import json
import os
import shutil
import uuid
import zipfile
import math
from xml.etree import ElementTree

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from services.candidate_store import (
    delete_match_runs_for_candidate,
    delete_recruiter_job,
    get_all_candidates,
    get_candidate_by_key,
    get_recruiter_job,
    get_session_user,
    get_dashboard_stats,
    get_profile_by_email,
    hash_password,
    link_auth_user_to_candidate,
    list_candidate_applications,
    list_public_jobs,
    list_recruiter_jobs,
    clear_session,
    create_session,
    save_candidate,
    save_auth_user,
    save_email_event,
    save_job_application,
    save_job,
    save_recruiter_action,
    save_recruiter_job,
    save_match_run,
    save_profile,
    verify_profile_credentials,
)
router = APIRouter()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _error(message: str) -> dict:
    return {"status": "error", "message": message}


def _resolve_job_input(job_input: str) -> str:
    from services.job_description_extractor import resolve_job_input

    return resolve_job_input(job_input)


def _parse_job_description(job_text: str) -> dict:
    from services.matcher_service import parse_job_description

    return parse_job_description(job_text)


def _match_resume(resume: dict, job_text: str) -> dict:
    from services.matcher_service import match_resume_to_job

    return match_resume_to_job(resume, job_text)


def _parse_resume_payload(resume_text: str, filename: str) -> dict:
    from services.resume_parser import parse_resume

    return parse_resume(resume_text, filename)


def _generate_feedback(resume: dict, job_text: str, match: dict) -> dict:
    from services.feedback_service import generate_ai_feedback

    return generate_ai_feedback(resume, job_text, match)


def _generate_job_card(profile: dict, resume: dict) -> dict:
    from services.profile_advisor import generate_future_job_card

    return generate_future_job_card(profile, resume)


def _extract_pdf_text(file_path: str) -> str:
    from services.pdf_parser import extract_text_from_pdf

    return extract_text_from_pdf(file_path)


def _extract_image_text(file_path: str) -> str:
    from services.ocr_service import extract_text_from_image

    return extract_text_from_image(file_path)


def _read_bearer_token(request: Request) -> str:
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return request.headers.get("x-session-token", "").strip()


def _require_session(request: Request, allowed_roles: set[str] | None = None) -> dict:
    token = _read_bearer_token(request)
    session = get_session_user(token)
    if not session:
        raise HTTPException(status_code=401, detail="Valid session is required")

    role = str(session["user"].get("role") or "").lower()
    if allowed_roles and role not in allowed_roles:
        raise HTTPException(status_code=403, detail="You do not have access to this resource")
    return session


def _extract_text_from_docx(file_path: str) -> str:
    paragraphs: list[str] = []

    with zipfile.ZipFile(file_path) as archive:
        xml_bytes = archive.read("word/document.xml")

    root = ElementTree.fromstring(xml_bytes)
    namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

    for paragraph in root.findall(".//w:p", namespace):
        parts = []
        for node in paragraph.findall(".//w:t", namespace):
            if node.text:
                parts.append(node.text)
        text = "".join(parts).strip()
        if text:
            paragraphs.append(text)

    return "\n".join(paragraphs)


def _extract_text_from_doc(file_path: str) -> str:
    binary = open(file_path, "rb").read()
    utf16_text = binary.decode("utf-16le", errors="ignore")
    segments = [
        segment.strip()
        for segment in utf16_text.split("\x00")
        if len(segment.strip()) >= 3
    ]

    if not segments:
        raise ValueError("Unable to extract text from DOC file")

    return "\n".join(segments)


async def _extract_resume_text(file: UploadFile) -> str:
    temp_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, temp_name)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extension = file.filename.rsplit(".", 1)[-1].lower()
        if extension == "pdf":
            return _extract_pdf_text(file_path)
        if extension == "docx":
            return _extract_text_from_docx(file_path)
        if extension == "doc":
            return _extract_text_from_doc(file_path)
        if extension in {"jpg", "jpeg", "png"}:
            return _extract_image_text(file_path)
        raise ValueError("Unsupported file type")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


