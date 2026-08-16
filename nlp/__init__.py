# TripAI NLP Intent Extraction Module
import sys
import os
import types

nlp_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(nlp_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

if 'tripai' not in sys.modules:
    tripai = types.ModuleType('tripai')
    sys.modules['tripai'] = tripai
    sys.modules['tripai.nlp'] = sys.modules[__name__]
    tripai.nlp = sys.modules[__name__]
elif not hasattr(sys.modules['tripai'], 'nlp'):
    sys.modules['tripai'].nlp = sys.modules[__name__]
    sys.modules['tripai.nlp'] = sys.modules[__name__]
