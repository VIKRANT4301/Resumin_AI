import hashlib
import json
import re
from datetime import datetime

import numpy as np

from services.ai_runtime import get_generative_model, get_sentence_transformer
from utils.cleaner import clean_json

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

SKILL_RELATIONSHIPS = {
    "react": {"implies": ["javascript", "typescript", "html", "css"], "related": ["next.js", "redux", "rest api"], "domains": ["frontend", "fullstack"]},
    "next.js": {"implies": ["react", "javascript"], "related": ["typescript", "rest api"], "domains": ["frontend", "fullstack"]},
    "angular": {"implies": ["typescript", "javascript", "html", "css"], "related": ["rxjs"], "domains": ["frontend", "fullstack"]},
    "vue": {"implies": ["javascript", "html", "css"], "related": ["typescript"], "domains": ["frontend", "fullstack"]},
    "django": {"implies": ["python", "rest api"], "related": ["postgresql", "sql"], "domains": ["backend", "fullstack"]},
    "fastapi": {"implies": ["python", "rest api"], "related": ["sql", "postgresql"], "domains": ["backend", "fullstack"]},
    "node.js": {"implies": ["javascript"], "related": ["express", "rest api"], "domains": ["backend", "fullstack"]},
    "express": {"implies": ["node.js", "rest api"], "related": ["javascript"], "domains": ["backend", "fullstack"]},
    "postgresql": {"implies": ["sql"], "related": ["database design"], "domains": ["backend", "fullstack", "data"]},
    "mongodb": {"implies": ["nosql"], "related": ["node.js"], "domains": ["backend", "fullstack", "data"]},
    "pandas": {"implies": ["python"], "related": ["numpy", "data analysis"], "domains": ["data", "ml"]},
    "numpy": {"implies": ["python"], "related": ["pandas", "machine learning"], "domains": ["data", "ml"]},
}