async def _parse_uploaded_resume(file: UploadFile, persist: bool) -> dict:
    resume_text = await _extract_resume_text(file)
    if not resume_text.strip():
        raise ValueError("No text extracted from resume")

    parsed = _parse_resume_payload(resume_text, file.filename)
    if parsed.get("_parse_status") != "success":
        raise ValueError(parsed.get("_error", "Resume parsing failed"))

    return save_candidate(parsed) if persist else parsed


def _build_ranked_candidate(candidate: dict, match: dict, feedback: dict) -> dict:
    summary = match.get("summary", {})
    top_matches = match.get("matched_skills", [])[:5]

    return {
        "id": candidate.get("_candidate_key") or candidate.get("email") or candidate.get("_source_file"),
        "name": candidate.get("name", "Unknown Candidate"),
        "email": candidate.get("email", ""),
        "phone": candidate.get("phone", ""),
        "location": candidate.get("location", ""),
        "match_score": summary.get("overall_score", 0),
        "skills_match_percent": summary.get("required_skill_match", 0),
        "critical_fit_percent": summary.get("critical_fit_percent", 0),
        "required_match_rate": summary.get("required_match_rate", 0),
        "preferred_match_rate": summary.get("preferred_match_rate", 0),
        "score_band": summary.get("score_band", "Weak Fit"),
        "confidence": match.get("confidence", {}),
        "deal_breakers": match.get("deal_breakers", []),
        "deal_breaker_flag": bool(match.get("deal_breakers", [])),
        "anomaly_alert": match.get("anomaly_alert", ""),
        "scoring_breakdown": summary.get("scoring_breakdown", {}),
        "job_role": match.get("job_role", "Target Role"),
        "match_reason": "; ".join(match.get("why_fit", [])[:2]),
        "top_matches": top_matches,
        "strengths": match.get("why_fit", []),
        "concerns": match.get("gaps", []),
        "gaps": match.get("gaps", []),
        "improvements": feedback.get("improvements", []),
        "required_skill_match": summary.get("required_skill_match", 0),
        "preferred_skill_match": summary.get("preferred_skill_match", 0),
        "experience_score": summary.get("experience_score", 0),
        "matched_skills": match.get("matched_skills", []),
        "missing_required_skills": match.get("missing_required_skills", []),
        "matched_preferred_skills": match.get("matched_preferred_skills", []),
        "why_fit": match.get("why_fit", []),
        "verdict": match.get("verdict", summary.get("score_band", "Weak Fit")),
        "skill_breakdown": match.get("skill_breakdown", {}),
        "skill_graph": match.get("skill_graph", {}),
        "gap_heatmap": match.get("gap_heatmap", []),
        "experience_timeline": match.get("experience_timeline", []),
        "experience_snapshot": match.get("experience_snapshot", {}),
        "ranking_explanation": match.get("ranking_explanation", {}),
        "summary": summary,
        "resume": candidate,
        "match": match,
        "feedback": feedback,
    }


def _normalize_action_state(action_state: object) -> dict[str, dict]:
    normalized: dict[str, dict] = {}

    if isinstance(action_state, dict):
        for raw_key, raw_value in action_state.items():
            key = str(raw_key or "").strip().lower()
            if not key:
                continue
            if isinstance(raw_value, dict):
                normalized[key] = {
                    "shortlisted": bool(raw_value.get("shortlisted")),
                    "rejected": bool(raw_value.get("rejected")),
                }
            else:
                label = str(raw_value or "").strip().lower()
                normalized[key] = {
                    "shortlisted": label == "shortlisted",
                    "rejected": label == "rejected",
                }
        return normalized

    if isinstance(action_state, list):
        for item in action_state:
            if not isinstance(item, dict):
                continue
            state = {
                "shortlisted": bool(item.get("shortlisted")),
                "rejected": bool(item.get("rejected")),
            }
            for raw_key in [
                item.get("id"),
                item.get("candidate_key"),
                item.get("email"),
                item.get("name"),
            ]:
                key = str(raw_key or "").strip().lower()
                if key:
                    normalized[key] = state
        return normalized

    return normalized


def _candidate_action_state(candidate: dict, action_state: dict[str, dict]) -> dict:
    for raw_key in [
        candidate.get("id"),
        candidate.get("email"),
        candidate.get("name"),
        candidate.get("resume", {}).get("_candidate_key"),
    ]:
        key = str(raw_key or "").strip().lower()
        if key and key in action_state:
            return action_state[key]
    return {"shortlisted": False, "rejected": False}


