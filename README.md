\# FlowPilot - AI Task -> Google Calendar



2-Week SCRUM Project | B.Tech CSE Portfolio | Feb 19 - Mar 4, 2026



\[Sprint Status](https://img.shields.io/badge/SCRUM-Day%207/14-blue) | \[Live Demo](https://img.shields.io/badge/Live-🟢-success)



\## What it does

Text -> AI Tasks -> Google Calendar (1-click sync)



"Finish report tomorrow 2pm + Call John Friday"

↓ AI extracts + prioritizes

→ Kanban: Ready / Needs Review

→ Push to Google Calendar



\## Live Features

\- AI Task Extraction (OpenAI GPT-4o + Regex fallback)

\- Kanban Workflow (Ready vs Review)

\- Smart Date Detection ("tomorrow 2pm" → ISO)

\- Production Deployed (Docker/Rate Limiting ready)



\## Quick Start (60 seconds)

```bash

git clone https://github.com/sravanyadav-19/FlowPilot\_App.git

cd FlowPilot\_App

pip install -r requirements.txt

uvicorn backend.main:app --reload



Open: http://localhost:8000



Tech Stack

FastAPI • OpenAI GPT-4o • Google OAuth2 • Redis • Docker



Sravan Yadav | Thullur| Tirupati | B.Tech CSE 2026