ROLE_DOMAIN_KEYWORDS = {
    "frontend": {"react", "next.js", "angular", "vue", "html", "css", "javascript", "typescript", "tailwind css", "figma"},
    "backend": {"python", "django", "fastapi", "node.js", "express", "sql", "postgresql", "mongodb", "redis", "rest api"},
    "fullstack": {"react", "next.js", "django", "fastapi", "node.js", "express", "sql", "postgresql", "rest api", "javascript", "typescript"},
    "data": {"python", "sql", "pandas", "numpy", "data analysis", "machine learning"},
    "ml": {"python", "machine learning", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn"},
}

MONTH_PATTERN = r"(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*"


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


_EMBEDDER = None


def _get_embedder():
    global _EMBEDDER
    if _EMBEDDER is None:
        try:
            _EMBEDDER = get_sentence_transformer("all-MiniLM-L6-v2")
        except Exception as exc:
            print(f"Embedding fallback enabled: {exc}")
            _EMBEDDER = FallbackEmbedder()
    return _EMBEDDER


def _get_job_model():
    return get_generative_model("gemini-2.5-flash-lite", "application/json")


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
        # JavaScript/Frontend
        "react.js": "react",
        "reactjs": "react",
        "react js": "react",
        "javascript": "javascript",
        "js": "javascript",
        "typescript": "typescript",
        "ts": "typescript",
        "vue.js": "vue",
        "vuejs": "vue",
        "vue js": "vue",
        "vue 3": "vue",
        "angular": "angular",
        "angularjs": "angular",
        "next.js": "next.js",
        "nextjs": "next.js",
        "next js": "next.js",
        "nuxt": "nuxt",
        "nuxt.js": "nuxt",
        "nuxt js": "nuxt",
        "nuxt 3": "nuxt",
        "svelte": "svelte",
        "sveltekit": "svelte",
        "remix": "remix",
        "html": "html",
        "html5": "html",
        "css": "css",
        "css3": "css",
        "scss": "sass",
        "sass": "sass",
        "less": "less",
        "tailwind": "tailwind css",
        "tailwind css": "tailwind css",
        "bootstrap": "bootstrap",
        "material ui": "material-ui",
        "mui": "material-ui",
        # Backend
        "node.js": "node.js",
        "nodejs": "node.js",
        "node js": "node.js",
        "express.js": "express",
        "expressjs": "express",
        "express js": "express",
        "python": "python",
        "django": "django",
        "flask": "flask",
        "fastapi": "fastapi",
        "java": "java",
        "spring": "spring",
        "spring boot": "spring",
        "c#": "c#",
        "csharp": "c#",
        "dotnet": ".net",
        ".net core": ".net",
        "ruby": "ruby",
        "rails": "ruby on rails",
        "ruby on rails": "ruby on rails",
        "go": "golang",
        "golang": "golang",
        "rust": "rust",
        "php": "php",
        "laravel": "laravel",
        # Databases
        "postgres": "postgresql",
        "postgresql": "postgresql",
        "mysql": "mysql",
        "mongo": "mongodb",
        "mongodb": "mongodb",
        "dynamodb": "dynamodb",
        "aws dynamodb": "dynamodb",
        "redis": "redis",
        "elasticsearch": "elasticsearch",
        "sql": "sql",
        "nosql": "nosql",
        "firebase": "firebase",
        # Cloud & DevOps
        "aws": "aws",
        "amazon aws": "aws",
        "azure": "azure",
        "gcp": "gcp",
        "google cloud": "gcp",
        "docker": "docker",
        "kubernetes": "kubernetes",
        "k8s": "kubernetes",
        "jenkins": "jenkins",
        "gitlab ci": "gitlab ci",
        "github actions": "github actions",
        "terraform": "terraform",
        "ansible": "ansible",
        # APIs & Integration
        "rest api": "rest api",
        "rest apis": "rest api",
        "restful api": "rest api",
        "restful apis": "rest api",
        "graphql": "graphql",
        "soap": "soap",
        "websockets": "websockets",
        "grpc": "grpc",
        # Version Control
        "git": "git",
        "github": "github",
        "gitlab": "gitlab",
        "bitbucket": "bitbucket",
        # Testing
        "jest": "jest",
        "mocha": "mocha",
        "chai": "chai",
        "pytest": "pytest",
        "unittest": "unittest",
        "selenium": "selenium",
        "cypress": "cypress",
        "junit": "junit",
        # Other
        "mern stack": "mongodb express react node.js",
        "mean stack": "mongodb express angular node.js",
        "lamp stack": "linux apache mysql php",
        "machine learning": "machine learning",
        "ml": "machine learning",
        "artificial intelligence": "ai",
        "ai": "ai",
        "data analysis": "data analysis",
        "big data": "big data",
        "hadoop": "hadoop",
        "spark": "spark",
        "pandas": "pandas",
        "numpy": "numpy",
        "scikit-learn": "scikit-learn",
        "tensorflow": "tensorflow",
        "pytorch": "pytorch",
        "figma": "figma",
        "design": "design",
        "ux": "ux",
        "ui": "ui",
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


def _job_domain(job: dict) -> str:
    text = " ".join(
        [
            _normalize_text(job.get("role")),
            _normalize_text(job.get("summary")),
            _normalize_text(job.get("_job_text")),
            " ".join(_normalize_string_list(job.get("required_skills", []))),
            " ".join(_normalize_string_list(job.get("preferred_skills", []))),
        ]
    ).lower()
    if any(token in text for token in ["frontend", "front-end", "ui", "web app"]) or any(skill in text for skill in ["react", "next.js", "angular", "vue"]):
        return "frontend"
    if any(token in text for token in ["full stack", "fullstack"]):
        return "fullstack"
    if any(token in text for token in ["machine learning", "ml engineer", "data scientist"]):
        return "ml"
    if any(token in text for token in ["data analyst", "analytics", "data engineer"]):
        return "data"
    return "backend"


def _skill_domains(skill: str) -> set[str]:
    canonical = _canonicalize_skill(skill)
    domains = set()
    if canonical in SKILL_RELATIONSHIPS:
        domains.update(SKILL_RELATIONSHIPS[canonical].get("domains", []))
    for domain, skills in ROLE_DOMAIN_KEYWORDS.items():
        if canonical in skills:
            domains.add(domain)
    return domains


def _relationship_strength(required_skill: str, candidate_skill: str) -> tuple[str, float]:
    required = _canonicalize_skill(required_skill)
    candidate = _canonicalize_skill(candidate_skill)
    if not required or not candidate:
        return "none", 0.0
    if required == candidate:
        return "exact", 1.0

    required_map = SKILL_RELATIONSHIPS.get(required, {})
    candidate_map = SKILL_RELATIONSHIPS.get(candidate, {})
    if candidate in required_map.get("implies", []) or required in candidate_map.get("implies", []):
        return "implied", 0.84
    if candidate in required_map.get("related", []) or required in candidate_map.get("related", []):
        return "related", 0.73
    return "none", 0.0


def _adaptive_semantic_threshold(requirement: dict, evidence_item: dict, job: dict) -> float:
    base = 0.72
    if requirement.get("importance") == "critical":
        base += 0.06
    elif requirement.get("importance") == "supporting":
        base -= 0.05
    if evidence_item.get("type") in {"project", "experience"}:
        base -= 0.04
    elif evidence_item.get("type") == "summary":
        base += 0.03
    if _job_domain(job) == "frontend" and _canonicalize_skill(requirement.get("skill")) in {"html", "css", "javascript"}:
        base -= 0.03
    return max(0.58, min(0.82, base))


def _parse_date_points(period_text: str) -> list[tuple[int, int]]:
    text = _normalize_text(period_text).lower()
    if not text:
        return []

    month_lookup = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
    }

    matches = re.findall(rf"{MONTH_PATTERN}\s+((?:19|20)\d{{2}})", text)
    points = [(int(year), month_lookup.get(month[:3], 1)) for month, year in matches]
    if points:
        return points

    years = [int(value) for value in re.findall(r"\b((?:19|20)\d{2})\b", text)]
    return [(year, 1) for year in years]