def _candidate_status(candidate: dict, action_state: dict[str, dict]) -> str:
    state = _candidate_action_state(candidate, action_state)
    if state.get("shortlisted"):
        return "shortlisted"
    if state.get("rejected"):
        return "rejected"
    return "pending"


def _next_step(candidate: dict, status: str) -> str:
    if status == "rejected":
        return "No further action"
    if status != "shortlisted":
        return ""

    gaps = [str(item).strip() for item in candidate.get("gaps", []) if str(item).strip()]
    matched_skills = [str(item).strip() for item in candidate.get("matched_skills", []) if str(item).strip()]
    focus_areas = gaps[:2] or matched_skills[:2]
    focus_text = ", ".join(focus_areas) if focus_areas else "matched role requirements"

    return f"Schedule Technical Round 1 focusing on {focus_text} and project-based evidence."


def _build_dashboard_candidate(candidate: dict, action_state: dict[str, dict]) -> dict:
    status = _candidate_status(candidate, action_state)
    why_fit = [str(item).strip() for item in candidate.get("why_fit", []) if str(item).strip()]
    gaps = [str(item).strip() for item in candidate.get("gaps", []) if str(item).strip()]

    return {
        "rank": int(candidate.get("rank", 0) or 0),
        "name": candidate.get("name", ""),
        "email": candidate.get("email", ""),
        "match_score": float(candidate.get("match_score", 0) or 0),
        "job_role": candidate.get("job_role", ""),
        "score_band": candidate.get("score_band", "Weak Fit"),
        "confidence": candidate.get("confidence", {}),
        "deal_breaker_flag": bool(candidate.get("deal_breaker_flag")),
        "deal_breakers": candidate.get("deal_breakers", []),
        "anomaly_alert": candidate.get("anomaly_alert", ""),
        "status": status,
        "why_fit": why_fit,
        "gaps": gaps,
        "next_step": _next_step(candidate, status),
        "top_matches": candidate.get("top_matches", []),
        "strengths": candidate.get("strengths", []),
        "concerns": candidate.get("concerns", []),
        "matched_skills": candidate.get("matched_skills", []),
        "missing_required_skills": candidate.get("missing_required_skills", []),
        "matched_preferred_skills": candidate.get("matched_preferred_skills", []),
        "scoring_breakdown": candidate.get("scoring_breakdown", {}),
        "skill_breakdown": candidate.get("skill_breakdown", {}),
        "skill_graph": candidate.get("skill_graph", {}),
        "gap_heatmap": candidate.get("gap_heatmap", []),
        "experience_timeline": candidate.get("experience_timeline", []),
        "experience_snapshot": candidate.get("experience_snapshot", {}),
        "ranking_explanation": candidate.get("ranking_explanation", {}),
        "summary": candidate.get("summary", {}),
        "resume": candidate.get("resume", {}),
        "match": candidate.get("match", {}),
        "feedback": candidate.get("feedback", {}),
    }


def _build_dashboard_response(ranked: list[dict], action_state: object = None) -> dict:
    normalized_action_state = _normalize_action_state(action_state)
    candidates = [_build_dashboard_candidate(candidate, normalized_action_state) for candidate in ranked]

    shortlisted_count = len([item for item in candidates if item["status"] == "shortlisted"])
    rejected_count = len([item for item in candidates if item["status"] == "rejected"])

    return {
        "summary": {
            "total_candidates": len(candidates),
            "shortlisted_count": shortlisted_count,
            "rejected_count": rejected_count,
            "top_score": max((item.get("match_score", 0) for item in candidates), default=0),
            "reliability": _ranking_reliability_summary(ranked),
        },
        "candidates": candidates,
    }


