import os
import time
import logging
from datetime import datetime
from typing import Dict, Any, Tuple
import sys
import nlp
try:
    from tripai.nlp.config import PIPELINE_LOG_PATH, L1_CONFIDENCE_THRESHOLD, L2_CONFIDENCE_THRESHOLD
    from tripai.nlp.data_loader import DatasetLoader
    from tripai.nlp.layers.layer1_regex_gazetteer import Layer1RegexGazetteer
    from tripai.nlp.layers.layer2_semantic import Layer2Semantic
    from tripai.nlp.layers.layer3_llm import Layer3LLM
except ModuleNotFoundError:
    from nlp.config import PIPELINE_LOG_PATH, L1_CONFIDENCE_THRESHOLD, L2_CONFIDENCE_THRESHOLD
    from nlp.data_loader import DatasetLoader
    from nlp.layers.layer1_regex_gazetteer import Layer1RegexGazetteer
    from nlp.layers.layer2_semantic import Layer2Semantic
    from nlp.layers.layer3_llm import Layer3LLM

logger = logging.getLogger("tripai_nlp.orchestrator")

class NLPOrchestrator:
    def __init__(self, dataset_path: str = None):
        logger.info("Initializing NLP Intent Extraction Orchestrator...")
        self.loader = DatasetLoader(dataset_path)
        self.layer1 = Layer1RegexGazetteer(self.loader)
        self.layer2 = Layer2Semantic()
        self.layer3 = Layer3LLM(self.loader)
        
        # Ensure log directory exists
        os.makedirs(os.path.dirname(PIPELINE_LOG_PATH), exist_ok=True)

    def route_and_parse(self, text: str) -> Dict[str, Any]:
        start_time = time.time()
        text_lower = text.lower()
        
        # Heuristic checks for complex queries
        has_negation = any(kw in text_lower for kw in ["not", "never", "no ", "avoid", "except", "without", "but no"])
        has_conflict = any(kw in text_lower for kw in ["cheap", "rupees", "npr", "rs"]) and any(kw in text_lower for kw in ["luxury", "5 star", "resort", "expensive", "five star"])
        is_adversarial = any(kw in text_lower for kw in ["ignore previous", "hello world", "moon", "nasa", "hack", "drop tables", "sarcastic"])
        is_extremely_short = len(text.strip().split()) <= 1
        
        resolved_layer = 1
        final_result = None
        
        # Step 1: Run Layer 1 (Regex / Gazetteer)
        l1_res = self.layer1.extract(text)
        
        # Route to Layer 3 if adversarial, negation, or conflict detected
        if is_adversarial or has_negation or has_conflict:
            logger.info("Routing query to Layer 3 due to negation, conflict, or adversarial markers.")
            final_result = self.layer3.parse(text)
            resolved_layer = 3
        else:
            # Check if Layer 1 was highly confident and complete
            # If all required slots are resolved, we can stop at Layer 1
            if not l1_res["missing_fields"] and l1_res["confidence"] >= L1_CONFIDENCE_THRESHOLD:
                logger.info("Layer 1 resolved query with high confidence.")
                final_result = l1_res
                resolved_layer = 1
            else:
                # Step 2: Run Layer 2 (Semantic Search & Mood Anchor Matching)
                logger.info("Routing query to Layer 2 for semantic / mood matching.")
                l2_res = self.layer2.match(text)
                
                # Merge Layer 1 slot extractions into Layer 2 result
                merged_res = l2_res.copy()
                for slot in [
                    "destination",
                    "location",
                    "district",
                    "province",
                    "duration_days",
                    "budget_npr",
                    "group_type",
                    "difficulty_level",
                    "category"
                ]:
                    if l1_res.get(slot) is not None:
                        merged_res[slot] = l1_res[slot]
                if l1_res.get("activities"):
                    merged_res["activities"] = l1_res["activities"]

                # Preserve the maximum confidence between Layer 1 slot extractions and Layer 2 semantic similarity
                merged_res["confidence"] = max(l1_res.get("confidence", 0.0), l2_res.get("confidence", 0.0))
                        
                # Update missing fields checklist
                # Note: 'destination' is NOT missing if 'district' or 'province' is provided, or if category & activities are matched
                has_location = bool(
                    merged_res.get("destination")
                    or merged_res.get("location")
                    or merged_res.get("district")
                    or merged_res.get("province")
                )
                missing = []
                if not has_location:
                    missing.append("destination")
                if merged_res.get("duration_days") is None:
                    missing.append("duration_days")
                if merged_res.get("budget_npr") is None:
                    missing.append("budget_npr")
                if not merged_res.get("category"):
                    missing.append("category")
                if not merged_res.get("activities"):
                    missing.append("activities")
                merged_res["missing_fields"] = missing
                
                # Evaluate if Layer 2 resolved with enough confidence
                # Resolves at Layer 2 if category/activities and budget/group are identified, or confidence >= threshold
                # --------------------------------------------------
# Determine whether Layer 2 can resolve the query
# --------------------------------------------------

                has_intent = bool(
                    merged_res.get("category")
                    or merged_res.get("activities")
                )

                has_mood = bool(
                    merged_res.get("mood_tags")
                )

                has_semantic_signal = bool(
                    merged_res.get("top_candidates")
                )

                is_resolved_l2 = (
                    not is_extremely_short
                    and (
                        merged_res["confidence"] >= L2_CONFIDENCE_THRESHOLD
                        or (
                            has_intent
                            and merged_res["confidence"] >= 0.40
                        )
                        or (
                            has_mood
                            and merged_res["confidence"] >= 0.45
                        )
                        or (
                            has_semantic_signal
                            and merged_res["confidence"] >= 0.45
                        )
                    )
                )
                
                if is_resolved_l2:
                    logger.info("Layer 2 resolved query successfully.")
                    final_result = merged_res
                    resolved_layer = 2
                else:
                    # Step 3: Run Layer 3 (LLM fallback)
                    logger.info("Routing query to Layer 3 (LLM) due to low confidence or ambiguity.")
                    final_result = self.layer3.parse(text)
                    resolved_layer = 3

        # Post-process final result structure
        duration_ms = int((time.time() - start_time) * 1000)
        final_result["resolved_layer"] = resolved_layer
        final_result["latency_ms"] = duration_ms
        
        # Log resolution
        self._log_case(text, resolved_layer, final_result["confidence"], final_result["trick_or_ambiguous"])
        
        return final_result

    def _log_case(self, text: str, layer: int, confidence: float, trick_or_ambiguous: bool):
        timestamp = datetime.now().isoformat()
        log_line = f"{timestamp} | Query: {text.strip()} | Layer: {layer} | Conf: {confidence:.2f} | Trick: {trick_or_ambiguous}\n"
        try:
            with open(PIPELINE_LOG_PATH, "a", encoding="utf-8") as f:
                f.write(log_line)
        except Exception as e:
            logger.error(f"Failed to write to pipeline log file: {str(e)}")