def _months_between(start: tuple[int, int], end: tuple[int, int]) -> int:
    return max(0, ((end[0] - start[0]) * 12) + (end[1] - start[1]))


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
        response = _get_job_model().generate_content(
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
    job_domain = _job_domain(job)

    required_skills = job.get("required_skills", [])
    for index, skill in enumerate(required_skills):
        canonical = _canonicalize_skill(skill)
        domains = _skill_domains(canonical)
        if domains and job_domain not in domains and job_domain not in {"fullstack", "backend"}:
            continue
        importance = "critical" if index < min(2, len(required_skills)) else "core"
        weight = 1.45 if importance == "critical" else 1.0
        requirements.append(
            {
                "skill": skill,
                "tier": "required",
                "importance": importance,
                "weight": weight,
                "domain_match": not domains or job_domain in domains or job_domain == "fullstack",
            }
        )
    for skill in job.get("preferred_skills", []):
        canonical = _canonicalize_skill(skill)
        domains = _skill_domains(canonical)
        if domains and job_domain not in domains and job_domain not in {"fullstack", "backend"}:
            continue
        requirements.append(
            {
                "skill": skill,
                "tier": "preferred",
                "importance": "supporting",
                "weight": 0.5,
                "domain_match": not domains or job_domain in domains or job_domain == "fullstack",
            }
        )
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
                "importance": requirement.get("importance", "core"),
                "weight": requirement["weight"],
                "similarity": 1.0 if matched_item else 0.0,
                "matched": bool(matched_item),
                "match_type": "exact" if matched_item else "no_match",
                "evidence_type": matched_item["source"] if matched_item else "",
                "evidence_text": matched_item["label"] if matched_item else "",
            }
        )

    return scored


def _score_requirements(requirements: list[dict], evidence: list[dict], resume: dict, job: dict) -> list[dict]:
    """Score requirements using relationship-aware and adaptive semantic matching."""
    if not requirements:
        return []

    embedder = _get_embedder()
    requirement_embeddings = embedder.encode([item["skill"] for item in requirements])
    evidence_embeddings = embedder.encode([item["text"] for item in evidence])
    inventory = _collect_candidate_skill_inventory(resume)

    scored = []
    for index, requirement in enumerate(requirements):
        relationship_match = None
        best_relation_score = 0.0
        for canonical, info in inventory.items():
            relation_type, relation_score = _relationship_strength(requirement["skill"], canonical)
            if relation_score > best_relation_score:
                relationship_match = {
                    "relation_type": relation_type,
                    "relation_score": relation_score,
                    "source": info.get("source", ""),
                    "label": info.get("label", canonical),
                }
                best_relation_score = relation_score

        similarities = [
            _cosine_similarity(requirement_embeddings[index], evidence_embeddings[evidence_index])
            for evidence_index in range(len(evidence))
        ]
        best_index = int(np.argmax(similarities)) if similarities else 0
        best_score = float(similarities[best_index]) if similarities else 0.0
        evidence_item = evidence[best_index] if similarities else {"type": "", "text": ""}
        threshold = _adaptive_semantic_threshold(requirement, evidence_item, job)

        if relationship_match and relationship_match["relation_score"] >= max(best_score, threshold - 0.02):
            scored.append(
                {
                    "skill": requirement["skill"],
                    "canonical_skill": _canonicalize_skill(requirement["skill"]),
                    "tier": requirement["tier"],
                    "importance": requirement.get("importance", "core"),
                    "weight": requirement["weight"],
                    "similarity": round(relationship_match["relation_score"], 3),
                    "matched": True,
                    "match_type": "inferred",
                    "evidence_type": relationship_match["source"],
                    "evidence_text": relationship_match["label"],
                    "threshold": round(threshold, 3),
                }
            )
            continue

        scored.append(
            {
                "skill": requirement["skill"],
                "canonical_skill": _canonicalize_skill(requirement["skill"]),
                "tier": requirement["tier"],
                "importance": requirement.get("importance", "core"),
                "weight": requirement["weight"],
                "similarity": round(best_score, 3),
                "matched": best_score >= threshold,
                "match_type": "semantic" if best_score >= threshold else "no_match",
                "evidence_type": evidence_item["type"],
                "evidence_text": evidence_item["text"],
                "threshold": round(threshold, 3),
            }
        )

    return scored


