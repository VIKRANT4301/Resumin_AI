import hashlib
import json
import os
import re

import google.generativeai as genai
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

from utils.cleaner import clean_json


load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

JOB_MODEL = genai.GenerativeModel(
    "gemini-2.5-flash-lite",
    generation_config={"response_mime_type": "application/json"},
)

JOB_PROMPT = """
You are a hiring intelligence engine.

Convert the job description into a clean JSON structure for semantic matching.

Rules:
- Return ONLY valid JSON.
- Do not add markdown or commentary.
- Use only information present in the job description.
- Normalize skills into short recruiter-friendly names.
- Put must-have skills in required_skills.
- Put nice-to-have skills in preferred_skills.
- Keep arrays even when empty.

Schema:
{
  "role": "",
  "summary": "",
  "required_skills": [""],
  "preferred_skills": [""],
  "responsibilities": [""],
  "min_years_experience": 0
}
"""

COMMON_SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "nextjs",
    "angular",
    "vue",
    "node.js",
    "nodejs",
    "express",
    "fastapi",
    "django",
    "flask",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "system design",
    "api integration",
    "rest api",
    "graphql",
    "html",
    "css",
    "tailwind",
    "machine learning",
    "data analysis",
    "pandas",
    "numpy",
    "git",
    "figma",
]


class FallbackEmbedder:
    def __init__(self, dim: int = 384):
        self.dim = dim

    def encode(self, items):
        if isinstance(items, list):
            return np.array([self._encode_one(item) for item in items])
        return self._encode_one(items)

    def _encode_one(self, text: str) -> np.ndarray:
        vector = np.zeros(self.dim, dtype=float)
        for token in re.findall(r"[a-z0-9.+#-]+", str(text or "").lower()):
            slot = int(hashlib.sha1(token.encode("utf-8")).hexdigest(), 16) % self.dim
            vector[slot] += 1.0
        norm = np.linalg.norm(vector)
        return vector / norm if norm else vector


try:
    EMBEDDER = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as exc:
    print(f"Embedding fallback enabled: {exc}")
    EMBEDDER = FallbackEmbedder()


def _normalize_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _normalize_string_list(values: object) -> list[str]:
    if not isinstance(values, list):
        return []

    cleaned = []
    seen = set()
    for value in values:
        item = _normalize_text(value)
        key = item.lower()
        if not item or key in seen:
            continue
        seen.add(key)
        cleaned.append(item)
    return cleaned


def _canonicalize_skill(value: object) -> str:
    text = _normalize_text(value).lower()
    aliases = {
        "react.js": "react",
        "reactjs": "react",
        "node.js": "node.js",
        "nodejs": "node.js",
        "express.js": "express",
        "expressjs": "express",
        "nextjs": "next.js",
        "javascript": "javascript",
        "js": "javascript",
        "typescript": "typescript",
        "ts": "typescript",
        "postgres": "postgresql",
        "mongo": "mongodb",
        "rest apis": "rest api",
        "restful api": "rest api",
        "restful apis": "rest api",
        "html5": "html",
        "css3": "css",
        "github": "git",
        "mern stack": "mongodb express react node.js",
    }
    return aliases.get(text, text)


def _display_skill(value: object) -> str:
    text = _normalize_text(value)
    if not text:
        return ""
    canonical = _canonicalize_skill(text)
    display_aliases = {
        "react": "React",
        "node.js": "Node.js",
        "express": "Express",
        "next.js": "Next.js",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "postgresql": "PostgreSQL",
        "mongodb": "MongoDB",
        "mysql": "MySQL",
        "sql": "SQL",
        "rest api": "REST API",
        "html": "HTML",
        "css": "CSS",
        "git": "Git",
        "aws": "AWS",
        "gcp": "GCP",
        "azure": "Azure",
    }
    return display_aliases.get(canonical, text)


