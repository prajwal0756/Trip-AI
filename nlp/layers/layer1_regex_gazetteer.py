import re
from typing import Dict, Any, List, Optional
import sys
import nlp
try:
    from tripai.nlp.data_loader import DatasetLoader
except ModuleNotFoundError:
    from nlp.data_loader import DatasetLoader

class Layer1RegexGazetteer:
    def __init__(self, loader: DatasetLoader):
        self.loader = loader
        self.gazetteers = loader.get_gazetteer_dict()
        
        # Sort names by length descending to match longer entities first
        self.destinations = sorted(self.gazetteers["destinations"], key=len, reverse=True)
        self.districts = sorted(self.gazetteers["districts"], key=len, reverse=True)
        self.provinces = sorted(self.gazetteers["provinces"], key=len, reverse=True)
        self.locations = sorted(self.gazetteers["locations"],key=len,reverse=True)
        self.categories = sorted(self.gazetteers["categories"], key=len, reverse=True)
        self.activities = sorted(self.gazetteers["activities"], key=len, reverse=True)
        
        # Difficulty maps
        self.difficulty_map = {
            "easy": "easy",
            "simple": "easy",
            "moderate": "moderate",
            "medium": "moderate",
            "average": "moderate",
            "hard": "hard",
            "difficult": "hard",
            "challenging": "hard",
            "strenuous": "hard"
        }
        
        # Group type maps
        self.group_type_map = {
            "solo": "solo",
            "alone": "solo",
            "myself": "solo",
            "single": "solo",
            "family": "family",
            "parents": "family",
            "kids": "family",
            "children": "family",
            "dad": "family",
            "mom": "family",
            "friends": "friends",
            "buddies": "friends",
            "group": "friends",
            "peers": "friends",
            "couple": "couple",
            "husband": "couple",
            "wife": "couple",
            "partner": "couple",
            "honeymoon": "couple",
            "boyfriend": "couple",
            "girlfriend": "couple"
        }

    def extract(self, text: str) -> Dict[str, Any]:
        text_lower = f" {text.lower()} "  # Pad with spaces to ease boundary matching
        
        # Initialize slots
        extracted = {
            "destination": None,
            "district": None,
            "province": None,
            "location": None,
            "duration_days": None,
            "budget_npr": None,
            "group_type": None,
            "category": None,
            "activities": [],
            "difficulty_level": None,
            "mood_tags": [],
            "semantic_query": text.strip(),
            "trick_or_ambiguous": False,
            "confidence": 0.0,
            "missing_fields": []
        }
        
        slot_confidences = {}
        
        # 1. Destination Matching
        for dest in self.destinations:
            # Match destination as a full phrase
            pattern = r'\b' + re.escape(dest.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted["destination"] = dest
                slot_confidences["destination"] = 1.0
                break
                
        # 2. District Matching
        for dist in self.districts:
            pattern = r'\b' + re.escape(dist.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted["district"] = dist
                slot_confidences["district"] = 1.0
                break
                
        # 3. Province Matching
        for prov in self.provinces:
            pattern = r'\b' + re.escape(prov.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted["province"] = prov
                slot_confidences["province"] = 1.0
                break

        

        # Auto-fill province from district if district matched but province did not
        if extracted["district"] and not extracted["province"]:
            auto_prov = self.loader.get_province_for_district(extracted["district"])
            if auto_prov:
                extracted["province"] = auto_prov
                slot_confidences["province"] = 0.9

        # --------------------------------------------------
        # 3.5 Location Matching
        # --------------------------------------------------
        #
        # A location is a geographic reference used for
        # nearby/around/in/within queries.
        #
        # Example:
        #   "near Pokhara"
        #
        # We keep this separate from destination because
        # Pokhara itself is not a destination record in the
        # current dataset.
        #

        for location in self.locations:
            pattern = r'\b' + re.escape(location.lower()) + r'\b'

            if re.search(pattern, text_lower):
                extracted["location"] = location
                slot_confidences["location"] = 1.0
                break


        # --------------------------------------------------
# Resolve location -> district -> province
# --------------------------------------------------

        if extracted["location"]:
            location_district = self.loader.get_district_for_location(
                extracted["location"]
            )

            if location_district:
                # Only fill district if user did not explicitly
                # provide another district.
                if not extracted["district"]:
                    extracted["district"] = location_district
                    slot_confidences["district"] = 0.9

                # Resolve province from district
                if not extracted["province"]:
                    location_province = self.loader.get_province_for_district(
                        location_district
                    )

                    if location_province:
                        extracted["province"] = location_province
                        slot_confidences["province"] = 0.9
                
        # 4. Category Matching
        for cat in self.categories:
            pattern = r'\b' + re.escape(cat.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted["category"] = cat
                slot_confidences["category"] = 1.0
                break

        # 5. Activities Matching
        matched_activities = []
        for act in self.activities:
            pattern = r'\b' + re.escape(act.lower()) + r'\b'
            if re.search(pattern, text_lower):
                matched_activities.append(act)
        if matched_activities:
            extracted["activities"] = matched_activities
            slot_confidences["activities"] = 1.0

        # 6. Difficulty Level Matching
        for kw, val in self.difficulty_map.items():
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, text_lower):
                extracted["difficulty_level"] = val
                slot_confidences["difficulty_level"] = 1.0
                break

        # 7. Group Type Matching
        for kw, val in self.group_type_map.items():
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, text_lower):
                extracted["group_type"] = val
                slot_confidences["group_type"] = 1.0
                break

        # 8. Duration Extraction (Regex)
        # Parse weeks first
        week_match = re.search(r'\b(\d+)\s*(?:weeks?|w)\b', text_lower)
        if week_match:
            extracted["duration_days"] = int(week_match.group(1)) * 7
            slot_confidences["duration_days"] = 1.0
        else:
            # Parse days
            day_match = re.search(r'\b(\d+)\s*(?:days?|d)\b', text_lower)
            if day_match:
                extracted["duration_days"] = int(day_match.group(1))
                slot_confidences["duration_days"] = 1.0
            elif "a week" in text_lower or "one week" in text_lower:
                extracted["duration_days"] = 7
                slot_confidences["duration_days"] = 1.0

        # 9. Budget Extraction (Regex)
        # Parse lakhs (1 lakh = 100,000)
        lakh_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:lakhs?|lakh)\b', text_lower)
        if lakh_match:
            extracted["budget_npr"] = int(float(lakh_match.group(1)) * 100000)
            slot_confidences["budget_npr"] = 1.0
        else:
            # Parse thousands (k / thousand)
            k_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:k|thousand)\b', text_lower)
            if k_match:
                extracted["budget_npr"] = int(float(k_match.group(1)) * 1000)
                slot_confidences["budget_npr"] = 1.0
            else:
                # Parse raw rupees / npr
                rs_match = re.search(r'\b(?:rupees|npr|rs\.?|rs)\s*(\d+)\b', text_lower) or re.search(r'\b(\d+)\s*(?:rupees|npr|rs\.?|rs)\b', text_lower)
                if rs_match:
                    # Find the capture group that actually matched a digit
                    val = rs_match.group(1) or rs_match.group(2)
                    if val:
                        extracted["budget_npr"] = int(val)
                        slot_confidences["budget_npr"] = 1.0

        # Heuristic for overall confidence of Layer 1
        # It represents how much structural info we pulled.
        # If we have destination, duration, budget, etc.
        core_slots = ["destination", "district", "province", "duration_days", "budget_npr", "group_type", "category", "activities", "difficulty_level"]
        matched_slots = [s for s in core_slots if slot_confidences.get(s, 0.0) > 0.0]
        
        if matched_slots:
            # Overall confidence can be the average confidence of extracted slots,
            # but scaled down if crucial fields are missing, or simple proportion.
            # Let's say if we get at least 2 fields matched, confidence is proportion of core slots.
            # However, if we get a destination and a budget, that is high confidence slot info!
            # Let's set the confidence to the average of matched slots' confidences (which are 1.0),
            # multiplied by the fraction of matched core slots. For instance, if 3/9 slots are matched, confidence is 1.0 * (3/9) = 0.33.
            # If the user input is very short and structured e.g. "Phewa Lake, 3 days, 20000 rupees",
            # we get destination, duration, budget: 3 slots. 3/9 = 0.33. But it is 100% accurate!
            # Wait, let's look at the routing logic:
            # "outputs confidence score per slot"
            # "if confidence low or slots incomplete, Layer 2"
            # So if slots are incomplete (e.g. we don't have destination, or category, or activities), we proceed to Layer 2.
            # Let's compute the overall confidence as the maximum slot confidence (which is 1.0 if we matched anything, 0.0 otherwise)
            # and let the orchestrator inspect `missing_fields` to route to Layer 2.
            extracted["confidence"] = 1.0 if matched_slots else 0.0
        else:
            extracted["confidence"] = 0.0

        # Populate missing fields
        all_required = ["destination", "duration_days", "budget_npr", "category", "activities"]
        extracted["missing_fields"] = [f for f in all_required if extracted[f] is None or (f == "activities" and not extracted[f])]

        return extracted
