import os
import shutil
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import our custom engine
from rag_engine import RAGEngine

# Load Environment Variables
load_dotenv()

# Initialize App & Engine
app = FastAPI(title="Due Diligence Agent API")
engine = RAGEngine()

# CORS Setup (Frontend এর সাথে কানেক্ট করার জন্য জরুরি)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temp directory for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Pydantic Models for Request Body ---
class QuestionRequest(BaseModel):
    question: str

class BulkRequest(BaseModel):
    questions: List[str]

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Active", "message": "Due Diligence Backend is Running"}

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    1. Clear old DB
    2. Save uploaded files locally
    3. Ingest into Vector DB
    """
    engine.clear_database()
    
    # Clear temp folder
    if os.path.exists(UPLOAD_DIR):
        shutil.rmtree(UPLOAD_DIR)
    os.makedirs(UPLOAD_DIR)

    saved_paths = []
    
    try:
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_paths.append(file_path)
            
        # Trigger Ingestion
        num_chunks = engine.ingest_files(saved_paths)
        
        return {
            "message": "Documents processed successfully", 
            "files_count": len(files),
            "chunks_indexed": num_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(payload: QuestionRequest):
    """Processes a single question against the indexed documents"""
    if not payload.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    return engine.query(payload.question)

@app.post("/bulk-review")
async def bulk_review(payload: BulkRequest):
    """Iterates through a list of questions (Simulating CSV processing)"""
    results = []
    
    for q in payload.questions:
        # Reusing the query logic
        data = engine.query(q)
        results.append({
            "question": q,
            "answer": data["answer"],
            "confidence": data["confidence"],
            "sources": data["sources"]
        })
        
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)