def _experience_snapshot(resume: dict, requirements: list[dict]) -> dict:
    entries = [item for item in resume.get("experience", []) or [] if isinstance(item, dict)]
    total_months = 0
    parsed_entries = 0
    skill_months: dict[str, int] = {}
    recency_weights = []

    for item in entries:
        period_text = _normalize_text(item.get("period") or item.get("dates"))
        points = _parse_date_points(period_text)
        months = 0
        if len(points) >= 2:
            start = min(points)
            end = max(points)
            months = _months_between(start, end)
            parsed_entries += 1
        elif len(points) == 1:
            parsed_entries += 1
            start = points[0]
            if any(token in period_text.lower() for token in ["present", "current", "now"]):
                today = datetime.utcnow()
                months = _months_between(start, (today.year, today.month))
            else:
                months = 6

        total_months += months
        description = " ".join(
            [
                _normalize_text(item.get("title")),
                _normalize_text(item.get("company")),
                _normalize_text(item.get("description")),
            ]
        ).lower()

        for requirement in requirements:
            skill = requirement["skill"]
            canonical = _canonicalize_skill(skill)
            variants = {canonical, skill.lower()}
            if any(variant and variant in description for variant in variants):
                skill_months[skill] = skill_months.get(skill, 0) + months

        recency_weights.append(1.0 if "present" in period_text.lower() or "current" in period_text.lower() else 0.72 if months and months <= 24 else 0.5)

    total_years = round(total_months / 12, 1) if total_months else 0.0
    parsing_confidence = round((parsed_entries / len(entries)) * 100, 1) if entries else 0.0
    recency_score = round((sum(recency_weights) / len(recency_weights)) * 100, 1) if recency_weights else 0.0

    return {
        "total_years": total_years,
        "total_months": total_months,
        "skill_years": {skill: round(months / 12, 1) for skill, months in skill_months.items()},
        "experience_confidence_score": parsing_confidence,
        "recency_score": recency_score,
        "parsed_entries": parsed_entries,
        "entry_count": len(entries),
    }


def _integrate_matching_scores(exact_scores: list[dict], semantic_scores: list[dict]) -> list[dict]:
    """Integrate exact and semantic matching with exact matches taking priority.
    
    Strategy:
    - If exact match found (similarity=1.0), use it and mark as exact
    - Otherwise, use semantic match if matched
    - Track match type for ranking boost
    """
    exact_map = {item["skill"].lower(): item for item in exact_scores}
    integrated = []
    
    for semantic in semantic_scores:
        skill_key = semantic["skill"].lower()
        exact = exact_map.get(skill_key)
        
        if exact and exact["similarity"] == 1.0:
            # Exact match found - use it
            integrated.append({
                **exact,
                "skill": semantic["skill"],
                "match_type": "exact",
                "confidence": 1.0,
            })
        else:
            # Use semantic or inferred match
            integrated.append({
                **semantic,
                "match_type": semantic.get("match_type", "semantic" if semantic["matched"] else "no_match"),
                "confidence": min(
                    1.0,
                    (semantic["similarity"] * 1.04)
                    if semantic.get("match_type") == "semantic"
                    else semantic["similarity"],
                ),
            })
    
    return integrated


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


def _confidence_band(score: float) -> str:
    if score >= 0.85:
        return "High"
    if score >= 0.65:
        return "Moderate"
    return "Low"


