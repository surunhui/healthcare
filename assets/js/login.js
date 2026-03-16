// 登录页脚本：负责校验账号密码、保存角色信息，并写入登录日志。
const standaloneLoginForm = document.querySelector("#standalone-login-form");
const loginUsername = document.querySelector("#login-username");
const loginPassword = document.querySelector("#login-password");
const loginRole = document.querySelector("#login-role");
const loginError = document.querySelector("#login-error");

// 将登录成功或失败写入 sessionStorage，供主页面日志区读取。
function appendLog(level, source, message) {
  const current = JSON.parse(sessionStorage.getItem("medsys_logs") || "[]");
  current.unshift({
    time: new Date().toISOString(),
    level,
    source,
    message
  });
  sessionStorage.setItem("medsys_logs", JSON.stringify(current.slice(0, 50)));
}

if (standaloneLoginForm) {
  standaloneLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const validUser = loginUsername?.value === "demo.user";
    const validPassword = loginPassword?.value === "Demo@123456";

    if (!validUser || !validPassword) {
      loginError?.classList.remove("hidden");
      appendLog("ERROR", "AUTH", `登录失败，用户名：${loginUsername?.value || "unknown"}`);
      return;
    }

    loginError?.classList.add("hidden");
    sessionStorage.setItem("medsys_role", loginRole?.value || "implementer");
    sessionStorage.setItem("medsys_user", loginUsername?.value || "demo.user");
    sessionStorage.setItem(
      "medsys_default_panel",
      {
        implementer: "overview",
        ops: "server",
        analyst: "database"
      }[loginRole?.value || "implementer"]
    );
    appendLog(
      "INFO",
      "AUTH",
      `登录成功，用户：${loginUsername?.value || "demo.user"}，角色：${loginRole?.value || "implementer"}`
    );
    window.location.href = "dashboard.html";
  });
}