def _ranking_reliability_summary(ranked: list[dict]) -> dict:
    if not ranked:
        return {
            "overall_reliability": 0,
            "precision_at_k": 0,
            "ndcg": 0,
            "skill_match_accuracy": 0,
            "experience_confidence": 0,
        }

    top_k = min(5, len(ranked))
    top_candidates = ranked[:top_k]
    relevant = 0
    gains = []
    ideal_gains = []
    skill_acc = []
    exp_conf = []

    for item in ranked:
        summary = item.get("summary", {})
        confidence = item.get("confidence", {})
        critical_cover = float(summary.get("critical_fit_percent", 0) or 0)
        required_rate = float(summary.get("required_match_rate", 0) or 0)
        experience_confidence = float(summary.get("experience_confidence_score", 0) or 0)
        exp_conf.append(experience_confidence)
        skill_acc.append((critical_cover * 0.65) + (required_rate * 100 * 0.35))

    for index, item in enumerate(top_candidates, start=1):
        summary = item.get("summary", {})
        gain = (
            float(summary.get("critical_fit_percent", 0) or 0) * 0.5
            + float(summary.get("required_skill_match", 0) or 0) * 0.3
            + float(item.get("confidence", {}).get("percent", 0) or 0) * 0.2
        ) / 100
        gains.append(gain / math.log2(index + 1))
        if float(summary.get("critical_fit_percent", 0) or 0) >= 70 and not item.get("deal_breaker_flag"):
            relevant += 1

    scored_gains = sorted(
        [
            (
                float(item.get("summary", {}).get("critical_fit_percent", 0) or 0) * 0.5
                + float(item.get("summary", {}).get("required_skill_match", 0) or 0) * 0.3
                + float(item.get("confidence", {}).get("percent", 0) or 0) * 0.2
            ) / 100
            for item in ranked
        ],
        reverse=True,
    )
    for index, gain in enumerate(scored_gains[:top_k], start=1):
        ideal_gains.append(gain / math.log2(index + 1))

    precision_at_k = round((relevant / top_k) * 100, 1)
    ndcg = round((sum(gains) / max(sum(ideal_gains), 1e-6)) * 100, 1)
    skill_match_accuracy = round(sum(skill_acc) / len(skill_acc), 1)
    experience_confidence = round(sum(exp_conf) / len(exp_conf), 1)
    overall_reliability = round(
        (precision_at_k * 0.35) + (ndcg * 0.25) + (skill_match_accuracy * 0.25) + (experience_confidence * 0.15),
        1,
    )

    return {
        "overall_reliability": overall_reliability,
        "precision_at_k": precision_at_k,
        "ndcg": ndcg,
        "skill_match_accuracy": skill_match_accuracy,
        "experience_confidence": experience_confidence,
    }


def _rank_candidates(candidates: list[dict], job_text: str) -> tuple[dict, list[dict]]:
    job = save_job(job_text, _parse_job_description(job_text))
    ranked = []

    for candidate in candidates:
        match = _match_resume(candidate, job_text)
        if match.get("error"):
            continue

        feedback = _generate_feedback(candidate, job_text, match)
        if candidate.get("_candidate_key"):
            save_match_run(candidate, job, match, feedback)
        ranked.append(_build_ranked_candidate(candidate, match, feedback))

    # Improved ranking: primary sort by match_score, tie-breaker by exact matches count
    # This ensures candidates with exact skill matches rank above those with semantic matches at same score
    ranked.sort(key=lambda item: (
        item.get("match_score", 0),
        item.get("summary", {}).get("exact_match_count", 0),
        item.get("summary", {}).get("experience_score", 0),
    ), reverse=True)
    
    for index, item in enumerate(ranked, start=1):
        item["rank"] = index
    return job, ranked


def _build_profile_response(profile: dict) -> dict:
    return {
        "email": profile.get("email", ""),
        "name": profile.get("name", ""),
        "role": profile.get("role", "candidate"),
        "phone": profile.get("phone", ""),
        "location": profile.get("location", ""),
        "current_title": profile.get("current_title", ""),
        "target_title": profile.get("target_title", ""),
        "candidate_key": profile.get("candidate_key", ""),
        "job_card": profile.get("job_card", {}),
        "resume": profile.get("resume", {}),
        "updated_at": profile.get("_updated_at", ""),
    }


def _attach_profile_identity(resume: dict, profile_payload: dict) -> dict:
    enriched_resume = dict(resume)
    if profile_payload.get("name"):
        enriched_resume["name"] = profile_payload["name"]
    if profile_payload.get("email"):
        enriched_resume["email"] = profile_payload["email"]
    return save_candidate(enriched_resume)


