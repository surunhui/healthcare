# SuHeng Outpatient Registration System

This repository contains a local runnable outpatient registration system with two connected portals:

- Patient portal: self-service registration and appointment lookup
- Hospital portal: patient filing, scheduling, registration management, refund handling, and audit logs

Both portals use the same backend service and the same SQLite database, so a registration created on the patient side is immediately visible on the hospital side.

## Features

- Patient create, update, search, and delete
- Doctor schedule and quota management
- Registration create, update, delete, and refund
- Patient self-service registration
- Hospital login, role control, and audit logs
- Local SQLite persistence

## Run

Start the backend from the project root:

```powershell
python -m backend.server
```

Then open:

```text
http://127.0.0.1:8000
```

You can also start the project with:

```text
启动苏衡门诊挂号系统.bat
```

## Main Entry Points

- `index.html`: unified product entry page
- `patient.html`: patient portal
- `registration.html`: hospital workstation

## Core Files

- `patient-app.js`: patient-side interaction logic
- `registration-app.js`: hospital-side interaction logic
- `backend/server.py`: HTTP routing and static file serving
- `backend/repository.py`: core business logic
- `backend/schema.py`: database schema and seed data
- `backend/db.py`: database connection management

## Data Flow

Example: a patient registers on the patient portal, and the hospital portal sees the same record.

1. `patient.html` collects visit date, doctor selection, and patient information.
2. `patient-app.js` validates the form and sends a request to the public registration API.
3. `backend/server.py` receives the request and forwards it to the repository layer.
4. `backend/repository.py` checks patient data, doctor availability, schedule, and remaining quota.
5. The backend writes data into `patients`, `registrations`, and `payment_records`.
6. `registration-app.js` loads registration records from the same database and renders them in the hospital portal.

## Repository Notes

- Local databases, debug logs, and temporary browser files are excluded from version control.
- Startup scripts use relative paths so the project can be cloned into any directory.
- Legacy demo pages remain only as redirect pages to the unified entry.

## License

MIT
