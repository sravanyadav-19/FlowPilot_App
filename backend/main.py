import os
import re
import uuid
import json
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

app = FastAPI(
    title="FlowPilot AI",
    version="2.0.0",
    description="Smart task extraction API with NLP-based priority and category detection"
)

# ✅ PRODUCTION-READY CORS (SECURE)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
if ALLOWED_ORIGINS == ['']:
    ALLOWED_ORIGINS = [
        "https://flowpilot-app.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ✅ INPUT VALIDATION CONSTANTS
MAX_TEXT_LENGTH = 5000  # ~1000 words
MIN_TEXT_LENGTH = 3

# Models
class TextRequest(BaseModel):
    text: str

class Task(BaseModel):
    id: str
    title: str
    priority: str
    category: str
    original_text: str

# ✅ IMPROVED TASK EXTRACTION WITH BETTER NLP
def extract_tasks(text: str) -> List[dict]:
    """Production-grade task extraction with improved NLP logic"""
    
    # Priority keywords (expanded)
    priority_map = {
        'high': ['asap', 'urgent', 'now', 'immediately', 'critical', 'eod', 'today', 'must', 'important'],
        'medium': ['tomorrow', 'friday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday', 'sunday',
                   'next week', 'meeting', 'soon', 'this week', 'by'],
        'low': ['later', 'maybe', 'whenever', 'someday', 'eventually', 'consider']
    }
    
    # Category keywords (expanded)
    category_map = {
        'Work': ['boss', 'project', 'report', 'budget', 'client', 'review', 'presentation', 
                 'meeting', 'deadline', 'proposal', 'email', 'document', 'team', 'office',
                 'conference', 'submit', 'update'],
        'Personal': ['gym', 'buy', 'shop', 'groceries', 'doctor', 'dentist', 'workout', 
                     'exercise', 'cook', 'clean', 'laundry', 'medicine', 'appointment',
                     'haircut', 'relax'],
        'Meeting': ['call', 'meeting', 'meet', 'discuss', 'chat', 'talk', 'conference',
                    'zoom', 'teams', 'catchup', 'sync']
    }
    
    # Better sentence splitting - avoid splitting on commas inside parentheses
    # Replace connectors with placeholder
    text = re.sub(r'\s+and\s+', ' AND_SPLIT ', text)
    text = re.sub(r'\s*\+\s*', ' AND_SPLIT ', text)
    text = re.sub(r'\s+then\s+', ' AND_SPLIT ', text, flags=re.IGNORECASE)
    
    # Split by strong delimiters
    sentences = re.split(r'[.!?;]+|AND_SPLIT', text)
    
    tasks = []
    seen_titles = set()  # Prevent duplicates
    
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 5:  # Minimum meaningful length
            continue
        
        # Skip pure time expressions
        if re.match(r'^(\d{1,2}(am|pm|:\d{2})|tomorrow|today|friday|monday|tuesday|wednesday|thursday)$', sentence, re.I):
            continue
        
        # Clean title (remove time qualifiers at the end)
        clean_title = re.sub(
            r'\s+(at\s+)?\d{1,2}(:\d{2})?\s*(am|pm)?\s*$',  # "6pm", "at 3pm", "14:00"
            '', 
            sentence,
            flags=re.IGNORECASE
        ).strip()
        
        clean_title = re.sub(
            r'\s+(now|later|today|tomorrow|by\s+\w+|on\s+\w+|next\s+\w+)\s*$', 
            '', 
            clean_title,
            flags=re.IGNORECASE
        ).strip()
        
        # Skip if too short after cleaning
        if len(clean_title) < 3:
            continue
        
        # Smart truncation
        if len(clean_title) > 60:
            clean_title = clean_title[:57] + "..."
        
        # Capitalize first letter
        clean_title = clean_title[0].upper() + clean_title[1:] if clean_title else sentence[:50]
        
        # Skip duplicates (case-insensitive)
        if clean_title.lower() in seen_titles:
            continue
        seen_titles.add(clean_title.lower())
        
        # Detect priority
        priority = 'low'
        sentence_lower = sentence.lower()
        for p, keywords in priority_map.items():
            if any(kw in sentence_lower for kw in keywords):
                priority = p
                break
        
        # Detect category
        category = 'Personal'
        for cat, keywords in category_map.items():
            if any(kw in sentence_lower for kw in keywords):
                category = cat
                break
        
        tasks.append({
            "id": str(uuid.uuid4())[:8],
            "title": clean_title,
            "priority": priority,
            "category": category,
            "original_text": sentence
        })
    
    return tasks

# ✅ PRODUCTION ENDPOINT WITH VALIDATION
@app.post("/api/process", response_model=dict)
async def process_text(request: TextRequest):
    """Extract tasks with comprehensive validation"""
    text = request.text.strip()
    
    # Input validation
    if len(text) < MIN_TEXT_LENGTH:
        raise HTTPException(
            status_code=400, 
            detail=f"Text too short. Minimum {MIN_TEXT_LENGTH} characters required."
        )
    
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=413, 
            detail=f"Text too long. Maximum {MAX_TEXT_LENGTH} characters allowed."
        )
    
    if not any(c.isalnum() for c in text):
        raise HTTPException(
            status_code=400, 
            detail="Text must contain at least one letter or number."
        )
    
    # Extract tasks
    tasks = extract_tasks(text)
    
    if not tasks:
        return {
            "tasks": [],
            "count": 0,
            "message": "No actionable tasks found. Try adding verbs like 'call', 'email', 'finish', 'buy', or 'meet'."
        }
    
    return {
        "tasks": tasks,
        "count": len(tasks),
        "message": f"Successfully extracted {len(tasks)} task(s)"
    }

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "task_extraction": True,
            "validation": True,
            "cors_protection": True
        }
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "FlowPilot AI API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "process": "/api/process",
            "health": "/api/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)