def _safe_int(value: object) -> int:
    try:
        return int(value or 0)
    except Exception:
        return 0


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    norm_a = float(np.linalg.norm(a))
    norm_b = float(np.linalg.norm(b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def _parse_years_from_text(text: str) -> int:
    matches = re.findall(r"(\d+)\+?\s+years?", str(text or "").lower())
    return max((int(item) for item in matches), default=0)


def _extract_skills_from_job_text(job_text: str) -> list[str]:
    lowered = _normalize_text(job_text).lower()
    found = []

    for skill in COMMON_SKILLS:
        if skill in lowered:
            normalized = "Next.js" if skill in {"next.js", "nextjs"} else "Node.js" if skill in {"node.js", "nodejs"} else skill
            cleaned = normalized.title() if normalized.islower() and "." not in normalized else normalized
            if cleaned not in found:
                found.append(cleaned)

    phrase_matches = re.findall(
        r"(?:experience with|expertise in|required skills?|must have|proficient in|knowledge of)\s+([a-z0-9+.#/\-\s,]{3,120})",
        lowered,
    )
    for chunk in phrase_matches:
        for piece in re.split(r",|/| and |\|", chunk):
            item = _normalize_text(piece)
            if 2 <= len(item.split()) <= 3 and len(item) <= 30:
                cleaned = item.title()
                if cleaned.lower() not in {value.lower() for value in found}:
                    found.append(cleaned)

    return found[:12]


def _fallback_job_payload(job_text: str) -> dict:
    normalized_text = _normalize_text(job_text)
    skills = _extract_skills_from_job_text(normalized_text)
    lines = [line.strip(" -•\t") for line in str(job_text or "").splitlines() if line.strip()]
    role = lines[0][:80] if lines else "Target Role"

    return {
        "role": role or "Target Role",
        "summary": normalized_text[:500],
        "required_skills": skills[:8],
        "preferred_skills": skills[8:12],
        "responsibilities": lines[1:5],
        "min_years_experience": _parse_years_from_text(job_text),
    }


def parse_job_description(job_text: str) -> dict:
    normalized_text = _normalize_text(job_text)
    if not normalized_text:
        return {
            "role": "Unknown Role",
            "summary": "",
            "required_skills": [],
            "preferred_skills": [],
            "responsibilities": [],
            "min_years_experience": 0,
            "_job_text": "",
            "_job_key": "",
        }

    payload = {}
    try:
        response = JOB_MODEL.generate_content(
            f"{JOB_PROMPT}\n\nJOB_DESCRIPTION:\n{job_text}",
            generation_config={"temperature": 0.1},
        )
        payload = json.loads(clean_json(response.text))
    except Exception as exc:
        print(f"Job parsing fallback enabled: {exc}")
        payload = _fallback_job_payload(job_text)

    if not _normalize_string_list(payload.get("required_skills", [])) and not _normalize_string_list(payload.get("preferred_skills", [])):
        payload = {
            **_fallback_job_payload(job_text),
            **payload,
        }

    return {
        "role": _normalize_text(payload.get("role")) or "Target Role",
        "summary": _normalize_text(payload.get("summary")) or normalized_text[:500],
        "required_skills": _normalize_string_list(payload.get("required_skills", [])),
        "preferred_skills": _normalize_string_list(payload.get("preferred_skills", [])),
        "responsibilities": _normalize_string_list(payload.get("responsibilities", [])),
        "min_years_experience": _safe_int(payload.get("min_years_experience")) or _parse_years_from_text(job_text),
        "_job_text": normalized_text,
        "_job_key": f"job:{hashlib.sha1(normalized_text.lower().encode('utf-8')).hexdigest()[:16]}",
    }


def _build_resume_evidence(resume: dict) -> list[dict]:
    evidence = []

    for skill in resume.get("skills", []) or []:
        text = _normalize_text(skill)
        if text:
            evidence.append({"type": "skill", "text": text})

    summary = _normalize_text(resume.get("summary"))
    if summary:
        evidence.append({"type": "summary", "text": summary})

    for item in resume.get("experience", []) or []:
        if not isinstance(item, dict):
            continue
        text = " | ".join(
            part
            for part in [
                _normalize_text(item.get("title")),
                _normalize_text(item.get("company")),
                _normalize_text(item.get("description")),
            ]
            if part
        )
        if text:
            evidence.append({"type": "experience", "text": text})

    for item in resume.get("projects", []) or []:
        if not isinstance(item, dict):
            continue
        technologies = ", ".join(_normalize_string_list(item.get("technologies", [])))
        text = " | ".join(
            part
            for part in [
                _normalize_text(item.get("name")),
                _normalize_text(item.get("description")),
                technologies,
            ]
            if part
        )
        if text:
            evidence.append({"type": "project", "text": text})

    return evidence or [{"type": "resume", "text": _normalize_text(json.dumps(resume, ensure_ascii=True))}]


def _build_requirements(job: dict) -> list[dict]:
    requirements = []
    for skill in job.get("required_skills", []):
        requirements.append({"skill": skill, "tier": "required", "weight": 1.0})
    for skill in job.get("preferred_skills", []):
        requirements.append({"skill": skill, "tier": "preferred", "weight": 0.65})
    return requirements


def _collect_candidate_skill_inventory(resume: dict) -> dict[str, dict]:
    inventory: dict[str, dict] = {}

    for skill in resume.get("skills", []) or []:
        canonical = _canonicalize_skill(skill)
        display = _display_skill(skill)
        if canonical and canonical not in inventory:
            inventory[canonical] = {"label": display, "source": "skills"}

    for project in resume.get("projects", []) or []:
        if not isinstance(project, dict):
            continue
        for technology in project.get("technologies", []) or []:
            canonical = _canonicalize_skill(technology)
            display = _display_skill(technology)
            if canonical and canonical not in inventory:
                inventory[canonical] = {"label": display, "source": "projects"}

    return inventory


def _score_requirements_exact(requirements: list[dict], resume: dict) -> list[dict]:
    inventory = _collect_candidate_skill_inventory(resume)
    scored = []

    for requirement in requirements:
        canonical = _canonicalize_skill(requirement["skill"])
        matched_item = inventory.get(canonical)
        scored.append(
            {
                "skill": _display_skill(requirement["skill"]),
                "canonical_skill": canonical,
                "tier": requirement["tier"],
                "weight": requirement["weight"],
                "similarity": 1.0 if matched_item else 0.0,
                "matched": bool(matched_item),
                "evidence_type": matched_item["source"] if matched_item else "",
                "evidence_text": matched_item["label"] if matched_item else "",
            }
        )

    return scored


def _score_requirements(requirements: list[dict], evidence: list[dict]) -> list[dict]:
    if not requirements:
        return []

    requirement_embeddings = EMBEDDER.encode([item["skill"] for item in requirements])
    evidence_embeddings = EMBEDDER.encode([item["text"] for item in evidence])

    scored = []
    for index, requirement in enumerate(requirements):
        similarities = [
            _cosine_similarity(requirement_embeddings[index], evidence_embeddings[evidence_index])
            for evidence_index in range(len(evidence))
        ]
        best_index = int(np.argmax(similarities)) if similarities else 0
        best_score = float(similarities[best_index]) if similarities else 0.0
        scored.append(
            {
                "skill": requirement["skill"],
                "tier": requirement["tier"],
                "weight": requirement["weight"],
                "similarity": round(best_score, 3),
                "matched": best_score >= 0.55,
                "evidence_type": evidence[best_index]["type"] if similarities else "",
                "evidence_text": evidence[best_index]["text"] if similarities else "",
            }
        )

    return scored


def _estimate_experience_years(resume: dict) -> int:
    years = []
    for item in resume.get("experience", []) or []:
        if not isinstance(item, dict):
            continue
        years.extend(int(value) for value in re.findall(r"\b((?:19|20)\d{2})\b", _normalize_text(item.get("period"))))
    if len(years) >= 2:
        return max(years) - min(years)
    return max(0, len(resume.get("experience", []) or []))


def _score_project_relevance_exact(resume: dict, requirements: list[dict]) -> float:
    project_technologies = set()
    for project in resume.get("projects", []) or []:
        if not isinstance(project, dict):
            continue
        for technology in project.get("technologies", []) or []:
            canonical = _canonicalize_skill(technology)
            if canonical:
                project_technologies.add(canonical)

    if not requirements:
        return 0.0

    required_skills = [_canonicalize_skill(item["skill"]) for item in requirements if item["tier"] == "required"]
    if not required_skills:
        return 0.0

    matched = len([skill for skill in required_skills if skill in project_technologies])
    return round((matched / len(required_skills)) * 100, 1) if required_skills else 0.0


def _verdict_for_score(score: float) -> str:
    if score >= 90:
        return "Excellent Fit"
    if score >= 75:
        return "Strong Fit"
    if score >= 60:
        return "Moderate Fit"
    return "Weak Fit"


def _build_why_fit(scored: list[dict], required_years: int, candidate_years: int) -> list[str]:
    required = [item for item in scored if item["tier"] == "required"]
    preferred = [item for item in scored if item["tier"] == "preferred"]
    matched_required = [item["skill"] for item in required if item["matched"]]
    matched_preferred = [item["skill"] for item in preferred if item["matched"]]
    reasons = []

    if required:
        if matched_required:
            reasons.append(
                f"Matches {len(matched_required)}/{len(required)} required skills including {', '.join(matched_required[:3])}."
            )
        else:
            reasons.append("No required skills matched.")
    else:
        reasons.append("No required skills were provided in the job description.")

    if preferred:
        if matched_preferred:
            reasons.append(
                f"Matches {len(matched_preferred)}/{len(preferred)} preferred skills including {', '.join(matched_preferred[:3])}."
            )
        else:
            reasons.append("No preferred skills matched.")

    if required_years > 0:
        if candidate_years >= required_years:
            reasons.append(f"Meets the experience requirement with {candidate_years} years against {required_years} required.")
        else:
            reasons.append(f"Has {candidate_years} years of experience against {required_years} required.")
    else:
        reasons.append(f"Experience requirement is missing; candidate resume shows {candidate_years} years based on structured entries.")

    return reasons[:3]


def _build_summary(scored: list[dict], required_years: int, candidate_years: int, project_relevance: float) -> dict:
    required = [item for item in scored if item["tier"] == "required"]
    preferred = [item for item in scored if item["tier"] == "preferred"]
    matched = [item for item in scored if item["matched"]]
    missing = [item for item in scored if not item["matched"]]

    matched_required = len([item for item in required if item["matched"]])
    matched_preferred = len([item for item in preferred if item["matched"]])
    required_match = round((matched_required / len(required)) * 100, 1) if required else 0.0
    preferred_match = round((matched_preferred / len(preferred)) * 100, 1) if preferred else 0.0
    experience_score = 100.0 if required_years <= 0 else round(min(candidate_years / max(required_years, 1), 1.0) * 100, 1)
    overall_score = round((required_match * 0.5) + (preferred_match * 0.2) + (experience_score * 0.3), 1)
    score_band = _verdict_for_score(overall_score)
    top_strengths = [item["skill"] for item in matched][:3]
    top_concerns = [item["skill"] for item in missing if item["tier"] == "required"][:3] or [item["skill"] for item in missing if item["tier"] == "preferred"][:3]
    why_fit = _build_why_fit(scored, required_years, candidate_years)
    gaps = [item["skill"] for item in missing if item["tier"] == "required"] or ["No required skills matched." if required and not matched_required else "No required skill gaps."]

    return {
        "overall_score": overall_score,
        "rank_score": overall_score,
        "score_band": score_band,
        "required_match_rate": round(matched_required / len(required), 2) if required else 0.0,
        "preferred_match_rate": round(matched_preferred / len(preferred), 2) if preferred else 0.0,
        "required_skill_match": required_match,
        "preferred_skill_match": preferred_match,
        "experience_score": experience_score,
        "skills_match_percent": required_match,
        "critical_fit_percent": required_match,
        "role_alignment": required_match,
        "experience_alignment": experience_score,
        "experience_years_estimate": candidate_years,
        "scoring_breakdown": {
            "required_skill_match": {"weight": 50, "score": required_match},
            "preferred_skill_match": {"weight": 20, "score": preferred_match},
            "experience_score": {"weight": 30, "score": experience_score},
            "projects_relevance": {"weight": 0, "score": round(project_relevance, 1)},
        },
        "matched_skills": len(matched),
        "matched_skills_list": [item["skill"] for item in matched],
        "missing_required_skills": [item["skill"] for item in required if not item["matched"]],
        "missing_skills": [item["skill"] for item in missing][:6],
        "matched_preferred_skills": [item["skill"] for item in preferred if item["matched"]],
        "strength_skills": [item["skill"] for item in matched][:6],
        "shortlist_reasons": why_fit,
        "top_strengths": top_strengths,
        "top_concerns": top_concerns,
        "why_fit": why_fit,
        "gaps": gaps,
        "project_relevance_percent": round(project_relevance, 1),
        "verdict": score_band,
    }


def match_resume_to_job(resume: dict, job_text: str) -> dict:
    if not _normalize_text(job_text):
        return {"error": "Job description is required"}

    job = parse_job_description(job_text)
    requirements = _build_requirements(job)
    scored = _score_requirements_exact(requirements, resume)

    required_years = int(job.get("min_years_experience", 0) or 0)
    candidate_years = _estimate_experience_years(resume)
    project_relevance = _score_project_relevance_exact(resume, requirements)
    summary = _build_summary(scored, required_years, candidate_years, project_relevance)
    summary["required_years"] = required_years

    return {
        "candidate": resume.get("name", "Unknown Candidate"),
        "source_file": resume.get("_source_file", ""),
        "job_role": job.get("role", "Target Role"),
        "job": job,
        "skill_scores": {
            f"{item['tier']}:{item['skill']}": {
                "skill": item["skill"],
                "tier": item["tier"],
                "similarity": item["similarity"],
                "weighted": round(item["similarity"] * item["weight"], 3),
                "matched": item["matched"],
                "evidence_type": item["evidence_type"],
                "evidence_text": item["evidence_text"][:240],
            }
            for item in scored
        },
        "matched_skills": summary.get("matched_skills_list", []),
        "missing_required_skills": summary.get("missing_required_skills", []),
        "matched_preferred_skills": summary.get("matched_preferred_skills", []),
        "why_fit": summary.get("why_fit", []),
        "gaps": summary.get("gaps", []),
        "verdict": summary.get("verdict", "Weak Fit"),
        "summary": summary,
    }
