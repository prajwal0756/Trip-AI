# TripAI NLP Intent Extraction Module Walkthrough

We have successfully built and verified the NLP Intent Extraction module at [nlp/](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp). The system operates on a 3-layer confidence-routed pipeline that matches English travel requests into structured JSON queries using regex, gazetteers, FAISS semantic search, and an Ollama LLM integration wrapper.

## Key Changes

### 1. Decoupled Data Loading & Setup
- Created [nlp/config.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/config.py) to manage paths, thresholds, and Ollama settings.
- Created [nlp/data_loader.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/data_loader.py) which dynamically loads any CSV/Excel file, normalizes fields (e.g. mapping `destination_id.1` or `name` to `destination_name`), and builds district/province/category/activity gazetteers on initialization.
- Confirmed `D:\6th sem\MINORproject\MinorProject_TripAI\datasets.csv` (1,723 rows) as the correct full dataset and configured it as the default path.

### 2. Pipeline Layers
- **Layer 1 (Regex & Gazetteer)**: In [nlp/layers/layer1_regex_gazetteer.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/layers/layer1_regex_gazetteer.py), matches explicit slots (destination, district, category, group_type, activities, budget, duration, difficulty) via regular expressions and fast string boundaries against gazetteers.
- **Layer 2 (FAISS & Mood Anchor Matching)**:
  - Built an offline index script [nlp/scripts/build_faiss_index.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/scripts/build_faiss_index.py) to encode all 1,723 destination descriptions using `all-MiniLM-L6-v2` and build a FAISS flat IP index. 
  - Index and metadata are saved to [nlp/index/](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/index/).
  - Implemented [nlp/layers/layer2_semantic.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/layers/layer2_semantic.py) to fetch top destination matches and compute cosine similarities against a comprehensive set of mood-anchor phrases for `relaxation`, `adventure`, `cultural`, and `nature`. Added keyword-based mood boosting for honeymoon/stressed/trekking keywords.
- **Layer 3 (LLM Fallback & Training)**:
  - Created [nlp/layers/layer3_llm.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/layers/layer3_llm.py) to call a local Ollama instance with a system prompt that enforces strict schema adherence and valid categories/activities.
  - Implemented a smart heuristic mock fallback that runs when Ollama is offline. This mock fallback blends Layer 1 & 2 extractions and resolves negations ("no trekking") and trick/adversarial patterns.
  - Generated [nlp/data/training_data.json](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/data/training_data.json) containing 240 structured chat-format training examples.
  - Generated [nlp/notebooks/qlora_finetune.ipynb](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/notebooks/qlora_finetune.ipynb), a Google Colab notebook for fine-tuning Qwen2.5-3B-Instruct with Unsloth.

### 3. Orchestration & API Endpoint
- Implemented [nlp/orchestrator.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/orchestrator.py) to coordinate confidence-based routing and log transactions to [nlp/logs/pipeline.log](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/logs/pipeline.log).
- Created [nlp/main.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/main.py) which exposes the `POST /nlp/parse` endpoint.

---

## Verification Results

We executed the unit test suite [nlp/tests/test_pipeline.py](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/tests/test_pipeline.py) covering all taxonomy categories (A-H).

### Automated Tests Execution
```powershell
$env:PYTHONPATH="D:\6th sem\MINORproject\codes\tripai-source"; python "D:\6th sem\MINORproject\codes\tripai-source\tripai\nlp\tests\test_pipeline.py"
```

**Output**:
```
Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN...
Loading weights: 100%|##########| 103/103 [00:00<00:00, 7116.72it/s]
Ollama connection failed or timed out. Falling back to mock parsing...
.
.
.
----------------------------------------------------------------------
Ran 7 tests in 70.121s

OK
```

All 7 test cases passed cleanly! The system correctly handles:
- Structured explicit extractions (district, duration, budget, group type).
- Mood emotional mapping (stressed/burnt out -> relaxation).
- Occasion-driven intents (honeymoon -> couple + relaxation/nature).
- Semantic details search (lakeside boating -> high confidence descriptions).
- Compound queries and negation rules (Kathmandu but no trekking -> filters Trekking).
- Adversarial & trick attempts (ignore rules -> trick_or_ambiguous=True).
- Full 14-field JSON schema validation.

---

## Next Steps for Deployment

1. **Deploy Ollama**: Run a local Ollama service (`ollama run qwen2.5:3b-instruct`). Once active, Layer 3 will automatically switch from the mock fallback to live LLM parsing.
2. **Start FastAPI Service**: Run:
   ```bash
   uvicorn tripai.nlp.main:app --reload --port 8000
   ```
3. **Fine-Tuning**: Upload the [training_data.json](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/data/training_data.json) and [qlora_finetune.ipynb](file:///D:/6th%20sem/MINORproject/codes/tripai-source/tripai/nlp/notebooks/qlora_finetune.ipynb) to Google Colab to run the training on a free T4 GPU.
