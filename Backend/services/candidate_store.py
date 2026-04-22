import json
import sqlite3
import hashlib
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "pro_res.db"
AUTH_DB_PATH = DATA_DIR / "auth.db"
LEGACY_JSON_PATH = DATA_DIR / "candidates.json"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _connect_auth() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(AUTH_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _normalize(value: Any) -> str:
    return str(value or "").strip()


def _get_table_columns(conn: sqlite3.Connection, table_name: str) -> set[str]:
    rows = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    return {str(row["name"]) for row in rows}


def _ensure_candidates_schema(conn: sqlite3.Connection) -> None:
    columns = _get_table_columns(conn, "candidates")
    if not columns:
        return

    expected_columns = {
        "candidate_key": "TEXT",
        "name": "TEXT",
        "email": "TEXT",
        "phone": "TEXT",
        "location": "TEXT",
        "source_file": "TEXT",
        "resume_json": "TEXT",
        "created_at": "TEXT",
        "updated_at": "TEXT",
    }

    for column_name, column_type in expected_columns.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE candidates ADD COLUMN {column_name} {column_type}")


def _ensure_jobs_schema(conn: sqlite3.Connection) -> None:
    columns = _get_table_columns(conn, "jobs")
    if not columns:
        return

    expected_columns = {
        "job_key": "TEXT",
        "role": "TEXT",
        "job_text": "TEXT",
        "job_json": "TEXT",
        "created_at": "TEXT",
        "updated_at": "TEXT",
    }

    for column_name, column_type in expected_columns.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE jobs ADD COLUMN {column_name} {column_type}")


def _ensure_recruiter_jobs_schema(conn: sqlite3.Connection) -> None:
    columns = _get_table_columns(conn, "recruiter_jobs")
    if not columns:
        return

    expected_columns = {
        "job_key": "TEXT",
        "recruiter_email": "TEXT",
        "title": "TEXT",
        "required_skills_json": "TEXT",
        "experience_level": "TEXT",
        "salary_range": "TEXT",
        "description": "TEXT",
        "created_at": "TEXT",
        "updated_at": "TEXT",
    }

    for column_name, column_type in expected_columns.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE recruiter_jobs ADD COLUMN {column_name} {column_type}")


def _ensure_job_applications_schema(conn: sqlite3.Connection) -> None:
    columns = _get_table_columns(conn, "job_applications")
    if not columns:
        return

    expected_columns = {
        "job_key": "TEXT",
        "candidate_email": "TEXT",
        "candidate_key": "TEXT",
        "status": "TEXT",
        "created_at": "TEXT",
        "updated_at": "TEXT",
    }

    for column_name, column_type in expected_columns.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE job_applications ADD COLUMN {column_name} {column_type}")


def _ensure_match_runs_schema(conn: sqlite3.Connection) -> None:
    columns = _get_table_columns(conn, "match_runs")
    if not columns:
        return

    expected_columns = {
        "candidate_key": "TEXT",
        "job_key": "TEXT",
        "match_score": "REAL",
        "result_json": "TEXT",
        "feedback_json": "TEXT",
        "created_at": "TEXT",
    }

    for column_name, column_type in expected_columns.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE match_runs ADD COLUMN {column_name} {column_type}")


def _ensure_profiles_schema(conn: sqlite3.Connection) -> None:
    columns = _get_table_columns(conn, "profiles")
    if not columns:
        return

    expected_columns = {
        "email": "TEXT",
        "name": "TEXT",
        "role": "TEXT",
        "password_hash": "TEXT",
        "phone": "TEXT",
        "location": "TEXT",
        "current_title": "TEXT",
        "target_title": "TEXT",
        "candidate_key": "TEXT",
        "job_card_json": "TEXT",
        "profile_json": "TEXT",
        "created_at": "TEXT",
        "updated_at": "TEXT",
    }

    for column_name, column_type in expected_columns.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE profiles ADD COLUMN {column_name} {column_type}")


def _ensure_auth_users_schema(conn: sqlite3.Connection) -> None:
    columns = _get_table_columns(conn, "auth_users")
    if not columns:
        return

    expected_columns = {
        "email": "TEXT",
        "password_hash": "TEXT",
        "role": "TEXT",
        "candidate_key": "TEXT",
        "profile_email": "TEXT",
        "session_token": "TEXT",
        "session_expires_at": "TEXT",
        "created_at": "TEXT",
        "updated_at": "TEXT",
    }

    for column_name, column_type in expected_columns.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE auth_users ADD COLUMN {column_name} {column_type}")


def _candidate_key(candidate: dict) -> str:
    email = _normalize(candidate.get("email")).lower()
    phone = _normalize(candidate.get("phone")).lower()
    name = _normalize(candidate.get("name")).lower()
    source_file = _normalize(candidate.get("_source_file")).lower()

    if email:
        return f"email:{email}"
    if phone:
        return f"phone:{phone}"
    if name and source_file:
        return f"name-file:{name}:{source_file}"
    if name:
        return f"name:{name}"
    return f"file:{source_file or 'unknown'}"


def _build_candidate_row(candidate: dict, candidate_key: str, created_at: str, updated_at: str) -> dict[str, Any]:
    return {
        "candidate_key": candidate_key,
        "name": candidate.get("name", ""),
        "email": candidate.get("email", ""),
        "phone": candidate.get("phone", ""),
        "location": candidate.get("location", ""),
        "source_file": candidate.get("_source_file", ""),
        "skills_json": json.dumps(candidate.get("skills", []), ensure_ascii=True),
        "education_json": json.dumps(candidate.get("education", []), ensure_ascii=True),
        "experience_json": json.dumps(candidate.get("experience", []), ensure_ascii=True),
        "resume_json": json.dumps(candidate, ensure_ascii=True),
        "created_at": created_at,
        "updated_at": updated_at,
    }


def init_store() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_key TEXT NOT NULL UNIQUE,
                name TEXT,
                email TEXT,
                phone TEXT,
                location TEXT,
                source_file TEXT,
                resume_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_key TEXT NOT NULL UNIQUE,
                role TEXT,
                job_text TEXT NOT NULL,
                job_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS match_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_key TEXT NOT NULL,
                job_key TEXT NOT NULL,
                match_score REAL NOT NULL,
                result_json TEXT NOT NULL,
                feedback_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(candidate_key, job_key)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                name TEXT,
                role TEXT,
                password_hash TEXT,
                phone TEXT,
                location TEXT,
                current_title TEXT,
                target_title TEXT,
                candidate_key TEXT,
                job_card_json TEXT NOT NULL,
                profile_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS recruiter_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_key TEXT NOT NULL UNIQUE,
                recruiter_email TEXT NOT NULL,
                title TEXT NOT NULL,
                required_skills_json TEXT NOT NULL,
                experience_level TEXT,
                salary_range TEXT,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS job_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_key TEXT NOT NULL,
                candidate_email TEXT NOT NULL,
                candidate_key TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(job_key, candidate_email)
            )
            """
        )
        _ensure_candidates_schema(conn)
        _ensure_jobs_schema(conn)
        _ensure_recruiter_jobs_schema(conn)
        _ensure_job_applications_schema(conn)
        _ensure_match_runs_schema(conn)
        _ensure_profiles_schema(conn)
        conn.commit()

    _seed_legacy_candidates()


def init_auth_store() -> None:
    with _connect_auth() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS auth_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                candidate_key TEXT,
                profile_email TEXT NOT NULL,
                session_token TEXT,
                session_expires_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        _ensure_auth_users_schema(conn)
        conn.commit()


def hash_password(password: str) -> str:
    normalized_password = str(password or "")
    if not normalized_password:
        raise ValueError("Password is required")

    iterations = 120000
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", normalized_password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    normalized_password = str(password or "")
    normalized_hash = str(stored_hash or "")
    if not normalized_password or not normalized_hash:
        return False

    try:
        algorithm, iterations, salt_hex, digest_hex = normalized_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            normalized_password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
        return secrets.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _seed_legacy_candidates() -> None:
    if not LEGACY_JSON_PATH.exists():
        return

    with _connect() as conn:
        existing_count = conn.execute("SELECT COUNT(*) AS count FROM candidates").fetchone()["count"]
        if existing_count > 0:
            return

    try:
        payload = json.loads(LEGACY_JSON_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return

    if not isinstance(payload, list):
        return

    for item in payload:
        if isinstance(item, dict):
            save_candidate(item)


def save_candidate(candidate: dict) -> dict:
    init_store()

    now = _utc_now()
    candidate_key = _candidate_key(candidate)

    with _connect() as conn:
        columns = _get_table_columns(conn, "candidates")
        existing = conn.execute(
            "SELECT created_at FROM candidates WHERE candidate_key = ?",
            (candidate_key,),
        ).fetchone()
        created_at = existing["created_at"] if existing else now
        row_payload = _build_candidate_row(candidate, candidate_key, created_at, now)
        insertable_columns = [column for column in row_payload if column in columns and column != "id"]

        insert_column_sql = ", ".join(insertable_columns)
        placeholder_sql = ", ".join(["?"] * len(insertable_columns))
        updateable_columns = [column for column in insertable_columns if column not in {"candidate_key", "created_at"}]
        update_sql = ", ".join(f"{column} = excluded.{column}" for column in updateable_columns)

        conn.execute(
            f"""
            INSERT INTO candidates ({insert_column_sql})
            VALUES ({placeholder_sql})
            ON CONFLICT(candidate_key) DO UPDATE SET
                {update_sql}
            """,
            tuple(row_payload[column] for column in insertable_columns),
        )
        conn.commit()

    saved = dict(candidate)
    saved["_candidate_key"] = candidate_key
    saved["_created_at"] = created_at
    saved["_updated_at"] = now
    return saved


def save_job(job_text: str, job_payload: dict) -> dict:
    init_store()

    now = _utc_now()
    normalized_text = _normalize(job_text)
    job_key = f"job:{hashlib.sha1(normalized_text.lower().encode('utf-8')).hexdigest()[:16]}"
    payload = json.dumps(job_payload, ensure_ascii=True)

    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO jobs (job_key, role, job_text, job_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(job_key) DO UPDATE SET
                role = excluded.role,
                job_text = excluded.job_text,
                job_json = excluded.job_json,
                updated_at = excluded.updated_at
            """,
            (
                job_key,
                job_payload.get("role", ""),
                normalized_text,
                payload,
                now,
                now,
            ),
        )
        conn.commit()

    saved = dict(job_payload)
    saved["_job_key"] = job_key
    return saved