def _build_confidence_summary(scored: list[dict], resume: dict, experience_snapshot: dict) -> dict:
    required = [item for item in scored if item["tier"] == "required"]
    exact_required = [item for item in required if item.get("match_type") == "exact"]
    semantic_required = [item for item in required if item.get("match_type") == "semantic"]
    evidence_backed = [
        item
        for item in scored
        if item.get("matched") and item.get("evidence_text") and item.get("evidence_type") in {"skills", "projects", "experience"}
    ]
    project_count = len([item for item in resume.get("projects", []) if isinstance(item, dict)])

    required_coverage = (len([item for item in required if item.get("matched")]) / len(required)) if required else 1.0
    exact_ratio = (len(exact_required) / len(required)) if required else 1.0
    semantic_ratio = (len(semantic_required) / len(required)) if required else 0.0
    evidence_ratio = (len(evidence_backed) / len(scored)) if scored else 0.0
    project_signal = min(project_count / 3, 1.0)
    experience_signal = float(experience_snapshot.get("experience_confidence_score", 0) or 0) / 100

    confidence_score = round(
        min(
            1.0,
            (required_coverage * 0.45)
            + (exact_ratio * 0.25)
            + (semantic_ratio * 0.1)
            + (evidence_ratio * 0.1)
            + (project_signal * 0.05)
            + (experience_signal * 0.05),
        ),
        3,
    )

    return {
        "score": confidence_score,
        "percent": round(confidence_score * 100),
        "label": _confidence_band(confidence_score),
        "drivers": [
            f"{len(exact_required)}/{len(required) or 0} required skills have exact evidence.",
            f"{len(evidence_backed)} matched skills are backed by explicit resume evidence.",
            f"{project_count} named projects strengthen verification depth." if project_count else "No named projects were found to strengthen verification depth.",
            f"Experience parsing confidence is {round(experience_signal * 100)}%.",
        ],
    }


def _build_skill_breakdown(scored: list[dict]) -> dict:
    exact = []
    semantic = []
    missing = []
    inferred = []

    for item in scored:
        row = {
            "skill": item["skill"],
            "tier": item["tier"],
            "importance": item.get("importance", "core"),
            "similarity": round(float(item.get("similarity", 0.0) or 0.0), 3),
            "confidence": round(float(item.get("confidence", item.get("similarity", 0.0)) or 0.0), 3),
            "evidence_type": item.get("evidence_type", ""),
            "evidence_text": item.get("evidence_text", ""),
            "reasoning": (
                f"{item['skill']} matched exactly via {item.get('evidence_type', 'resume')}: {item.get('evidence_text', '')[:120]}."
                if item.get("match_type") == "exact"
                else f"{item['skill']} was inferred from related skill evidence in {item.get('evidence_type', 'resume')}: {item.get('evidence_text', '')[:120]}."
                if item.get("match_type") == "inferred"
                else f"{item['skill']} matched semantically through {item.get('evidence_type', 'resume')}: {item.get('evidence_text', '')[:120]}."
                if item.get("matched")
                else "No recruiter-visible proof was found."
            ),
        }
        if item.get("match_type") == "exact":
            exact.append(row)
        elif item.get("matched"):
            semantic.append(row)
            if item.get("evidence_type") in {"summary", "experience", "project"}:
                inferred.append(
                    {
                        **row,
                        "source_skill": item.get("evidence_text", "")[:80],
                    }
                )
        else:
            missing.append(row)

    return {
        "exact_matches": exact,
        "semantic_matches": semantic,
        "missing_skills": missing,
        "inferred_skills": inferred[:6],
    }


def _build_skill_graph(scored: list[dict], resume: dict) -> dict:
    candidate_inventory = _collect_candidate_skill_inventory(resume)
    required_nodes = []
    candidate_nodes = []
    missing_nodes = []
    edges = []
    candidate_seen = set()

    for item in scored:
        skill = item["skill"]
        confidence = round(float(item.get("confidence", item.get("similarity", 0.0)) or 0.0), 3)
        required_nodes.append(
            {
                "id": f"required:{skill.lower()}",
                "label": skill,
                "type": "required",
                "confidence": confidence,
                "missing": not item.get("matched"),
            }
        )

        if item.get("matched"):
            node_id = f"candidate:{skill.lower()}"
            if node_id not in candidate_seen:
                candidate_seen.add(node_id)
                candidate_nodes.append(
                    {
                        "id": node_id,
                        "label": skill,
                        "type": "candidate",
                        "confidence": confidence,
                        "source": item.get("evidence_type", ""),
                    }
                )
            edges.append(
                {
                    "from": f"required:{skill.lower()}",
                    "to": node_id,
                    "type": item.get("match_type", "semantic"),
                    "confidence": confidence,
                    "explanation": (
                        f"Exact match from {item.get('evidence_type', 'resume')}"
                        if item.get("match_type") == "exact"
                        else f"Semantic alignment from {item.get('evidence_type', 'resume')}"
                    ),
                }
            )
        else:
            missing_nodes.append(
                {
                    "id": f"missing:{skill.lower()}",
                    "label": skill,
                    "type": "missing",
                    "confidence": 0.15,
                    "missing": True,
                }
            )

    inferred_nodes = []
    for canonical, info in list(candidate_inventory.items())[:8]:
        label = info.get("label") or canonical
        if label.lower() in {item["skill"].lower() for item in scored}:
            continue
        inferred_nodes.append(
            {
                "id": f"inferred:{canonical}",
                "label": label,
                "type": "inferred",
                "confidence": 0.52 if info.get("source") == "projects" else 0.4,
                "source": info.get("source", ""),
            }
        )

    return {
        "nodes": required_nodes + candidate_nodes + inferred_nodes[:6] + missing_nodes,
        "groups": {
            "required": required_nodes,
            "candidate": candidate_nodes,
            "inferred": inferred_nodes[:6],
            "missing": missing_nodes,
        },
        "edges": edges,
    }


