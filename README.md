# SuHeng Registration System

This repository now exposes a single formal product entry: the outpatient registration system. It includes patient registration, scheduling, quota control, refunds, authentication, password hashing, and audit logs.

## Product Scope

- Single product entry: `registration.html`
- Core capabilities: patient filing, doctor scheduling, registration, refund, audit
- Legacy demo pages are no longer product entry points

## Run

```powershell
python -m backend.server
```

Open:

```text
http://127.0.0.1:8000
```

## Key Files

- `registration.html`
- `registration-app.js`
- `registration.css`
- `backend/server.py`
- `backend/repository.py`
- `backend/schema.py`
