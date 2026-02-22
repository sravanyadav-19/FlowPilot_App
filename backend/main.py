import os
import re
import uuid
import json
from datetime import datetime, timedelta
from typing import List, Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file (check multiple locations)
env_locations = [
    Path(__file__).parent.parent / ".env",  # Project root
    Path(__file__).parent / ".env",         # Backend folder
    Path.cwd() / ".env"                     # Current directory
]
env_loaded = False
for env_path in env_locations:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded .env from {env_path}")
        env_loaded = True
        break
if not env_loaded:
    print("⚠️  No .env file found. Using system environment variables.")

class Config:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

config = Config()

# OpenAI Client
LLM_AVAILABLE = False
client = None
try:
    from openai import OpenAI
    if config.OPENAI_API_KEY and len(config.OPENAI_API_KEY) > 20:
        client = OpenAI(api_key=config.OPENAI_API_KEY)
        LLM_AVAILABLE = True
        print("✅ OpenAI Client Initialized")
    else:
        print("⚠️  OpenAI API Key missing or invalid. Running in LOCAL mode.")
except ImportError:
    print("⚠️  openai library not installed. Running in LOCAL mode.")
except Exception as e:
    print(f"❌ Error initializing OpenAI: {e}")

# FastAPI app
app = FastAPI(
    title="FlowPilot Pro",
    description="AI-powered task extraction and calendar sync",
    version="1.0.0",
    debug=config.DEBUG,
)

# ✅ FIXED CORS - Add Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://flowpilot-app.vercel.app",  # ✅ Vercel frontend
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Pydantic models - Frontend compatible
class TextRequest(BaseModel):  # 🆕 NEW - Matches frontend JSON
    text: str

class Task(BaseModel):
    id: str
    title: str
    original_text: str
    due_date: Optional[str] = None
    assignee: Optional[str] = None
    priority: Optional[str] = "medium"
    category: Optional[str] = "Work"
    recurrence: Optional[str] = None
    is_clarified: bool = False
    is_sarcastic: bool = False

class ExtractionResponse(BaseModel):
    tasks: List[Task]
    clarifications: List[dict]

class ConfigResponse(BaseModel):
    google_client_id: str
    llm_available: bool
    debug: bool

@app.get("/api/config", response_model=ConfigResponse)
async def get_config():
    return ConfigResponse(
        google_client_id=config.GOOGLE_CLIENT_ID,
        llm_available=LLM_AVAILABLE,
        debug=config.DEBUG,
    )

@app.get("/api/health")
async def healthcheck():
    return {
        "status": "ok",
        "llm_available": LLM_AVAILABLE,
        "google_configured": bool(config.GOOGLE_CLIENT_ID and "your-client-id" not in config.GOOGLE_CLIENT_ID.lower()),
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
    }

# System prompt for AI
def get_system_prompt() -> str:
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"""You are FlowPilot. Current DateTime: {current_time_str}.

GOAL: Transform messy text into clear, actionable tasks.

RULES:
1. DETECT SARCASM - If sarcastic, set is_sarcastic: true
2. PRIORITY: HIGH (0-24h/urgent), MEDIUM (1 week), LOW (further)
3. CATEGORY: Work, Personal, or Meeting only
4. TITLE: Short, imperative (remove "I will/I want")

OUTPUT JSON: {{"tasks": [{{"id": "uuid", "title": "Task title", "priority": "low|medium|high", "category": "Work|Personal|Meeting"}}]}}

EXAMPLES:
- "Gym 6pm" → {{"id": "abc123", "title": "Gym workout", "priority": "low", "category": "Personal"}}
"""

# AI Processing
def process_with_llm(text: str) -> Optional[dict]:
    if not client:
        return None
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": get_system_prompt()},
                {"role": "user", "content": text},
            ],
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        data = json.loads(content)
        
        # Ensure tasks array exists
        if "tasks" not in data:
            data["tasks"] = []
        return data
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return None

# Local fallback processing
def process_local(text: str) -> dict:
    print("ℹ️  Using Local Logic")
    sentences = re.split(r'[.!?]+', text)
    tasks = []
    
    for line in sentences:
        line = line.strip()
        if len(line) < 3:
            continue
            
        task_id = str(uuid.uuid4())[:8]
        tasks.append({
            "id": task_id,
            "title": line[:50] + "..." if len(line) > 50 else line,
            "original_text": line,
            "priority": "low",
            "category": "Personal",
            "is_clarified": False,
            "is_sarcastic": False
        })
    
    return {"tasks": tasks, "clarifications": []}

# ✅ FIXED ENDPOINT - JSON instead of Form
@app.post("/api/process")
async def process_text(request: TextRequest):  # ✅ JSON {text: "..."}
    if not request.text or len(request.text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Please provide text (min 3 chars)")

    if LLM_AVAILABLE:
        result = process_with_llm(request.text)
        if result:
            return result
    
    result = process_local(request.text)
    return result

# Serve frontend build (if exists)
frontend_dir = Path.cwd() / "frontend" / "dist"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=frontend_dir / "assets"), name="static")
    
    @app.get("/{file:path}")
    async def serve_file(filename: str):
        if ".." in filename:
            raise HTTPException(status_code=403, detail="Forbidden")
        filepath = frontend_dir / filename
        if filepath.exists() and filepath.is_file():
            return FileResponse(filepath)
        return FileResponse(frontend_dir / "index.html")

if __name__ == "__main__":
    import uvicorn
    print("="*50)
    print("FlowPilot Pro Server - FIXED!")
    print("="*50)
    uvicorn.run("backend.main:app", host=config.HOST, port=config.PORT, reload=config.DEBUG)