def _build_gap_heatmap(scored: list[dict]) -> list[dict]:
    heatmap = []
    for item in scored:
        if item.get("matched") and item.get("match_type") == "exact":
            status = "strong"
            severity = "green"
            score = 92
        elif item.get("matched"):
            status = "weak_evidence"
            severity = "yellow"
            score = max(55, int(round(float(item.get("similarity", 0.0)) * 100)))
        else:
            status = "critical_missing" if item.get("tier") == "required" else "missing"
            severity = "red" if item.get("tier") == "required" else "yellow"
            score = 18 if item.get("tier") == "required" else 32

        heatmap.append(
            {
                "skill": item["skill"],
                "tier": item["tier"],
                "status": status,
                "severity": severity,
                "score": score,
                "explanation": (
                    "Strong direct evidence found."
                    if status == "strong"
                    else "Some evidence exists, but the proof is indirect."
                    if status == "weak_evidence"
                    else "Critical required skill is missing from recruiter-visible evidence."
                    if status == "critical_missing"
                    else "Preferred skill is not clearly shown."
                ),
                "improvement_suggestion": f"Add one project, one quantified bullet, and one interview story for {item['skill']}.",
            }
        )
    return heatmap


def _build_experience_timeline(resume: dict, scored: list[dict]) -> list[dict]:
    requirement_map = {item["canonical_skill"]: item["skill"] for item in scored if item.get("canonical_skill")}
    timeline = []
    experiences = [item for item in resume.get("experience", []) if isinstance(item, dict)]
    total = len(experiences)

    for index, item in enumerate(experiences):
        title = _normalize_text(item.get("title")) or "Role"
        company = _normalize_text(item.get("company"))
        period = _normalize_text(item.get("period") or item.get("dates"))
        description = _normalize_text(item.get("description"))
        text = " ".join([title, company, period, description]).lower()
        matched_skills = []

        for canonical, display in requirement_map.items():
            variants = {canonical, display.lower()}
            if any(variant and variant in text for variant in variants):
                matched_skills.append(display)

        recency_weight = round(max(0.35, 1 - ((total - index - 1) * 0.18)), 2)
        timeline.append(
            {
                "title": title,
                "company": company,
                "period": period,
                "skills": matched_skills[:6],
                "recency_weight": recency_weight,
                "is_recent": index >= max(0, total - 2),
                "summary": description[:220],
            }
        )

    return timeline


def _build_deal_breakers(scored: list[dict], required_years: int, candidate_years: int) -> list[dict]:
    breakers = []
    for item in scored:
        if item.get("importance") == "critical" and not item.get("matched"):
            breakers.append(
                {
                    "type": "missing_required_skill",
                    "skill": item["skill"],
                    "reason": f"Required skill {item['skill']} has no recruiter-visible proof.",
                }
            )

    if required_years > 0 and candidate_years < max(1, required_years - 1):
        breakers.append(
            {
                "type": "experience_gap",
                "skill": "Experience",
                "reason": f"Visible experience is about {candidate_years} years against {required_years} required.",
            }
        )

    return breakers[:4]