def save_match_run(candidate: dict, job: dict, match: dict, feedback: dict) -> None:
    init_store()

    candidate_key = candidate.get("_candidate_key") or _candidate_key(candidate)
    job_key = job.get("_job_key") or save_job(job.get("_job_text", ""), job).get("_job_key")
    created_at = _utc_now()

    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO match_runs (
                candidate_key, job_key, match_score, result_json, feedback_json, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(candidate_key, job_key) DO UPDATE SET
                match_score = excluded.match_score,
                result_json = excluded.result_json,
                feedback_json = excluded.feedback_json,
                created_at = excluded.created_at
            """,
            (
                candidate_key,
                job_key,
                float(match.get("summary", {}).get("overall_score", 0)),
                json.dumps(match, ensure_ascii=True),
                json.dumps(feedback, ensure_ascii=True),
                created_at,
            ),
        )
        conn.commit()


def delete_match_runs_for_candidate(candidate_key: str) -> None:
    init_store()
    normalized_candidate_key = _normalize(candidate_key)
    if not normalized_candidate_key:
        return

    with _connect() as conn:
        conn.execute(
            """
            DELETE FROM match_runs
            WHERE candidate_key = ?
            """,
            (normalized_candidate_key,),
        )
        conn.commit()


def _job_post_key(recruiter_email: str, title: str, description: str) -> str:
    source = f"{_normalize(recruiter_email).lower()}::{_normalize(title).lower()}::{_normalize(description).lower()}"
    return f"post:{hashlib.sha1(source.encode('utf-8')).hexdigest()[:16]}"


def save_recruiter_job(job_payload: dict) -> dict:
    init_store()

    recruiter_email = _normalize(job_payload.get("recruiter_email")).lower()
    title = _normalize(job_payload.get("title"))
    description = _normalize(job_payload.get("description"))
    if not recruiter_email or not title or not description:
        raise ValueError("Recruiter email, title, and description are required")

    required_skills = [
        _normalize(item)
        for item in (job_payload.get("required_skills") or [])
        if _normalize(item)
    ]
    now = _utc_now()
    job_key = _normalize(job_payload.get("job_key")) or _job_post_key(recruiter_email, title, description)

    with _connect() as conn:
        existing = conn.execute(
            "SELECT created_at FROM recruiter_jobs WHERE job_key = ?",
            (job_key,),
        ).fetchone()
        created_at = existing["created_at"] if existing else now
        conn.execute(
            """
            INSERT INTO recruiter_jobs (
                job_key, recruiter_email, title, required_skills_json, experience_level, salary_range, description, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(job_key) DO UPDATE SET
                recruiter_email = excluded.recruiter_email,
                title = excluded.title,
                required_skills_json = excluded.required_skills_json,
                experience_level = excluded.experience_level,
                salary_range = excluded.salary_range,
                description = excluded.description,
                updated_at = excluded.updated_at
            """,
            (
                job_key,
                recruiter_email,
                title,
                json.dumps(required_skills, ensure_ascii=True),
                _normalize(job_payload.get("experience_level")),
                _normalize(job_payload.get("salary_range")),
                description,
                created_at,
                now,
            ),
        )
        conn.commit()

    return {
        "job_key": job_key,
        "recruiter_email": recruiter_email,
        "title": title,
        "required_skills": required_skills,
        "experience_level": _normalize(job_payload.get("experience_level")),
        "salary_range": _normalize(job_payload.get("salary_range")),
        "description": description,
        "_created_at": created_at,
        "_updated_at": now,
    }


def get_recruiter_job(job_key: str, recruiter_email: str | None = None) -> dict | None:
    init_store()
    normalized_job_key = _normalize(job_key)
    if not normalized_job_key:
        return None

    query = """
        SELECT *
        FROM recruiter_jobs
        WHERE job_key = ?
    """
    params: tuple[Any, ...] = (normalized_job_key,)
    if recruiter_email is not None:
        query += " AND recruiter_email = ?"
        params = (normalized_job_key, _normalize(recruiter_email).lower())

    with _connect() as conn:
        row = conn.execute(query, params).fetchone()

    if not row:
        return None

    return {
        "job_key": row["job_key"],
        "recruiter_email": row["recruiter_email"],
        "title": row["title"],
        "required_skills": json.loads(row["required_skills_json"] or "[]"),
        "experience_level": row["experience_level"] or "",
        "salary_range": row["salary_range"] or "",
        "description": row["description"] or "",
        "_created_at": row["created_at"],
        "_updated_at": row["updated_at"],
    }


def list_recruiter_jobs(recruiter_email: str) -> list[dict]:
    init_store()
    normalized_email = _normalize(recruiter_email).lower()
    if not normalized_email:
        return []

    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM recruiter_jobs
            WHERE recruiter_email = ?
            ORDER BY updated_at DESC
            """,
            (normalized_email,),
        ).fetchall()

    return [
        {
            "job_key": row["job_key"],
            "recruiter_email": row["recruiter_email"],
            "title": row["title"],
            "required_skills": json.loads(row["required_skills_json"] or "[]"),
            "experience_level": row["experience_level"] or "",
            "salary_range": row["salary_range"] or "",
            "description": row["description"] or "",
            "_created_at": row["created_at"],
            "_updated_at": row["updated_at"],
        }
        for row in rows
    ]


def list_public_jobs() -> list[dict]:
    init_store()

    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM recruiter_jobs
            ORDER BY updated_at DESC
            """
        ).fetchall()

    return [
        {
            "job_key": row["job_key"],
            "title": row["title"],
            "required_skills": json.loads(row["required_skills_json"] or "[]"),
            "experience_level": row["experience_level"] or "",
            "salary_range": row["salary_range"] or "",
            "description": row["description"] or "",
            "_created_at": row["created_at"],
            "_updated_at": row["updated_at"],
        }
        for row in rows
    ]


def delete_recruiter_job(job_key: str, recruiter_email: str) -> bool:
    init_store()
    normalized_job_key = _normalize(job_key)
    normalized_email = _normalize(recruiter_email).lower()
    if not normalized_job_key or not normalized_email:
        return False

    with _connect() as conn:
        deleted = conn.execute(
            """
            DELETE FROM recruiter_jobs
            WHERE job_key = ? AND recruiter_email = ?
            """,
            (normalized_job_key, normalized_email),
        )
        conn.execute(
            """
            DELETE FROM job_applications
            WHERE job_key = ?
            """,
            (normalized_job_key,),
        )
        conn.commit()
    return deleted.rowcount > 0


def save_job_application(job_key: str, candidate_email: str, candidate_key: str = "", status: str = "applied") -> dict:
    init_store()
    normalized_job_key = _normalize(job_key)
    normalized_email = _normalize(candidate_email).lower()
    normalized_status = _normalize(status).lower() or "applied"
    if not normalized_job_key or not normalized_email:
        raise ValueError("Job key and candidate email are required")

    now = _utc_now()
    with _connect() as conn:
        existing = conn.execute(
            """
            SELECT created_at FROM job_applications
            WHERE job_key = ? AND candidate_email = ?
            """,
            (normalized_job_key, normalized_email),
        ).fetchone()
        created_at = existing["created_at"] if existing else now
        conn.execute(
            """
            INSERT INTO job_applications (
                job_key, candidate_email, candidate_key, status, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(job_key, candidate_email) DO UPDATE SET
                candidate_key = excluded.candidate_key,
                status = excluded.status,
                updated_at = excluded.updated_at
            """,
            (
                normalized_job_key,
                normalized_email,
                _normalize(candidate_key),
                normalized_status,
                created_at,
                now,
            ),
        )
        conn.commit()

    return {
        "job_key": normalized_job_key,
        "candidate_email": normalized_email,
        "candidate_key": _normalize(candidate_key),
        "status": normalized_status,
        "_created_at": created_at,
        "_updated_at": now,
    }


def list_candidate_applications(candidate_email: str) -> list[dict]:
    init_store()
    normalized_email = _normalize(candidate_email).lower()
    if not normalized_email:
        return []

    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT applications.*, jobs.title, jobs.required_skills_json, jobs.experience_level, jobs.salary_range, jobs.description
            FROM job_applications AS applications
            JOIN recruiter_jobs AS jobs
              ON applications.job_key = jobs.job_key
            WHERE applications.candidate_email = ?
            ORDER BY applications.updated_at DESC
            """,
            (normalized_email,),
        ).fetchall()

    return [
        {
            "job_key": row["job_key"],
            "candidate_email": row["candidate_email"],
            "candidate_key": row["candidate_key"] or "",
            "status": row["status"] or "applied",
            "title": row["title"] or "",
            "required_skills": json.loads(row["required_skills_json"] or "[]"),
            "experience_level": row["experience_level"] or "",
            "salary_range": row["salary_range"] or "",
            "description": row["description"] or "",
            "_created_at": row["created_at"],
            "_updated_at": row["updated_at"],
        }
        for row in rows
    ]


def get_all_candidates() -> list[dict]:
    init_store()

    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT candidate_key, resume_json, created_at, updated_at
            FROM candidates
            ORDER BY updated_at DESC
            """
        ).fetchall()

    results = []
    for row in rows:
        candidate = json.loads(row["resume_json"])
        candidate["_candidate_key"] = row["candidate_key"]
        candidate["_created_at"] = row["created_at"]
        candidate["_updated_at"] = row["updated_at"]
        results.append(candidate)
    return results


def get_candidate_by_key(candidate_key: str) -> dict | None:
    init_store()

    with _connect() as conn:
        row = conn.execute(
            """
            SELECT candidate_key, resume_json, created_at, updated_at
            FROM candidates
            WHERE candidate_key = ?
            """,
            (candidate_key,),
        ).fetchone()

    if not row:
        return None

    candidate = json.loads(row["resume_json"])
    candidate["_candidate_key"] = row["candidate_key"]
    candidate["_created_at"] = row["created_at"]
    candidate["_updated_at"] = row["updated_at"]
    return candidate


def save_profile(profile: dict, candidate_key: str, job_card: dict, password_hash: str | None = None) -> dict:
    init_store()

    now = _utc_now()
    email = _normalize(profile.get("email")).lower()
    if not email:
        raise ValueError("Email is required")

    profile_payload = {
        "email": email,
        "name": profile.get("name", ""),
        "role": profile.get("role", "candidate"),
        "password_hash": password_hash or "",
        "phone": profile.get("phone", ""),
        "location": profile.get("location", ""),
        "current_title": profile.get("current_title", ""),
        "target_title": profile.get("target_title", ""),
        "candidate_key": candidate_key,
        "job_card_json": json.dumps(job_card, ensure_ascii=True),
        "profile_json": json.dumps(profile, ensure_ascii=True),
        "updated_at": now,
    }

    with _connect() as conn:
        existing = conn.execute(
            "SELECT created_at FROM profiles WHERE email = ?",
            (email,),
        ).fetchone()
        created_at = existing["created_at"] if existing else now
        profile_payload["created_at"] = created_at

        columns = _get_table_columns(conn, "profiles")
        insertable_columns = [column for column in profile_payload if column in columns and column != "id"]
        insert_column_sql = ", ".join(insertable_columns)
        placeholder_sql = ", ".join(["?"] * len(insertable_columns))
        updateable_columns = [column for column in insertable_columns if column not in {"email", "created_at"}]
        update_sql = ", ".join(f"{column} = excluded.{column}" for column in updateable_columns)

        conn.execute(
            f"""
            INSERT INTO profiles ({insert_column_sql})
            VALUES ({placeholder_sql})
            ON CONFLICT(email) DO UPDATE SET
                {update_sql}
            """,
            tuple(profile_payload[column] for column in insertable_columns),
        )
        conn.commit()

    saved = dict(profile)
    saved["email"] = email
    saved["role"] = profile.get("role", "candidate")
    saved["candidate_key"] = candidate_key
    saved["job_card"] = job_card
    saved["_created_at"] = created_at
    saved["_updated_at"] = now
    return saved


def save_auth_user(
    email: str,
    password_hash: str,
    candidate_key: str = "",
    profile_email: str | None = None,
    role: str = "candidate",
) -> dict:
    init_auth_store()

    normalized_email = _normalize(email).lower()
    normalized_profile_email = _normalize(profile_email or email).lower()
    normalized_role = _normalize(role).lower() or "candidate"
    if not normalized_email:
        raise ValueError("Email is required")
    if not password_hash:
        raise ValueError("Password hash is required")

    now = _utc_now()

    with _connect_auth() as conn:
        existing = conn.execute(
            "SELECT created_at FROM auth_users WHERE email = ?",
            (normalized_email,),
        ).fetchone()
        created_at = existing["created_at"] if existing else now

        conn.execute(
            """
            INSERT INTO auth_users (
                email, password_hash, role, candidate_key, profile_email, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
                password_hash = excluded.password_hash,
                role = excluded.role,
                candidate_key = excluded.candidate_key,
                profile_email = excluded.profile_email,
                updated_at = excluded.updated_at
            """,
            (
                normalized_email,
                password_hash,
                normalized_role,
                _normalize(candidate_key),
                normalized_profile_email,
                created_at,
                now,
            ),
        )
        conn.commit()

    return {
        "email": normalized_email,
        "role": normalized_role,
        "candidate_key": _normalize(candidate_key),
        "profile_email": normalized_profile_email,
        "_created_at": created_at,
        "_updated_at": now,
    }


def link_auth_user_to_candidate(email: str, candidate_key: str, profile_email: str | None = None) -> None:
    init_auth_store()
    normalized_email = _normalize(email).lower()
    if not normalized_email:
        return

    now = _utc_now()
    normalized_profile_email = _normalize(profile_email or email).lower()

    with _connect_auth() as conn:
        conn.execute(
            """
            UPDATE auth_users
            SET candidate_key = ?, profile_email = ?, updated_at = ?
            WHERE email = ?
            """,
            (_normalize(candidate_key), normalized_profile_email, now, normalized_email),
        )
        conn.commit()


def get_profile_by_email(email: str) -> dict | None:
    init_store()
    normalized_email = _normalize(email).lower()
    if not normalized_email:
        return None

    with _connect() as conn:
        row = conn.execute(
            """
            SELECT *
            FROM profiles
            WHERE email = ?
            """,
            (normalized_email,),
        ).fetchone()

    if not row:
        return None

    profile_data = json.loads(row["profile_json"]) if row["profile_json"] else {}
    profile = {
        "email": row["email"],
        "name": row["name"] or profile_data.get("name", ""),
        "role": row["role"] or profile_data.get("role", "candidate"),
        "phone": row["phone"] or profile_data.get("phone", ""),
        "location": row["location"] or profile_data.get("location", ""),
        "current_title": row["current_title"] or profile_data.get("current_title", ""),
        "target_title": row["target_title"] or profile_data.get("target_title", ""),
        "candidate_key": row["candidate_key"] or "",
        "job_card": json.loads(row["job_card_json"]) if row["job_card_json"] else {},
        "_created_at": row["created_at"],
        "_updated_at": row["updated_at"],
    }

    candidate = get_candidate_by_key(profile["candidate_key"]) if profile["candidate_key"] else None
    if candidate:
        profile["resume"] = candidate

    return profile


def verify_profile_credentials(email: str, password: str) -> dict | None:
    init_auth_store()
    normalized_email = _normalize(email).lower()
    if not normalized_email:
        return None

    with _connect_auth() as conn:
        row = conn.execute(
            """
            SELECT email, password_hash, role, profile_email, candidate_key
            FROM auth_users
            WHERE email = ?
            """,
            (normalized_email,),
        ).fetchone()

    if row and verify_password(password, row["password_hash"] or ""):
        profile = get_profile_by_email(row["profile_email"] or normalized_email)
        if row["role"] == "recruiter":
            if not profile:
                profile = {
                    "email": normalized_email,
                    "name": "",
                    "role": "recruiter",
                    "phone": "",
                    "location": "",
                    "current_title": "",
                    "target_title": "",
                    "candidate_key": "",
                    "job_card": {},
                    "_created_at": "",
                    "_updated_at": "",
                }
            else:
                profile["role"] = "recruiter"
        if profile and row["candidate_key"] and not profile.get("resume"):
            candidate = get_candidate_by_key(row["candidate_key"])
            if candidate:
                profile["resume"] = candidate
                profile["candidate_key"] = row["candidate_key"]
        return profile

    # Backward-compatible fallback for users created before auth.db existed.
    init_store()
    with _connect() as conn:
        legacy_row = conn.execute(
            """
            SELECT email, password_hash, candidate_key
            FROM profiles
            WHERE email = ?
            """,
            (normalized_email,),
        ).fetchone()

    if not legacy_row or not verify_password(password, legacy_row["password_hash"] or ""):
        return None

    migrated = save_auth_user(
        normalized_email,
        legacy_row["password_hash"] or "",
        legacy_row["candidate_key"] or "",
        profile_email=normalized_email,
        role="candidate",
    )
    profile = get_profile_by_email(migrated["profile_email"])
    if profile and migrated["candidate_key"] and not profile.get("resume"):
        candidate = get_candidate_by_key(migrated["candidate_key"])
        if candidate:
            profile["resume"] = candidate
            profile["candidate_key"] = migrated["candidate_key"]

    return profile


def create_session(email: str, duration_hours: int = 12) -> dict | None:
    init_auth_store()
    normalized_email = _normalize(email).lower()
    if not normalized_email:
        return None

    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_at = now.timestamp() + (duration_hours * 3600)
    expires_at_iso = datetime.fromtimestamp(expires_at, tz=timezone.utc).isoformat()

    with _connect_auth() as conn:
        row = conn.execute(
            """
            SELECT email, role, profile_email, candidate_key
            FROM auth_users
            WHERE email = ?
            """,
            (normalized_email,),
        ).fetchone()
        if not row:
            return None

        conn.execute(
            """
            UPDATE auth_users
            SET session_token = ?, session_expires_at = ?, updated_at = ?
            WHERE email = ?
            """,
            (token, expires_at_iso, _utc_now(), normalized_email),
        )
        conn.commit()

    return {
        "token": token,
        "email": row["email"],
        "role": row["role"] or "candidate",
        "profile_email": row["profile_email"] or row["email"],
        "candidate_key": row["candidate_key"] or "",
        "expires_at": expires_at_iso,
    }


def get_session_user(token: str) -> dict | None:
    init_auth_store()
    normalized_token = _normalize(token)
    if not normalized_token:
        return None

    with _connect_auth() as conn:
        row = conn.execute(
            """
            SELECT email, role, candidate_key, profile_email, session_expires_at
            FROM auth_users
            WHERE session_token = ?
            """,
            (normalized_token,),
        ).fetchone()

    if not row:
        return None

    expires_at = _normalize(row["session_expires_at"])
    if not expires_at:
        return None

    try:
        expiry = datetime.fromisoformat(expires_at)
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
    except ValueError:
        return None

    if expiry <= datetime.now(timezone.utc):
        clear_session(normalized_token)
        return None

    profile = get_profile_by_email(row["profile_email"] or row["email"])
    if not profile:
        profile = {
            "email": row["profile_email"] or row["email"],
            "name": "",
            "role": row["role"] or "candidate",
            "phone": "",
            "location": "",
            "current_title": "",
            "target_title": "",
            "candidate_key": row["candidate_key"] or "",
            "job_card": {},
            "_created_at": "",
            "_updated_at": "",
        }
    else:
        profile["role"] = row["role"] or profile.get("role", "candidate")

    return {
        "token": normalized_token,
        "expires_at": expires_at,
        "user": profile,
    }


def clear_session(token: str) -> None:
    init_auth_store()
    normalized_token = _normalize(token)
    if not normalized_token:
        return

    with _connect_auth() as conn:
        conn.execute(
            """
            UPDATE auth_users
            SET session_token = NULL, session_expires_at = NULL, updated_at = ?
            WHERE session_token = ?
            """,
            (_utc_now(), normalized_token),
        )
        conn.commit()


def get_dashboard_stats() -> dict:
    init_store()

    with _connect() as conn:
        candidate_count = conn.execute("SELECT COUNT(*) AS count FROM candidates").fetchone()["count"]
        job_count = conn.execute("SELECT COUNT(*) AS count FROM jobs").fetchone()["count"]
        match_count = conn.execute("SELECT COUNT(*) AS count FROM match_runs").fetchone()["count"]
        avg_match_score = conn.execute("SELECT AVG(match_score) AS value FROM match_runs").fetchone()["value"]

    return {
        "candidate_count": candidate_count,
        "job_count": job_count,
        "match_count": match_count,
        "average_match_score": round(float(avg_match_score or 0), 1),
    }
