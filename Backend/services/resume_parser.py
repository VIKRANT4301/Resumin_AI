import json
import re

from services.ai_runtime import get_generative_model
from utils.cleaner import clean_json

RESUME_PARSER_PROMPT = """
You are a resume extraction engine for an AI hiring platform.

Your job is to read raw resume text and convert it into a clean, normalized JSON object.

Rules:
- Return ONLY valid JSON.
- Do not include markdown, comments, or explanations.
- Use only information explicitly present in the resume text.
- Standardize the structure even if the resume layout is messy.
- Deduplicate skills, certifications, and repeated entries.
- Keep concise, recruiter-friendly technology names in skills.
- Keep arrays even when empty.
- Use empty strings for missing scalar fields.

Required JSON schema:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "skills": [""],
  "experience": [
    {
      "title": "",
      "company": "",
      "period": "",
      "location": "",
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "details": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [""]
    }
  ],
  "certifications": [""]
}
"""


def _normalize_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _split_lines(text: str) -> list[str]:
    return [line.strip(" \t-•|") for line in str(text or "").splitlines() if line.strip()]


def _normalize_string_list(values: object) -> list[str]:
    if not isinstance(values, list):
        return []

    cleaned = []
    seen = set()
    for value in values:
        item = _normalize_text(value)
        if not item:
            continue
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(item)
    return cleaned


def _normalize_object_list(values: object, fields: list[str]) -> list[dict]:
    if not isinstance(values, list):
        return []

    cleaned = []
    for item in values:
        if not isinstance(item, dict):
            continue
        normalized = {field: _normalize_text(item.get(field, "")) for field in fields}
        if any(normalized.values()):
            cleaned.append(normalized)
    return cleaned


def _normalize_projects(values: object) -> list[dict]:
    if not isinstance(values, list):
        return []

    cleaned = []
    for item in values:
        if not isinstance(item, dict):
            continue
        normalized = {
            "name": _normalize_text(item.get("name")),
            "description": _normalize_text(item.get("description")),
            "technologies": _normalize_string_list(item.get("technologies", [])),
        }
        if normalized["name"] or normalized["description"] or normalized["technologies"]:
            cleaned.append(normalized)
    return cleaned


def _extract_email(text: str) -> str:
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text or "")
    return match.group(0) if match else ""


def _extract_phone(text: str) -> str:
    match = re.search(r"(\+?\d[\d\s().-]{7,}\d)", text or "")
    return _normalize_text(match.group(1)) if match else ""


def _extract_location(lines: list[str]) -> str:
    for line in lines[:8]:
        if "@" in line:
            continue
        if re.search(r"\b(?:india|usa|united states|remote|hyderabad|bangalore|bengaluru|mumbai|delhi|pune|chennai|kolkata)\b", line, re.I):
            return _normalize_text(line)
    return ""


def _extract_name(lines: list[str], email: str) -> str:
    email_local = (email.split("@", 1)[0] if email else "").replace(".", " ").replace("_", " ").strip()
    email_local_words = {part.lower() for part in email_local.split() if part}

    for line in lines[:6]:
        candidate = _normalize_text(line)
        if not candidate or "resume" in candidate.lower() or "curriculum vitae" in candidate.lower():
            continue
        if len(candidate) > 60 or any(ch.isdigit() for ch in candidate) or "@" in candidate:
            continue
        words = [word for word in re.split(r"\s+", candidate) if word]
        if not 2 <= len(words) <= 4:
            continue
        if email_local_words and any(word.lower() in email_local_words for word in words):
            return " ".join(word.capitalize() for word in words)
        if all(re.fullmatch(r"[A-Za-z][A-Za-z'.-]*", word) for word in words):
            return " ".join(word.capitalize() for word in words)
    return ""


def _extract_skills(text: str) -> list[str]:
    known_skills = [
        "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB",
        "SQL", "MySQL", "PostgreSQL", "SQLite", "HTML", "CSS", "Tailwind", "FastAPI", "Django",
        "Flask", "Git", "Docker", "AWS", "Azure", "GCP", "Machine Learning", "Deep Learning",
        "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "OpenCV", "REST API",
        "Next.js", "C++", "C", "Spring Boot", "Kubernetes", "Linux",
    ]
    lowered = (text or "").lower()
    found = []
    for skill in known_skills:
        pattern = re.escape(skill.lower()).replace(r"\.", r"[.]")
        if re.search(rf"(?<!\w){pattern}(?!\w)", lowered):
            found.append(skill)
    return _normalize_string_list(found)


def _extract_summary(lines: list[str]) -> str:
    for index, line in enumerate(lines):
        if re.search(r"\b(summary|profile|objective|about)\b", line, re.I):
            summary_lines = []
            for next_line in lines[index + 1:index + 4]:
                if re.search(r"\b(experience|education|skills|projects|certifications)\b", next_line, re.I):
                    break
                summary_lines.append(next_line)
            summary = _normalize_text(" ".join(summary_lines))
            if summary:
                return summary[:500]
    return _normalize_text(" ".join(lines[1:3]))[:300] if len(lines) > 1 else ""


