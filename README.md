```markdown
# ⚡ FlowPilot AI — Smart Task Extraction & Google Calendar Sync

**2-Week SCRUM Project | B.Tech CSE Portfolio | Feb 19 - Mar 4, 2026**

[![Live App](https://img.shields.io/badge/App-Live-success)](https://flowpilot-app.vercel.app/)
[![API Status](https://img.shields.io/badge/API-Ready-brightgreen)](https://flowpilot-app.onrender.com/docs)
[![Sprint](https://img.shields.io/badge/SCRUM-Day%207/14-blue)](https://github.com/sravanyadav-19/FlowPilot_App)

---

## 🎯 What It Does

Paste messy text → AI extracts structured tasks → Push to Google Calendar in 1 click

```
Input:  "Email boss tomorrow at 2pm, gym 6pm, call Sarah about meeting"
                    ↓ AI extracts + prioritizes
Output: 3 tasks → Kanban Board → Push to Google Calendar ✨
```

---

## ✅ Live Features

### 🤖 AI Task Extraction
- **Dual AI Engine** — OpenAI GPT-3.5-turbo + Smart Local NLP Fallback
- **Smart Splitting** — Commas, "and", "+", "then", "also", "or", periods, semicolons, newlines
- **Parentheses Protection** — `"Buy groceries (milk, eggs, bread)"` stays as one task
- **Sarcasm Detection** — Filters out non-actionable text
- **First Person Removal** — `"I want to update resume"` → `"Update resume."`

### 📅 Date & Time Intelligence
- Specific times: `"at 2pm"`, `"3:30pm"`, `"14:00"`
- Relative dates: `"tomorrow"`, `"next Friday"`, `"this week"`
- Time keywords: `"morning"` → 9am, `"noon"` → 12pm, `"evening"` → 6pm
- Combined: `"tomorrow at 2pm"` → Full ISO datetime

### 🏷️ Auto-Classification
- **Priority Detection:** urgent/ASAP → High, tomorrow/Friday → Medium, maybe/later → Low
- **Category Detection:** boss/report → Work, gym/groceries → Personal, call/meeting → Meeting
- **Assignee Extraction:** `"assign to John"`, `"tell Sarah"`, `"remind David"`

### 📋 Kanban Board
- **Ready for Calendar** — Tasks with dates (auto-sorted)
- **Needs Review** — Tasks missing dates (with clarification prompts)
- **Drag & Drop** — Move tasks between columns by dragging
- **Inline Editing** — Click title to edit, click priority to change

### 🗓️ Google Calendar Sync
- One-click OAuth 2.0 sign-in
- Push ready tasks to Google Calendar instantly
- Proper timezone handling
- Session management with auto-refresh

### 🌙 Dark Mode
- Smooth toggle with system preference detection
- Persists across sessions via localStorage
- Every component styled for both themes

### 🔍 Search & Filter
- Real-time search by title, text, or assignee
- Filter by priority (High/Medium/Low)
- Filter by category (Work/Personal/Meeting)
- Sort by priority, date, or category

### 📤 Export System
- Download tasks as JSON
- Download tasks as CSV (opens in Excel/Sheets)
- One-click copy to clipboard

### ⌨️ Keyboard Shortcuts
| Shortcut       | Action                      |
|----------------|-----------------------------|
| `Ctrl + Enter` | Extract tasks               |
| `Ctrl + D`     | Toggle dark mode            |
| `Ctrl + K`     | Focus search bar            |
| `Ctrl + Z`     | Undo last action            |
| `?`            | Show shortcuts panel        |
| `Esc`          | Close modals / Clear search |

### ↩️ Undo System
- Undo delete, move, edit, priority change, date change
- Floating undo button + Ctrl+Z support
- Stack of 20 actions

### 🔒 Production Security
- CORS protection (whitelist-only origins)
- Input validation (3-10,000 characters)
- Request timeout handling
- Error recovery with user-friendly messages

---

**Live App:** [https://flowpilot-app.vercel.app/](https://flowpilot-app.vercel.app/)
**API Docs:** [https://flowpilot-app.onrender.com/docs](https://flowpilot-app.onrender.com/docs)
**API Tests:** [https://flowpilot-app.onrender.com/api/test](https://flowpilot-app.onrender.com/api/test)

---

## 🚀 Quick Start

### Backend (FastAPI)

```bash
git clone https://github.com/sravanyadav-19/FlowPilot_App.git
cd FlowPilot_App
cp .env.example .env          # Edit with your API keys
pip install -r requirements.txt
uvicorn backend.main:app --reload
# API Docs → http://localhost:8000/docs
```

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm start
# App → http://localhost:3000
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS |
| **Backend** | FastAPI + Python 3.11 + Pydantic |
| **AI** | OpenAI GPT-3.5-turbo + Smart NLP Fallback |
| **Calendar** | Google Calendar API + OAuth 2.0 |
| **Deploy** | Vercel (Frontend) + Render.com (Backend) |

---

## 📅 Sprint Roadmap

```
✅ Day 1: FastAPI + Render.com deployment LIVE
✅ Day 2: AI Task Extraction (OpenAI + Regex fallback)
✅ Day 3: React Frontend + Tailwind CSS + TypeScript
✅ Day 4: Google Calendar OAuth + Kanban Board
✅ Day 5: Task Actions (Edit/Delete/Move) + localStorage
✅ Day 6: Dark Mode + Search/Filter + Export (JSON/CSV)
✅ Day 7: Drag & Drop + Keyboard Shortcuts + Date Picker + Undo
⏳ Day 8-14: Statistics + Templates + Polish + Testing
```

---

## 🏗️ Project Structure

```
FlowPilot_App/
├── backend/
│   ├── __init__.py
│   └── main.py                        # FastAPI + AI extraction engine
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.tsx            # Task card with edit/delete/drag
│   │   │   ├── EmptyState.tsx          # Empty column UI
│   │   │   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   │   │   ├── FilterBar.tsx           # Search + priority/category filters
│   │   │   ├── ExportMenu.tsx          # JSON/CSV/clipboard export
│   │   │   ├── DragDropColumn.tsx      # Drag & drop kanban column
│   │   │   ├── DatePicker.tsx          # Inline date/time picker
│   │   │   └── ShortcutsModal.tsx      # Keyboard shortcuts panel
│   │   ├── hooks/
│   │   │   ├── useTaskExtractor.ts     # API integration + task extraction
│   │   │   ├── useLocalStorage.ts      # Persistent storage hook
│   │   │   ├── useTheme.ts            # Dark mode management
│   │   │   ├── useExport.ts           # JSON/CSV/clipboard export
│   │   │   ├── useDragDrop.ts         # HTML5 drag & drop logic
│   │   │   ├── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   │   │   └── useUndoRedo.ts         # Undo/redo action stack
│   │   ├── types/
│   │   │   └── task.ts                # TypeScript interfaces
│   │   ├── App.tsx                    # Main application
│   │   ├── index.tsx                  # React entry point
│   │   └── index.css                  # Tailwind + animations
│   ├── .env                           # Frontend config
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .env.example                       # Environment template
├── requirements.txt                   # Python dependencies
├── render.yaml                        # Render deployment config
├── runtime.txt                        # Python version pin
└── README.md
```

---

## 🧪 API Examples

### Extract Tasks

```bash
curl -X POST https://flowpilot-app.onrender.com/api/process \
  -F "text=Email boss tomorrow at 2pm, gym 6pm, call Sarah about meeting"
