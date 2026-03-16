from __future__ import annotations

from datetime import date, timedelta

from backend.db import get_connection
from backend.security import hash_password


DOCTOR_SEEDS = [
    ("D001", "王医生", "心内科", "主任医师", 30.00, 12),
    ("D002", "赵医生", "呼吸科", "主治医师", 20.00, 10),
    ("D003", "钱医生", "神经科", "住院医师", 15.00, 8),
    ("D004", "孙医生", "全科门诊", "主治医师", 25.00, 15),
]

ACCOUNT_SEEDS = [
    ("demo.registrar", "Demo@123456", "挂号员", "REGISTRAR"),
    ("demo.supervisor", "Demo@123456", "运营主管", "SUPERVISOR"),
]


def initialize_database() -> None:
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS accounts (
                account_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL DEFAULT '',
                display_name TEXT NOT NULL,
                role_name TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
                session_id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                session_token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(account_id)
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
                audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER,
                actor_name TEXT NOT NULL,
                action_name TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT,
                detail_text TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(account_id)
            );

            CREATE TABLE IF NOT EXISTS patients (
                patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_no TEXT NOT NULL UNIQUE,
                patient_name TEXT NOT NULL,
                gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
                birth_date TEXT,
                phone TEXT,
                id_card TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS doctors (
                doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
                doctor_code TEXT NOT NULL UNIQUE,
                doctor_name TEXT NOT NULL,
                dept_name TEXT NOT NULL,
                title_name TEXT,
                fee_amount NUMERIC NOT NULL DEFAULT 0,
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS doctor_schedules (
                schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
                doctor_id INTEGER NOT NULL,
                visit_date TEXT NOT NULL,
                total_quota INTEGER NOT NULL CHECK (total_quota >= 0),
                available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(doctor_id, visit_date),
                FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
            );

            CREATE TABLE IF NOT EXISTS registrations (
                reg_id INTEGER PRIMARY KEY AUTOINCREMENT,
                reg_no TEXT NOT NULL UNIQUE,
                patient_id INTEGER NOT NULL,
                doctor_id INTEGER NOT NULL,
                visit_date TEXT NOT NULL,
                reg_fee NUMERIC NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('BOOKED', 'REFUNDED')),
                note TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                refunded_at TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
                FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
            );

            CREATE TABLE IF NOT EXISTS payment_records (
                payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                payment_no TEXT NOT NULL UNIQUE,
                reg_id INTEGER NOT NULL,
                payment_type TEXT NOT NULL CHECK (payment_type IN ('CHARGE', 'REFUND')),
                payment_amount NUMERIC NOT NULL,
                operator_name TEXT,
                payment_status TEXT NOT NULL DEFAULT 'SUCCESS',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reg_id) REFERENCES registrations(reg_id)
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_token
                ON sessions(session_token);
            CREATE INDEX IF NOT EXISTS idx_audit_created_at
                ON audit_logs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_schedules_visit_date
                ON doctor_schedules(visit_date);
            CREATE INDEX IF NOT EXISTS idx_registrations_visit_date
                ON registrations(visit_date);
            CREATE INDEX IF NOT EXISTS idx_registrations_patient
                ON registrations(patient_id);
            CREATE INDEX IF NOT EXISTS idx_registrations_doctor
                ON registrations(doctor_id);
            CREATE INDEX IF NOT EXISTS idx_payments_reg
                ON payment_records(reg_id);
            """
        )

        _ensure_column(connection, "accounts", "password_hash", "TEXT NOT NULL DEFAULT ''")

        for username, password, display_name, role_name in ACCOUNT_SEEDS:
            connection.execute(
                """
                INSERT INTO accounts (username, password, password_hash, display_name, role_name, active)
                SELECT ?, '', ?, ?, ?, 1
                WHERE NOT EXISTS (
                    SELECT 1 FROM accounts WHERE username = ?
                )
                """,
                (username, hash_password(password), display_name, role_name, username),
            )

        _migrate_legacy_passwords(connection)

        for doctor_code, doctor_name, dept_name, title_name, fee_amount, default_quota in DOCTOR_SEEDS:
            connection.execute(
                """
                INSERT INTO doctors (
                    doctor_code, doctor_name, dept_name, title_name, fee_amount, active
                )
                SELECT ?, ?, ?, ?, ?, 1
                WHERE NOT EXISTS (
                    SELECT 1 FROM doctors WHERE doctor_code = ?
                )
                """,
                (doctor_code, doctor_name, dept_name, title_name, fee_amount, doctor_code),
            )
            doctor_id_row = connection.execute(
                "SELECT doctor_id FROM doctors WHERE doctor_code = ?",
                (doctor_code,),
            ).fetchone()
            _seed_schedule_window(connection, int(doctor_id_row["doctor_id"]), default_quota)


def _ensure_column(connection, table_name: str, column_name: str, definition: str) -> None:
    columns = connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    if any(row["name"] == column_name for row in columns):
        return
    connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")


def _migrate_legacy_passwords(connection) -> None:
    rows = connection.execute(
        """
        SELECT account_id, password, password_hash
        FROM accounts
        """
    ).fetchall()
    for row in rows:
        current_hash = row["password_hash"] or ""
        legacy_password = row["password"] or ""
        if current_hash:
            continue
        if not legacy_password:
            continue
        connection.execute(
            """
            UPDATE accounts
            SET password_hash = ?, password = ''
            WHERE account_id = ?
            """,
            (hash_password(legacy_password), row["account_id"]),
        )


def _seed_schedule_window(connection, doctor_id: int, default_quota: int) -> None:
    for offset in range(0, 14):
        visit_date = (date.today() + timedelta(days=offset)).isoformat()
        connection.execute(
            """
            INSERT INTO doctor_schedules (
                doctor_id, visit_date, total_quota, available
            )
            SELECT ?, ?, ?, 1
            WHERE NOT EXISTS (
                SELECT 1 FROM doctor_schedules
                WHERE doctor_id = ? AND visit_date = ?
            )
            """,
            (doctor_id, visit_date, default_quota, doctor_id, visit_date),
        )
