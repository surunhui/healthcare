from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any

from backend.db import get_connection
from backend.security import verify_password


# 作用：把 sqlite3.Row 统一转成普通字典，方便后端继续处理和返回 JSON。
# 数据来源：数据库查询结果的一行 row。
# 结果去向：返回给仓储层各函数，最终再交给 server.py 或前端页面。
def _row_to_dict(row: Any) -> dict[str, Any]:
    return dict(row) if row is not None else {}


@dataclass
class RegistrationRepository:
    session_hours: int = 12

    # 作用：校验医院端账号密码，创建会话 token。
    # 数据来源：server.py 从 /api/login 收到的 username 和 password。
    # 结果去向：写入 sessions、audit_logs，并把 token 与账号信息返回给医院端。
    def login(self, username: str, password: str) -> dict[str, Any]:
        username = username.strip()
        if not username or not password:
            raise ValueError("用户名和密码不能为空")

        with get_connection() as connection:
            row = connection.execute(
                """
                SELECT account_id, username, password_hash, display_name, role_name, active
                FROM accounts
                WHERE username = ?
                """,
                (username,),
            ).fetchone()
            if row is None or int(row["active"] or 0) != 1:
                raise ValueError("用户名或密码错误")
            if not verify_password(password, row["password_hash"] or ""):
                raise ValueError("用户名或密码错误")

            token = secrets.token_hex(24)
            expires_at = (datetime.now() + timedelta(hours=self.session_hours)).isoformat(timespec="seconds")
            connection.execute("DELETE FROM sessions WHERE account_id = ?", (row["account_id"],))
            connection.execute(
                """
                INSERT INTO sessions (account_id, session_token, expires_at)
                VALUES (?, ?, ?)
                """,
                (row["account_id"], token, expires_at),
            )
            account = _row_to_dict(row)
            account.pop("password_hash", None)
            self._write_audit(connection, account, "LOGIN", "SESSION", token, "用户登录成功")
        return {"token": token, "expires_at": expires_at, "account": account}

    # 作用：让当前 token 失效，完成退出登录。
    # 数据来源：server.py 解析出的 token 和当前账号信息。
    # 结果去向：删除 sessions 中的会话，并写入审计日志。
    def logout(self, token: str, account: dict[str, Any]) -> None:
        with get_connection() as connection:
            connection.execute("DELETE FROM sessions WHERE session_token = ?", (token,))
            self._write_audit(connection, account, "LOGOUT", "SESSION", token, "用户退出登录")

    # 作用：根据 token 找到当前登录账号，并检查登录是否过期。
    # 数据来源：请求头中的 Bearer token。
    # 结果去向：返回当前账号给 server.py 做权限判断和业务处理。
    def get_account_by_token(self, token: str) -> dict[str, Any]:
        if not token:
            raise ValueError("请先登录")
        with get_connection() as connection:
            row = connection.execute(
                """
                SELECT a.account_id, a.username, a.display_name, a.role_name, a.active, s.expires_at
                FROM sessions s
                INNER JOIN accounts a ON a.account_id = s.account_id
                WHERE s.session_token = ?
                """,
                (token,),
            ).fetchone()
            if row is None:
                raise ValueError("登录状态已失效，请重新登录")
            expires_at = datetime.fromisoformat(str(row["expires_at"]))
            if expires_at <= datetime.now():
                connection.execute("DELETE FROM sessions WHERE session_token = ?", (token,))
                raise ValueError("登录已过期，请重新登录")
            if int(row["active"] or 0) != 1:
                raise PermissionError("当前账号已停用")
            account = _row_to_dict(row)
            account.pop("expires_at", None)
            return account

    # 作用：校验当前账号是否拥有目标角色。
    # 数据来源：当前账号 account 和接口要求的 roles。
    # 结果去向：允许继续执行，或抛出权限错误给前端。
    def assert_role(self, account: dict[str, Any], roles: set[str]) -> None:
        if (account or {}).get("role_name") not in roles:
            raise PermissionError("当前角色没有操作权限")

    # 作用：查询审计日志，供医院端审计模块展示。
    # 数据来源：audit_logs 表和 limit 参数。
    # 结果去向：返回给工作台页面渲染操作日志列表。
    def list_audit_logs(self, limit: int = 50) -> list[dict[str, Any]]:
        safe_limit = max(1, min(int(limit or 50), 200))
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT audit_id, actor_name, action_name, entity_type, entity_id, detail_text, created_at
                FROM audit_logs
                ORDER BY audit_id DESC
                LIMIT ?
                """,
                (safe_limit,),
            ).fetchall()
        return [_row_to_dict(row) for row in rows]

    # 作用：查询指定日期的医生列表，并计算剩余号源。
    # 数据来源：doctors、doctor_schedules、registrations 和 visit_date。
    # 结果去向：返回给患者端选医生，也返回给医院端挂号和排班模块。
    def list_doctors(self, visit_date: str | None = None) -> list[dict[str, Any]]:
        target_date = (visit_date or date.today().isoformat()).strip()
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    d.doctor_id,
                    d.doctor_code,
                    d.doctor_name,
                    d.dept_name,
                    d.title_name,
                    d.fee_amount,
                    d.active,
                    COALESCE(s.schedule_id, 0) AS schedule_id,
                    COALESCE(s.visit_date, ?) AS visit_date,
                    COALESCE(s.total_quota, 0) AS total_quota,
                    COALESCE(s.available, 0) AS available,
                    COALESCE((
                        SELECT COUNT(*)
                        FROM registrations r
                        WHERE r.doctor_id = d.doctor_id
                          AND r.visit_date = ?
                          AND r.status = 'BOOKED'
                    ), 0) AS booked_count
                FROM doctors d
                LEFT JOIN doctor_schedules s
                    ON s.doctor_id = d.doctor_id
                   AND s.visit_date = ?
                WHERE d.active = 1
                ORDER BY d.dept_name, d.doctor_name
                """,
                (target_date, target_date, target_date),
            ).fetchall()
        items: list[dict[str, Any]] = []
        for row in rows:
            item = _row_to_dict(row)
            total_quota = int(item.get("total_quota") or 0)
            booked_count = int(item.get("booked_count") or 0)
            available = int(item.get("available") or 0)
            item["remaining_quota"] = max(total_quota - booked_count, 0) if available == 1 else 0
            items.append(item)
        return items

    # 作用：推荐默认业务日期，避免今天无排班时整页都不可挂号。
    # 数据来源：前端传来的 preferred_date 和 doctor_schedules 的日期分布。
    # 结果去向：返回最合适的 visit_date 给患者端和医院端自动对齐。
    def get_default_visit_date(self, preferred_date: str | None = None) -> str:
        target_date = (preferred_date or date.today().isoformat()).strip()
        with get_connection() as connection:
            exact = connection.execute(
                """
                SELECT 1
                FROM doctor_schedules
                WHERE visit_date = ?
                LIMIT 1
                """,
                (target_date,),
            ).fetchone()
            if exact is not None:
                return target_date

            next_row = connection.execute(
                """
                SELECT MIN(visit_date) AS visit_date
                FROM doctor_schedules
                WHERE visit_date >= ?
                """,
                (target_date,),
            ).fetchone()
            if next_row and next_row["visit_date"]:
                return str(next_row["visit_date"])

            latest_row = connection.execute("SELECT MAX(visit_date) AS visit_date FROM doctor_schedules").fetchone()
            if latest_row and latest_row["visit_date"]:
                return str(latest_row["visit_date"])
        return target_date

    # 作用：查询某一天的排班详情和已挂号数量。
    # 数据来源：doctor_schedules、doctors、registrations 和 visit_date。
    # 结果去向：返回给医院端当日排班与号源表格。
    def list_schedules(self, visit_date: str) -> list[dict[str, Any]]:
        target_date = visit_date.strip()
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    s.schedule_id,
                    s.visit_date,
                    s.total_quota,
                    s.available,
                    d.doctor_id,
                    d.doctor_name,
                    d.dept_name,
                    COALESCE((
                        SELECT COUNT(*)
                        FROM registrations r
                        WHERE r.doctor_id = d.doctor_id
                          AND r.visit_date = s.visit_date
                          AND r.status = 'BOOKED'
                    ), 0) AS booked_count
                FROM doctor_schedules s
                INNER JOIN doctors d ON d.doctor_id = s.doctor_id
                WHERE s.visit_date = ?
                ORDER BY d.dept_name, d.doctor_name
                """,
                (target_date,),
            ).fetchall()
        items: list[dict[str, Any]] = []
        for row in rows:
            item = _row_to_dict(row)
            item["remaining_quota"] = max(int(item["total_quota"]) - int(item["booked_count"]), 0) if int(item["available"]) == 1 else 0
            items.append(item)
        return items

    # 作用：新增或更新一条排班记录。
    # 数据来源：医院端排班表单 payload 和当前账号。
    # 结果去向：写入 doctor_schedules、audit_logs，并把最新排班回传前端。
    def save_schedule(self, payload: dict[str, Any], account: dict[str, Any]) -> dict[str, Any]:
        doctor_id = int(payload["doctor_id"])
        visit_date = str(payload["visit_date"]).strip()
        total_quota = int(payload["total_quota"])
        available = 1 if bool(payload.get("available", True)) else 0
        if total_quota < 0:
            raise ValueError("总号源不能小于 0")

        with get_connection() as connection:
            doctor = connection.execute(
                "SELECT doctor_id FROM doctors WHERE doctor_id = ? AND active = 1",
                (doctor_id,),
            ).fetchone()
            if doctor is None:
                raise ValueError("医生不存在或已停用")

            booked = connection.execute(
                """
                SELECT COUNT(*) AS booked_count
                FROM registrations
                WHERE doctor_id = ?
                  AND visit_date = ?
                  AND status = 'BOOKED'
                """,
                (doctor_id, visit_date),
            ).fetchone()
            booked_count = int(booked["booked_count"] or 0)
            if total_quota < booked_count:
                raise ValueError("总号源不能小于当前已挂号数量")

            connection.execute(
                """
                INSERT INTO doctor_schedules (doctor_id, visit_date, total_quota, available)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(doctor_id, visit_date)
                DO UPDATE SET
                    total_quota = excluded.total_quota,
                    available = excluded.available,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (doctor_id, visit_date, total_quota, available),
            )
            self._write_audit(connection, account, "SAVE_SCHEDULE", "SCHEDULE", f"{doctor_id}:{visit_date}", f"保存排班，总号源={total_quota}，状态={'出诊' if available == 1 else '停诊'}")
            row = self._get_schedule_item(connection, doctor_id, visit_date)
        return _row_to_dict(row)

    # 作用：删除一条排班记录，但不能删除已有挂号的排班。
    # 数据来源：doctor_id、visit_date 和当前账号。
    # 结果去向：删除 doctor_schedules 中的数据，并写入审计日志。
    def delete_schedule(self, doctor_id: int, visit_date: str, account: dict[str, Any]) -> None:
        with get_connection() as connection:
            booked = connection.execute(
                """
                SELECT COUNT(*) AS booked_count
                FROM registrations
                WHERE doctor_id = ?
                  AND visit_date = ?
                  AND status = 'BOOKED'
                """,
                (doctor_id, visit_date),
            ).fetchone()
            if int(booked["booked_count"] or 0) > 0:
                raise ValueError("当前排班下已有挂号记录，不能删除，请先处理挂号记录")

            connection.execute(
                "DELETE FROM doctor_schedules WHERE doctor_id = ? AND visit_date = ?",
                (doctor_id, visit_date),
            )
            self._write_audit(connection, account, "DELETE_SCHEDULE", "SCHEDULE", f"{doctor_id}:{visit_date}", "删除排班")

    # 作用：按编号、姓名或手机号搜索患者。
    # 数据来源：医院端搜索框 keyword 和 patients 表。
    # 结果去向：返回患者列表给工作台表格与挂号下拉框。
    def search_patients(self, keyword: str = "") -> list[dict[str, Any]]:
        normalized = keyword.strip()
        like = f"%{normalized}%"
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT patient_id, patient_no, patient_name, gender, birth_date, phone, id_card, created_at
                FROM patients
                WHERE ? = ''
                   OR patient_no LIKE ?
                   OR patient_name LIKE ?
                   OR phone LIKE ?
                ORDER BY patient_id DESC
                LIMIT 100
                """,
                (normalized, like, like, like),
            ).fetchall()
        return [_row_to_dict(row) for row in rows]

    # 作用：新建患者档案。
    # 数据来源：医院端患者建档表单 payload 和当前账号。
    # 结果去向：写入 patients、audit_logs，并把患者资料返回前端。
    def create_patient(self, payload: dict[str, Any], account: dict[str, Any]) -> dict[str, Any]:
        patient_no = str(payload["patient_no"]).strip()
        patient_name = str(payload["patient_name"]).strip()
        gender = str(payload["gender"]).strip()
        birth_date = str(payload.get("birth_date") or "").strip() or None
        phone = str(payload.get("phone") or "").strip() or None
        id_card = str(payload.get("id_card") or "").strip() or None
        if gender not in {"M", "F"}:
            raise ValueError("性别必须为 M 或 F")

        with get_connection() as connection:
            duplicate = connection.execute("SELECT patient_id FROM patients WHERE patient_no = ?", (patient_no,)).fetchone()
            if duplicate is not None:
                raise ValueError("患者编号已存在")
            if id_card:
                existing_id_card = connection.execute("SELECT patient_id FROM patients WHERE id_card = ?", (id_card,)).fetchone()
                if existing_id_card is not None:
                    raise ValueError("该身份证号已存在患者档案")

            cursor = connection.execute(
                """
                INSERT INTO patients (
                    patient_no, patient_name, gender, birth_date, phone, id_card
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (patient_no, patient_name, gender, birth_date, phone, id_card),
            )
            patient_id = cursor.lastrowid
            self._write_audit(connection, account, "CREATE_PATIENT", "PATIENT", str(patient_id), f"患者编号={patient_no}")
            row = connection.execute(
                """
                SELECT patient_id, patient_no, patient_name, gender, birth_date, phone, id_card, created_at
                FROM patients
                WHERE patient_id = ?
                """,
                (patient_id,),
            ).fetchone()
        return _row_to_dict(row)

    # 作用：修改已有患者档案。
    # 数据来源：医院端编辑后的患者 payload 和当前账号。
    # 结果去向：更新 patients、写审计日志，并把最新数据回传前端。
    def update_patient(self, patient_id: int, payload: dict[str, Any], account: dict[str, Any]) -> dict[str, Any]:
        patient_no = str(payload["patient_no"]).strip()
        patient_name = str(payload["patient_name"]).strip()
        gender = str(payload["gender"]).strip()
        birth_date = str(payload.get("birth_date") or "").strip() or None
        phone = str(payload.get("phone") or "").strip() or None
        id_card = str(payload.get("id_card") or "").strip() or None
        if gender not in {"M", "F"}:
            raise ValueError("性别必须为 M 或 F")

        with get_connection() as connection:
            existing = connection.execute("SELECT patient_id FROM patients WHERE patient_id = ?", (patient_id,)).fetchone()
            if existing is None:
                raise ValueError("患者不存在或已被删除")

            duplicate_no = connection.execute(
                "SELECT patient_id FROM patients WHERE patient_no = ? AND patient_id <> ?",
                (patient_no, patient_id),
            ).fetchone()
            if duplicate_no is not None:
                raise ValueError("患者编号已存在")
            if id_card:
                duplicate_id_card = connection.execute(
                    "SELECT patient_id FROM patients WHERE id_card = ? AND patient_id <> ?",
                    (id_card, patient_id),
                ).fetchone()
                if duplicate_id_card is not None:
                    raise ValueError("该身份证号已存在患者档案")

            connection.execute(
                """
                UPDATE patients
                SET patient_no = ?,
                    patient_name = ?,
                    gender = ?,
                    birth_date = ?,
                    phone = ?,
                    id_card = ?
                WHERE patient_id = ?
                """,
                (patient_no, patient_name, gender, birth_date, phone, id_card, patient_id),
            )
            self._write_audit(connection, account, "UPDATE_PATIENT", "PATIENT", str(patient_id), f"修改患者，编号={patient_no}")
            row = connection.execute(
                """
                SELECT patient_id, patient_no, patient_name, gender, birth_date, phone, id_card, created_at
                FROM patients
                WHERE patient_id = ?
                """,
                (patient_id,),
            ).fetchone()
        return _row_to_dict(row)

    # 作用：删除没有历史挂号的患者档案。
    # 数据来源：医院端当前编辑的 patient_id 和当前账号。
    # 结果去向：删除 patients 记录，并写入审计日志。
    def delete_patient(self, patient_id: int, account: dict[str, Any]) -> None:
        with get_connection() as connection:
            existing = connection.execute("SELECT patient_id FROM patients WHERE patient_id = ?", (patient_id,)).fetchone()
            if existing is None:
                raise ValueError("患者不存在或已被删除")

            related = connection.execute("SELECT COUNT(*) AS reg_count FROM registrations WHERE patient_id = ?", (patient_id,)).fetchone()
            reg_count = int(related["reg_count"] or 0)
            if reg_count > 0:
                raise ValueError("该患者已有挂号记录，不能删除，请保留档案或先处理历史业务")

            connection.execute("DELETE FROM patients WHERE patient_id = ?", (patient_id,))
            self._write_audit(connection, account, "DELETE_PATIENT", "PATIENT", str(patient_id), "删除患者档案")

    # 作用：患者端自助挂号入口，先复用或新建患者档案，再创建挂号。
    # 数据来源：患者端提交的基本信息、医生、日期和备注。
    # 结果去向：必要时写入 patients，再写入 registrations、payment_records。
    def create_self_service_registration(self, payload: dict[str, Any]) -> dict[str, Any]:
        patient = self._get_or_create_public_patient(payload)
        account = {"account_id": None, "display_name": "患者自助"}
        registration_payload = {
            "patient_id": patient["patient_id"],
            "doctor_id": payload["doctor_id"],
            "visit_date": payload["visit_date"],
            "note": payload.get("note") or "",
        }
        return self.create_registration(registration_payload, account)

    # 作用：患者端按姓名、手机号、挂号单号查询自己的预约。
    # 数据来源：患者端查询表单参数，以及 registrations、patients、doctors。
    # 结果去向：返回给患者端页面显示预约记录。
    def list_self_service_registrations(self, patient_name: str, phone: str, reg_no: str) -> list[dict[str, Any]]:
        name = patient_name.strip()
        phone_no = phone.strip()
        registration_no = reg_no.strip().upper()
        if not name or not phone_no or not registration_no:
            raise ValueError("缺少必要字段: patient_name, phone, reg_no")
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    r.reg_id,
                    r.reg_no,
                    r.visit_date,
                    r.reg_fee,
                    r.status,
                    r.note,
                    r.created_at,
                    r.refunded_at,
                    p.patient_id,
                    p.patient_no,
                    p.patient_name,
                    d.doctor_id,
                    d.doctor_name,
                    d.dept_name
                FROM registrations r
                INNER JOIN patients p ON p.patient_id = r.patient_id
                INNER JOIN doctors d ON d.doctor_id = r.doctor_id
                WHERE p.patient_name = ?
                  AND COALESCE(p.phone, '') = ?
                  AND r.reg_no = ?
                ORDER BY r.created_at DESC
                LIMIT 20
                """,
                (name, phone_no, registration_no),
            ).fetchall()
        return [_row_to_dict(row) for row in rows]

    # 作用：查询医院端挂号记录，可按日期和状态筛选。
    # 数据来源：筛选参数 visit_date、status，以及 registrations 关联表。
    # 结果去向：返回给医院端挂号记录列表和编辑区。
    def list_registrations(self, visit_date: str | None = None, status: str | None = None) -> list[dict[str, Any]]:
        date_filter = (visit_date or "").strip()
        status_filter = (status or "").strip()
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    r.reg_id,
                    r.reg_no,
                    r.patient_id,
                    r.doctor_id,
                    r.visit_date,
                    r.reg_fee,
                    r.status,
                    r.note,
                    r.created_at,
                    r.refunded_at,
                    p.patient_name,
                    p.patient_no,
                    d.doctor_name,
                    d.dept_name
                FROM registrations r
                INNER JOIN patients p ON p.patient_id = r.patient_id
                INNER JOIN doctors d ON d.doctor_id = r.doctor_id
                WHERE (? = '' OR r.visit_date = ?)
                  AND (? = '' OR r.status = ?)
                ORDER BY r.created_at DESC
                LIMIT 100
                """,
                (date_filter, date_filter, status_filter, status_filter),
            ).fetchall()
        return [_row_to_dict(row) for row in rows]

    # 作用：统一处理新增挂号；如果 payload 里带 reg_id，就转去更新挂号。
    # 数据来源：医院端挂号表单 payload 和当前账号。
    # 结果去向：写入或更新 registrations、payment_records、audit_logs。
    def create_registration(self, payload: dict[str, Any], account: dict[str, Any]) -> dict[str, Any]:
        if str(payload.get("reg_id") or "").strip():
            return self.update_registration(int(payload["reg_id"]), payload, account)

        patient_id = int(payload["patient_id"])
        doctor_id = int(payload["doctor_id"])
        visit_date = str(payload["visit_date"]).strip()
        note = (payload.get("note") or "").strip() or None

        with get_connection() as connection:
            patient = connection.execute("SELECT patient_id FROM patients WHERE patient_id = ?", (patient_id,)).fetchone()
            if patient is None:
                raise ValueError("患者不存在")

            doctor = connection.execute(
                "SELECT doctor_id, doctor_name, fee_amount FROM doctors WHERE doctor_id = ? AND active = 1",
                (doctor_id,),
            ).fetchone()
            if doctor is None:
                raise ValueError("医生不存在或已停用")

            schedule = connection.execute(
                """
                SELECT total_quota, available
                FROM doctor_schedules
                WHERE doctor_id = ? AND visit_date = ?
                """,
                (doctor_id, visit_date),
            ).fetchone()
            if schedule is None:
                raise ValueError("所选日期没有排班，请先维护排班")
            if int(schedule["available"]) != 1:
                raise ValueError("当前医生在所选日期停诊，不能挂号")

            booked_count = connection.execute(
                """
                SELECT COUNT(*) AS booked_count
                FROM registrations
                WHERE doctor_id = ?
                  AND visit_date = ?
                  AND status = 'BOOKED'
                """,
                (doctor_id, visit_date),
            ).fetchone()
            if int(booked_count["booked_count"] or 0) >= int(schedule["total_quota"] or 0):
                raise ValueError("当前号源已满，请选择其他医生")

            reg_no = self._next_registration_no(connection)
            fee_amount = float(doctor["fee_amount"] or 0)
            cursor = connection.execute(
                """
                INSERT INTO registrations (
                    reg_no, patient_id, doctor_id, visit_date, reg_fee, status, note
                ) VALUES (?, ?, ?, ?, ?, 'BOOKED', ?)
                """,
                (reg_no, patient_id, doctor_id, visit_date, fee_amount, note),
            )
            reg_id = cursor.lastrowid
            charge_no = self._next_payment_no(connection, "CHG")
            connection.execute(
                """
                INSERT INTO payment_records (
                    payment_no, reg_id, payment_type, payment_amount, operator_name, payment_status
                ) VALUES (?, ?, 'CHARGE', ?, ?, 'SUCCESS')
                """,
                (charge_no, reg_id, fee_amount, account.get("display_name") or "系统"),
            )
            self._write_audit(connection, account, "CREATE_REGISTRATION", "REGISTRATION", str(reg_id), f"创建挂号，单号={reg_no}")
            row = self._get_registration_row(connection, reg_id)
        return _row_to_dict(row)

    # 作用：修改一条尚未退号的挂号记录。
    # 数据来源：医院端编辑后的挂号 payload、当前账号和原有挂号记录。
    # 结果去向：更新 registrations，同步收费金额，并写入审计日志。
    def update_registration(self, reg_id: int, payload: dict[str, Any], account: dict[str, Any]) -> dict[str, Any]:
        patient_id = int(payload["patient_id"])
        doctor_id = int(payload["doctor_id"])
        visit_date = str(payload["visit_date"]).strip()
        note = (payload.get("note") or "").strip() or None

        with get_connection() as connection:
            registration = connection.execute(
                "SELECT reg_id, reg_no, status FROM registrations WHERE reg_id = ?",
                (reg_id,),
            ).fetchone()
            if registration is None:
                raise ValueError("挂号记录不存在")
            if registration["status"] == "REFUNDED":
                raise ValueError("已退号记录不允许修改")

            patient = connection.execute("SELECT patient_id FROM patients WHERE patient_id = ?", (patient_id,)).fetchone()
            if patient is None:
                raise ValueError("患者不存在")
            doctor = connection.execute(
                "SELECT doctor_id, fee_amount FROM doctors WHERE doctor_id = ? AND active = 1",
                (doctor_id,),
            ).fetchone()
            if doctor is None:
                raise ValueError("医生不存在或已停用")
            schedule = connection.execute(
                """
                SELECT total_quota, available
                FROM doctor_schedules
                WHERE doctor_id = ? AND visit_date = ?
                """,
                (doctor_id, visit_date),
            ).fetchone()
            if schedule is None:
                raise ValueError("所选日期没有排班，请先维护排班")
            if int(schedule["available"]) != 1:
                raise ValueError("当前医生在所选日期停诊，不能挂号")

            booked_count = connection.execute(
                """
                SELECT COUNT(*) AS booked_count
                FROM registrations
                WHERE doctor_id = ?
                  AND visit_date = ?
                  AND status = 'BOOKED'
                  AND reg_id <> ?
                """,
                (doctor_id, visit_date, reg_id),
            ).fetchone()
            if int(booked_count["booked_count"] or 0) >= int(schedule["total_quota"] or 0):
                raise ValueError("当前号源已满，请选择其他医生")

            fee_amount = float(doctor["fee_amount"] or 0)
            connection.execute(
                """
                UPDATE registrations
                SET patient_id = ?,
                    doctor_id = ?,
                    visit_date = ?,
                    reg_fee = ?,
                    note = ?
                WHERE reg_id = ?
                """,
                (patient_id, doctor_id, visit_date, fee_amount, note, reg_id),
            )
            connection.execute(
                """
                UPDATE payment_records
                SET payment_amount = ?, operator_name = ?
                WHERE reg_id = ? AND payment_type = 'CHARGE'
                """,
                (fee_amount, account.get("display_name") or "系统", reg_id),
            )
            self._write_audit(connection, account, "UPDATE_REGISTRATION", "REGISTRATION", str(reg_id), f"修改挂号，单号={registration['reg_no']}")
            row = self._get_registration_row(connection, reg_id)
        return _row_to_dict(row)

    # 作用：删除一条尚未退号的挂号记录，通常用于录错后的撤销。
    # 数据来源：reg_id 和当前账号。
    # 结果去向：删除 registrations、payment_records，并写入审计日志。
    def delete_registration(self, reg_id: int, account: dict[str, Any]) -> None:
        with get_connection() as connection:
            registration = connection.execute("SELECT reg_id, reg_no, status FROM registrations WHERE reg_id = ?", (reg_id,)).fetchone()
            if registration is None:
                raise ValueError("挂号记录不存在")
            if registration["status"] == "REFUNDED":
                raise ValueError("已退号记录不能直接删除")

            connection.execute("DELETE FROM payment_records WHERE reg_id = ?", (reg_id,))
            connection.execute("DELETE FROM registrations WHERE reg_id = ?", (reg_id,))
            self._write_audit(connection, account, "DELETE_REGISTRATION", "REGISTRATION", str(reg_id), f"删除挂号，单号={registration['reg_no']}")

    # 作用：执行退号，生成退款流水，并保留挂号痕迹。
    # 数据来源：reg_id 和当前账号。
    # 结果去向：把 registrations 更新为 REFUNDED，写入 payment_records、audit_logs。
    def refund_registration(self, reg_id: int, account: dict[str, Any]) -> dict[str, Any]:
        with get_connection() as connection:
            registration = connection.execute(
                "SELECT reg_id, reg_fee, status FROM registrations WHERE reg_id = ?",
                (reg_id,),
            ).fetchone()
            if registration is None:
                raise ValueError("挂号记录不存在")
            if registration["status"] == "REFUNDED":
                raise ValueError("该挂号记录已经退号")

            connection.execute(
                """
                UPDATE registrations
                SET status = 'REFUNDED', refunded_at = CURRENT_TIMESTAMP
                WHERE reg_id = ?
                """,
                (reg_id,),
            )
            refund_no = self._next_payment_no(connection, "REF")
            connection.execute(
                """
                INSERT INTO payment_records (
                    payment_no, reg_id, payment_type, payment_amount, operator_name, payment_status
                ) VALUES (?, ?, 'REFUND', ?, ?, 'SUCCESS')
                """,
                (refund_no, reg_id, float(registration["reg_fee"]), account.get("display_name") or "系统"),
            )
            self._write_audit(connection, account, "REFUND_REGISTRATION", "REGISTRATION", str(reg_id), "执行退号并回补号源")
            row = self._get_registration_row(connection, reg_id)
        return _row_to_dict(row)

    # 作用：汇总某一天的挂号总量、收费、退费和医生号源统计。
    # 数据来源：registrations、doctors、doctor_schedules 和 visit_date。
    # 结果去向：返回给医院端今日总览和医生当日统计模块。
    def get_overview(self, visit_date: str) -> dict[str, Any]:
        with get_connection() as connection:
            summary = connection.execute(
                """
                SELECT
                    COALESCE(SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END), 0) AS total_count,
                    COALESCE(SUM(CASE WHEN status = 'BOOKED' THEN reg_fee ELSE 0 END), 0) AS booked_amount,
                    COALESCE(SUM(CASE WHEN status = 'REFUNDED' THEN reg_fee ELSE 0 END), 0) AS refunded_amount
                FROM registrations
                WHERE visit_date = ?
                """,
                (visit_date,),
            ).fetchone()
            doctor_rows = connection.execute(
                """
                SELECT
                    d.doctor_name,
                    d.dept_name,
                    COALESCE(s.total_quota, 0) AS total_quota,
                    COALESCE(s.available, 0) AS available,
                    COUNT(r.reg_id) AS reg_count,
                    COALESCE(SUM(CASE WHEN r.status = 'BOOKED' THEN r.reg_fee ELSE 0 END), 0) AS booked_amount
                FROM doctors d
                LEFT JOIN doctor_schedules s
                    ON s.doctor_id = d.doctor_id
                   AND s.visit_date = ?
                LEFT JOIN registrations r
                    ON r.doctor_id = d.doctor_id
                   AND r.visit_date = ?
                   AND r.status = 'BOOKED'
                WHERE d.active = 1
                GROUP BY d.doctor_id, d.doctor_name, d.dept_name, s.total_quota, s.available
                ORDER BY d.dept_name, d.doctor_name
                """,
                (visit_date, visit_date),
            ).fetchall()
        doctor_stats: list[dict[str, Any]] = []
        for row in doctor_rows:
            item = _row_to_dict(row)
            item["remaining_quota"] = max(int(item.get("total_quota") or 0) - int(item.get("reg_count") or 0), 0) if int(item.get("available") or 0) == 1 else 0
            doctor_stats.append(item)
        return {"visit_date": visit_date, "summary": _row_to_dict(summary), "doctor_stats": doctor_stats}

    # 作用：按 reg_id 取回一条完整挂号记录。
    # 数据来源：registrations 与 patients、doctors 的关联查询。
    # 结果去向：返回给创建、修改、退号等流程统一做响应。
    def _get_registration_row(self, connection, reg_id: int):
        return connection.execute(
            """
            SELECT
                r.reg_id,
                r.reg_no,
                r.patient_id,
                r.doctor_id,
                r.visit_date,
                r.reg_fee,
                r.status,
                r.note,
                r.created_at,
                r.refunded_at,
                p.patient_name,
                p.patient_no,
                d.doctor_name,
                d.dept_name
            FROM registrations r
            INNER JOIN patients p ON p.patient_id = r.patient_id
            INNER JOIN doctors d ON d.doctor_id = r.doctor_id
            WHERE r.reg_id = ?
            """,
            (reg_id,),
        ).fetchone()

    # 作用：按医生和日期取回一条排班详情。
    # 数据来源：doctor_schedules 与 doctors 的关联查询。
    # 结果去向：返回给 save_schedule，在保存后回传前端最新排班。
    def _get_schedule_item(self, connection, doctor_id: int, visit_date: str):
        return connection.execute(
            """
            SELECT
                s.schedule_id,
                s.visit_date,
                s.total_quota,
                s.available,
                d.doctor_id,
                d.doctor_name,
                d.dept_name,
                COALESCE((
                    SELECT COUNT(*)
                    FROM registrations r
                    WHERE r.doctor_id = d.doctor_id
                      AND r.visit_date = s.visit_date
                      AND r.status = 'BOOKED'
                ), 0) AS booked_count
            FROM doctor_schedules s
            INNER JOIN doctors d ON d.doctor_id = s.doctor_id
            WHERE s.doctor_id = ? AND s.visit_date = ?
            """,
            (doctor_id, visit_date),
        ).fetchone()

    # 作用：患者端根据身份证或基础信息复用档案；没有档案时自动建最小患者记录。
    # 数据来源：患者端挂号 payload 和 patients 表。
    # 结果去向：返回 patient_id 给自助挂号流程继续创建挂号。
    def _get_or_create_public_patient(self, payload: dict[str, Any]) -> dict[str, Any]:
        patient_name = str(payload["patient_name"]).strip()
        gender = str(payload["gender"]).strip()
        birth_date = str(payload.get("birth_date") or "").strip() or None
        phone = str(payload.get("phone") or "").strip() or None
        id_card = str(payload.get("id_card") or "").strip() or None
        if gender not in {"M", "F"}:
            raise ValueError("性别必须为 M 或 F")

        with get_connection() as connection:
            existing = None
            if id_card:
                existing = connection.execute(
                    """
                    SELECT patient_id, patient_no, patient_name, gender, birth_date, phone, id_card, created_at
                    FROM patients
                    WHERE id_card = ?
                    ORDER BY patient_id DESC
                    LIMIT 1
                    """,
                    (id_card,),
                ).fetchone()
            if existing is None:
                existing = connection.execute(
                    """
                    SELECT patient_id, patient_no, patient_name, gender, birth_date, phone, id_card, created_at
                    FROM patients
                    WHERE patient_name = ?
                      AND COALESCE(phone, '') = ?
                      AND COALESCE(birth_date, '') = ?
                    ORDER BY patient_id DESC
                    LIMIT 1
                    """,
                    (patient_name, phone or "", birth_date or ""),
                ).fetchone()
            if existing is not None:
                return _row_to_dict(existing)

            patient_no = self._next_patient_no(connection)
            cursor = connection.execute(
                """
                INSERT INTO patients (patient_no, patient_name, gender, birth_date, phone, id_card)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (patient_no, patient_name, gender, birth_date, phone, id_card),
            )
            patient_id = cursor.lastrowid
            return _row_to_dict(
                connection.execute(
                    """
                    SELECT patient_id, patient_no, patient_name, gender, birth_date, phone, id_card, created_at
                    FROM patients
                    WHERE patient_id = ?
                    """,
                    (patient_id,),
                ).fetchone()
            )

    # 作用：生成新的患者编号。
    # 数据来源：patients 表里当前最大的 patient_id。
    # 结果去向：返回新的 patient_no 给医院端建档和患者端自动建档使用。
    def _next_patient_no(self, connection) -> str:
        next_id = int(connection.execute("SELECT COALESCE(MAX(patient_id), 0) + 1 AS next_id FROM patients").fetchone()["next_id"])
        return f"PAT{date.today().strftime('%Y%m%d')}{next_id:04d}"

    # 作用：生成新的挂号单号。
    # 数据来源：registrations 表里当前最大的 reg_id。
    # 结果去向：返回新的 reg_no 给 create_registration 写入挂号表。
    def _next_registration_no(self, connection) -> str:
        next_id = int(connection.execute("SELECT COALESCE(MAX(reg_id), 0) + 1 AS next_id FROM registrations").fetchone()["next_id"])
        return f"REG{date.today().strftime('%Y%m%d')}{next_id:04d}"

    # 作用：生成收费或退费流水号。
    # 数据来源：payment_records 表里当前最大的 payment_id 和前缀 prefix。
    # 结果去向：返回新的 payment_no 给收费、退费流水写入使用。
    def _next_payment_no(self, connection, prefix: str = "PAY") -> str:
        next_id = int(connection.execute("SELECT COALESCE(MAX(payment_id), 0) + 1 AS next_id FROM payment_records").fetchone()["next_id"])
        return f"{prefix}{date.today().strftime('%Y%m%d')}{next_id:04d}"

    # 作用：写入审计日志，记录关键业务动作。
    # 数据来源：当前账号、动作名称、对象类型、对象编号和详情文本。
    # 结果去向：写入 audit_logs，供医院端审计模块查询。
    def _write_audit(
        self,
        connection,
        account: dict[str, Any],
        action_name: str,
        entity_type: str,
        entity_id: str | None,
        detail_text: str,
    ) -> None:
        connection.execute(
            """
            INSERT INTO audit_logs (
                account_id, actor_name, action_name, entity_type, entity_id, detail_text
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                account.get("account_id"),
                account.get("display_name") or "系统",
                action_name,
                entity_type,
                entity_id,
                detail_text,
            ),
        )
