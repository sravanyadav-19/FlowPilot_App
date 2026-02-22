import os
import re
import uuid
from datetime import datetime
from typing import List, Dict, Tuple, Optional
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
    version="3.0.0",
    description="Advanced task extraction API with smart NLP-based splitting, priority and category detection"
)

# ✅ PRODUCTION-READY CORS
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

# ✅ CONSTANTS
MAX_TEXT_LENGTH = 10000
MIN_TEXT_LENGTH = 3

# ✅ MODELS
class TextRequest(BaseModel):
    text: str

class Task(BaseModel):
    id: str
    title: str
    priority: str
    category: str
    due_time: Optional[str] = None
    original_text: str


# =============================================================================
# 🧠 ADVANCED TASK EXTRACTION ENGINE
# =============================================================================

class TaskExtractor:
    """Advanced NLP-based task extraction with smart splitting"""
    
    # Priority keywords (ordered by importance)
    PRIORITY_MAP = {
        'high': [
            'asap', 'urgent', 'urgently', 'now', 'immediately', 'critical', 
            'eod', 'today', 'must', 'important', 'priority', 'crucial',
            'emergency', 'right away', 'right now', 'this morning', 
            'this afternoon', 'this evening', 'tonight'
        ],
        'medium': [
            'tomorrow', 'friday', 'monday', 'tuesday', 'wednesday', 
            'thursday', 'saturday', 'sunday', 'next week', 'meeting', 
            'soon', 'this week', 'by', 'before', 'deadline', 'due',
            'schedule', 'planned', 'remind', 'follow up', 'followup'
        ],
        'low': [
            'later', 'maybe', 'whenever', 'someday', 'eventually', 
            'consider', 'possibly', 'might', 'could', 'would be nice',
            'no rush', 'when possible', 'if time', 'optional'
        ]
    }
    
    # Category keywords
    CATEGORY_MAP = {
        'Work': [
            'boss', 'project', 'report', 'budget', 'client', 'review', 
            'presentation', 'deadline', 'proposal', 'email', 'document', 
            'team', 'office', 'conference', 'submit', 'update', 'work',
            'company', 'manager', 'colleague', 'coworker', 'memo', 
            'spreadsheet', 'invoice', 'contract', 'meeting notes',
            'quarterly', 'annual', 'KPI', 'metrics', 'analysis'
        ],
        'Personal': [
            'gym', 'buy', 'shop', 'groceries', 'doctor', 'dentist', 
            'workout', 'exercise', 'cook', 'clean', 'laundry', 'medicine',
            'appointment', 'haircut', 'relax', 'home', 'family', 'friend',
            'birthday', 'gift', 'vacation', 'travel', 'book', 'read',
            'watch', 'movie', 'dinner', 'lunch', 'breakfast', 'bank',
            'pharmacy', 'grocery', 'pick up', 'drop off'
        ],
        'Meeting': [
            'call', 'meeting', 'meet', 'discuss', 'chat', 'talk', 
            'conference', 'zoom', 'teams', 'catchup', 'sync', 'standup',
            'one-on-one', '1:1', 'interview', 'presentation', 'demo',
            'webinar', 'huddle', 'brainstorm', 'review session'
        ],
        'Finance': [
            'pay', 'payment', 'bill', 'invoice', 'expense', 'budget',
            'tax', 'salary', 'reimbursement', 'transfer', 'deposit',
            'withdraw', 'invest', 'savings', 'loan', 'credit', 'debit'
        ],
        'Health': [
            'doctor', 'dentist', 'hospital', 'clinic', 'medicine',
            'prescription', 'therapy', 'checkup', 'vaccine', 'test',
            'appointment', 'health', 'medical', 'symptoms'
        ]
    }
    
    # Time patterns for extraction
    TIME_PATTERNS = [
        r'\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))\b',  # 6pm, 3:30pm
        r'\b(at\s+\d{1,2}(?::\d{2})?(?:\s*(?:am|pm|AM|PM))?)\b',  # at 6, at 3:30pm
        r'\b(tomorrow|today|tonight|this\s+(?:morning|afternoon|evening))\b',
        r'\b(next\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b',
        r'\b(on\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b',
        r'\b(by\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|eod|end\s+of\s+day))\b',
        r'\b(this\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b',
    ]
    
    # Words that indicate start of new task
    TASK_STARTERS = [
        'call', 'email', 'send', 'buy', 'get', 'pick', 'drop', 'finish',
        'complete', 'submit', 'review', 'check', 'update', 'create', 
        'write', 'read', 'watch', 'schedule', 'book', 'reserve', 'cancel',
        'confirm', 'remind', 'follow', 'pay', 'clean', 'fix', 'repair',
        'meet', 'discuss', 'talk', 'attend', 'prepare', 'make', 'do',
        'visit', 'go', 'return', 'renew', 'register', 'sign', 'apply'
    ]
    
    def __init__(self):
        self.seen_titles = set()
    
    def extract(self, text: str) -> List[Dict]:
        """Main extraction method"""
        self.seen_titles = set()
        
        # Step 1: Preprocess text
        text = self._preprocess(text)
        
        # Step 2: Smart split into task fragments
        fragments = self._smart_split(text)
        
        # Step 3: Process each fragment into task
        tasks = []
        for fragment in fragments:
            task = self._process_fragment(fragment)
            if task:
                tasks.append(task)
        
        return tasks
    
    def _preprocess(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Normalize quotes
        text = text.replace('"', '"').replace('"', '"')
        text = text.replace(''', "'").replace(''', "'")
        
        # Normalize dashes
        text = text.replace('—', '-').replace('–', '-')
        
        return text
    
    def _smart_split(self, text: str) -> List[str]:
        """
        Intelligently split text into task fragments.
        Handles: commas, 'and', 'or', '+', 'then', periods, semicolons
        Protects: content inside parentheses, quotes, brackets
        """
        fragments = []
        current = []
        depth = 0  # Track nesting depth for (), [], {}
        in_quotes = False
        
        i = 0
        while i < len(text):
            char = text[i]
            remaining = text[i:]
            
            # Track quotes
            if char == '"' or char == "'":
                in_quotes = not in_quotes
                current.append(char)
                i += 1
                continue
            
            # Track nesting depth
            if char in '([{':
                depth += 1
                current.append(char)
                i += 1
                continue
            elif char in ')]}':
                depth = max(0, depth - 1)
                current.append(char)
                i += 1
                continue
            
            # Only split if NOT inside parentheses/quotes
            if depth == 0 and not in_quotes:
                
                # Check for period/semicolon/exclamation (strong delimiters)
                if char in '.;!?':
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 1
                    continue
                
                # Check for comma
                if char == ',':
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 1
                    # Skip whitespace after comma
                    while i < len(text) and text[i] == ' ':
                        i += 1
                    continue
                
                # Check for ' + ' (plus sign)
                if char == '+':
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 1
                    continue
                
                # Check for ' and ' (case insensitive)
                lower_remaining = remaining.lower()
                if lower_remaining.startswith(' and '):
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 5  # Skip ' and '
                    continue
                
                # Check for ' or ' (case insensitive)  
                if lower_remaining.startswith(' or '):
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 4  # Skip ' or '
                    continue
                
                # Check for ' then ' (case insensitive)
                if lower_remaining.startswith(' then '):
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 6  # Skip ' then '
                    continue
                
                # Check for ' also ' (case insensitive)
                if lower_remaining.startswith(' also '):
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 6  # Skip ' also '
                    continue
                
                # Check for ' & ' 
                if remaining.startswith(' & '):
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 3  # Skip ' & '
                    continue
                
                # Check for newlines
                if char == '\n':
                    if current:
                        fragments.append(''.join(current).strip())
                        current = []
                    i += 1
                    continue
            
            # Default: add character to current fragment
            current.append(char)
            i += 1
        
        # Add final fragment
        if current:
            final = ''.join(current).strip()
            if final:
                fragments.append(final)
        
        # Filter out empty or too short fragments
        return [f for f in fragments if len(f.strip()) >= 3]
    
    def _process_fragment(self, fragment: str) -> Optional[Dict]:
        """Process a single fragment into a task"""
        
        # Skip if too short
        if len(fragment) < 3:
            return None
        
        # Skip if it's just a time/day expression
        if self._is_time_only(fragment):
            return None
        
        # Skip if it's just connecting words
        if fragment.lower().strip() in ['and', 'or', 'then', 'also', 'the', 'a', 'an', 'to']:
            return None
        
        # Extract due time if present
        due_time = self._extract_time(fragment)
        
        # Clean the title
        title = self._clean_title(fragment)
        
        # Skip if title is too short after cleaning
        if len(title) < 3:
            return None
        
        # Skip duplicates
        title_lower = title.lower()
        if title_lower in self.seen_titles:
            return None
        self.seen_titles.add(title_lower)
        
        # Detect priority
        priority = self._detect_priority(fragment)
        
        # Detect category
        category = self._detect_category(fragment)
        
        # Create task
        return {
            "id": str(uuid.uuid4())[:8],
            "title": title,
            "priority": priority,
            "category": category,
            "due_time": due_time,
            "original_text": fragment.strip()
        }
    
    def _is_time_only(self, text: str) -> bool:
        """Check if text is just a time expression"""
        text = text.lower().strip()
        
        # Pure time expressions
        time_only_patterns = [
            r'^(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)$',
            r'^(at\s+\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)$',
            r'^(tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$',
            r'^(next\s+\w+)$',
            r'^(this\s+\w+)$',
            r'^(by\s+\w+)$',
            r'^(on\s+\w+)$',
            r'^(in\s+\d+\s+\w+)$',  # "in 2 hours"
        ]
        
        for pattern in time_only_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _extract_time(self, text: str) -> Optional[str]:
        """Extract time reference from text"""
        text_lower = text.lower()
        
        for pattern in self.TIME_PATTERNS:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    def _clean_title(self, text: str) -> str:
        """Clean and format task title"""
        title = text.strip()
        
        # Remove leading connectors
        leading_words = ['and', 'or', 'then', 'also', 'but', 'so', 'to']
        for word in leading_words:
            pattern = rf'^{word}\s+'
            title = re.sub(pattern, '', title, flags=re.IGNORECASE)
        
        # Remove trailing time expressions
        time_suffixes = [
            r'\s+(at\s+)?\d{1,2}(:\d{2})?\s*(am|pm)?\s*$',
            r'\s+(by\s+)?(tomorrow|today|tonight|eod|end\s+of\s+day)\s*$',
            r'\s+(by\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*$',
            r'\s+(next|this)\s+(week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*$',
            r'\s+now\s*$',
            r'\s+later\s*$',
            r'\s+soon\s*$',
            r'\s+asap\s*$',
        ]
        
        for pattern in time_suffixes:
            title = re.sub(pattern, '', title, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        title = re.sub(r'\s+', ' ', title).strip()
        
        # Remove trailing punctuation (except closing parentheses)
        title = re.sub(r'[,;:]+$', '', title).strip()
        
        # Truncate if too long
        if len(title) > 80:
            title = title[:77] + "..."
        
        # Capitalize first letter
        if title:
            title = title[0].upper() + title[1:]
        
        return title
    
    def _detect_priority(self, text: str) -> str:
        """Detect task priority from keywords"""
        text_lower = text.lower()
        
        # Check high priority first
        for keyword in self.PRIORITY_MAP['high']:
            if keyword in text_lower:
                return 'high'
        
        # Check medium priority
        for keyword in self.PRIORITY_MAP['medium']:
            if keyword in text_lower:
                return 'medium'
        
        # Check low priority
        for keyword in self.PRIORITY_MAP['low']:
            if keyword in text_lower:
                return 'low'
        
        # Default to low
        return 'low'
    
    def _detect_category(self, text: str) -> str:
        """Detect task category from keywords"""
        text_lower = text.lower()
        
        # Score each category
        scores = {cat: 0 for cat in self.CATEGORY_MAP}
        
        for category, keywords in self.CATEGORY_MAP.items():
            for keyword in keywords:
                if keyword in text_lower:
                    scores[category] += 1
        
        # Get category with highest score
        max_score = max(scores.values())
        if max_score > 0:
            for category, score in scores.items():
                if score == max_score:
                    return category
        
        # Default to Personal
        return 'Personal'


# Create global extractor instance
extractor = TaskExtractor()


def extract_tasks(text: str) -> List[Dict]:
    """Wrapper function for task extraction"""
    return extractor.extract(text)


# =============================================================================
# 🌐 API ENDPOINTS
# =============================================================================

@app.post("/api/process", response_model=dict)
async def process_text(request: TextRequest):
    """Extract tasks from text with comprehensive validation"""
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
    
    # Response
    if not tasks:
        return {
            "tasks": [],
            "count": 0,
            "message": "No actionable tasks found. Try using action words like 'call', 'email', 'buy', 'finish', 'meet'.",
            "suggestions": [
                "Use commas to separate tasks: 'Email boss, call John, buy groceries'",
                "Use 'and' or '+' between tasks: 'Finish report and send email'",
                "Include action verbs: 'call', 'email', 'buy', 'finish', 'meet'"
            ]
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
        "version": "3.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "smart_splitting": True,
            "parentheses_protection": True,
            "priority_detection": True,
            "category_detection": True,
            "time_extraction": True,
            "duplicate_prevention": True
        }
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "FlowPilot AI API",
        "version": "3.0.0",
        "description": "Advanced task extraction with smart NLP",
        "docs": "/docs",
        "endpoints": {
            "process": "POST /api/process",
            "health": "GET /api/health"
        },
        "features": [
            "Smart comma/and/or/+/then splitting",
            "Parentheses protection (won't split inside ())",
            "Priority detection (high/medium/low)",
            "Category detection (Work/Personal/Meeting/Finance/Health)",
            "Time extraction from tasks",
            "Duplicate task prevention"
        ]
    }


@app.get("/api/test")
async def test_extraction():
    """Test endpoint with sample extractions"""
    test_cases = [
        "Email boss tomorrow, gym 6pm, call Sarah about meeting",
        "Buy groceries + finish report and call John then gym at 6pm",
        "Finish Q1 report (including budget, timeline, and KPIs) by Friday",
        "Urgent: submit proposal ASAP, maybe clean room later",
        "Call doctor at 3pm and pick up medicine from pharmacy"
    ]
    
    results = []
    for test in test_cases:
        tasks = extract_tasks(test)
        results.append({
            "input": test,
            "task_count": len(tasks),
            "tasks": [{"title": t["title"], "priority": t["priority"], "category": t["category"]} for t in tasks]
        })
    
    return {"test_results": results}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)