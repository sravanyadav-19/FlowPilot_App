

```markdown
# ⚡ FlowPilot AI — Smart Task Extraction & Google Calendar Sync

**2-Week SCRUM Project | B.Tech CSE Portfolio | Feb 19 - Mar 4, 2026**

[![Live App](https://img.shields.io/badge/App-Live-success)](https://flowpilot-app.vercel.app/)
[![API Status](https://img.shields.io/badge/API-Ready-brightgreen)](https://flowpilot-app.onrender.com/docs)
[![Sprint](https://img.shields.io/badge/SCRUM-Day%204/14-blue)](https://github.com/sravanyadav-19/FlowPilot_App)

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

- **🤖 Dual AI Engine** — OpenAI GPT-3.5-turbo + Smart Local NLP Fallback
- **🔪 Smart Splitting** — Commas, "and", "+", "then", "also", periods, newlines
- **🛡️ Parentheses Protection** — `"Buy groceries (milk, eggs, bread)"` stays as one task
- **📅 Date/Time Parsing** — "tomorrow at 2pm", "next Friday", "6pm", "morning"
- **🏷️ Auto-Classification** — Priority (high/medium/low) + Category (Work/Personal/Meeting)
- **📋 Kanban Board** — Ready for Calendar | Needs Review
- **🗓️ Google Calendar Sync** — One-click push with OAuth 2.0
- **😏 Sarcasm Detection** — Filters out non-actionable text
- **🔒 Production Security** — CORS protection, input validation, rate limiting

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
| **AI** | OpenAI GPT-3.5-turbo + Regex NLP Fallback |
| **Calendar** | Google Calendar API + OAuth 2.0 |
| **Deploy** | Vercel (Frontend) + Render.com (Backend) |

---

## 📅 Sprint Roadmap

```
✅ Day 1: FastAPI + Render.com deployment LIVE
✅ Day 2: AI Task Extraction (OpenAI + Regex fallback)
✅ Day 3: React Frontend + Tailwind CSS + TypeScript
✅ Day 4: Google Calendar OAuth + Kanban Board
⏳ Day 5: Drag & Drop task management
⏳ Day 6-14: Polish + Testing + Documentation
```

---

## 🏗️ Project Structure

```
FlowPilot_App/
├── backend/
│   ├── __init__.py
│   └── main.py                    # FastAPI + AI extraction engine
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.tsx       # Task display component
│   │   │   └── EmptyState.tsx     # Empty state UI
│   │   ├── hooks/
│   │   │   └── useTaskExtractor.ts # API integration hook
│   │   ├── types/
│   │   │   └── task.ts            # TypeScript interfaces
│   │   ├── App.tsx                # Main application
│   │   ├── index.tsx              # React entry point
│   │   └── index.css              # Tailwind imports
│   ├── .env                       # Frontend environment config
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .env.example                   # Environment template
├── requirements.txt               # Python dependencies
├── render.yaml                    # Render.com deployment config
├── runtime.txt                    # Python version pin
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

## 🐛 Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Request timeout" | Render free tier sleeping | Wait 30s, retry |
| CORS error | Frontend URL not whitelisted | Add to `ALLOWED_ORIGINS` |
| "No tasks found" | No action verbs in text | Use: call, email, buy, finish |
| "LOCAL" badge | No OpenAI key set | Add `OPENAI_API_KEY` in .env |

---

## 🎯 Smart Splitting Examples

| Input | Tasks Created |
|-------|--------------|
| `"Email boss, gym 6pm, call Sarah"` | 3 tasks |
| `"Buy groceries + finish report"` | 2 tasks |
| `"Call John and email Sarah then clean room"` | 3 tasks |
| `"Buy groceries (milk, eggs, bread)"` | 1 task (parentheses protected) |
| `"Submit proposal ASAP, maybe clean later"` | 2 tasks (high + low priority) |

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
```