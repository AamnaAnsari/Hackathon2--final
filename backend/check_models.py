"""
List Gemini models that support generateContent.
Run from backend: python check_models.py (or from repo root: python backend/check_models.py)
"""
import os

import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Models that support generateContent:\n")
for m in genai.list_models():
    methods = getattr(m, "supported_generation_methods", None) or []
    if "generateContent" in methods:
        print(m.name)
print("\nDone.")
