# Lizzy's Bakery

Monorepo for Lizzy's Bakery: a React/Vite frontend and a Django REST backend.

## Layout

```
lizzys-bakery/
├── lizzys-bakery-frontend/   React 19 + TypeScript + Vite + Tailwind
└── lizzys-bakery-backend/    Django + Django REST Framework
```

Each app keeps its own dependencies, config, and `.env` file in its own folder.

## Setup

**Frontend**

```
cd lizzys-bakery-frontend
npm install
```

Requires `lizzys-bakery-frontend/.env` with `VITE_API_BASE_URL` set to the backend URL.

**Backend**

```
cd lizzys-bakery-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Requires `lizzys-bakery-backend/.env` with `SECRET_KEY`, `DEBUG`, and `DATABASE_URL` set.

**Root**

```
npm install
```

Installs `concurrently`, used to run both dev servers together.

## Running

Start both apps at once from the repo root:

```
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:8000

Or run each independently:

```
npm run dev:frontend
npm run dev:backend
```
