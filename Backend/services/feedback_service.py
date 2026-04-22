import json
import os
import re

import google.generativeai as genai
from dotenv import load_dotenv

from utils.cleaner import clean_json


load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

MODEL = genai.GenerativeModel(
    "gemini-2.5-flash-lite",
    generation_config={"response_mime_type": "application/json"},
)

RESOURCE_LIBRARY = {
    "python": [
        {"title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "docs"},
        {"title": "Automate the Boring Stuff", "url": "https://automatetheboringstuff.com/", "type": "course"},
        {"title": "Exercism Python Track", "url": "https://exercism.org/tracks/python", "type": "practice"},
        {"title": "Real Python Project Tutorials", "url": "https://realpython.com/tutorials/projects/", "type": "projects"},
    ],
    "javascript": [
        {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "docs"},
        {"title": "javascript.info", "url": "https://javascript.info/", "type": "course"},
        {"title": "Frontend Mentor", "url": "https://www.frontendmentor.io/", "type": "practice"},
        {"title": "JavaScript30", "url": "https://javascript30.com/", "type": "projects"},
    ],
    "typescript": [
        {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro", "type": "docs"},
        {"title": "Total TypeScript", "url": "https://www.totaltypescript.com/tutorials", "type": "course"},
        {"title": "Type Challenges", "url": "https://github.com/type-challenges/type-challenges", "type": "practice"},
        {"title": "TypeScript Deep Dive", "url": "https://basarat.gitbook.io/typescript/", "type": "reference"},
    ],
    "react": [
        {"title": "React Learn", "url": "https://react.dev/learn", "type": "docs"},
        {"title": "Epic React Articles", "url": "https://www.epicreact.dev/articles", "type": "course"},
        {"title": "Frontend Mentor React Challenges", "url": "https://www.frontendmentor.io/challenges?techs=react", "type": "practice"},
        {"title": "React TypeScript Cheatsheets", "url": "https://react-typescript-cheatsheet.netlify.app/", "type": "reference"},
    ],
    "next.js": [
        {"title": "Next.js Docs", "url": "https://nextjs.org/docs", "type": "docs"},
        {"title": "Learn Next.js", "url": "https://nextjs.org/learn", "type": "course"},
        {"title": "Next.js Examples", "url": "https://github.com/vercel/next.js/tree/canary/examples", "type": "projects"},
        {"title": "Vercel Architecture Guides", "url": "https://vercel.com/guides", "type": "reference"},
    ],
    "node.js": [
        {"title": "Node.js Learn", "url": "https://nodejs.org/en/learn", "type": "docs"},
        {"title": "Express Guide", "url": "https://expressjs.com/en/guide/routing.html", "type": "course"},
        {"title": "NodeSchool", "url": "https://nodeschool.io/", "type": "practice"},
        {"title": "Awesome Node.js", "url": "https://github.com/sindresorhus/awesome-nodejs", "type": "reference"},
    ],
    "fastapi": [
        {"title": "FastAPI Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "docs"},
        {"title": "FastAPI Beyond CRUD", "url": "https://jod35.github.io/fastapi-beyond-crud-docs/site/", "type": "course"},
        {"title": "Full Stack FastAPI Template", "url": "https://github.com/fastapi/full-stack-fastapi-template", "type": "projects"},
        {"title": "TestDriven.io FastAPI Articles", "url": "https://testdriven.io/blog/topics/fastapi/", "type": "reference"},
    ],
    "sql": [
        {"title": "SQLBolt", "url": "https://sqlbolt.com/", "type": "course"},
        {"title": "PostgreSQL Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html", "type": "docs"},
        {"title": "LeetCode Database", "url": "https://leetcode.com/problemset/database/", "type": "practice"},
        {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "reference"},
    ],
    "docker": [
        {"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/", "type": "docs"},
        {"title": "Play with Docker", "url": "https://labs.play-with-docker.com/", "type": "practice"},
        {"title": "Docker Curriculum", "url": "https://docker-curriculum.com/", "type": "course"},
        {"title": "Awesome Compose", "url": "https://github.com/docker/awesome-compose", "type": "projects"},
    ],
    "kubernetes": [
        {"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "type": "docs"},
        {"title": "KodeKloud Kubernetes Learning Path", "url": "https://kodekloud.com/learning-path/kubernetes/", "type": "course"},
        {"title": "Killercoda Kubernetes Scenarios", "url": "https://killercoda.com/kubernetes", "type": "practice"},
        {"title": "Awesome Kubernetes", "url": "https://github.com/ramitsurana/awesome-kubernetes", "type": "reference"},
    ],
    "aws": [
        {"title": "AWS Skill Builder", "url": "https://skillbuilder.aws/", "type": "course"},
        {"title": "AWS Documentation", "url": "https://docs.aws.amazon.com/", "type": "docs"},
        {"title": "Well-Architected Labs", "url": "https://wellarchitectedlabs.com/", "type": "practice"},
        {"title": "AWS Samples", "url": "https://github.com/aws-samples", "type": "projects"},
    ],
    "system design": [
        {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "reference"},
        {"title": "ByteByteGo Articles", "url": "https://blog.bytebytego.com/", "type": "course"},
        {"title": "Design Gurus Grokking Samples", "url": "https://www.designgurus.io/blog", "type": "reference"},
        {"title": "Hello Interview System Design", "url": "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction", "type": "practice"},
    ],
}

ADVISOR_PROMPT = """
You are an AI hiring coach and recruiter-side advisor.

Return ONLY valid JSON. Use the supplied resume, job, scoring breakdown, and detected gaps.
Avoid generic wording. Do not start fit reasoning with "Strong evidence for".

Schema:
{
  "candidate_summary": "",
  "why_candidate_fits": [""],
  "risk_signals": [{"title": "", "severity": "Low", "explanation": "", "mitigation": ""}],
  "improvement_plan": {
    "ranked_missing_skills": [{"skill": "", "importance": 1, "reason": ""}],
    "roadmap": [{"skill": "", "level": "Beginner", "focus": "", "project": "", "good_looks_like": ""}],
    "weekly_plan": [{"week": 1, "goal": "", "deliverable": ""}]
  },
  "top_strengths": [""],
  "top_concerns": [""]
}
"""


def _normalize_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _normalize_skill(skill: str) -> str:
    lowered = _normalize_text(skill).lower()
    if lowered in {"nextjs", "next.js"}:
        return "Next.js"
    if lowered in {"node", "node.js", "nodejs"}:
        return "Node.js"
    if lowered == "aws":
        return "AWS"
    if lowered == "sql":
        return "SQL"
    return _normalize_text(skill).title() if lowered == _normalize_text(skill).lower() else _normalize_text(skill)


def _resource_key(skill: str) -> str:
    lowered = _normalize_text(skill).lower()
    if "next" in lowered:
        return "next.js"
    if "node" in lowered:
        return "node.js"
    if "react" in lowered:
        return "react"
    if "type" in lowered:
        return "typescript"
    if "java" in lowered and "script" in lowered:
        return "javascript"
    if "fastapi" in lowered:
        return "fastapi"
    if "docker" in lowered:
        return "docker"
    if "kubernetes" in lowered or "k8s" in lowered:
        return "kubernetes"
    if "system design" in lowered:
        return "system design"
    if "aws" in lowered or "amazon web services" in lowered:
        return "aws"
    if "sql" in lowered or "postgres" in lowered or "mysql" in lowered:
        return "sql"
    return lowered


def _resources_for_skill(skill: str) -> list[dict]:
    normalized = _normalize_skill(skill)
    key = _resource_key(skill)
    resources = RESOURCE_LIBRARY.get(key, [])
    if resources:
        return resources[:4]
    query = normalized.replace(" ", "+")
    return [
        {"title": f"{normalized} official documentation", "url": f"https://www.google.com/search?q={query}+official+documentation", "type": "docs"},
        {"title": f"{normalized} practical course", "url": f"https://www.youtube.com/results?search_query={query}+course", "type": "course"},
        {"title": f"{normalized} practice problems", "url": f"https://www.google.com/search?q={query}+practice+problems", "type": "practice"},
        {"title": f"{normalized} project tutorial", "url": f"https://www.google.com/search?q={query}+project+tutorial", "type": "projects"},
    ]


def _candidate_title(resume: dict) -> str:
    experience = resume.get("experience", []) or []
    if experience and isinstance(experience[0], dict):
        return _normalize_text(experience[0].get("title")) or "recent role"
    return "recent role"


def _rank_missing_skills(match_result: dict) -> list[dict]:
    scores = list((match_result.get("skill_scores") or {}).values())
    ranked = []
    for item in scores:
        if item.get("matched"):
            continue
        importance = 100 if item.get("tier") == "required" else 70
        importance += int(round((1 - float(item.get("similarity") or 0)) * 20))
        ranked.append(
            {
                "skill": _normalize_skill(item.get("skill", "")),
                "importance_score": importance,
                "reason": "Missing from required skills" if item.get("tier") == "required" else "Helpful but secondary capability",
                "tier": item.get("tier", "preferred"),
            }
        )

    ranked.sort(key=lambda item: item["importance_score"], reverse=True)
    return ranked[:5]


def _weekly_plan_for_skill(skill: str, start_week: int) -> list[dict]:
    normalized = _normalize_skill(skill)
    return [
        {
            "week": start_week,
            "goal": f"Build fundamentals in {normalized}",
            "deliverable": f"Finish one guided learning track and summarize core concepts for {normalized}.",
        },
        {
            "week": start_week + 1,
            "goal": f"Practice applied {normalized}",
            "deliverable": f"Complete 5-8 hands-on exercises and document patterns, mistakes, and fixes in {normalized}.",
        },
        {
            "week": start_week + 2,
            "goal": f"Ship one resume-worthy {normalized} project",
            "deliverable": f"Publish a project or case study showing how {normalized} solved a realistic hiring problem.",
        },
    ]


def _roadmap_for_skill(skill: str, role: str) -> list[dict]:
    normalized = _normalize_skill(skill)
    return [
        {
            "skill": normalized,
            "level": "Beginner",
            "focus": f"Understand the core concepts, syntax, and common workflows of {normalized} used in {role}.",
            "project": f"Create a small focused exercise that demonstrates one isolated {normalized} capability.",
            "good_looks_like": f"You can explain when to use {normalized}, implement the basics without copying, and debug simple mistakes.",
        },
        {
            "skill": normalized,
            "level": "Intermediate",
            "focus": f"Use {normalized} inside a realistic end-to-end feature similar to the target job.",
            "project": f"Ship a mini production-style feature where {normalized} interacts with APIs, data, or state transitions.",
            "good_looks_like": f"You can complete a feature with clean structure, test the happy path, and explain tradeoffs during an interview.",
        },
        {
            "skill": normalized,
            "level": "Advanced",
            "focus": f"Demonstrate depth, performance, architecture, and edge-case judgment in {normalized}.",
            "project": f"Create a portfolio case study showing a measurable before/after outcome driven by {normalized}.",
            "good_looks_like": f"You can defend implementation decisions, discuss scaling concerns, and connect {normalized} to business impact.",
        },
    ]


def _build_improvement_plan(resume: dict, job_role: str, missing_skills: list[dict]) -> dict:
    ranked_missing_skills = []
    roadmap = []
    weekly_plan = []

    for index, item in enumerate(missing_skills, start=1):
        skill = item["skill"]
        ranked_missing_skills.append(
            {
                "skill": skill,
                "importance_rank": index,
                "importance_score": item["importance_score"],
                "why_it_matters": item["reason"],
                "resources": _resources_for_skill(skill),
            }
        )
        roadmap.extend(_roadmap_for_skill(skill, job_role))
        weekly_plan.extend(_weekly_plan_for_skill(skill, ((index - 1) * 3) + 1))

    return {
        "ranked_missing_skills": ranked_missing_skills,
        "roadmap": roadmap,
        "weekly_plan": weekly_plan,
    }


def _risk_signals(resume: dict, match_result: dict, ranked_missing_skills: list[dict]) -> list[dict]:
    summary = match_result.get("summary", {}) if isinstance(match_result, dict) else {}
    role = match_result.get("job_role", "target role")
    required_years = int(summary.get("required_years", 0) or 0)
    candidate_years = int(summary.get("experience_years_estimate", 0) or 0)
    risks = []

    critical_gaps = [item for item in ranked_missing_skills if item["importance_score"] >= 95][:3]
    if critical_gaps:
        skills = ", ".join(item["skill"] for item in critical_gaps)
        risks.append(
            {
                "title": "Critical skill gap",
                "severity": "High",
                "explanation": f"The resume lacks direct evidence for high-priority skills needed for {role}: {skills}.",
                "mitigation": f"Build one project and one resume bullet for {skills} so recruiters can see direct applied proof, not implied familiarity.",
            }
        )

    minor_gaps = [item for item in ranked_missing_skills if 70 <= item["importance_score"] < 95][:2]
    if minor_gaps:
        skills = ", ".join(item["skill"] for item in minor_gaps)
        risks.append(
            {
                "title": "Secondary skill gap",
                "severity": "Medium",
                "explanation": f"These are not deal-breakers, but missing coverage for {skills} weakens competitiveness against stronger profiles.",
                "mitigation": f"Add lightweight practice, terminology, and one concrete example for {skills} before interviews.",
            }
        )

    if required_years and candidate_years < required_years:
        risks.append(
            {
                "title": "Experience mismatch",
                "severity": "High" if required_years - candidate_years >= 2 else "Medium",
                "explanation": f"The job asks for about {required_years} years while the resume shows roughly {candidate_years} years of visible experience.",
                "mitigation": "Lead with outcomes, ownership scope, and speed of growth so recruiters see depth beyond raw tenure.",
            }
        )

    experience = [item for item in (resume.get("experience") or []) if isinstance(item, dict)]
    titles = [_normalize_text(item.get("title")) for item in experience if _normalize_text(item.get("title"))]
    if len(set(title.lower() for title in titles[:4])) >= 3:
        risks.append(
            {
                "title": "Domain inconsistency",
                "severity": "Medium",
                "explanation": "Recent roles appear spread across multiple functions, which may make the target specialization look less deliberate.",
                "mitigation": "Rewrite the summary and recent bullets to show a clear narrative toward the target role and highlight the most transferable work first.",
            }
        )

    if len(experience) >= 4:
        short_entries = 0
        for item in experience[:5]:
            period = _normalize_text(item.get("period")).lower()
            if any(token in period for token in ["6 mo", "5 mo", "4 mo", "3 mo", "2 mo", "1 mo"]):
                short_entries += 1
        if short_entries >= 2:
            risks.append(
                {
                    "title": "Possible job hopping pattern",
                    "severity": "Medium",
                    "explanation": "Several recent roles look short, which may raise retention questions even if the moves were justified.",
                    "mitigation": "Prepare a crisp, non-defensive explanation that links each move to growth, scope, or project completion.",
                }
            )

    overall_score = float(summary.get("overall_score", 0) or 0)
    if overall_score >= 90 and candidate_years > max(required_years + 3, 6):
        risks.append(
            {
                "title": "Potential overqualification",
                "severity": "Low",
                "explanation": "The candidate may exceed the visible level of the role, which can trigger compensation or retention concerns.",
                "mitigation": "Clarify why this role is attractive now and emphasize alignment with mission, scope, or domain rather than title alone.",
            }
        )
    elif overall_score < 60 and required_years and candidate_years + 1 < required_years:
        risks.append(
            {
                "title": "Potential underqualification",
                "severity": "High",
                "explanation": "The combined skill and tenure evidence is noticeably below the target role’s bar.",
                "mitigation": "Retarget slightly closer roles or show accelerated readiness through a portfolio, certifications, and stronger project proof.",
            }
        )

    return risks[:5]


def _why_candidate_fits(resume: dict, match_result: dict) -> list[str]:
    summary = match_result.get("summary", {}) if isinstance(match_result, dict) else {}
    skills = summary.get("top_strengths", [])[:3]
    role = match_result.get("job_role", "target role")
    experience = resume.get("experience", []) or []
    projects = resume.get("projects", []) or []
    bullets = []

    if skills:
        bullets.append(
            f"Direct match: the resume shows recruiter-visible evidence for {', '.join(skills)}, covering the strongest overlap with the {role} requirements."
        )
    if experience:
        latest = experience[0] if isinstance(experience[0], dict) else {}
        title = _normalize_text(latest.get("title")) or "recent role"
        bullets.append(
            f"Transferable skills: experience from {title} can carry into {role} because the profile already demonstrates adjacent delivery, ownership, and execution patterns."
        )
    if projects:
        bullets.append(
            f"Impact-based justification: {len(projects)} project signal(s) add applied evidence beyond keyword overlap, which increases confidence that the candidate can execute in the target environment."
        )
    else:
        bullets.append(
            "Impact-based justification: the resume would be stronger with more portfolio proof, but the existing experience still shows enough execution context to support interview exploration."
        )

    return bullets[:3]


def _fallback_feedback(resume: dict, match_result: dict) -> dict:
    summary = match_result.get("summary", {}) if isinstance(match_result, dict) else {}
    overall_score = int(round(float(summary.get("overall_score", 0) or 0)))
    job_role = match_result.get("job_role", "Target Role")
    ranked_missing_skills = _rank_missing_skills(match_result)
    improvement_plan = _build_improvement_plan(resume, job_role, ranked_missing_skills[:3])
    risks = _risk_signals(resume, match_result, ranked_missing_skills)
    why_fits = _why_candidate_fits(resume, match_result)

    return {
        "score": overall_score,
        "score_band": summary.get("score_band", "Weak Fit"),
        "summary": f"{job_role} alignment is currently {overall_score}%. The score is driven by weighted skills, experience, project relevance, and risk signals.",
        "strengths": [
            f"Visible overlap in {skill} helps the profile clear an early recruiter screen."
            for skill in summary.get("top_strengths", [])[:3]
        ] or ["The profile shows some overlap with the target role."],
        "top_strengths": summary.get("top_strengths", [])[:3],
        "top_concerns": summary.get("top_concerns", [])[:3],
        "risk_signals": risks,
        "missing_skills": [item["skill"] for item in ranked_missing_skills[:5]],
        "improvements": [
            f"Turn {item['skill']} into proof with one project, one metric-backed bullet, and one interview story."
            for item in ranked_missing_skills[:3]
        ],
        "match_reason": "The weighted fit combines skills match (40%), experience match (30%), project relevance (20%), and risk signals (10%).",
        "why_candidate_fits": why_fits,
        "improvement_plan": improvement_plan,
        "preparation_plan": [
            {"skill": item["skill"], "resources": _resources_for_skill(item["skill"])}
            for item in ranked_missing_skills[:3]
        ],
    }


def generate_ai_feedback(resume: dict, job_description: str, match_result: dict | None = None) -> dict:
    fallback = _fallback_feedback(resume, match_result or {})
    return fallback
