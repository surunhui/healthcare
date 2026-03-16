#!/bin/bash

# check_system.sh
# 场景：医院应用服务器快速巡检脚本
# 功能：
# 1. 检查 Tomcat 进程
# 2. 检查 8080 端口监听状态
# 3. 检查磁盘使用率
# 4. 检查日志目录占用
# 5. 检查 Java 进程内存占用
# 6. 查看 Tomcat 日志尾部
# 7. 输出简单风险汇总
#
# 教学说明：
# 1. 管道符 "|" 的作用是把左侧命令的输出传递给右侧命令继续处理
# 2. chmod +x 的作用是给脚本增加执行权限，否则不能直接通过 ./script.sh 运行

set +e

TOMCAT_FOUND=0
PORT_FOUND=0
DISK_ALERT=0
LOG_ALERT=0
JVM_FOUND=0
TOMCAT_KEYWORD="${1:-tomcat}"
PORT_TO_CHECK="${2:-8080}"
LOG_DIR="${3:-/var/log}"
TOMCAT_LOG_FILE="${4:-/opt/tomcat/logs/catalina.out}"

echo "========== 1. 检查 Tomcat 进程 =========="
if ps -ef | grep "$TOMCAT_KEYWORD" | grep -v grep; then
    TOMCAT_FOUND=1
else
    echo "未匹配到关键字对应的进程：$TOMCAT_KEYWORD"
fi

echo ""
echo "========== 2. 检查端口监听 =========="
if command -v ss >/dev/null 2>&1; then
    if ss -lntp 2>/dev/null | grep -E "[\:\.]${PORT_TO_CHECK}[[:space:]]"; then
        PORT_FOUND=1
    else
        echo "端口 $PORT_TO_CHECK 未监听"
    fi
elif command -v netstat >/dev/null 2>&1; then
    if netstat -lntp 2>/dev/null | grep -E "[\:\.]${PORT_TO_CHECK}[[:space:]]"; then
        PORT_FOUND=1
    else
        echo "端口 $PORT_TO_CHECK 未监听"
    fi
else
    echo "当前系统既没有 ss，也没有 netstat 命令"
fi

echo ""
echo "========== 3. 检查磁盘使用率 =========="
df -hP

# 实战说明：
# 这里使用 awk 提取磁盘使用率列。
# 如果某个挂载点使用率大于等于 90%，就输出告警信息。
while read -r filesystem size used avail usep mountpoint; do
    usep_value=$(echo "$usep" | tr -d '%')
    if [ -n "$usep_value" ] && [ "$usep_value" -ge 90 ] 2>/dev/null; then
        echo "告警：挂载点 $mountpoint 的使用率为 ${usep}"
        DISK_ALERT=1
    fi
done < <(df -hP | awk 'NR>1 {print $1, $2, $3, $4, $5, $6}')

echo ""
echo "========== 4. 检查日志目录 =========="
if [ -d "$LOG_DIR" ]; then
    du -sh "$LOG_DIR" 2>/dev/null
    find "$LOG_DIR" -type f \( -name "*.log" -o -name "*.out" \) -size +100M 2>/dev/null
    if find "$LOG_DIR" -type f \( -name "*.log" -o -name "*.out" \) -size +500M 2>/dev/null | grep -q .; then
        echo "告警：$LOG_DIR 下检测到较大的日志文件"
        LOG_ALERT=1
    fi
else
    echo "日志目录不存在：$LOG_DIR"
fi

echo ""
echo "========== 5. 检查 Java 内存 =========="
if ps -ef | grep java | grep -v grep; then
    JVM_FOUND=1
    # RSS 表示常驻内存，单位为 KB。
    # 按 RSS 倒序排序后，更容易找到占用内存最大的 Java 进程。
    ps -eo pid,ppid,%cpu,%mem,rss,args | grep java | grep -v grep | sort -k5 -nr | head -5
else
    echo "未检测到 Java 进程"
fi

echo ""
echo "========== 6. 查看 Tomcat 日志尾部 =========="
if [ -f "$TOMCAT_LOG_FILE" ]; then
    tail -n 20 "$TOMCAT_LOG_FILE" 2>/dev/null
else
    echo "未找到 Tomcat 日志文件：$TOMCAT_LOG_FILE"
fi

echo ""
echo "========== 7. 汇总 =========="
if [ "$TOMCAT_FOUND" -eq 1 ]; then
    echo "Tomcat 进程：正常"
else
    echo "Tomcat 进程：失败，请检查服务状态和启动日志"
fi

if [ "$PORT_FOUND" -eq 1 ]; then
    echo "端口 $PORT_TO_CHECK：正常"
else
    echo "端口 $PORT_TO_CHECK：失败，请检查应用启动、连接器配置或防火墙"
fi

if [ "$DISK_ALERT" -eq 1 ]; then
    echo "磁盘使用率：风险，建议清理旧日志、临时文件或备份文件"
else
    echo "磁盘使用率：正常"
fi

if [ "$LOG_ALERT" -eq 1 ]; then
    echo "日志目录：风险，较大的日志文件可能正在持续占用磁盘空间"
else
    echo "日志目录：正常，或未发现超大日志文件"
fi

if [ "$JVM_FOUND" -eq 1 ]; then
    echo "Java 进程：已发现"
else
    echo "Java 进程：未发现"
fi

echo ""
echo "========== 8. 使用方式 =========="
echo "默认方式运行：./check_system.sh"
echo "指定关键字和端口：./check_system.sh tomcat 8080"
echo "指定日志目录和 Tomcat 日志文件：./check_system.sh tomcat 8080 /var/log /opt/tomcat/logs/catalina.out"

# 面试题：
# 如果磁盘空间达到 100%，导致医院系统服务异常，你会怎么处理？
#
# 参考回答：
# 1. 先用 df -h 找到被占满的文件系统
# 2. 再用 du -sh /var/log/* 或 du -sh /* 定位大目录
# 3. 优先清理确认无用的文件，例如旧日志、过期临时文件
# 4. 避免误删数据库文件、业务上传文件和配置文件
# 5. 清理后再次确认剩余空间，并确认 Tomcat / 数据库是否恢复
# 6. 事后补充日志轮转和监控策略