def _extract_section(lines: list[str], section_names: list[str]) -> list[str]:
    start_index = None
    for index, line in enumerate(lines):
        if any(re.fullmatch(rf".*\b{name}\b.*", line, re.I) for name in section_names):
            start_index = index + 1
            break
    if start_index is None:
        return []

    collected = []
    for line in lines[start_index:]:
        if re.search(r"^(experience|education|skills|projects|certifications|summary|profile|objective)\b", line, re.I):
            break
        collected.append(line)
    return collected


def _extract_education(lines: list[str]) -> list[dict]:
    education_lines = _extract_section(lines, ["education", "academic"])
    if not education_lines:
        education_lines = [line for line in lines if re.search(r"\b(b\.?tech|bachelor|master|m\.?tech|bsc|msc|mba|phd|university|college|school)\b", line, re.I)]

    results = []
    for line in education_lines[:6]:
        year_match = re.search(r"\b(19|20)\d{2}\b", line)
        results.append(
            {
                "degree": _normalize_text(line),
                "institution": "",
                "year": year_match.group(0) if year_match else "",
                "details": "",
            }
        )
    return _normalize_object_list(results, ["degree", "institution", "year", "details"])


def _extract_experience(lines: list[str]) -> list[dict]:
    experience_lines = _extract_section(lines, ["experience", "employment", "work history"])
    if not experience_lines:
        experience_lines = [line for line in lines if re.search(r"\b(intern|engineer|developer|analyst|manager|consultant)\b", line, re.I)]

    results = []
    for line in experience_lines[:8]:
        if len(line) < 6:
            continue
        results.append(
            {
                "title": _normalize_text(line),
                "company": "",
                "period": "",
                "location": "",
                "description": "",
            }
        )
    return _normalize_object_list(results, ["title", "company", "period", "location", "description"])


def _extract_projects(lines: list[str]) -> list[dict]:
    project_lines = _extract_section(lines, ["projects", "project"])
    results = []
    for line in project_lines[:6]:
        results.append({"name": _normalize_text(line), "description": "", "technologies": []})
    return _normalize_projects(results)


def _extract_certifications(lines: list[str]) -> list[str]:
    cert_lines = _extract_section(lines, ["certifications", "certification", "licenses"])
    return _normalize_string_list(cert_lines[:8])


def _fallback_resume_payload(text: str, filename: str) -> dict:
    lines = _split_lines(text)
    email = _extract_email(text)

    return {
        "name": _extract_name(lines, email),
        "email": email,
        "phone": _extract_phone(text),
        "location": _extract_location(lines),
        "summary": _extract_summary(lines),
        "skills": _extract_skills(text),
        "experience": _extract_experience(lines),
        "education": _extract_education(lines),
        "projects": _extract_projects(lines),
        "certifications": _extract_certifications(lines),
        "_fallback_reason": "local_resume_parser",
        "_source_file": filename,
    }


def _normalize_resume_payload(data: dict, filename: str) -> dict:
    skills = _normalize_string_list(data.get("skills", []))
    experience = _normalize_object_list(
        data.get("experience", []),
        ["title", "company", "period", "location", "description"],
    )
    education = _normalize_object_list(
        data.get("education", []),
        ["degree", "institution", "year", "details"],
    )
    projects = _normalize_projects(data.get("projects", []))
    certifications = _normalize_string_list(data.get("certifications", []))

    normalized = {
        "name": _normalize_text(data.get("name")),
        "email": _normalize_text(data.get("email")),
        "phone": _normalize_text(data.get("phone")),
        "location": _normalize_text(data.get("location")),
        "summary": _normalize_text(data.get("summary")),
        "skills": skills,
        "experience": experience,
        "education": education,
        "projects": projects,
        "certifications": certifications,
        "_document_stats": {
            "skills": len(skills),
            "experience_entries": len(experience),
            "education_entries": len(education),
            "project_entries": len(projects),
            "certifications": len(certifications),
        },
        "_source_file": filename,
        "_parse_status": "success",
    }
    return normalized


def parse_resume(text: str, filename: str = "unknown") -> dict:
    if not _normalize_text(text):
        return {"_parse_status": "error", "_error": "Empty resume text"}

    payload = {}
    try:
        response = get_generative_model("gemini-2.5-flash-lite", "application/json").generate_content(
            f"{RESUME_PARSER_PROMPT}\n\nRESUME_TEXT:\n{text}",
            generation_config={"temperature": 0.1},
        )
        payload = json.loads(clean_json(response.text))
    except Exception as exc:
        print(f"Resume parser fallback enabled: {exc}")
        payload = _fallback_resume_payload(text, filename)

    normalized = _normalize_resume_payload(payload, filename)
    if not any(
        [
            normalized.get("name"),
            normalized.get("email"),
            normalized.get("phone"),
            normalized.get("skills"),
            normalized.get("experience"),
            normalized.get("education"),
            normalized.get("projects"),
            normalized.get("certifications"),
        ]
    ):
        normalized = _normalize_resume_payload(_fallback_resume_payload(text, filename), filename)
    return normalized
