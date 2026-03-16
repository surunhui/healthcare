from __future__ import annotations

import json
import mimetypes
import traceback
from datetime import date
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from backend.repository import RegistrationRepository
from backend.schema import initialize_database


ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000
repository = RegistrationRepository()


class AppHandler(BaseHTTPRequestHandler):
    server_version = "RegistrationHTTP/1.3"

    # 作用：处理所有 GET 请求。
    # 数据来源：浏览器访问的路径和查询参数。
    # 结果去向：API 请求交给后端分发，普通路径走静态文件返回。
    def do_GET(self) -> None:
        # 所有浏览器请求都先到这里：API 走后端分发，其他路径按静态文件返回。
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self._handle_api_get(parsed.path, parse_qs(parsed.query))
            return
        self._serve_static(parsed.path)

    # 作用：处理所有 POST 请求。
    # 数据来源：浏览器或前端脚本发来的 POST 请求。
    # 结果去向：统一分发给对应的 API 业务入口。
    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            self._send_json({"error": "未找到接口"}, HTTPStatus.NOT_FOUND)
            return
        self._handle_api_post(parsed.path)

    # 作用：关闭默认访问日志输出，避免终端被 HTTP 请求刷屏。
    # 数据来源：BaseHTTPRequestHandler 每次处理请求时都会调用这里。
    # 结果去向：直接 return，不额外打印访问日志。
    def log_message(self, format: str, *args: object) -> None:
        return

    # 作用：分发所有 GET 类 API。
    # 数据来源：do_GET 解析出来的 path 和 query。
    # 结果去向：调用 repository 对应函数，再把结果返回给前端。
    def _handle_api_get(self, path: str, query: dict[str, list[str]]) -> None:
        try:
            # 公开接口给患者端使用，不要求医院端登录。
            if path == "/api/health":
                self._send_json({"status": "ok"})
                return
            if path == "/api/public/doctors":
                visit_date = self._first(query, "date") or date.today().isoformat()
                self._send_json({"items": repository.list_doctors(visit_date)})
                return
            if path == "/api/public/registrations":
                patient_name = self._first(query, "patient_name")
                phone = self._first(query, "phone")
                reg_no = self._first(query, "reg_no")
                self._send_json({"items": repository.list_self_service_registrations(patient_name, phone, reg_no)})
                return
            if path == "/api/me":
                self._send_json({"account": self._require_account()})
                return

            account = self._require_account()
            if path == "/api/doctors":
                visit_date = self._first(query, "date") or date.today().isoformat()
                self._send_json({"items": repository.list_doctors(visit_date)})
                return
            if path == "/api/default-visit-date":
                preferred_date = self._first(query, "date") or date.today().isoformat()
                self._send_json({"visit_date": repository.get_default_visit_date(preferred_date)})
                return
            if path == "/api/schedules":
                visit_date = self._first(query, "date") or date.today().isoformat()
                self._send_json({"items": repository.list_schedules(visit_date)})
                return
            if path == "/api/patients":
                keyword = self._first(query, "q")
                self._send_json({"items": repository.search_patients(keyword)})
                return
            if path == "/api/registrations":
                visit_date = self._first(query, "date")
                status = self._first(query, "status")
                self._send_json({"items": repository.list_registrations(visit_date, status)})
                return
            if path == "/api/overview":
                visit_date = self._first(query, "date") or date.today().isoformat()
                self._send_json(repository.get_overview(visit_date))
                return
            if path == "/api/audit-logs":
                repository.assert_role(account, {"SUPERVISOR"})
                limit = int(self._first(query, "limit") or "50")
                self._send_json({"items": repository.list_audit_logs(limit)})
                return
            self._send_json({"error": "未找到接口"}, HTTPStatus.NOT_FOUND)
        except Exception as exc:
            self._handle_exception(exc)

    # 作用：分发所有 POST 类 API。
    # 数据来源：do_POST 解析出的路径和请求体 JSON。
    # 结果去向：调用 repository 执行业务写入，再把结果返回给前端。
    def _handle_api_post(self, path: str) -> None:
        try:
            if path == "/api/login":
                payload = self._read_json()
                self._validate_required(payload, ["username", "password"])
                self._send_json(repository.login(str(payload["username"]), str(payload["password"])))
                return
            if path == "/api/public/registrations":
                payload = self._read_json()
                self._validate_required(payload, ["patient_name", "gender", "phone", "doctor_id", "visit_date"])
                self._send_json(repository.create_self_service_registration(payload), HTTPStatus.CREATED)
                return

            account = self._require_account()
            token = self._get_token()

            if path == "/api/logout":
                repository.logout(token, account)
                self._send_json({"status": "ok"})
                return
            if path == "/api/patients":
                payload = self._read_json()
                repository.assert_role(account, {"REGISTRAR", "SUPERVISOR"})
                if self.headers.get("X-Patient-Delete", "") == "1":
                    self._validate_required(payload, ["patient_id"])
                    repository.delete_patient(int(payload["patient_id"]), account)
                    self._send_json({"status": "ok"})
                elif self.headers.get("X-Patient-Edit", "") == "1":
                    self._validate_required(payload, ["patient_id", "patient_no", "patient_name", "gender"])
                    self._send_json(repository.update_patient(int(payload["patient_id"]), payload, account))
                else:
                    self._validate_required(payload, ["patient_no", "patient_name", "gender"])
                    self._send_json(repository.create_patient(payload, account), HTTPStatus.CREATED)
                return
            if path == "/api/schedules":
                payload = self._read_json()
                repository.assert_role(account, {"REGISTRAR", "SUPERVISOR"})
                if self.headers.get("X-Schedule-Delete", "") == "1":
                    self._validate_required(payload, ["doctor_id", "visit_date"])
                    repository.delete_schedule(int(payload["doctor_id"]), str(payload["visit_date"]), account)
                    self._send_json({"status": "ok"})
                else:
                    self._validate_required(payload, ["doctor_id", "visit_date", "total_quota"])
                    self._send_json(repository.save_schedule(payload, account))
                return
            if path == "/api/registrations":
                payload = self._read_json()
                repository.assert_role(account, {"REGISTRAR", "SUPERVISOR"})
                if self.headers.get("X-Registration-Delete", "") == "1":
                    self._validate_required(payload, ["reg_id"])
                    repository.delete_registration(int(payload["reg_id"]), account)
                    self._send_json({"status": "ok"})
                else:
                    self._validate_required(payload, ["patient_id", "doctor_id", "visit_date"])
                    status = HTTPStatus.OK if str(payload.get("reg_id") or "").strip() else HTTPStatus.CREATED
                    self._send_json(repository.create_registration(payload, account), status)
                return
            if path.endswith("/refund"):
                reg_id = int(path.split("/")[-2])
                repository.assert_role(account, {"SUPERVISOR"})
                self._send_json(repository.refund_registration(reg_id, account))
                return
            self._send_json({"error": "未找到接口"}, HTTPStatus.NOT_FOUND)
        except Exception as exc:
            self._handle_exception(exc)

    # 作用：要求当前请求必须是已登录状态。
    # 数据来源：请求头中的 token。
    # 结果去向：返回当前账号给后续接口继续做权限判断。
    def _require_account(self) -> dict[str, object]:
        return repository.get_account_by_token(self._get_token())

    # 作用：从 Authorization 请求头中取出 Bearer token。
    # 数据来源：前端登录后带上的 Authorization 请求头。
    # 结果去向：返回给 _require_account、logout 等逻辑使用。
    def _get_token(self) -> str:
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header.replace("Bearer ", "", 1).strip()
        raise ValueError("请先登录")

    # 作用：返回 HTML、CSS、JS 等静态文件。
    # 数据来源：浏览器访问的非 /api/ 路径。
    # 结果去向：把目标文件内容写回 HTTP 响应。
    def _serve_static(self, raw_path: str) -> None:
        path = raw_path or "/"
        if path == "/":
            path = "/index.html"

        target = (ROOT_DIR / path.lstrip("/")).resolve()
        # 防止通过 ../ 之类的路径探测项目根目录之外的文件。
        if ROOT_DIR not in target.parents and target != ROOT_DIR:
            self._send_json({"error": "禁止访问"}, HTTPStatus.FORBIDDEN)
            return
        if not target.exists() or target.is_dir():
            self._send_json({"error": "未找到文件"}, HTTPStatus.NOT_FOUND)
            return

        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        payload = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    # 作用：把请求体读取并解析成 JSON 字典。
    # 数据来源：POST 请求体。
    # 结果去向：返回给具体业务接口继续校验和处理。
    def _read_json(self) -> dict[str, object]:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_length) if content_length > 0 else b"{}"
        return json.loads(raw.decode("utf-8"))

    # 作用：检查请求是否缺少必填字段。
    # 数据来源：前端提交的 JSON 数据和字段清单。
    # 结果去向：字段完整则继续，否则抛出错误返回前端。
    def _validate_required(self, payload: dict[str, object], fields: list[str]) -> None:
        missing = [field for field in fields if not str(payload.get(field, "")).strip()]
        if missing:
            raise ValueError(f"缺少必填字段: {', '.join(missing)}")

    # 作用：从 parse_qs 结果中取出单个查询参数。
    # 数据来源：URL 查询字符串解析后的 query 字典。
    # 结果去向：返回给 GET 接口作为筛选条件。
    def _first(self, query: dict[str, list[str]], key: str) -> str:
        return query.get(key, [""])[0]

    # 作用：把 Python 对象编码成 JSON 并写入响应。
    # 数据来源：repository 返回的数据或错误信息。
    # 结果去向：发送给浏览器作为 HTTP 响应体。
    def _send_json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    # 作用：统一处理接口异常。
    # 数据来源：API 分发过程中抛出的异常对象。
    # 结果去向：转换成 HTTP 状态码和 JSON 错误信息返回给前端。
    def _handle_exception(self, exc: Exception) -> None:
        if isinstance(exc, PermissionError):
            status = HTTPStatus.FORBIDDEN
        else:
            status = HTTPStatus.BAD_REQUEST if isinstance(exc, ValueError) else HTTPStatus.INTERNAL_SERVER_ERROR
        payload = {"error": str(exc)}
        if status == HTTPStatus.INTERNAL_SERVER_ERROR:
            traceback.print_exc()
        self._send_json(payload, status)


# 作用：启动本地 HTTP 服务。
# 数据来源：默认 host、port 和 initialize_database 初始化结果。
# 结果去向：创建 ThreadingHTTPServer 并持续监听浏览器请求。
def run_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT) -> None:
    initialize_database()
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f"苏衡门诊挂号系统已启动：http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()