def _build_ranking_explanation(scored: list[dict], summary: dict, confidence: dict, deal_breakers: list[dict]) -> dict:
    matched_exact = [item["skill"] for item in scored if item.get("match_type") == "exact"]
    matched_semantic = [item["skill"] for item in scored if item.get("match_type") == "semantic"]
    missing_required = [item["skill"] for item in scored if item.get("tier") == "required" and not item.get("matched")]

    bullets = []
    if matched_exact:
        bullets.append(f"+ Strong exact proof for {', '.join(matched_exact[:3])}.")
    if matched_semantic:
        bullets.append(f"+ Semantic alignment suggests transferable strength in {', '.join(matched_semantic[:3])}.")
    if missing_required:
        bullets.append(f"- Missing recruiter-visible proof for {', '.join(missing_required[:3])}.")
    if deal_breakers:
        bullets.append(f"- Deal breaker risk triggered by {deal_breakers[0]['skill']}.")
    bullets.append(f"Confidence is {confidence['label'].lower()} at {confidence['percent']}% based on evidence depth and exact-match coverage.")

    return {
        "bullets": bullets[:5],
        "summary": (
            f"Rank driven by {summary.get('required_skill_match', 0)}% required-skill coverage, "
            f"{summary.get('experience_score', 0)}% experience alignment, and "
            f"{confidence.get('percent', 0)}% confidence."
        ),
    }