```

### Response

```json
{
  "tasks": [
    {
      "id": "a3b2c1d4",
      "title": "Email boss.",
      "priority": "medium",
      "category": "Work",
      "due_date": "2026-02-23T14:00:00",
      "is_clarified": true
    },
    {
      "id": "e5f6g7h8",
      "title": "Gym.",
      "priority": "medium",
      "category": "Personal",
      "due_date": "2026-02-22T18:00:00",
      "is_clarified": true
    },
    {
      "id": "i9j0k1l2",
      "title": "Call Sarah about meeting.",
      "priority": "medium",
      "category": "Meeting",
      "due_date": null,
      "is_clarified": false
    }
  ],
  "clarifications": [
    {
      "id": "i9j0k1l2",
      "task_title": "Call Sarah about meeting.",
      "question": "When is this due?"
    }
  ]
}
```

### Health Check

```bash
curl https://flowpilot-app.onrender.com/api/health
```

### Run Test Cases

```bash
curl https://flowpilot-app.onrender.com/api/test
```

---

## 🎯 Smart Splitting Examples

| Input | Tasks | Feature |
|-------|-------|---------|
| `"Email boss, gym 6pm, call Sarah"` | 3 tasks | Comma splitting |
| `"Buy groceries + finish report"` | 2 tasks | Plus splitting |
| `"Call John and email Sarah then clean room"` | 3 tasks | And/then splitting |
| `"Buy groceries (milk, eggs, bread)"` | 1 task | Parentheses protection |
| `"Submit proposal ASAP, maybe clean later"` | 2 tasks | Priority detection |
| `"Assign slides to John by Wednesday"` | 1 task | Assignee extraction |
| `"I want to update my resume by Friday"` | 1 task | First person removal |
| `"Yeah right I'll do this in 5 minutes"` | 0 tasks | Sarcasm filtered |

---

## 🔐 Environment Variables

### Backend (.env)

```env
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ALLOWED_ORIGINS=https://flowpilot-app.vercel.app,http://localhost:3000
DEBUG=false
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://flowpilot-app.onrender.com
```

---

## 🚀 Deployment

### Backend → Render.com

1. Connect GitHub repo to Render
2. Set environment variables in Render Dashboard
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Root Directory: `frontend`
3. Framework: Create React App
4. Add `REACT_APP_API_URL` environment variable

---

## 🐛 Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Request timeout" | Render free tier sleeping | Wait 30s, retry |
| CORS error | Frontend URL not whitelisted | Add to `ALLOWED_ORIGINS` |
| "No tasks found" | No action verbs in text | Use: call, email, buy, finish |
| "LOCAL" badge | No OpenAI key set | Add `OPENAI_API_KEY` in .env |
| Tasks not saving | localStorage full/disabled | Clear browser data |
| Drag not working | Touch device | Use Move button instead |

---

## 📊 Day-by-Day Build Log

| Day | Features Shipped | Lines Changed |
|-----|-----------------|---------------|
| Day 1 | FastAPI backend + Render deployment | ~200 |
| Day 2 | AI extraction (GPT + Regex) | ~350 |
| Day 3 | React + TypeScript + Tailwind frontend | ~400 |
| Day 4 | Google Calendar OAuth + Kanban board | ~500 |
| Day 5 | Edit/Delete/Move + localStorage persistence | ~450 |
| Day 6 | Dark mode + Search/Filter + Export | ~666 |
| Day 7 | Drag & Drop + Shortcuts + Date Picker + Undo | ~600 |
| **Total** | **Full-stack AI app** | **~3,166** |

---

## 👨‍💻 Author

**Sravan Yadav**
📍 Thullur, Tirupati
🎓 B.Tech CSE 2026
🔗 [GitHub](https://github.com/sravanyadav-19) | [Live App](https://flowpilot-app.vercel.app/)

---

## 📜 License

MIT License — Free to use for learning and portfolio projects.

---

⭐ **Star this repo if you found it helpful!**