def _sync_profile_resume(profile: dict, parsed_resume: dict) -> tuple[dict, dict]:
    refreshed_profile = {
        "name": profile.get("name", ""),
        "email": profile.get("email", ""),
        "phone": profile.get("phone", ""),
        "location": profile.get("location", ""),
        "current_title": profile.get("current_title", ""),
        "target_title": profile.get("target_title", ""),
        "role": profile.get("role", "candidate"),
    }
    previous_candidate_key = profile.get("candidate_key", "")
    resume = _attach_profile_identity(parsed_resume, refreshed_profile)
    job_card = _generate_job_card(refreshed_profile, resume)
    saved_profile = save_profile(refreshed_profile, resume.get("_candidate_key", ""), job_card)
    link_auth_user_to_candidate(
        refreshed_profile["email"],
        resume.get("_candidate_key", ""),
        profile_email=refreshed_profile["email"],
    )
    if previous_candidate_key:
        delete_match_runs_for_candidate(previous_candidate_key)
    saved_profile["resume"] = resume
    return saved_profile, resume


def _auth_payload(session: dict) -> dict:
    if "user" in session:
        user = session["user"]
    else:
        profile_email = session.get("profile_email") or session.get("email", "")
        user = get_profile_by_email(profile_email)
        if not user:
            user = {
                "email": profile_email,
                "name": "",
                "role": session.get("role", "candidate"),
                "phone": "",
                "location": "",
                "current_title": "",
                "target_title": "",
                "candidate_key": session.get("candidate_key", ""),
                "job_card": {},
                "resume": {},
                "_updated_at": "",
            }

    return {
        "token": session["token"],
        "expires_at": session["expires_at"],
        "user": _build_profile_response(user),
    }


