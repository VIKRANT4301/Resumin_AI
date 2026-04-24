import json

from services.ai_runtime import get_generative_model
from utils.cleaner import clean_json

PROMPT = """
You are an AI career strategist.

Create a future-focused candidate job card for a recruiter-facing hiring platform.

Rules:
- Return ONLY valid JSON.
- Keep it concise but strong.
- Do not invent technologies or experience not present in the supplied resume/profile.
- Position the candidate toward a realistic next role.

Required JSON:
{
  "headline": "",
  "target_role": "",
  "positioning_summary": "",
  "top_strengths": [""],
  "next_milestones": [""]
}
"""


def _fallback_job_card(profile: dict, resume: dict) -> dict:
    target_role = profile.get("target_title") or profile.get("current_title") or "Target Role"
    skills = resume.get("skills", [])[:4]
    strengths = skills or ["Structured resume data is available for recruiter review."]

    milestones = []
    for skill in resume.get("skills", [])[4:7]:
        milestones.append(f"Build stronger portfolio proof around {skill}.")

    if not milestones:
        milestones = [
            "Refresh the resume to highlight measurable impact.",
            "Add stronger project evidence for the next target role.",
        ]

    return {
        "headline": f"Emerging fit for {target_role}",
        "target_role": target_role,
        "positioning_summary": f"This candidate is moving toward {target_role} with visible evidence in the resume and room to sharpen positioning.",
        "top_strengths": strengths,
        "next_milestones": milestones,
    }


def generate_future_job_card(profile: dict, resume: dict) -> dict:
    fallback = _fallback_job_card(profile, resume)

    try:
        prompt = f"""
{PROMPT}

PROFILE:
{json.dumps(profile, ensure_ascii=True)[:3000]}

RESUME:
{json.dumps(resume, ensure_ascii=True)[:7000]}
"""
        response = get_generative_model("gemini-2.5-flash-lite", "application/json").generate_content(
            prompt,
            generation_config={"temperature": 0.2},
        )
        parsed = json.loads(clean_json(response.text))

        def _list_value(key: str, default: list[str]) -> list[str]:
            value = parsed.get(key, [])
            if not isinstance(value, list):
                return default
            cleaned = [str(item).strip() for item in value if str(item).strip()]
            return cleaned[:4] or default

        return {
            "headline": str(parsed.get("headline") or fallback["headline"]).strip(),
            "target_role": str(parsed.get("target_role") or fallback["target_role"]).strip(),
            "positioning_summary": str(parsed.get("positioning_summary") or fallback["positioning_summary"]).strip(),
            "top_strengths": _list_value("top_strengths", fallback["top_strengths"]),
            "next_milestones": _list_value("next_milestones", fallback["next_milestones"]),
        }
    except Exception as exc:
        print(f"Profile advisor fallback enabled: {exc}")
        return fallback
