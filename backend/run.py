"""
Run the FastAPI server. Usage: python run.py
Or: uvicorn main:app --reload
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
