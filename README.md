## Project Overview

This repository contains a full-stack application for configuring AI Agents, connecting data sources, and generating articles on-demand.

- Frontend: React app for creating agents, connecting data sources, and managing article generation and viewing
- Backend: Django REST API for managing organizations, agent instances, data sources, and articles

### Key Features
- Guided agent creation flow with progress stepper
- Connect existing workspace data sources and manage connected sources
- Separate completion and on-demand article generation
- Home screen displaying configured agents with actions to generate or view articles
- Articles page showing titles, timestamps, and full content per agent


## Tech Stack
- **Frontend**: React, Redux Toolkit, Vite, CSS (custom)
- **Backend**: Django, Django REST Framework, SQLite (dev)
- **Runtime**: Node.js (frontend), Python 3.10+ (backend)


## Quick Start

### Prerequisites
- Node.js 18+ and npm (`node -v`, `npm -v`)
- Python 3.10+ and pip (`python --version`, `pip --version`)
- Git


## Backend Setup (Django)

1) Open a terminal and navigate to the backend folder:
```bash
cd agent_setup
```

2) Create and activate a virtual environment:
```bash
# Windows (PowerShell)
python -m venv .venv
. .venv/Scripts/Activate.ps1

# macOS/Linux (bash)
python3 -m venv .venv
source .venv/bin/activate
```

3) Install dependencies:
```bash
pip install -r requirements.txt
```

4) Apply migrations and start the server:
```bash
python manage.py makemigrations core
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Optional: create an admin user for Django admin:
```bash
python manage.py createsuperuser
```

The API runs at `http://localhost:8000`.


## Frontend Setup (React)

1) Open a new terminal and navigate to the frontend:
```bash
cd frontend
```

2) Install dependencies:
```bash
npm install
```

3) Start the dev server:
```bash
npm run dev
```

The app runs at the address printed by the dev server (typically `http://localhost:5173`). The frontend expects the backend at `http://localhost:8000` (configured in API calls).


## Project Structure

```text
agentassign/
├─ agent_setup/                # Django project root
│  ├─ agent_setup/             # Django settings and URLs
│  ├─ core/                    # App with models, serializers, views, urls
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ views.py
│  │  ├─ urls.py
│  │  └─ utils.py              # Article generation and helpers
│  ├─ media/                   # Uploaded files (e.g., CSVs)
│  ├─ manage.py
│  ├─ requirements.txt
│  └─ README.md                # Backend-specific docs
│
├─ frontend/                   # React app root
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ AgentCreationDialog/
│  │  │  ├─ common/
│  │  │  └─ HomeScreen.jsx
│  │  ├─ store/                # Redux slices and store setup
│  │  ├─ hooks/                # Typed Redux hooks
│  │  ├─ App.jsx
│  │  └─ index.css
│  └─ package.json
└─ README.md                   # This file
```


## Core Flows

### Agent Creation and Data Sources
- Progress stepper shows relevant steps
- Left panel lists workspace data sources and connected sources
- Right panel shows Agent Summary (type, name, configuration)
- File upload UI remains available (collapsible)

### Completing Setup vs Generating Articles
- Completing setup saves the configured agent and returns to the Home screen
- Article generation is initiated from the Home screen (per agent)
- Articles page displays content for the selected agent


## API Overview (selected)

- Health check: `GET /health/`
- Organizations: `GET /organizations/list/`
- Agent instances (list): `GET /agent-instances/list/`
- Agent instance articles (generate or create): `POST /agent-instances/{instance_id}/articles/`
- Articles for agent: `GET /narratives/agent/{instance_id}/`
- Data source link to agent: `POST /agent-instances/{instance_id}/datasources/`

Responses include standard fields; article responses include `id`, `title`, `content`, `agent_instance`, `created_at`.


## Configuration

- Backend uses SQLite by default. Adjust database settings in `agent_setup/agent_setup/settings.py` if needed.
- CORS: Ensure your environment allows frontend origin to access the backend (add CORS middleware if you host separately).
- Frontend API base is hard-coded as `http://localhost:8000` in Redux thunks under `frontend/src/store/slices/`.


## Development Tips

- Keep both servers running:
  - Backend: `python manage.py runserver`
  - Frontend: `npm run dev`
- Update models: `python manage.py makemigrations core && python manage.py migrate`
- Check server health: `GET /health/`


## Troubleshooting

- Frontend can’t reach API
  - Ensure backend is on `http://localhost:8000`
  - Check network/CORS if served on different hosts/ports

- No articles shown after generation
  - Confirm data source is linked to the agent
  - Call `POST /agent-instances/{id}/articles/` (no payload needed for auto-generation)
  - Then load `GET /narratives/agent/{id}/`

- Database errors or missing tables
  - Re-run migrations: `python manage.py makemigrations core && python manage.py migrate`


## Notes

- Legacy local test and database utility scripts have been removed to keep the backend clean. Use Django management commands and API endpoints instead.


