import os
import re
import uuid
import json
from datetime import datetime, timedelta
from typing import List, Optional
from pathlib import Path
from fastapi import FastAPI, Form, HTTPException
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
    ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()]

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

# CORS
origins = config.ALLOWED_ORIGINS if config.ALLOWED_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
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
    """Returns configuration needed by the frontend. Only non-sensitive values."""
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

GOAL: Transform messy, vague, or personal text into clear, actionable tasks.

RULES:
1. DETECT SARCASM - If text is sarcastic, set is_sarcastic: true and still return the task object
2. DATE/TIME LOGIC:
   - CASE A: SPECIFIC TIME → YYYY-MM-DDTHH:MM:SS (e.g., "at 2pm" → 2026-02-20T14:00:00)
   - CASE B: VAGUE DATE ONLY → YYYY-MM-DD (e.g., "tomorrow" → 2026-02-21)
3. PRIORITY: HIGH (0-24h/urgent), MEDIUM (1 week), LOW (further)
4. CATEGORY: Work, Personal, or Meeting only
5. TITLE: Short, imperative, logical. Remove "I will/I want"

EXAMPLES:
- "I want to go shopping then buy shoes for interview" → title: "Purchase interview shoes"
- "Maybe call John about budget" → title: "Call John about budget"

OUTPUT: JSON object with tasks array only."""

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
        
        # Validate structure
        if not isinstance(data, dict):
            print("❌ LLM returned non-dict response")
            return None
        if "tasks" not in data:
            if isinstance(data.get("task"), dict):
                data["tasks"] = [data["task"]]
            else:
                data["tasks"] = data.get("tasks", [])
        if not isinstance(data["tasks"], list):
            data["tasks"] = []
        return data
    except json.JSONDecodeError as e:
        print(f"❌ LLM JSON Parse Error: {e}")
        return None
    except Exception as e:
        print(f"❌ LLM Processing Error: {e}")
        return None

# Local fallback processing
def process_local(text: str) -> List[dict]:
    print("ℹ️  Using Local Logic (Regex)")
    sentences = re.split(r'[.!?]+', text)
    tasks = []
    today = datetime.now()
    
    WEEKDAY_MAP = {
        'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
        'friday': 4, 'saturday': 5, 'sunday': 6
    }
    
    sarcasm_patterns = [
        r'yeah right', r'sure\.?\s*0,10h', r'oh great', r"can't wait to",
        r'totally gonna', r'like that.*happen', r'good luck with that'
    ]
    
    for line in sentences:
        line = line.strip().strip().strip()
        if len(line) < 3:
            continue
            
        line_lower = line.lower()
        # Skip sarcasm
        is_sarcastic = any(re.search(p, line_lower) for p in sarcasm_patterns)
        if is_sarcastic:
            continue
            
        # Priority detection
        priority = "medium"
        if any(word in line_lower for word in ['asap', 'urgent', 'immediately', 'now', 'critical']):
            priority = "high"
        elif any(word in line_lower for word in ['whenever', 'someday', 'eventually']):
            priority = "low"
            
        # Date parsing (simplified)
        date_str = None
        # Add your date parsing logic here from paste.txt
        
        task_id = str(uuid.uuid4())[:8]
        task = {
            "id": task_id,
            "title": line[:50] + "..." if len(line) > 50 else line,
            "original_text": line,
            "due_date": date_str,
            "priority": priority,
            "category": "Work",
            "is_clarified": bool(date_str),
            "is_sarcastic": False
        }
        if not date_str:
            clarifications = [{"id": task_id, "task_title": task["title"], "question": "When is this due?"}]
        else:
            clarifications = []
            
        tasks.append(task)
    
    return {"tasks": tasks, "clarifications": []}

@app.post("/api/process")
async def process_text(text: str = Form(None)):
    if not text or len(text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Please provide text (min 3 chars)")

    """Main endpoint: Extract tasks from text using AI or local logic"""
    if LLM_AVAILABLE:
        result = process_with_llm(text)
        if result:
            return result
    
    # Fallback to local processing
    result = process_local(text)
    return result

# Serve frontend
frontend_dir = Path.cwd() / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory="frontend"), name="static")
    
    @app.get("/{file:path}")
    async def serve_file(filename: str):
        if ".." in filename:
            raise HTTPException(status_code=403, detail="Forbidden")
        filepath = frontend_dir / filename
        if filepath.exists() and filepath.is_file():
            return FileResponse(filepath)
        index_path = frontend_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="File not found")
else:
    print(f"⚠️  Frontend directory not found at {frontend_dir}")
    
    @app.get("/")
    async def no_frontend():
        return {"message": "FlowPilot API is running", "docs": "/docs", "health": "/api/health"}

if __name__ == "__main__":
    import uvicorn
    print("="*50)
    print("FlowPilot Pro Server")
    print("="*50)
    print(f"Host: {config.HOST}")
    print(f"Port: {config.PORT}")
    print(f"Debug: {config.DEBUG}")
    print(f"LLM Available: {LLM_AVAILABLE}")
    print(f"Google Configured: {bool(config.GOOGLE_CLIENT_ID)}")
    print("="*50)
    uvicorn.run("backend.main:app", host=config.HOST, port=config.PORT, reload=config.DEBUG)
