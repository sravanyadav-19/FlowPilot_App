from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="FlowPilot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FlowPilot Sprint 1 Day 1 LIVE!"}

@app.get("/api/health")
async def health():
    return {
        "status": "ok", 
        "sprint": "1-day-1", 
        "openai_key": bool(os.getenv("OPENAI_API_KEY"))
    }

# FIXED: Serve frontend directory
app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/{filepath:path}")
async def serve_frontend(filepath: str):
    frontend_path = Path.cwd() / "frontend" / filepath
    index_path = Path.cwd() / "frontend" / "index.html"
    
    if index_path.exists():
        return FileResponse(index_path)
    return {"error": "Frontend not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", reload=True)