def _normalize_required_skills(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return []


@router.post("/")
async def match_single_resume(file: UploadFile = File(...), job_input: str = Form(...)):
    if not str(job_input or "").strip():
        return _error("Job description is required")

    try:
        resolved_job_input = _resolve_job_input(job_input)
        if not resolved_job_input:
            return _error("Job description is required")

        resume = await _parse_uploaded_resume(file, persist=True)
        job = save_job(resolved_job_input, _parse_job_description(resolved_job_input))
        match = _match_resume(resume, resolved_job_input)
        if match.get("error"):
            return _error(match["error"])

        feedback = _generate_feedback(resume, resolved_job_input, match)
        if resume.get("_candidate_key"):
            save_match_run(resume, job, match, feedback)

        return {
            "status": "success",
            "job": job,
            "resume": resume,
            "match": match,
            "feedback": feedback,
        }
    except Exception as exc:
        return _error(str(exc))


@router.post("/recruiter-find")
async def recruiter_find(request: Request):
    _require_session(request, {"recruiter"})
    body = await request.json()
    job_input = str(body.get("job_input") or "").strip()
    top_k = max(1, min(100, int(body.get("top_k", 10) or 10)))
    action_state = body.get("action_state")

    if not job_input:
        return _error("Job description is required")

    candidates = get_all_candidates()
    if not candidates:
        return {"status": "success", "results": [], "total_candidates": 0, "requested_count": top_k}

    try:
        resolved_job_input = _resolve_job_input(job_input)
        if not resolved_job_input:
            return _error("Job description is required")

        job, ranked = _rank_candidates(candidates, resolved_job_input)
        return _build_dashboard_response(ranked[:top_k], action_state)
    except Exception as exc:
        return _error(str(exc))


@router.get("/jobs/mine")
async def recruiter_jobs(request: Request):
    session = _require_session(request, {"recruiter"})
    return {
        "status": "success",
        "results": list_recruiter_jobs(session["user"].get("email", "")),
    }


@router.post("/jobs")
async def create_recruiter_job(request: Request):
    session = _require_session(request, {"recruiter"})
    body = await request.json()
    try:
        job = save_recruiter_job(
            {
                "recruiter_email": session["user"].get("email", ""),
                "title": body.get("title", ""),
                "required_skills": _normalize_required_skills(body.get("required_skills", [])),
                "experience_level": body.get("experience_level", ""),
                "salary_range": body.get("salary_range", ""),
                "description": body.get("description", ""),
            }
        )
        return {"status": "success", "job": job}
    except Exception as exc:
        return _error(str(exc))


@router.put("/jobs/{job_key}")
async def update_recruiter_job(job_key: str, request: Request):
    session = _require_session(request, {"recruiter"})
    existing = get_recruiter_job(job_key, session["user"].get("email", ""))
    if not existing:
        raise HTTPException(status_code=404, detail="Job post not found")

    body = await request.json()
    try:
        job = save_recruiter_job(
            {
                "job_key": job_key,
                "recruiter_email": session["user"].get("email", ""),
                "title": body.get("title", existing.get("title", "")),
                "required_skills": _normalize_required_skills(body.get("required_skills", existing.get("required_skills", []))),
                "experience_level": body.get("experience_level", existing.get("experience_level", "")),
                "salary_range": body.get("salary_range", existing.get("salary_range", "")),
                "description": body.get("description", existing.get("description", "")),
            }
        )
        return {"status": "success", "job": job}
    except Exception as exc:
        return _error(str(exc))


@router.delete("/jobs/{job_key}")
async def remove_recruiter_job(job_key: str, request: Request):
    session = _require_session(request, {"recruiter"})
    deleted = delete_recruiter_job(job_key, session["user"].get("email", ""))
    if not deleted:
        raise HTTPException(status_code=404, detail="Job post not found")
    return {"status": "success"}


@router.get("/jobs/public")
async def candidate_jobs(request: Request):
    _require_session(request, {"candidate"})
    return {"status": "success", "results": list_public_jobs()}


@router.post("/jobs/{job_key}/apply")
async def apply_to_job(job_key: str, request: Request):
    session = _require_session(request, {"candidate"})
    candidate_email = session["user"].get("email", "")
    candidate_key = session["user"].get("candidate_key", "")
    if not get_recruiter_job(job_key):
        raise HTTPException(status_code=404, detail="Job post not found")

    application = save_job_application(job_key, candidate_email, candidate_key=candidate_key, status="applied")
    return {"status": "success", "application": application}


@router.get("/applications/mine")
async def candidate_applications(request: Request):
    session = _require_session(request, {"candidate"})
    return {
        "status": "success",
        "results": list_candidate_applications(session["user"].get("email", "")),
    }


@router.post("/recruiter-bulk")
async def recruiter_bulk(
    request: Request,
    job_input: str = Form(...),
    top_k: int = Form(10),
    action_state: str = Form(""),
    files: list[UploadFile] = File(...),
):
    _require_session(request, {"recruiter"})
    if not str(job_input or "").strip():
        return _error("Job description is required")
    if not files:
        return _error("Please upload at least one resume")

    parsed_candidates = []
    skipped_files = []

    for file in files:
        try:
            parsed = await _parse_uploaded_resume(file, persist=True)
            parsed_candidates.append(parsed)
        except Exception as exc:
            skipped_files.append({"file": getattr(file, "filename", "unknown"), "reason": str(exc)})

    if not parsed_candidates:
        return {
            "status": "error",
            "message": "No resumes could be parsed successfully",
            "skipped_files": skipped_files,
        }

    limit = max(1, min(100, int(top_k or 10)))

    try:
        resolved_job_input = _resolve_job_input(job_input)
        if not resolved_job_input:
            return _error("Job description is required")

        job, ranked = _rank_candidates(parsed_candidates, resolved_job_input)
        parsed_action_state = None
        if str(action_state or "").strip():
            try:
                parsed_action_state = json.loads(action_state)
            except Exception:
                parsed_action_state = None
        return _build_dashboard_response(ranked[:limit], parsed_action_state)
    except Exception as exc:
        return _error(str(exc))


@router.get("/candidates")
async def list_candidates(request: Request):
    _require_session(request, {"recruiter"})
    candidates = get_all_candidates()
    return {
        "status": "success",
        "total_candidates": len(candidates),
        "results": [
            {
                "id": candidate.get("_candidate_key"),
                "name": candidate.get("name", "Unknown Candidate"),
                "email": candidate.get("email", ""),
                "phone": candidate.get("phone", ""),
                "location": candidate.get("location", ""),
                "skills": candidate.get("skills", [])[:10],
                "source_file": candidate.get("_source_file", ""),
                "updated_at": candidate.get("_updated_at", ""),
            }
            for candidate in candidates
        ],
    }


@router.get("/dashboard")
async def dashboard(request: Request):
    _require_session(request, {"recruiter"})
    return {"status": "success", "statistics": get_dashboard_stats()}


@router.post("/recruiter/actions")
async def recruiter_action(request: Request):
    session = _require_session(request, {"recruiter"})
    body = await request.json()

    action = str(body.get("action") or "").strip().lower()
    if action not in {"shortlisted", "rejected", "saved", "liked", "disliked"}:
        return _error("Valid recruiter action is required")

    candidate_email = str(body.get("candidate_email") or "").strip().lower()
    candidate_key = str(body.get("candidate_key") or "").strip()
    recruiter_email = session["user"].get("email", "")
    job_key = str(body.get("job_key") or "").strip()
    role_name = str(body.get("role_name") or "Target Role").strip()
    candidate_name = str(body.get("candidate_name") or "Candidate").strip()
    reason = str(body.get("reason") or "").strip()
    strengths = [str(item).strip() for item in (body.get("strengths") or []) if str(item).strip()]
    next_step = str(body.get("next_step") or "").strip()

    email_event = None
    email_status = ""
    if action == "shortlisted" and candidate_email:
        subject = f"You have been shortlisted for {role_name}"
        body_text = "\n".join(
            [
                f"Hello {candidate_name},",
                "",
                f"You have been shortlisted for {role_name}.",
                f"Key strengths we noticed: {', '.join(strengths[:3]) or 'role alignment and strong visible evidence'}.",
                f"Next steps: {next_step or 'Our team will contact you with the next interview step shortly.'}",
                "",
                "Regards,",
                "ProRes Hiring Team",
            ]
        )
        email_event = save_email_event(
            {
                "recipient_email": candidate_email,
                "event_type": "shortlist_email",
                "subject": subject,
                "body": body_text,
                "status": "logged",
                "payload": body,
            }
        )
        email_status = "logged"

    saved_action = save_recruiter_action(
        {
            "recruiter_email": recruiter_email,
            "candidate_key": candidate_key,
            "candidate_email": candidate_email,
            "job_key": job_key,
            "action": action,
            "reason": reason,
            "email_status": email_status,
            "payload": body,
        }
    )

    return {
        "status": "success",
        "action": saved_action,
        "email_event": email_event,
        "message": (
            "Email sent to candidate"
            if email_event
            else "Recruiter feedback captured for learning"
        ),
    }


@router.get("/profile")
async def get_profile(request: Request, email: str):
    session = _require_session(request, {"candidate", "recruiter"})
    role = session["user"].get("role", "candidate")
    if role == "candidate" and session["user"].get("email") != str(email or "").strip().lower():
        raise HTTPException(status_code=403, detail="Candidates can only access their own profile")
    profile = get_profile_by_email(email)
    if not profile:
        return _error("Profile not found")
    return {"status": "success", "profile": _build_profile_response(profile)}

@router.post("/auth/register")
async def register_user(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("candidate"),
    phone: str = Form(""),
    location: str = Form(""),
    current_title: str = Form(""),
    target_title: str = Form(""),
    file: UploadFile | None = File(None),
):
    try:
        if len(password.strip()) < 6:
            return _error("Password must be at least 6 characters long")
        normalized_role = str(role or "candidate").strip().lower()
        if normalized_role not in {"candidate", "recruiter"}:
            return _error("Role must be candidate or recruiter")
        password_hash = hash_password(password.strip())

        profile_payload = {
            "name": name.strip(),
            "email": email.strip().lower(),
            "role": normalized_role,
            "phone": phone.strip(),
            "location": location.strip(),
            "current_title": current_title.strip(),
            "target_title": target_title.strip(),
        }
        resume = {}
        job_card = {}

        if normalized_role == "candidate":
            if file is None or not getattr(file, "filename", None):
                return _error("Candidate signup requires a resume")
            parsed_resume = await _parse_uploaded_resume(file, persist=False)
            resume = _attach_profile_identity(parsed_resume, profile_payload)
            job_card = _generate_job_card(profile_payload, resume)
            profile = save_profile(
                profile_payload,
                resume.get("_candidate_key", ""),
                job_card,
            )
            profile["resume"] = resume
        else:
            profile = save_profile(profile_payload, "", {})

        save_auth_user(
            profile_payload["email"],
            password_hash,
            resume.get("_candidate_key", ""),
            profile_email=profile_payload["email"],
            role=normalized_role,
        )
        session = create_session(profile_payload["email"])
        return {
            "status": "success",
            "profile": _build_profile_response(profile),
            "auth": _auth_payload(session) if session else None,
        }
    except Exception as exc:
        return _error(str(exc))


@router.post("/auth/login")
async def login_user(request: Request):
    body = await request.json()
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")

    if not email or not password:
        return _error("Email and password are required")

    profile = verify_profile_credentials(email, password)
    if not profile:
        return _error("Invalid email or password")

    session = create_session(email)
    return {
        "status": "success",
        "profile": _build_profile_response(profile),
        "auth": _auth_payload(session) if session else None,
    }


@router.get("/auth/session")
async def get_session(request: Request):
    session = _require_session(request, {"candidate", "recruiter"})
    return {"status": "success", "auth": _auth_payload(session)}


@router.post("/auth/logout")
async def logout(request: Request):
    token = _read_bearer_token(request)
    if token:
        clear_session(token)
    return {"status": "success"}


@router.post("/profile/register")
async def register_profile(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: str = Form(""),
    location: str = Form(""),
    current_title: str = Form(""),
    target_title: str = Form(""),
    file: UploadFile = File(...),
):
    return await register_user(
        name=name,
        email=email,
        password=password,
        role="candidate",
        phone=phone,
        location=location,
        current_title=current_title,
        target_title=target_title,
        file=file,
    )


@router.post("/profile/login")
async def login_profile(request: Request):
    return await login_user(request)


@router.post("/profile/match")
async def match_profile_resume(
    request: Request,
    email: str = Form(...),
    job_input: str = Form(...),
    file: UploadFile | None = File(None),
):
    session = _require_session(request, {"candidate"})
    if not str(email or "").strip():
        return _error("Email is required")
    if session["user"].get("email") != str(email or "").strip().lower():
        raise HTTPException(status_code=403, detail="Candidates can only run analysis for their own profile")
    if not str(job_input or "").strip():
        return _error("Job description is required")

    try:
        profile = get_profile_by_email(email)
        if not profile:
            return _error("Profile not found")

        if file is not None and getattr(file, "filename", None):
            parsed_resume = await _parse_uploaded_resume(file, persist=False)
            profile, resume = _sync_profile_resume(profile, parsed_resume)
        else:
            resume = profile.get("resume") or get_candidate_by_key(profile.get("candidate_key", ""))
            if not resume:
                return _error("No resume found for this profile. Please upload one.")

        resolved_job_input = _resolve_job_input(job_input)
        if not resolved_job_input:
            return _error("Job description is required")

        job = save_job(resolved_job_input, _parse_job_description(resolved_job_input))
        match = _match_resume(resume, resolved_job_input)
        if match.get("error"):
            return _error(match["error"])

        feedback = _generate_feedback(resume, resolved_job_input, match)
        if resume.get("_candidate_key"):
            save_match_run(resume, job, match, feedback)

        return {
            "status": "success",
            "profile": _build_profile_response(profile),
            "resume": resume,
            "job": job,
            "match": match,
            "feedback": feedback,
        }
    except Exception as exc:
        return _error(str(exc))


@router.post("/profile/resume")
async def update_profile_resume(
    request: Request,
    email: str = Form(...),
    confirm_replace: bool = Form(False),
    file: UploadFile | None = File(None),
):
    session = _require_session(request, {"candidate"})
    normalized_email = str(email or "").strip().lower()
    if not normalized_email:
        return _error("Email is required")
    if session["user"].get("email") != normalized_email:
        raise HTTPException(status_code=403, detail="Candidates can only manage their own resume")
    if file is None or not getattr(file, "filename", None):
        return _error("Resume file is required")

    try:
        profile = get_profile_by_email(normalized_email)
        if not profile:
            return _error("Profile not found")

        has_existing_resume = bool(profile.get("resume") or get_candidate_by_key(profile.get("candidate_key", "")))
        if has_existing_resume and not confirm_replace:
            return _error("Uploading a new resume will replace your existing data")

        parsed_resume = await _parse_uploaded_resume(file, persist=False)
        profile, resume = _sync_profile_resume(profile, parsed_resume)

        return {
            "status": "success",
            "message": "Resume updated successfully",
            "profile": _build_profile_response(profile),
            "resume": resume,
        }
    except Exception as exc:
        return _error(str(exc))
