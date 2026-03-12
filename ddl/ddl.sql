-- 데일리 슈크럼(SUPER scrum) — MySQL DDL
-- 기획 문서: 기획/06-테이블-및-DDL참고.md
-- PK: bigint, TSID/Snowflake 등 시계열 ID 권장. 공통 컬럼: createdAt, createdMemberId, updatedAt, updatedMemberId, note

-- team
CREATE TABLE team (
    team_id         BIGINT       NOT NULL PRIMARY KEY,
    team_name       VARCHAR(255) NOT NULL,
    week_start_day  TINYINT      NULL COMMENT '주간 보고 시작 요일 (0=일~6=토)',
    week_end_day    TINYINT      NULL COMMENT '주간 보고 종료 요일',
    created_at      DATETIME(3)  NOT NULL,
    created_member_id BIGINT     NOT NULL,
    updated_at      DATETIME(3)  NULL,
    updated_member_id BIGINT     NULL,
    note            VARCHAR(500) NULL
);

-- member (로그인: 05 인증 참고, doorayMemberId 기준)
CREATE TABLE member (
    member_id         BIGINT       NOT NULL PRIMARY KEY,
    team_id           BIGINT       NULL COMMENT '소속 팀 ID, 미지정 시 NULL',
    dooray_member_id  VARCHAR(64)  NOT NULL COMMENT 'Dooray 회원 id',
    member_name       VARCHAR(255) NOT NULL,
    manager_yn        CHAR(1)      NOT NULL DEFAULT 'N' COMMENT '관리자 여부 (Y: 팀 설정 수정/팀원 삭제 가능, N: 읽기 전용 + 팀원 추가만 가능)',
    created_at        DATETIME(3)  NOT NULL,
    created_member_id BIGINT       NOT NULL,
    updated_at        DATETIME(3)  NULL,
    updated_member_id BIGINT       NULL,
    note              VARCHAR(500) NULL,
    FOREIGN KEY (team_id) REFERENCES team(team_id)
);

-- tag (팀별, parentTagId NULL=monthly, 있으면 weekly)
CREATE TABLE tag (
    tag_id            BIGINT       NOT NULL PRIMARY KEY,
    team_id           BIGINT       NOT NULL,
    parent_tag_id     BIGINT       NULL,
    tag_name          VARCHAR(255) NOT NULL,
    type              VARCHAR(20)  NOT NULL COMMENT 'weekly | monthly',
    created_at        DATETIME(3)  NOT NULL,
    created_member_id BIGINT       NOT NULL,
    updated_at        DATETIME(3)  NULL,
    updated_member_id BIGINT       NULL,
    note              VARCHAR(500) NULL,
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (parent_tag_id) REFERENCES tag(tag_id)
);

-- report (type: daily | weekly | monthly | review)
CREATE TABLE report (
    report_id         BIGINT       NOT NULL PRIMARY KEY,
    member_id         BIGINT       NOT NULL,
    sta_date          DATE         NOT NULL,
    end_date          DATE         NOT NULL,
    type              VARCHAR(20)  NOT NULL COMMENT 'daily | weekly | monthly | review',
    created_at        DATETIME(3)  NOT NULL,
    created_member_id BIGINT       NOT NULL,
    updated_at        DATETIME(3)  NULL,
    updated_member_id BIGINT       NULL,
    note              VARCHAR(500) NULL,
    FOREIGN KEY (member_id) REFERENCES member(member_id)
);

-- report_detail (UNIQUE report_id, task_id)
CREATE TABLE report_detail (
    report_detail_id  BIGINT       NOT NULL PRIMARY KEY,
    report_id         BIGINT       NOT NULL,
    tag_id            BIGINT       NOT NULL,
    task_id           BIGINT       NOT NULL COMMENT 'taskLink의 tasks/ 뒤 값',
    task_title        VARCHAR(500) NOT NULL,
    task_link         VARCHAR(1024) NOT NULL,
    done              TEXT         NOT NULL COMMENT '해당 업무로 한 일',
    work_hours        DECIMAL(10,2) NOT NULL,
    performance       TEXT         NULL COMMENT '어필할 성과',
    created_at        DATETIME(3)  NOT NULL,
    created_member_id BIGINT       NOT NULL,
    updated_at        DATETIME(3)  NULL,
    updated_member_id BIGINT       NULL,
    note              VARCHAR(500) NULL,
    UNIQUE KEY uk_report_task (report_id, task_id),
    FOREIGN KEY (report_id) REFERENCES report(report_id),
    FOREIGN KEY (tag_id) REFERENCES tag(tag_id)
);

-- peer_report (동료 협업 기록, report.type=daily 기준)
CREATE TABLE peer_report (
    peer_report_id    BIGINT       NOT NULL PRIMARY KEY,
    report_id         BIGINT       NOT NULL,
    peer_member_id    BIGINT       NOT NULL,
    content           TEXT         NULL,
    created_at        DATETIME(3)  NOT NULL,
    created_member_id BIGINT       NOT NULL,
    updated_at        DATETIME(3)  NULL,
    updated_member_id BIGINT       NULL,
    note              VARCHAR(500) NULL,
    UNIQUE KEY uk_report_peer (report_id, peer_member_id),
    FOREIGN KEY (report_id) REFERENCES report(report_id),
    FOREIGN KEY (peer_member_id) REFERENCES member(member_id)
);

-- report_tag (주/월/성과 보고 태그별 반정규화, reportId=새로 생성한 report)
CREATE TABLE report_tag (
    report_tag_id     BIGINT       NOT NULL PRIMARY KEY,
    report_id         BIGINT       NOT NULL,
    tag_id            BIGINT       NOT NULL,
    work_hours        DECIMAL(10,2) NOT NULL,
    type              VARCHAR(20)  NOT NULL COMMENT 'weekly | monthly | review',
    ai_summary_content TEXT        NULL COMMENT 'monthly, review 시 AI 요약',
    created_at        DATETIME(3)  NOT NULL,
    created_member_id BIGINT       NOT NULL,
    updated_at        DATETIME(3)  NULL,
    updated_member_id BIGINT       NULL,
    note              VARCHAR(500) NULL,
    FOREIGN KEY (report_id) REFERENCES report(report_id),
    FOREIGN KEY (tag_id) REFERENCES tag(tag_id)
);

-- team.created_member_id FK (순환 참조 해소: member 생성 후 ALTER로 추가)
ALTER TABLE team ADD CONSTRAINT fk_team_created_member
    FOREIGN KEY (created_member_id) REFERENCES member(member_id);
