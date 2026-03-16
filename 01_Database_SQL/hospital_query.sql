-- hospital_query.sql
-- 场景：基础 HIS 挂号业务建模与日报统计演示
-- 数据库：MySQL 8.x

-- =========================================================
-- 1. 表结构设计
-- =========================================================

-- 教学说明：
-- 医疗数据通常需要分表存储。
-- patient_info 保存患者主数据。
-- doctor_list 保存医生主数据。
-- reg_records 保存挂号流水数据。
-- 这样设计符合数据库范式思想：
-- 1. 减少重复字段
-- 2. 避免更新异常
-- 3. 保持主数据与业务流水的一致性

CREATE TABLE IF NOT EXISTS patient_info (
    patient_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '患者主键',
    patient_no VARCHAR(32) NOT NULL UNIQUE COMMENT '患者编号 / 病历号',
    patient_name VARCHAR(50) NOT NULL COMMENT '患者姓名',
    gender CHAR(1) NOT NULL COMMENT '性别：M/F',
    birth_date DATE NULL COMMENT '出生日期',
    phone VARCHAR(20) NULL COMMENT '联系电话',
    id_card VARCHAR(32) NULL COMMENT '身份证号',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='患者主数据表';

CREATE TABLE IF NOT EXISTS doctor_list (
    doctor_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '医生主键',
    doctor_code VARCHAR(32) NOT NULL UNIQUE COMMENT '医生编码',
    doctor_name VARCHAR(50) NOT NULL COMMENT '医生姓名',
    dept_name VARCHAR(100) NOT NULL COMMENT '科室名称',
    title_name VARCHAR(50) NULL COMMENT '职称',
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '默认挂号费',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用，0停用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='医生主数据表';

CREATE TABLE IF NOT EXISTS reg_records (
    reg_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '挂号流水主键',
    reg_no VARCHAR(32) NOT NULL UNIQUE COMMENT '挂号单号',
    patient_id BIGINT NOT NULL COMMENT '患者主键',
    doctor_id BIGINT NOT NULL COMMENT '医生主键',
    reg_time DATETIME NOT NULL COMMENT '挂号时间',
    reg_fee DECIMAL(10,2) NOT NULL COMMENT '实际挂号费',
    pay_status VARCHAR(20) NOT NULL DEFAULT 'PAID' COMMENT '支付状态：PAID/REFUND/PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    CONSTRAINT fk_reg_patient FOREIGN KEY (patient_id) REFERENCES patient_info(patient_id),
    CONSTRAINT fk_reg_doctor FOREIGN KEY (doctor_id) REFERENCES doctor_list(doctor_id)
) COMMENT='挂号流水表';

CREATE INDEX idx_reg_records_reg_time ON reg_records(reg_time);
CREATE INDEX idx_reg_records_doctor_time ON reg_records(doctor_id, reg_time);
CREATE INDEX idx_reg_records_patient_id ON reg_records(patient_id);
CREATE INDEX idx_doctor_list_dept_status ON doctor_list(dept_name, status);

-- 收费 / 退费扩展说明：
-- 在真实医院系统里，挂号成功和收费成功不一定完全同步。
-- 例如病人可能先挂号，再发生退费。
-- 因此生产环境通常会把支付流水单独建表。
CREATE TABLE IF NOT EXISTS reg_payment_records (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '支付流水主键',
    reg_id BIGINT NOT NULL COMMENT '挂号流水主键',
    payment_no VARCHAR(32) NOT NULL UNIQUE COMMENT '支付流水号',
    payment_type VARCHAR(20) NOT NULL COMMENT '支付类型：CHARGE/REFUND',
    payment_amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    payment_time DATETIME NOT NULL COMMENT '支付时间',
    operator_name VARCHAR(50) NULL COMMENT '操作员',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '支付状态：SUCCESS/FAILED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    CONSTRAINT fk_payment_reg FOREIGN KEY (reg_id) REFERENCES reg_records(reg_id)
) COMMENT='挂号收费退费表';

CREATE INDEX idx_reg_payment_records_reg_id ON reg_payment_records(reg_id);
CREATE INDEX idx_reg_payment_records_payment_time ON reg_payment_records(payment_time);

-- =========================================================
-- 2. 示例数据
-- =========================================================

-- 实战说明：
-- 示例数据使用 INSERT ... SELECT ... WHERE NOT EXISTS。
-- 这样脚本可重复执行，避免因唯一键冲突而失败。

INSERT INTO patient_info (patient_no, patient_name, gender, birth_date, phone, id_card)
SELECT 'P202603110001', '张三', 'M', '1990-04-12', '13800000001', '110101199004120011'
WHERE NOT EXISTS (
    SELECT 1 FROM patient_info WHERE patient_no = 'P202603110001'
);

INSERT INTO patient_info (patient_no, patient_name, gender, birth_date, phone, id_card)
SELECT 'P202603110002', '李四', 'F', '1988-09-23', '13800000002', '110101198809230022'
WHERE NOT EXISTS (
    SELECT 1 FROM patient_info WHERE patient_no = 'P202603110002'
);

INSERT INTO doctor_list (doctor_code, doctor_name, dept_name, title_name, fee_amount, status)
SELECT 'D001', '王医生', 'Cardiology', '主任医师', 30.00, 1
WHERE NOT EXISTS (
    SELECT 1 FROM doctor_list WHERE doctor_code = 'D001'
);

INSERT INTO doctor_list (doctor_code, doctor_name, dept_name, title_name, fee_amount, status)
SELECT 'D002', '赵医生', 'Respiratory', '主治医师', 20.00, 1
WHERE NOT EXISTS (
    SELECT 1 FROM doctor_list WHERE doctor_code = 'D002'
);

INSERT INTO doctor_list (doctor_code, doctor_name, dept_name, title_name, fee_amount, status)
SELECT 'D003', '钱医生', 'Neurology', '住院医师', 15.00, 1
WHERE NOT EXISTS (
    SELECT 1 FROM doctor_list WHERE doctor_code = 'D003'
);

INSERT INTO reg_records (reg_no, patient_id, doctor_id, reg_time, reg_fee, pay_status)
SELECT 'R202603110001', p.patient_id, d.doctor_id, '2026-03-11 08:15:00', 30.00, 'PAID'
FROM patient_info p
JOIN doctor_list d ON d.doctor_code = 'D001'
WHERE p.patient_no = 'P202603110001'
  AND NOT EXISTS (SELECT 1 FROM reg_records WHERE reg_no = 'R202603110001');

INSERT INTO reg_records (reg_no, patient_id, doctor_id, reg_time, reg_fee, pay_status)
SELECT 'R202603110002', p.patient_id, d.doctor_id, '2026-03-11 09:20:00', 30.00, 'PAID'
FROM patient_info p
JOIN doctor_list d ON d.doctor_code = 'D001'
WHERE p.patient_no = 'P202603110002'
  AND NOT EXISTS (SELECT 1 FROM reg_records WHERE reg_no = 'R202603110002');

INSERT INTO reg_records (reg_no, patient_id, doctor_id, reg_time, reg_fee, pay_status)
SELECT 'R202603110003', p.patient_id, d.doctor_id, '2026-03-11 10:00:00', 20.00, 'PAID'
FROM patient_info p
JOIN doctor_list d ON d.doctor_code = 'D002'
WHERE p.patient_no = 'P202603110001'
  AND NOT EXISTS (SELECT 1 FROM reg_records WHERE reg_no = 'R202603110003');

-- 支付示例说明：
-- R202603110001 和 R202603110002 正常收费。
-- R202603110003 先收费，后退费，这在门诊场景中很常见。
INSERT INTO reg_payment_records (reg_id, payment_no, payment_type, payment_amount, payment_time, operator_name, payment_status)
SELECT r.reg_id, 'P202603110001', 'CHARGE', 30.00, '2026-03-11 08:16:00', '收费员01', 'SUCCESS'
FROM reg_records r
WHERE r.reg_no = 'R202603110001'
  AND NOT EXISTS (SELECT 1 FROM reg_payment_records WHERE payment_no = 'P202603110001');

INSERT INTO reg_payment_records (reg_id, payment_no, payment_type, payment_amount, payment_time, operator_name, payment_status)
SELECT r.reg_id, 'P202603110002', 'CHARGE', 30.00, '2026-03-11 09:21:00', '收费员01', 'SUCCESS'
FROM reg_records r
WHERE r.reg_no = 'R202603110002'
  AND NOT EXISTS (SELECT 1 FROM reg_payment_records WHERE payment_no = 'P202603110002');

INSERT INTO reg_payment_records (reg_id, payment_no, payment_type, payment_amount, payment_time, operator_name, payment_status)
SELECT r.reg_id, 'P202603110003', 'CHARGE', 20.00, '2026-03-11 10:01:00', '收费员02', 'SUCCESS'
FROM reg_records r
WHERE r.reg_no = 'R202603110003'
  AND NOT EXISTS (SELECT 1 FROM reg_payment_records WHERE payment_no = 'P202603110003');

INSERT INTO reg_payment_records (reg_id, payment_no, payment_type, payment_amount, payment_time, operator_name, payment_status)
SELECT r.reg_id, 'P202603110004', 'REFUND', 20.00, '2026-03-11 10:30:00', '收费员02', 'SUCCESS'
FROM reg_records r
WHERE r.reg_no = 'R202603110003'
  AND NOT EXISTS (SELECT 1 FROM reg_payment_records WHERE payment_no = 'P202603110004');

-- =========================================================
-- 3. 核心查询：按医生统计当日挂号总额
-- =========================================================

-- 需求：
-- 统计 2026-03-11 每位医生的挂号次数和挂号总额。
--
-- 为什么推荐时间范围，而不是 DATE(reg_time) = '2026-03-11'？
-- 因为给索引字段套函数后，可能导致索引失效。
-- 用时间范围过滤通常更适合生产环境。
SELECT
    d.doctor_id,
    d.doctor_code,
    d.doctor_name,
    d.dept_name,
    COUNT(r.reg_id) AS reg_count,
    COALESCE(SUM(r.reg_fee), 0.00) AS total_reg_fee
FROM doctor_list d
LEFT JOIN reg_records r
    ON d.doctor_id = r.doctor_id
   AND r.reg_time >= '2026-03-11 00:00:00'
   AND r.reg_time < '2026-03-12 00:00:00'
   AND r.pay_status = 'PAID'
WHERE d.status = 1
GROUP BY
    d.doctor_id,
    d.doctor_code,
    d.doctor_name,
    d.dept_name
ORDER BY
    d.dept_name,
    d.doctor_name;

-- 预期结果：
-- 王医生：reg_count = 2，total_reg_fee = 60.00
-- 赵医生：reg_count = 1，total_reg_fee = 20.00
-- 钱医生：reg_count = 0，total_reg_fee = 0.00

-- =========================================================
-- 4. JOIN 教学说明
-- =========================================================

-- INNER JOIN：
-- 只返回能匹配到挂号流水的医生。
-- 如果当天没有挂号，该医生会直接从结果中消失。
--
-- LEFT JOIN：
-- 会保留 doctor_list 中的全部医生。
-- 就算当天没有挂号，也会显示该医生。
-- 当业务要求“没挂号也要显示 0”时，应使用 LEFT JOIN。

-- 查询目标日期没有挂号的医生
SELECT
    d.doctor_id,
    d.doctor_name,
    d.dept_name
FROM doctor_list d
LEFT JOIN reg_records r
    ON d.doctor_id = r.doctor_id
   AND r.reg_time >= '2026-03-11 00:00:00'
   AND r.reg_time < '2026-03-12 00:00:00'
   AND r.pay_status = 'PAID'
WHERE d.status = 1
  AND r.reg_id IS NULL
ORDER BY d.dept_name, d.doctor_name;

-- =========================================================
-- 5. 实施常用查询
-- =========================================================

-- 按科室统计当日挂号量
SELECT
    d.dept_name,
    COUNT(r.reg_id) AS reg_count
FROM doctor_list d
LEFT JOIN reg_records r
    ON d.doctor_id = r.doctor_id
   AND r.reg_time >= '2026-03-11 00:00:00'
   AND r.reg_time < '2026-03-12 00:00:00'
   AND r.pay_status = 'PAID'
WHERE d.status = 1
GROUP BY d.dept_name
ORDER BY d.dept_name;

-- 查询某个患者最近挂号记录
SELECT
    p.patient_no,
    p.patient_name,
    d.doctor_name,
    d.dept_name,
    r.reg_time,
    r.reg_fee,
    r.pay_status
FROM reg_records r
INNER JOIN patient_info p ON r.patient_id = p.patient_id
INNER JOIN doctor_list d ON r.doctor_id = d.doctor_id
WHERE p.patient_no = 'P202603110001'
ORDER BY r.reg_time DESC;

-- =========================================================
-- 6. 收费 / 退费实战查询
-- =========================================================

-- 查询 A：
-- 按医生统计当日收费、退费和净额。
-- 实战意义：
-- 医院财务往往更关心净收入，而不只是挂号次数。
SELECT
    d.doctor_id,
    d.doctor_name,
    d.dept_name,
    COALESCE(SUM(CASE WHEN p.payment_type = 'CHARGE' THEN p.payment_amount ELSE 0 END), 0.00) AS charge_amount,
    COALESCE(SUM(CASE WHEN p.payment_type = 'REFUND' THEN p.payment_amount ELSE 0 END), 0.00) AS refund_amount,
    COALESCE(SUM(CASE
        WHEN p.payment_type = 'CHARGE' THEN p.payment_amount
        WHEN p.payment_type = 'REFUND' THEN -p.payment_amount
        ELSE 0
    END), 0.00) AS net_amount
FROM doctor_list d
LEFT JOIN reg_records r
    ON d.doctor_id = r.doctor_id
LEFT JOIN reg_payment_records p
    ON r.reg_id = p.reg_id
   AND p.payment_time >= '2026-03-11 00:00:00'
   AND p.payment_time < '2026-03-12 00:00:00'
   AND p.payment_status = 'SUCCESS'
WHERE d.status = 1
GROUP BY d.doctor_id, d.doctor_name, d.dept_name
ORDER BY d.dept_name, d.doctor_name;

-- 查询 B：
-- 查询目标日期发生退费的挂号记录。
-- 当收费处或财务要求做退费核对时，这类 SQL 很常用。
SELECT
    r.reg_no,
    p.payment_no,
    d.doctor_name,
    d.dept_name,
    p.payment_amount AS refund_amount,
    p.payment_time,
    p.operator_name
FROM reg_payment_records p
INNER JOIN reg_records r ON p.reg_id = r.reg_id
INNER JOIN doctor_list d ON r.doctor_id = d.doctor_id
WHERE p.payment_type = 'REFUND'
  AND p.payment_status = 'SUCCESS'
  AND p.payment_time >= '2026-03-11 00:00:00'
  AND p.payment_time < '2026-03-12 00:00:00'
ORDER BY p.payment_time DESC;

-- =========================================================
-- 7. 面试问答
-- =========================================================

-- 面试题：
-- 如果医院系统查询病人信息突然很慢，作为实施工程师你会如何排查？
--
-- 参考回答：
-- 1. 先确认影响范围：单个用户、单个科室还是全院
-- 2. 记录发生时间、患者编号、页面路径和具体现象
-- 3. 查看应用日志，确认是否有超时、报错、线程阻塞、接口失败
-- 4. 查看数据库是否存在慢 SQL、锁等待、缺少索引、执行计划异常
-- 5. 查看服务器资源：CPU、内存、磁盘 I/O、磁盘使用率
-- 6. 查看网络链路和依赖系统是否异常
-- 7. 在重启或修改前先保留现场证据，再协调开发、DBA、网工处理

-- 生产安全提醒：
-- 生产环境执行 UPDATE 或 DELETE 前：
-- 1. 先用相同 WHERE 条件执行 SELECT
-- 2. 备份受影响数据
-- 3. 尽量放在事务中执行
-- 4. COMMIT 前先核对影响行数