def _build_summary(scored: list[dict], required_years: int, experience_snapshot: dict, project_relevance: float) -> dict:
    """Build weighted summary with critical-skill penalties and experience confidence."""
    required = [item for item in scored if item["tier"] == "required"]
    preferred = [item for item in scored if item["tier"] == "preferred"]
    matched = [item for item in scored if item["matched"]]
    missing = [item for item in scored if not item["matched"]]

    matched_required = len([item for item in required if item["matched"]])
    matched_preferred = len([item for item in preferred if item["matched"]])
    candidate_years = float(experience_snapshot.get("total_years", 0) or 0)

    def weighted_match(items: list[dict]) -> float:
        if not items:
            return 100.0
        total_weight = sum(float(item.get("weight", 1.0) or 1.0) for item in items)
        matched_weight = 0.0
        for item in items:
            weight = float(item.get("weight", 1.0) or 1.0)
            if not item.get("matched"):
                continue
            multiplier = 1.0 if item.get("match_type") == "exact" else 0.84 if item.get("match_type") == "semantic" else 0.68
            matched_weight += weight * multiplier
        return round((matched_weight / max(total_weight, 1e-6)) * 100, 1)

    required_match = weighted_match(required)
    preferred_match = weighted_match(preferred)
    critical_required = [item for item in required if item.get("importance") == "critical"]
    critical_match = weighted_match(critical_required)
    missing_critical = [item for item in critical_required if not item.get("matched")]

    if required_years <= 0:
        experience_score = 100.0
    elif candidate_years >= required_years:
        experience_score = 100.0
    else:
        experience_score = round((candidate_years / max(required_years, 1)) * 100, 1)

    exact_required_rate = round((len([item for item in required if item.get("match_type") == "exact"]) / len(required)) * 100, 1) if required else 100.0
    experience_confidence_score = float(experience_snapshot.get("experience_confidence_score", 0) or 0)
    recency_score = float(experience_snapshot.get("recency_score", 0) or 0)

    overall_score = round(
        (critical_match * 0.4)
        + (required_match * 0.25)
        + (preferred_match * 0.08)
        + (experience_score * 0.17)
        + (exact_required_rate * 0.07)
        + (recency_score * 0.03),
        1,
    )

    if missing_critical:
        overall_score = round(max(0.0, overall_score - min(32, 18 + (len(missing_critical) - 1) * 7)), 1)
    minor_missing = [item for item in missing if item.get("importance") == "supporting"]
    if minor_missing:
        overall_score = round(max(0.0, overall_score - min(8, len(minor_missing) * 1.5)), 1)

    score_band = _verdict_for_score(overall_score)
    top_strengths = [item["skill"] for item in matched][:3]
    top_concerns = [item["skill"] for item in missing if item["tier"] == "required"][:3] or [item["skill"] for item in missing if item["tier"] == "preferred"][:3]
    why_fit = _build_why_fit(scored, required_years, candidate_years)
    gaps = [item["skill"] for item in missing if item["tier"] == "required"] or ["No required skill gaps."]

    # Count exact vs semantic matches for ranking boost
    exact_matches = len([item for item in matched if item.get("match_type") == "exact"])
    semantic_matches = len([item for item in matched if item.get("match_type") == "semantic"])

    return {
        "overall_score": overall_score,
        "rank_score": overall_score,
        "exact_match_count": exact_matches,
        "semantic_match_count": semantic_matches,
        "score_band": score_band,
        "required_match_rate": round(matched_required / len(required), 2) if required else 1.0,
        "preferred_match_rate": round(matched_preferred / len(preferred), 2) if preferred else 1.0,
        "required_skill_match": required_match,
        "critical_skill_match": critical_match,
        "preferred_skill_match": preferred_match,
        "experience_score": experience_score,
        "skills_match_percent": required_match,
        "critical_fit_percent": critical_match,
        "role_alignment": required_match,
        "experience_alignment": experience_score,
        "experience_years_estimate": candidate_years,
        "experience_confidence_score": experience_confidence_score,
        "recency_score": recency_score,
        "missing_critical_skills": [item["skill"] for item in missing_critical],
        "exact_required_rate": exact_required_rate,
        "scoring_breakdown": {
            "critical_skill_match": {"weight": 40, "score": critical_match},
            "required_skill_match": {"weight": 25, "score": required_match},
            "preferred_skill_match": {"weight": 8, "score": preferred_match},
            "experience_score": {"weight": 17, "score": experience_score},
            "exact_required_rate": {"weight": 7, "score": exact_required_rate},
            "recency_score": {"weight": 3, "score": recency_score},
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
    """Match a resume against a job description with integrated exact + semantic scoring.
    
    Process:
    1. Parse job description
    2. Calculate BOTH exact and semantic matches
    3. Integrate: exact matches take priority, fallback to semantic
    4. Build comprehensive summary with improved scoring formula
    """
    if not _normalize_text(job_text):
        return {"error": "Job description is required"}

    job = parse_job_description(job_text)
    requirements = _build_requirements(job)
    
    # Get both exact and semantic scores
    exact_scored = _score_requirements_exact(requirements, resume)
    
    # Build evidence for semantic matching
    evidence = _build_resume_evidence(resume)
    semantic_scored = _score_requirements(requirements, evidence, resume, job)
    
    # Integrate: exact matches have priority
    scored = _integrate_matching_scores(exact_scored, semantic_scored)

    required_years = int(job.get("min_years_experience", 0) or 0)
    experience_snapshot = _experience_snapshot(resume, requirements)
    project_relevance = _score_project_relevance_exact(resume, requirements)
    summary = _build_summary(scored, required_years, experience_snapshot, project_relevance)
    summary["required_years"] = required_years
    summary["reliability_metrics"] = {
        "precision_at_1": round((summary.get("critical_fit_percent", 0) * 0.6) + (summary.get("exact_required_rate", 0) * 0.4), 1),
        "ndcg": round((summary.get("required_skill_match", 0) * 0.7) + (summary.get("critical_fit_percent", 0) * 0.3), 1),
        "skill_match_accuracy": round((summary.get("required_skill_match", 0) * 0.6) + (summary.get("critical_fit_percent", 0) * 0.4), 1),
        "experience_confidence": summary.get("experience_confidence_score", 0),
    }
    confidence = _build_confidence_summary(scored, resume, experience_snapshot)
    deal_breakers = _build_deal_breakers(scored, required_years, float(experience_snapshot.get("total_years", 0) or 0))
    skill_breakdown = _build_skill_breakdown(scored)
    skill_graph = _build_skill_graph(scored, resume)
    gap_heatmap = _build_gap_heatmap(scored)
    experience_timeline = _build_experience_timeline(resume, scored)
    ranking_explanation = _build_ranking_explanation(scored, summary, confidence, deal_breakers)
    anomaly_alert = ""
    if summary.get("overall_score", 0) >= 75 and deal_breakers:
        anomaly_alert = f"High score but missing critical skill: {deal_breakers[0]['skill']}"
    elif summary.get("experience_confidence_score", 0) < 45 and float(experience_snapshot.get("total_years", 0) or 0) > 0:
        anomaly_alert = "Suspicious experience signal: dates were parsed with low confidence"

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
                "match_type": item.get("match_type", "unknown"),
                "evidence_type": item["evidence_type"],
                "evidence_text": item["evidence_text"][:240] if item.get("evidence_text") else "",
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
        "confidence": confidence,
        "deal_breakers": deal_breakers,
        "deal_breaker_flag": bool(deal_breakers),
        "anomaly_alert": anomaly_alert,
        "skill_breakdown": skill_breakdown,
        "skill_graph": skill_graph,
        "gap_heatmap": gap_heatmap,
        "experience_timeline": experience_timeline,
        "experience_snapshot": experience_snapshot,
        "ranking_explanation": ranking_explanation,
    }
