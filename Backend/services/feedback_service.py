import re


RESOURCE_LIBRARY = {
    "python": [
        {"title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "docs"},
        {"title": "Automate the Boring Stuff with Python", "url": "https://automatetheboringstuff.com/", "type": "course"},
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
        {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "docs"},
        {"title": "Total TypeScript Tutorials", "url": "https://www.totaltypescript.com/tutorials", "type": "course"},
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
        {"title": "Vercel Guides", "url": "https://vercel.com/guides", "type": "reference"},
    ],
    "node.js": [
        {"title": "Node.js Learn", "url": "https://nodejs.org/en/learn", "type": "docs"},
        {"title": "NodeSchool", "url": "https://nodeschool.io/", "type": "course"},
        {"title": "Node.js Design Patterns Samples", "url": "https://github.com/PacktPublishing/Node.js-Design-Patterns-Third-Edition", "type": "projects"},
        {"title": "Express Routing Guide", "url": "https://expressjs.com/en/guide/routing.html", "type": "reference"},
    ],
    "fastapi": [
        {"title": "FastAPI Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "docs"},
        {"title": "FastAPI Beyond CRUD", "url": "https://jod35.github.io/fastapi-beyond-crud-docs/site/", "type": "course"},
        {"title": "Full Stack FastAPI Template", "url": "https://github.com/fastapi/full-stack-fastapi-template", "type": "projects"},
        {"title": "TestDriven.io FastAPI Articles", "url": "https://testdriven.io/blog/topics/fastapi/", "type": "reference"},
    ],
    "django": [
        {"title": "Django Official Tutorial", "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/", "type": "docs"},
        {"title": "Django for Everybody", "url": "https://www.dj4e.com/", "type": "course"},
        {"title": "Django Practice Projects", "url": "https://github.com/wsvincent/awesome-django#projects", "type": "practice"},
        {"title": "Cookiecutter Django", "url": "https://github.com/cookiecutter/cookiecutter-django", "type": "projects"},
    ],
    "sql": [
        {"title": "PostgreSQL Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html", "type": "docs"},
        {"title": "SQLBolt", "url": "https://sqlbolt.com/", "type": "course"},
        {"title": "LeetCode Database", "url": "https://leetcode.com/problemset/database/", "type": "practice"},
        {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "reference"},
    ],
    "docker": [
        {"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/", "type": "docs"},
        {"title": "Docker Curriculum", "url": "https://docker-curriculum.com/", "type": "course"},
        {"title": "Play with Docker", "url": "https://labs.play-with-docker.com/", "type": "practice"},
        {"title": "Awesome Compose", "url": "https://github.com/docker/awesome-compose", "type": "projects"},
    ],
    "kubernetes": [
        {"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "type": "docs"},
        {"title": "KodeKloud Kubernetes Learning Path", "url": "https://kodekloud.com/learning-path/kubernetes/", "type": "course"},
        {"title": "Killercoda Kubernetes Scenarios", "url": "https://killercoda.com/kubernetes", "type": "practice"},
        {"title": "Awesome Kubernetes", "url": "https://github.com/ramitsurana/awesome-kubernetes", "type": "reference"},
    ],
    "aws": [
        {"title": "AWS Documentation", "url": "https://docs.aws.amazon.com/", "type": "docs"},
        {"title": "AWS Skill Builder", "url": "https://skillbuilder.aws/", "type": "course"},
        {"title": "Well-Architected Labs", "url": "https://wellarchitectedlabs.com/", "type": "practice"},
        {"title": "AWS Samples", "url": "https://github.com/aws-samples", "type": "projects"},
    ],
    "system design": [
        {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "docs"},
        {"title": "ByteByteGo Articles", "url": "https://blog.bytebytego.com/", "type": "course"},
        {"title": "Hello Interview System Design", "url": "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction", "type": "practice"},
        {"title": "Design Gurus Blog", "url": "https://www.designgurus.io/blog", "type": "reference"},
    ],
}

SKILL_ALIASES = {
    "react.js": "react",
    "reactjs": "react",
    "nodejs": "node.js",
    "node.js": "node.js",
    "express.js": "express",
    "expressjs": "express",
    "nextjs": "next.js",
    "js": "javascript",
    "ts": "typescript",
    "postgres": "postgresql",
    "rest apis": "rest api",
    "restful api": "rest api",
    "restful apis": "rest api",
    "html5": "html",
    "css3": "css",
    "github": "git",
    "amazon web services": "aws",
}

DISPLAY_ALIASES = {
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
    "fastapi": "FastAPI",
}

FRONTEND_SEMANTIC_RULES = {
    "react": {
        "implies": ["javascript", "dom", "component-based architecture", "spa architecture"],
        "confidence": "High",
        "reason": "React work typically requires JavaScript-driven UI logic, component composition, and DOM rendering patterns.",
    },
    "angular": {
        "implies": ["typescript", "rxjs", "spa architecture"],
        "confidence": "High",
        "reason": "Angular projects usually rely on TypeScript, reactive flows, and structured SPA architecture.",
    },
    "next.js": {
        "implies": ["react", "javascript", "ssr", "ssg"],
        "confidence": "High",
        "reason": "Next.js is built on React and commonly signals server-side rendering or static generation concepts.",
    },
    "html": {
        "implies": ["frontend fundamentals", "semantic markup"],
        "confidence": "High",
        "reason": "HTML is a direct signal of page structure, semantic markup, and browser rendering fundamentals.",
    },
    "css": {
        "implies": ["responsive design", "frontend fundamentals", "layout systems"],
        "confidence": "Medium",
        "reason": "CSS experience usually carries layout, spacing, and responsive styling knowledge, but depth still needs project proof.",
    },
    "mern stack": {
        "implies": ["mongodb", "express", "react", "node.js", "javascript"],
        "confidence": "High",
        "reason": "MERN directly bundles MongoDB, Express, React, and Node.js and strongly suggests applied JavaScript work.",
    },
    "mean stack": {
        "implies": ["mongodb", "express", "angular", "node.js", "typescript"],
        "confidence": "High",
        "reason": "MEAN strongly suggests Angular-driven frontend work plus its related TypeScript ecosystem.",
    },
    "bootstrap": {
        "implies": ["responsive design", "css", "layout systems"],
        "confidence": "Medium",
        "reason": "Bootstrap signals familiarity with responsive layout patterns, CSS utility usage, and component styling.",
    },
    "vite": {
        "implies": ["frontend tooling", "javascript"],
        "confidence": "Medium",
        "reason": "Vite is a frontend build tool commonly used in modern JavaScript app workflows.",
    },
}

FRONTEND_CORE_SKILLS = {
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",
    "next.js",
    "dom",
    "responsive design",
    "frontend fundamentals",
    "spa architecture",
    "state management",
    "api integration",
    "accessibility",
}

FRONTEND_ADJACENT_SKILLS = {
    "git",
    "github",
    "figma",
    "vite",
    "bootstrap",
    "tailwind",
    "rest api",
    "node.js",
    "express",
    "docker",
    "aws",
    "frontend tooling",
    "layout systems",
    "semantic markup",
}

FULLSTACK_SEMANTIC_RULES = {
    "react": {
        "implies": ["javascript", "ui architecture", "component state", "client-side api consumption"],
        "confidence": "High",
        "reason": "React typically signals browser-side component logic, client-side state handling, and API-driven UI rendering.",
    },
    "django": {
        "implies": ["python", "orm", "rest api", "backend data flow", "server-side architecture"],
        "confidence": "High",
        "reason": "Django usually implies Python backend fundamentals, model-view routing, data handling, and API or server-rendered delivery patterns.",
    },
    "django rest framework": {
        "implies": ["rest api", "serialization", "backend integration"],
        "confidence": "High",
        "reason": "Django REST Framework is a direct signal of API design, serialization, and contract-driven backend/frontend integration.",
    },
    "react + django": {
        "implies": ["full stack integration", "authentication flow", "frontend-backend contract"],
        "confidence": "High",
        "reason": "Combining React and Django strongly suggests cross-layer delivery, data contracts, and integration debugging.",
    },
}

FULLSTACK_CORE_SKILLS = {
    "react",
    "django",
    "javascript",
    "python",
    "rest api",
    "api integration",
    "sql",
    "postgresql",
    "authentication",
    "frontend-backend contract",
    "full stack integration",
}


def _normalize_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _normalize_skill(skill: str) -> str:
    canonical = SKILL_ALIASES.get(_normalize_text(skill).lower(), _normalize_text(skill).lower())
    return DISPLAY_ALIASES.get(canonical, canonical.title() if canonical else "")


def _resource_key(skill: str) -> str:
    lowered = SKILL_ALIASES.get(_normalize_text(skill).lower(), _normalize_text(skill).lower())
    if "next" in lowered:
        return "next.js"
    if "node" in lowered:
        return "node.js"
    if "react" in lowered:
        return "react"
    if "django" in lowered:
        return "django"
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
    if "aws" in lowered:
        return "aws"
    if lowered in {"sql", "postgresql", "mysql"}:
        return "sql"
    return lowered


def _resources_for_skill(skill: str) -> list[dict]:
    return RESOURCE_LIBRARY.get(_resource_key(skill), [])[:4]


def _safe_int(value: object) -> int:
    try:
        return int(value or 0)
    except Exception:
        return 0


def _is_frontend_role(match_result: dict, job_description: str) -> bool:
    role_text = " ".join(
        [
            _normalize_text(match_result.get("job_role")),
            _normalize_text(match_result.get("job", {}).get("summary")),
            _normalize_text(job_description),
        ]
    ).lower()
    return any(token in role_text for token in ["frontend", "front-end", "react", "angular", "ui developer", "web developer"])


def _is_fullstack_react_django_role(match_result: dict, job_description: str) -> bool:
    role_text = " ".join(
        [
            _normalize_text(match_result.get("job_role")),
            _normalize_text(match_result.get("job", {}).get("summary")),
            _normalize_text(job_description),
        ]
    ).lower()
    return (
        any(token in role_text for token in ["full stack", "fullstack", "react"])
        and "django" in role_text
    )


def _resume_sources(resume: dict) -> list[dict]:
    sources = []

    summary = _normalize_text(resume.get("summary"))
    if summary:
        sources.append({"type": "summary", "label": "Professional Summary", "text": summary})

    for index, item in enumerate(resume.get("experience") or [], start=1):
        if not isinstance(item, dict):
            continue
        title = _normalize_text(item.get("title"))
        company = _normalize_text(item.get("company"))
        period = _normalize_text(item.get("period") or item.get("dates"))
        description = _normalize_text(item.get("description"))
        label_parts = [part for part in [title, company, period] if part]
        text = " | ".join(part for part in [title, company, description] if part)
        if text:
            sources.append(
                {
                    "type": "experience",
                    "label": " - ".join(label_parts) or f"Experience {index}",
                    "text": text,
                    "description": description,
                }
            )

    for index, item in enumerate(resume.get("projects") or [], start=1):
        if not isinstance(item, dict):
            continue
        name = _normalize_text(item.get("name"))
        description = _normalize_text(item.get("description"))
        technologies = ", ".join(_normalize_text(tech) for tech in item.get("technologies") or [] if _normalize_text(tech))
        text = " | ".join(part for part in [name, description, technologies] if part)
        if text:
            sources.append(
                {
                    "type": "project",
                    "label": name or f"Project {index}",
                    "text": text,
                    "description": description,
                    "technologies": technologies,
                }
            )

    return sources


def _resume_skill_inventory(resume: dict) -> set[str]:
    inventory = set()

    for skill in resume.get("skills") or []:
        lowered = SKILL_ALIASES.get(_normalize_text(skill).lower(), _normalize_text(skill).lower())
        if lowered:
            inventory.add(lowered)

    for project in resume.get("projects") or []:
        if not isinstance(project, dict):
            continue
        for tech in project.get("technologies") or []:
            lowered = SKILL_ALIASES.get(_normalize_text(tech).lower(), _normalize_text(tech).lower())
            if lowered:
                inventory.add(lowered)

    return inventory


def _skill_variants(skill: str) -> list[str]:
    raw = _normalize_text(skill).lower()
    canonical = SKILL_ALIASES.get(raw, raw)
    variants = {raw, canonical}

    if canonical == "react":
        variants.update({"react.js", "reactjs"})
    if canonical == "node.js":
        variants.update({"nodejs", "node.js"})
    if canonical == "express":
        variants.update({"express.js", "expressjs"})
    if canonical == "next.js":
        variants.update({"nextjs", "next.js"})
    if canonical == "javascript":
        variants.update({"js", "javascript"})
    if canonical == "typescript":
        variants.update({"ts", "typescript"})
    if canonical == "postgresql":
        variants.update({"postgres", "postgresql"})
    if canonical == "rest api":
        variants.update({"rest api", "restful api", "restful apis", "rest apis"})
    if canonical == "html":
        variants.update({"html", "html5"})
    if canonical == "css":
        variants.update({"css", "css3"})
    if canonical == "git":
        variants.update({"git", "github"})
    if canonical == "aws":
        variants.update({"aws", "amazon web services"})

    return sorted(variants)


def _contains_skill(text: str, skill: str) -> bool:
    lowered = _normalize_text(text).lower()
    if not lowered:
        return False

    for variant in _skill_variants(skill):
        pattern = re.escape(variant).replace(r"\ ", r"\s+").replace(r"\.", r"[.]")
        if re.search(rf"(?<!\w){pattern}(?!\w)", lowered):
            return True
    return False


def _extract_metric(text: str) -> str:
    normalized = _normalize_text(text)
    metric_patterns = [
        r"\b\d+(?:\.\d+)?%\b",
        r"\b\d+\+?\s+(?:users?|clients?|servers?|services?|projects?|features?|apis?|models?|dashboards?|queries|records)\b",
        r"\b\d+\s*(?:ms|sec|secs|seconds|mins|minutes|hours|days|weeks|months)\b",
        r"\b\d+x\b",
    ]
    for pattern in metric_patterns:
        match = re.search(pattern, normalized, re.I)
        if match:
            return match.group(0)
    return ""


def _clip(text: str, limit: int = 220) -> str:
    normalized = _normalize_text(text)
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[: limit - 3].rstrip()}..."


def _skill_contexts(skill: str, resume: dict) -> dict:
    inventory = _resume_skill_inventory(resume)
    canonical = SKILL_ALIASES.get(_normalize_text(skill).lower(), _normalize_text(skill).lower())
    skills_listed = canonical in inventory

    project_hits = []
    experience_hits = []
    summary_hit = False

    for source in _resume_sources(resume):
        if not _contains_skill(source.get("text", ""), skill):
            continue
        if source["type"] == "project":
            project_hits.append(source)
        elif source["type"] == "experience":
            experience_hits.append(source)
        elif source["type"] == "summary":
            summary_hit = True

    return {
        "listed_in_skills": skills_listed,
        "projects": project_hits,
        "experience": experience_hits,
        "summary": summary_hit,
    }


def _matched_skills(match_result: dict) -> list[dict]:
    scores = list((match_result.get("skill_scores") or {}).values())
    return [item for item in scores if item.get("matched")]


def _missing_skills(match_result: dict) -> list[dict]:
    scores = list((match_result.get("skill_scores") or {}).values())
    return [item for item in scores if not item.get("matched")]


def _match_analysis(resume: dict, match_result: dict) -> dict:
    summary = match_result.get("summary", {}) if isinstance(match_result, dict) else {}
    required_skills = match_result.get("job", {}).get("required_skills", []) if isinstance(match_result, dict) else []
    matched = _matched_skills(match_result)
    matched_details = []

    for item in matched[:8]:
        skill = _normalize_skill(item.get("skill", ""))
        context = _skill_contexts(skill, resume)
        project_count = len(context["projects"])
        experience_count = len(context["experience"])
        evidence_source = "skills list"
        evidence_context = ""

        if project_count:
            evidence_source = f"{project_count} project{'s' if project_count != 1 else ''}"
            evidence_context = context["projects"][0]["label"]
        elif experience_count:
            evidence_source = f"{experience_count} experience entr{'ies' if experience_count != 1 else 'y'}"
            evidence_context = context["experience"][0]["label"]
        elif context["summary"]:
            evidence_source = "professional summary"
            evidence_context = "Professional Summary"

        overlap_insight = (
            f"{skill} appears in {project_count} project context{'s' if project_count != 1 else ''}"
            if project_count
            else f"{skill} appears in {experience_count} work context{'s' if experience_count != 1 else ''}"
            if experience_count
            else f"{skill} is listed, but direct delivery evidence is thin"
        )

        matched_details.append(
            {
                "skill": skill,
                "tier": item.get("tier", "preferred"),
                "match_percent": 100 if item.get("matched") else int(round(float(item.get("similarity", 0)) * 100)),
                "evidence_source": evidence_source,
                "context": evidence_context or item.get("evidence_text", ""),
                "overlap_insight": overlap_insight,
            }
        )

    required_match = float(summary.get("required_skill_match", 0) or 0)
    preferred_match = float(summary.get("preferred_skill_match", 0) or 0)
    experience_score = float(summary.get("experience_score", 0) or 0)
    overall = float(summary.get("overall_score", 0) or 0)
    matched_required = len([item for item in matched if item.get("tier") == "required"])

    reasoning = (
        f"Overall fit is {int(round(overall))}% based on {int(round(required_match))}% required-skill coverage, "
        f"{int(round(preferred_match))}% preferred-skill coverage, and {int(round(experience_score))}% experience alignment."
    )
    if required_skills:
        reasoning += f" The resume shows direct coverage for {matched_required}/{len(required_skills)} required skills."

    return {
        "overall_match_percent": int(round(overall)),
        "required_skill_match_percent": int(round(required_match)),
        "preferred_skill_match_percent": int(round(preferred_match)),
        "experience_alignment_percent": int(round(experience_score)),
        "reasoning": reasoning,
        "matched_skills": matched_details,
    }


def _bucket_fit(skills: list[str], resume: dict, match_result: dict) -> dict:
    if not skills:
        return {"score": 0, "covered": [], "weak": [], "missing": []}

    covered = []
    weak = []
    missing = []
    score_lookup = {
        _normalize_skill(item.get("skill", "")): item
        for item in list((match_result.get("skill_scores") or {}).values())
    }

    for skill in skills:
        normalized = _normalize_skill(skill)
        context = _skill_contexts(normalized, resume)
        score_item = score_lookup.get(normalized, {})
        if score_item.get("matched"):
            covered.append(normalized)
        elif context["listed_in_skills"] or context["projects"] or context["experience"] or context["summary"]:
            weak.append(normalized)
        else:
            missing.append(normalized)

    score = round(((len(covered) + (len(weak) * 0.45)) / len(skills)) * 100)
    return {
        "score": int(score),
        "covered": covered,
        "weak": weak,
        "missing": missing,
    }


def _fullstack_match_score(match_result: dict, resume: dict) -> dict:
    frontend = _bucket_fit(["React", "JavaScript", "HTML", "CSS"], resume, match_result)
    backend = _bucket_fit(["Django", "Python", "REST API", "SQL"], resume, match_result)
    readiness_source = _bucket_fit(
        ["React", "Django", "REST API", "SQL", "Git"],
        resume,
        match_result,
    )
    readiness_score = round((frontend["score"] * 0.35) + (backend["score"] * 0.4) + (readiness_source["score"] * 0.25))
    insight = (
        "The strongest signal is balanced frontend and backend stack overlap."
        if frontend["score"] >= 65 and backend["score"] >= 65
        else "The profile leans to one side of the stack; integration readiness depends on proving the weaker half."
    )
    return {
        "frontend_fit": frontend,
        "backend_fit": backend,
        "full_stack_readiness": {
            "score": int(readiness_score),
            "insight": insight,
        },
    }


def _semantic_skill_matching(resume: dict, match_result: dict, is_frontend_role: bool) -> dict:
    if not is_frontend_role:
        return {"direct_matches": [], "inferred_matches": [], "weak_unproven_matches": []}

    inventory = _resume_skill_inventory(resume)
    direct_matches = []
    inferred_matches = []
    weak_unproven_matches = []
    seen_inferred = set()
    seen_weak = set()

    for item in _matched_skills(match_result):
        skill = _normalize_skill(item.get("skill", ""))
        context = _skill_contexts(skill, resume)
        project_count = len(context["projects"])
        experience_count = len(context["experience"])
        evidence = f"{project_count} projects" if project_count else f"{experience_count} work entries" if experience_count else "skills inventory"
        direct_matches.append(
            {
                "skill": skill,
                "strength": "Strong match" if project_count or experience_count else "Direct but thin",
                "reasoning": f"Direct resume evidence found through {evidence}.",
            }
        )

    for raw_skill in resume.get("skills") or []:
        canonical = SKILL_ALIASES.get(_normalize_text(raw_skill).lower(), _normalize_text(raw_skill).lower())
        rules = FRONTEND_SEMANTIC_RULES.get(canonical)
        if not rules:
            continue

        for implied in rules["implies"]:
            normalized_implied = _normalize_skill(implied)
            implied_canonical = SKILL_ALIASES.get(_normalize_text(implied).lower(), _normalize_text(implied).lower())
            if implied_canonical in inventory:
                continue
            if normalized_implied in seen_inferred:
                continue
            seen_inferred.add(normalized_implied)
            inferred_matches.append(
                {
                    "skill": normalized_implied,
                    "source_skill": _normalize_skill(raw_skill),
                    "confidence": rules["confidence"],
                    "reasoning": rules["reason"],
                }
            )

    for item in _missing_skills(match_result):
        skill = _normalize_skill(item.get("skill", ""))
        if skill in seen_weak:
            continue
        context = _skill_contexts(skill, resume)
        if context["listed_in_skills"] or context["projects"] or context["experience"] or context["summary"]:
            seen_weak.add(skill)
            weak_unproven_matches.append(
                {
                    "skill": skill,
                    "strength": "Weak/Unproven",
                    "reasoning": f"{skill} has some signal in the resume, but the current evidence is not strong enough to count as recruiter-ready proof.",
                }
            )

    return {
        "direct_matches": direct_matches[:8],
        "inferred_matches": inferred_matches[:8],
        "weak_unproven_matches": weak_unproven_matches[:8],
    }


def _fullstack_semantic_map(resume: dict, match_result: dict, is_fullstack_role: bool) -> dict:
    if not is_fullstack_role:
        return {"core_nodes": [], "connected_nodes": [], "inferred_nodes": [], "missing_nodes": [], "edges": []}

    core_nodes = []
    connected_nodes = []
    inferred_nodes = []
    missing_nodes = []
    edges = []
    inventory = _resume_skill_inventory(resume)
    score_lookup = {
        _normalize_skill(item.get("skill", "")): item
        for item in list((match_result.get("skill_scores") or {}).values())
    }

    node_specs = [
        ("React", "Core", ["JavaScript", "UI Architecture", "Client-side API Consumption"]),
        ("Django", "Core", ["Python", "REST API", "Backend Data Flow", "ORM"]),
        ("REST API", "Connected", ["Frontend-Backend Contract", "Authentication"]),
        ("SQL", "Connected", ["Database Modeling"]),
        ("TypeScript", "Inferred", []),
        ("State Management", "Inferred", []),
    ]

    for skill, kind, neighbors in node_specs:
        normalized = _normalize_skill(skill)
        context = _skill_contexts(normalized, resume)
        matched = score_lookup.get(normalized, {}).get("matched", False)
        intensity = "strong" if matched else "weak" if (context["listed_in_skills"] or context["projects"] or context["experience"] or context["summary"]) else "missing"
        node = {
            "skill": normalized,
            "kind": kind,
            "intensity": intensity,
            "evidence": (
                "Well supported by direct resume evidence."
                if intensity == "strong"
                else "Some signal exists, but the resume does not prove depth yet."
                if intensity == "weak"
                else "No clear recruiter-visible evidence found."
            ),
        }
        if kind == "Core":
            core_nodes.append(node)
        elif kind == "Connected":
            connected_nodes.append(node)
        else:
            if intensity == "missing":
                missing_nodes.append(node)
            else:
                inferred_nodes.append(node)

        for neighbor in neighbors:
            edges.append(
                {
                    "from": normalized,
                    "to": neighbor,
                    "explanation": (
                        "React connects to JavaScript and UI architecture because component behavior, state updates, and browser rendering depend on them."
                        if normalized == "React"
                        else "Django connects to APIs and backend data flow because it typically owns routing, models, and server-side business logic."
                        if normalized == "Django"
                        else f"{normalized} connects to {neighbor} through real-world full-stack implementation flow."
                    ),
                }
            )

    if "react" in inventory and "django" in inventory:
        inferred_nodes.append(
            {
                "skill": "Full Stack Integration",
                "kind": "Inferred",
                "intensity": "strong",
                "evidence": "React and Django appear together in the profile, which strongly suggests some cross-layer integration familiarity.",
            }
        )

    return {
        "core_nodes": core_nodes,
        "connected_nodes": connected_nodes,
        "inferred_nodes": inferred_nodes,
        "missing_nodes": missing_nodes,
        "edges": edges[:8],
    }


def _evidence_highlights(resume: dict, match_result: dict) -> list[dict]:
    highlights = []

    for source in _resume_sources(resume):
        if source["type"] not in {"project", "experience"}:
            continue
        metric = _extract_metric(source.get("text", ""))
        action_text = source.get("description") or source.get("text", "")
        action = _clip(action_text, 140)
        impact = metric or "No explicit metric provided; outcome should be quantified on the resume"
        technologies = []
        for skill in match_result.get("job", {}).get("required_skills", []) + match_result.get("job", {}).get("preferred_skills", []):
            if _contains_skill(source.get("text", ""), skill):
                technologies.append(_normalize_skill(skill))

        if not technologies and source["type"] == "project":
            raw_tech = _normalize_text(source.get("technologies", ""))
            if raw_tech:
                technologies = [_clip(raw_tech, 80)]

        highlights.append(
            {
                "project_or_context": source["label"],
                "action": action,
                "impact": impact,
                "relevance": ", ".join(technologies[:3]) if technologies else "Transferable execution signal",
            }
        )

    highlights.sort(key=lambda item: 0 if "No explicit metric" not in item["impact"] else 1)
    return highlights[:5]


def _gap_analysis(resume: dict, match_result: dict) -> dict:
    completely_missing = []
    partial_exposure = []
    mentioned_not_demonstrated = []

    for item in _missing_skills(match_result):
        skill = _normalize_skill(item.get("skill", ""))
        context = _skill_contexts(skill, resume)
        tier = item.get("tier", "preferred")
        evidence = {
            "skill": skill,
            "tier": tier,
            "reason": "",
        }

        if context["projects"] or context["experience"] or context["summary"]:
            evidence["reason"] = f"{skill} appears in resume text, but there is no strong project-level or explicit skills evidence to count it as a match."
            partial_exposure.append(evidence)
        elif context["listed_in_skills"]:
            evidence["reason"] = f"{skill} is listed in the skills section, but there is no supporting project or work bullet proving depth."
            mentioned_not_demonstrated.append(evidence)
        else:
            evidence["reason"] = f"{skill} is not visible in the skills list, projects, experience, or summary."
            completely_missing.append(evidence)

    return {
        "completely_missing": completely_missing[:5],
        "partial_exposure": partial_exposure[:5],
        "mentioned_but_not_demonstrated": mentioned_not_demonstrated[:5],
    }


def _skill_gap_intelligence(resume: dict, match_result: dict, semantic_skill_matching: dict, is_frontend_role: bool) -> dict:
    if not is_frontend_role:
        return {
            "completely_missing": [],
            "weak_evidence": [],
            "likely_known": [],
        }

    inferred_lookup = {item["skill"]: item for item in semantic_skill_matching.get("inferred_matches", [])}
    weak_lookup = {item["skill"]: item for item in semantic_skill_matching.get("weak_unproven_matches", [])}
    completely_missing = []
    weak_evidence = []
    likely_known = []

    for item in _missing_skills(match_result):
        skill = _normalize_skill(item.get("skill", ""))
        if skill in inferred_lookup:
            inferred = inferred_lookup[skill]
            likely_known.append(
                {
                    "skill": skill,
                    "reason": f"Inferred via {inferred['source_skill']} ({inferred['confidence']} confidence), but still lacks direct standalone proof.",
                }
            )
            continue
        if skill in weak_lookup:
            weak_evidence.append(
                {
                    "skill": skill,
                    "reason": weak_lookup[skill]["reasoning"],
                }
            )
            continue
        completely_missing.append(
            {
                "skill": skill,
                "reason": f"No visible frontend-relevant signal for {skill} was found in skills, projects, experience, or summary.",
            }
        )

    return {
        "completely_missing": completely_missing[:6],
        "weak_evidence": weak_evidence[:6],
        "likely_known": likely_known[:6],
    }


def _fullstack_gap_intelligence(resume: dict, match_result: dict, semantic_map: dict, is_fullstack_role: bool) -> dict:
    if not is_fullstack_role:
        return {"missing": [], "weak": [], "inferred": []}

    missing = [
        {"skill": item["skill"], "reason": item["evidence"]}
        for item in semantic_map.get("missing_nodes", [])
    ]
    weak = []
    inferred = []

    for skill in ["React", "Django", "REST API", "SQL", "TypeScript", "State Management"]:
        context = _skill_contexts(skill, resume)
        normalized = _normalize_skill(skill)
        if normalized in {item["skill"] for item in missing}:
            continue
        if context["listed_in_skills"] or context["projects"] or context["experience"] or context["summary"]:
            weak.append(
                {
                    "skill": normalized,
                    "reason": f"{normalized} has some resume signal, but the current bullets do not show enough depth for confident full-stack validation.",
                }
            )
        elif any(item["skill"] == normalized for item in semantic_map.get("inferred_nodes", [])):
            inferred.append(
                {
                    "skill": normalized,
                    "reason": f"{normalized} is plausible from adjacent stack evidence, but still needs direct project proof.",
                }
            )

    return {
        "missing": missing[:6],
        "weak": weak[:6],
        "inferred": inferred[:6],
    }


def _roadmap_for_skill(skill: str, role: str) -> list[dict]:
    normalized = _normalize_skill(skill)
    return [
        {
            "skill": normalized,
            "level": "Beginner",
            "focus": f"Understand the core workflows and role-specific terminology for {normalized} in {role}.",
            "project": f"Build one focused starter feature that isolates {normalized} in a realistic task.",
            "good_looks_like": f"You can explain the basics of {normalized}, implement it cleanly, and debug common mistakes.",
        },
        {
            "skill": normalized,
            "level": "Intermediate",
            "focus": f"Use {normalized} inside an end-to-end feature with data flow, edge cases, and production-style structure.",
            "project": f"Ship a mini case study where {normalized} solves one meaningful user or business problem.",
            "good_looks_like": f"You can discuss tradeoffs, testing, and why the implementation choice makes sense for the role.",
        },
        {
            "skill": normalized,
            "level": "Advanced",
            "focus": f"Show architecture, performance, and reliability judgment with {normalized}.",
            "project": f"Create a portfolio-quality example with before/after impact and explain the scaling choices.",
            "good_looks_like": f"You can defend design decisions and connect {normalized} work to measurable outcomes.",
        },
    ]


def _weekly_plan_for_skill(skill: str, start_week: int) -> list[dict]:
    normalized = _normalize_skill(skill)
    return [
        {
            "week": start_week,
            "goal": f"Build baseline fluency in {normalized}",
            "deliverable": f"Finish one structured learning path and write a short implementation note for {normalized}.",
        },
        {
            "week": start_week + 1,
            "goal": f"Apply {normalized} in a scoped feature",
            "deliverable": f"Ship one hands-on exercise using {normalized} and capture the decisions, bugs, and fixes.",
        },
        {
            "week": start_week + 2,
            "goal": f"Turn {normalized} into resume evidence",
            "deliverable": f"Publish a case study and convert it into one quantified bullet plus one interview story.",
        },
    ]


def _project_idea(skill: str, role: str) -> str:
    normalized = _normalize_skill(skill)
    role_hint = _normalize_text(role) or "target role"
    frontend_projects = {
        "JavaScript": "Build an analytics dashboard with async API aggregation, optimistic UI updates, filters, and failure-state handling.",
        "TypeScript": "Build a typed design-system playground with reusable components, strict props contracts, and form validation flows.",
        "Responsive Design": "Build a multi-device ecommerce storefront with adaptive layouts, mobile navigation, and performance-conscious image loading.",
        "Accessibility": "Build a content-rich SaaS settings console with keyboard navigation, focus management, ARIA labels, and screen-reader validation.",
        "Next.js": "Build a content platform using SSR/SSG, dynamic routes, SEO metadata, and a CMS-backed publishing workflow.",
        "State Management": "Build a collaborative task board with complex client-side state, optimistic updates, and offline recovery flows.",
        "API Integration": "Build a real-time reporting dashboard with pagination, loading skeletons, retries, and chart-driven visual summaries.",
    }
    return frontend_projects.get(normalized, f"Build a {role_hint.lower()} portfolio feature where {normalized} is essential, not decorative, and document the implementation decisions plus final outcome.")


def _resume_bullet(skill: str) -> str:
    normalized = _normalize_skill(skill)
    bullets = {
        "JavaScript": "Built a dynamic analytics dashboard in JavaScript with API-driven filtering and error handling, cutting data retrieval friction and improving report interaction speed by 35%.",
        "TypeScript": "Introduced TypeScript-based component contracts and form models, reducing UI integration bugs by 30% across reusable frontend modules.",
        "Responsive Design": "Designed and shipped responsive layouts across mobile, tablet, and desktop breakpoints, increasing successful mobile task completion by 22%.",
        "Accessibility": "Improved keyboard navigation, focus states, and semantic labels across key flows, raising accessibility audit scores from 71 to 94.",
        "Next.js": "Built a Next.js content experience using SSR and route-level optimization, improving first-load performance by 28% and strengthening SEO visibility.",
        "State Management": "Implemented predictable client-side state flows for a multi-step dashboard, reducing stale-data UI issues by 40%.",
        "API Integration": "Delivered resilient API integrations with retries, loading states, and empty-state UX, reducing failed user actions by 25%.",
    }
    return bullets.get(normalized, f"Implemented {normalized} in a production-style feature, reduced manual workflow time by 30%, and documented delivery impact with clear usage metrics.")


def _star_angle(skill: str) -> str:
    normalized = _normalize_skill(skill)
    angles = {
        "JavaScript": "Describe a case where async API behavior caused inconsistent UI state, how you stabilized the flow, and what improved afterward.",
        "TypeScript": "Describe inheriting loosely typed UI code, introducing stronger interfaces, and the bugs that disappeared after cleanup.",
        "Responsive Design": "Describe a layout that broke on smaller devices, the breakpoint strategy you chose, and the measurable UX improvement.",
        "Accessibility": "Describe discovering an accessibility gap, the remediation approach, and how you validated the fix with keyboard or screen-reader checks.",
        "Next.js": "Describe when client-only rendering hurt performance or SEO, why you chose SSR/SSG, and the resulting outcome.",
        "State Management": "Describe a complex UI flow with conflicting state updates, how you restructured it, and the reduction in defects.",
        "API Integration": "Describe an unreliable API dependency, how you handled retries and loading/error states, and the effect on user completion rate.",
    }
    return angles.get(normalized, f"Situation: feature needed {normalized}. Task: own implementation under a clear constraint. Action: chose the design, shipped it, and handled one blocker. Result: improved speed, reliability, or user adoption with a measurable outcome.")


def _rank_missing_skills(match_result: dict) -> list[dict]:
    ranked = []
    for item in _missing_skills(match_result):
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


def _build_improvement_plan(job_role: str, missing_skills: list[dict]) -> dict:
    ranked_missing_skills = []
    roadmap = []
    weekly_plan = []
    actionable_steps = []

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
        actionable_steps.append(
            {
                "skill": skill,
                "project_idea": _project_idea(skill, job_role),
                "resume_bullet_example": _resume_bullet(skill),
                "interview_story_angle": _star_angle(skill),
                "upgrade_tip": f"Push {skill} beyond baseline by adding performance, accessibility, edge-case handling, and clear before/after impact metrics.",
            }
        )

    return {
        "ranked_missing_skills": ranked_missing_skills,
        "roadmap": roadmap,
        "weekly_plan": weekly_plan,
        "actionable_steps": actionable_steps,
    }


def _fullstack_improvement_plan(missing_skills: list[dict], is_fullstack_role: bool) -> list[dict]:
    if not is_fullstack_role:
        return []

    patterns = {
        "Django": {
            "format": "Project",
            "idea": "Ship a Django backend for a collaborative task system with authentication, relational models, and audit-ready API endpoints.",
            "upgrade_action": "Add token or session auth plus role-based permissions so the backend feels production-aware rather than tutorial-level.",
            "practical_output": "A documented backend repo with API collection, schema notes, and seeded demo data.",
            "impact_example": "Reduced admin-side manual task tracking by 40% after centralizing workflow state in Django models and APIs.",
        },
        "REST API": {
            "format": "Simulation",
            "idea": "Model a real product workflow where React consumes paginated, filtered, and authenticated Django endpoints.",
            "upgrade_action": "Version the API contract and add failure-state handling in both frontend and backend.",
            "practical_output": "A contract-driven integration demo with sample requests, error cases, and response snapshots.",
            "impact_example": "Cut failed client requests by 25% after introducing validation, pagination, and structured error responses.",
        },
        "SQL": {
            "format": "Optimization",
            "idea": "Refactor a feature to use relational data modeling instead of flat mock data, including joins or query optimization.",
            "upgrade_action": "Show one before/after query or schema decision that improved data retrieval clarity.",
            "practical_output": "Schema diagram plus migration files and one benchmark note.",
            "impact_example": "Improved filtered dashboard response time by 30% after restructuring query-heavy data access patterns.",
        },
        "TypeScript": {
            "format": "Refactor",
            "idea": "Convert a React feature from loose JavaScript to typed props, API models, and state transitions.",
            "upgrade_action": "Type the API boundary first so data bugs become visible at compile time.",
            "practical_output": "A typed frontend module with cleaner interfaces and fewer runtime mismatches.",
            "impact_example": "Reduced integration defects by 28% after introducing typed API contracts and component props.",
        },
        "State Management": {
            "format": "Architecture",
            "idea": "Rebuild one multi-step React flow with predictable state handling, optimistic updates, and rollback paths.",
            "upgrade_action": "Demonstrate one tricky edge case, such as stale updates or concurrent edits, and how the new state model handles it.",
            "practical_output": "An architecture note plus a working demo of resilient client state behavior.",
            "impact_example": "Lowered inconsistent UI states by 35% after centralizing cross-screen state transitions.",
        },
    }

    items = []
    for skill in missing_skills[:4]:
        normalized = skill["skill"]
        pattern = patterns.get(
            normalized,
            {
                "format": "Contribution",
                "idea": f"Add {normalized} to an end-to-end React + Django case study instead of treating it as an isolated learning exercise.",
                "upgrade_action": f"Document one technical decision that shows why {normalized} matters in the stack.",
                "practical_output": f"A visible proof-of-work artifact showing applied {normalized} usage.",
                "impact_example": f"Used {normalized} to improve delivery speed, reliability, or maintainability with a measurable before/after result.",
            },
        )
        items.append({"skill": normalized, **pattern})
    return items


def _tool_relevance_filter(resume: dict, is_frontend_role: bool) -> dict:
    skills = [_normalize_skill(skill) for skill in resume.get("skills") or [] if _normalize_skill(skill)]
    highly_relevant = []
    indirectly_relevant = []
    not_relevant = []

    if not is_frontend_role:
        return {
            "highly_relevant": highly_relevant,
            "indirectly_relevant": indirectly_relevant,
            "not_relevant": not_relevant,
        }

    for skill in skills:
        canonical = SKILL_ALIASES.get(skill.lower(), skill.lower())
        if canonical in FRONTEND_CORE_SKILLS or skill in {"HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Next.js"}:
            highly_relevant.append(
                {
                    "skill": skill,
                    "reason": f"{skill} directly contributes to frontend implementation, browser behavior, or UI architecture.",
                }
            )
        elif canonical in FRONTEND_ADJACENT_SKILLS:
            indirectly_relevant.append(
                {
                    "skill": skill,
                    "reason": f"{skill} supports frontend delivery through tooling, collaboration, API work, or deployment context.",
                }
            )
        else:
            not_relevant.append(
                {
                    "skill": skill,
                    "reason": f"{skill} does not materially strengthen a frontend screening decision unless the target role is unusually hybrid.",
                }
            )

    return {
        "highly_relevant": highly_relevant[:12],
        "indirectly_relevant": indirectly_relevant[:12],
        "not_relevant": not_relevant[:12],
    }


def _role_skill_blueprint(match_result: dict) -> dict:
    job = match_result.get("job", {}) if isinstance(match_result, dict) else {}
    core = [
        {
            "skill": _normalize_skill(skill),
            "why_it_matters": "Core screening requirement; weak evidence here usually blocks shortlist progression.",
        }
        for skill in job.get("required_skills", [])[:8]
    ]
    supporting = [
        {
            "skill": _normalize_skill(skill),
            "why_it_matters": "Supporting capability that improves day-one productivity and team fit.",
        }
        for skill in job.get("preferred_skills", [])[:8]
    ]
    advanced = []

    for skill in job.get("preferred_skills", []):
        lowered = _normalize_text(skill).lower()
        if any(token in lowered for token in ["aws", "azure", "gcp", "docker", "kubernetes", "system design", "architecture"]):
            advanced.append(
                {
                    "skill": _normalize_skill(skill),
                    "why_it_matters": "Advanced leverage skill that helps with scale, reliability, or seniority signals.",
                }
            )

    return {
        "core_skills": core,
        "supporting_skills": supporting,
        "advanced_optional_skills": advanced[:6],
    }


def _frontend_role_skill_blueprint(match_result: dict, is_frontend_role: bool) -> dict:
    if not is_frontend_role:
        return _role_skill_blueprint(match_result)

    job = match_result.get("job", {}) if isinstance(match_result, dict) else {}
    combined = [_normalize_skill(skill) for skill in job.get("required_skills", []) + job.get("preferred_skills", [])]

    core = []
    adjacent = []
    low_relevance = []

    explanations = {
        "HTML": "Provides semantic structure, accessible markup, and the document skeleton every frontend feature depends on.",
        "CSS": "Controls layout, responsive behavior, and visual polish across devices and breakpoints.",
        "JavaScript": "Drives interactivity, state updates, DOM behavior, and API-connected user flows.",
        "TypeScript": "Improves component contracts, maintainability, and error detection in larger frontend codebases.",
        "React": "Signals component-based UI delivery and modern single-page application patterns.",
        "Angular": "Signals TypeScript-heavy frontend architecture, structured modules, and reactive application patterns.",
        "Next.js": "Adds SSR/SSG and route-level performance/SEO capabilities on top of React.",
        "Responsive Design": "Shows the candidate can make interfaces work across mobile, tablet, and desktop without degraded UX.",
        "Accessibility": "Shows awareness of inclusive UI behavior, keyboard support, and semantic interface quality.",
        "Git": "Enables branch-based collaboration, review workflows, and safe iteration in team frontend environments.",
        "Figma": "Helps translate designs into accurate UI implementation and collaborate smoothly with product/design teams.",
        "REST API": "Connects frontend views to real backend data, loading states, and error-handling flows.",
        "Node.js": "Useful for frontend tooling, local APIs, or full-stack collaboration, but not a pure frontend screening core.",
        "Docker": "Helpful for environment consistency and deployment workflows, but secondary to browser-facing frontend depth.",
        "AWS": "Useful for hosting or integration context, but not a primary proof of frontend implementation skill.",
    }

    for skill in combined:
        if skill in {"HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Next.js", "Responsive Design", "Accessibility"}:
            core.append({"skill": skill, "why_it_matters": explanations.get(skill, "Core frontend requirement.")})
        elif skill in {"Git", "Figma", "REST API", "Node.js", "Vite", "Bootstrap", "Tailwind", "Docker", "AWS"}:
            adjacent.append({"skill": skill, "why_it_matters": explanations.get(skill, "Useful adjacent frontend skill.")})
        else:
            low_relevance.append({"skill": skill, "why_it_matters": explanations.get(skill, "Lower-signal skill for a frontend-only hiring decision.")})

    return {
        "core_skills": core[:10],
        "adjacent_skills": adjacent[:10],
        "irrelevant_or_low_relevance_skills": low_relevance[:10],
    }


def _fullstack_role_skill_blueprint(is_fullstack_role: bool) -> dict:
    if not is_fullstack_role:
        return {}

    return {
        "core_skills": [
            {"skill": "React", "why_it_matters": "Owns browser-side UI composition, interactivity, and client rendering for the stack."},
            {"skill": "Django", "why_it_matters": "Anchors backend logic, routing, models, and server-side application structure."},
            {"skill": "REST API", "why_it_matters": "Defines the contract between frontend behavior and backend data delivery."},
            {"skill": "SQL", "why_it_matters": "Supports persistent data modeling, filtering, and efficient retrieval behind the Django layer."},
        ],
        "integration_skills": [
            {"skill": "Authentication", "why_it_matters": "Connects frontend session behavior with backend access control and protected routes."},
            {"skill": "State Management", "why_it_matters": "Keeps React views stable when API state, loading, and mutations change over time."},
            {"skill": "API Integration", "why_it_matters": "Turns backend endpoints into usable product workflows with error, loading, and success handling."},
        ],
        "supporting_tools": [
            {"skill": "Git", "why_it_matters": "Enables safe collaboration across frontend and backend code paths."},
            {"skill": "Docker", "why_it_matters": "Helps reproduce full-stack environments consistently during setup, testing, and deployment."},
            {"skill": "Postman", "why_it_matters": "Useful for validating backend contracts before wiring them into the UI layer."},
        ],
    }


def _strength_signals(resume: dict, match_result: dict) -> list[dict]:
    signals = []
    experience = [item for item in resume.get("experience") or [] if isinstance(item, dict)]
    projects = [item for item in resume.get("projects") or [] if isinstance(item, dict)]
    matched = _matched_skills(match_result)

    if projects:
        signals.append(
            {
                "signal": "Real project depth",
                "why_it_matters": f"The resume includes {len(projects)} named project example(s), which gives recruiters proof beyond a keyword-only skills section.",
            }
        )

    if experience:
        signals.append(
            {
                "signal": "Execution consistency",
                "why_it_matters": f"The profile shows {len(experience)} structured experience entr{'ies' if len(experience) != 1 else 'y'}, which helps validate repeatable delivery rather than one-off learning.",
            }
        )

    if len([item for item in matched if item.get("tier") == "required"]) >= 2:
        signals.append(
            {
                "signal": "Strong overlap with must-have skills",
                "why_it_matters": "The resume covers multiple required skills directly, which reduces recruiter interpretation risk in early screening.",
            }
        )

    for source in _resume_sources(resume):
        metric = _extract_metric(source.get("text", ""))
        if metric:
            signals.append(
                {
                    "signal": "Measured problem-solving",
                    "why_it_matters": f"The resume includes quantified evidence ({metric}) in {source['label']}, which is much more credible than a responsibility-only bullet.",
                }
            )
            break

    return signals[:4]


def _frontend_strength_signals(resume: dict, match_result: dict, is_frontend_role: bool) -> list[dict]:
    if not is_frontend_role:
        return _strength_signals(resume, match_result)

    signals = []
    inventory = _resume_skill_inventory(resume)
    sources = _resume_sources(resume)

    if any(skill in inventory for skill in {"react", "angular", "next.js"}):
        frameworks = [_normalize_skill(skill) for skill in inventory if skill in {"react", "angular", "next.js"}]
        signals.append(
            {
                "signal": "Modern frontend framework exposure",
                "why_it_matters": f"The resume shows {', '.join(frameworks[:3])}, which is stronger than generic web claims because it points to production-style component architecture.",
            }
        )

    frontend_source_count = sum(
        1 for source in sources if any(_contains_skill(source.get("text", ""), skill) for skill in ["react", "angular", "html", "css", "javascript", "typescript", "bootstrap", "next.js"])
    )
    if frontend_source_count >= 2:
        signals.append(
            {
                "signal": "Consistent frontend usage",
                "why_it_matters": f"Frontend-relevant technologies appear across {frontend_source_count} separate resume contexts, which suggests repeated use rather than one isolated course project.",
            }
        )

    if "html" in inventory and "css" in inventory:
        signals.append(
            {
                "signal": "Clear frontend foundation",
                "why_it_matters": "HTML and CSS together indicate baseline browser-side implementation skill rather than framework-only exposure.",
            }
        )

    for source in sources:
        if any(_contains_skill(source.get("text", ""), skill) for skill in ["react", "angular", "javascript", "html", "css", "bootstrap", "vite"]):
            signals.append(
                {
                    "signal": "Applied UI delivery signal",
                    "why_it_matters": f"{source['label']} shows actual frontend-oriented implementation context instead of a bare tools list.",
                }
            )
            break

    return signals[:4]


def _fullstack_strength_signals(resume: dict, match_result: dict, is_fullstack_role: bool) -> list[dict]:
    if not is_fullstack_role:
        return []

    sources = _resume_sources(resume)
    inventory = _resume_skill_inventory(resume)
    signals = []

    if "react" in inventory and "django" in inventory:
        signals.append(
            {
                "signal": "Balanced stack exposure",
                "why_it_matters": "Both React and Django are visible, which is stronger than a one-sided profile claiming full-stack readiness without evidence from both halves.",
            }
        )

    integration_contexts = [
        source for source in sources
        if any(_contains_skill(source.get("text", ""), skill) for skill in ["react", "django", "rest api", "sql"])
    ]
    if len(integration_contexts) >= 2:
        signals.append(
            {
                "signal": "Cross-layer delivery signal",
                "why_it_matters": f"The resume shows {len(integration_contexts)} contexts touching frontend and backend concepts, which suggests more than isolated stack experimentation.",
            }
        )

    if any(_contains_skill(source.get("text", ""), "rest api") for source in sources):
        signals.append(
            {
                "signal": "API-oriented thinking",
                "why_it_matters": "The profile includes API-related evidence, which matters because React + Django hiring depends heavily on clean integration boundaries.",
            }
        )

    if any(_extract_metric(source.get("text", "")) for source in sources):
        signals.append(
            {
                "signal": "Outcome-aware implementation",
                "why_it_matters": "At least one bullet contains a measurable result, which makes the technical work more credible during screening.",
            }
        )

    return signals[:4]


def _risk_signals(resume: dict, match_result: dict, ranked_missing_skills: list[dict]) -> list[dict]:
    summary = match_result.get("summary", {}) if isinstance(match_result, dict) else {}
    role = match_result.get("job_role", "target role")
    required_years = _safe_int(summary.get("required_years"))
    candidate_years = _safe_int(summary.get("experience_years_estimate"))
    risks = []

    critical_gaps = [item for item in ranked_missing_skills if item["importance_score"] >= 95][:3]
    if critical_gaps:
        skills = ", ".join(item["skill"] for item in critical_gaps)
        risks.append(
            {
                "title": "Critical skill gap",
                "severity": "High",
                "explanation": f"The resume does not show direct recruiter-visible evidence for high-priority {role} skills: {skills}.",
                "mitigation": f"Add one project, one metric-backed bullet, and one interview story for {skills}.",
            }
        )

    if required_years and candidate_years < required_years:
        risks.append(
            {
                "title": "Experience mismatch",
                "severity": "High" if required_years - candidate_years >= 2 else "Medium",
                "explanation": f"The job asks for about {required_years} years, while the visible resume evidence suggests roughly {candidate_years} years.",
                "mitigation": "Lead with ownership, scope, and outcomes so the profile reads as depth-first rather than tenure-first.",
            }
        )

    if not (resume.get("projects") or []):
        risks.append(
            {
                "title": "Limited project proof",
                "severity": "Medium",
                "explanation": "The resume lacks named project work, which makes technical depth harder to verify.",
                "mitigation": "Add 2-3 compact projects that directly map to the target role's required stack.",
            }
        )

    if not any(_extract_metric(source.get("text", "")) for source in _resume_sources(resume)):
        risks.append(
            {
                "title": "Low measurable impact",
                "severity": "Medium",
                "explanation": "Most bullets describe activity but not business, technical, or speed outcomes.",
                "mitigation": "Rewrite the strongest bullets with percentages, counts, latency, adoption, or time saved.",
            }
        )

    return risks[:5]


def _why_candidate_fits(match_analysis: dict) -> list[str]:
    bullets = []
    matched_skills = match_analysis.get("matched_skills", [])

    if matched_skills:
        top = matched_skills[:3]
        bullets.append(
            "Matched skills: "
            + ", ".join(
                f"{item['skill']} via {item['evidence_source']}"
                for item in top
            )
            + "."
        )

    bullets.append(match_analysis.get("reasoning", "The resume shows measurable alignment with the target role."))

    thin = [item["skill"] for item in matched_skills if "thin" in item.get("overlap_insight", "").lower()]
    if thin:
        bullets.append(f"Some matched skills are present but still need deeper proof: {', '.join(thin[:3])}.")

    return bullets[:3]


def _candidate_summary(job_role: str, match_analysis: dict, strengths: list[dict], risks: list[dict]) -> str:
    score = match_analysis.get("overall_match_percent", 0)
    strength_text = strengths[0]["signal"] if strengths else "role-relevant overlap"
    risk_text = risks[0]["title"] if risks else "no major blocker"
    return f"{job_role} fit is currently {score}%. The strongest signal is {strength_text.lower()}, while the main watchout is {risk_text.lower()}."


def _legacy_strengths(match_analysis: dict) -> list[str]:
    strengths = []
    for item in match_analysis.get("matched_skills", [])[:3]:
        strengths.append(f"{item['skill']} matches the role with evidence from {item['evidence_source']}.")
    return strengths or ["The profile shows some overlap with the target role."]


def _legacy_improvements(improvement_plan: dict) -> list[str]:
    return [
        f"Turn {item['skill']} into proof with one project, one quantified bullet, and one interview story."
        for item in improvement_plan.get("ranked_missing_skills", [])[:3]
    ]


def _preparation_plan(improvement_plan: dict) -> list[dict]:
    return [
        {"skill": item["skill"], "resources": item.get("resources", [])}
        for item in improvement_plan.get("ranked_missing_skills", [])[:3]
    ]


def _additional_value_for_candidate(resume: dict, is_frontend_role: bool) -> list[dict]:
    if not is_frontend_role:
        return []

    project_count = len([item for item in resume.get("projects") or [] if isinstance(item, dict)])
    suggestions = [
        {
            "area": "Portfolio polish",
            "action": "Turn your best frontend project into a case study with problem, design choices, responsive screenshots, and measurable results.",
        },
        {
            "area": "GitHub signal",
            "action": "Add pinned repos with strong README files, setup steps, architecture notes, and before/after UI screenshots or GIFs.",
        },
        {
            "area": "UI quality",
            "action": "Show mobile, tablet, and desktop versions for each featured project so recruiters can see responsive execution immediately.",
        },
        {
            "area": "Real-world credibility",
            "action": "Build one API-backed frontend with loading, empty, error, and success states; this separates real product thinking from tutorial-level work.",
        },
        {
            "area": "Open-source proof",
            "action": "Contribute UI fixes, docs, or accessibility improvements to a React or design-system repo to show collaboration and production judgment.",
        },
    ]

    if project_count >= 3:
        suggestions = suggestions[1:]

    return suggestions[:4]


def _fullstack_preparation_resources(missing_skills: list[dict], is_fullstack_role: bool) -> list[dict]:
    if not is_fullstack_role:
        return []

    plans = []
    for item in missing_skills[:4]:
        skill = item["skill"]
        resources = _resources_for_skill(skill)
        plans.append(
            {
                "skill": skill,
                "official_docs": [resource for resource in resources if resource["type"] == "docs"][:1],
                "course": [resource for resource in resources if resource["type"] == "course"][:1],
                "practice_platform": [resource for resource in resources if resource["type"] == "practice"][:1],
                "real_world_example": [resource for resource in resources if resource["type"] in {"projects", "reference"}][:1],
            }
        )
    return plans


def _interview_question_module(missing_skills: list[dict], is_fullstack_role: bool) -> dict:
    if not is_fullstack_role:
        return {"conceptual_questions": [], "practical_questions": [], "scenario_questions": []}

    conceptual = [
        {
            "question": "How does React batch and apply state updates, and why can that create stale UI bugs?",
            "expectation": "A strong answer explains async rendering behavior, state queues, and how to avoid reading stale values.",
        },
        {
            "question": "What responsibilities belong in Django models, views, and serializers when building an API-backed product?",
            "expectation": "The interviewer wants clean separation of concerns rather than dumping all business logic into one layer.",
        },
    ]
    practical = [
        {
            "question": "Design a Django API for a task board that React can filter by owner, status, and due date.",
            "expectation": "A solid answer covers endpoints, query parameters, validation, and response shape for frontend use.",
        },
        {
            "question": "How would you structure React state for a dashboard with loading, success, empty, and error states from the same endpoint?",
            "expectation": "The interviewer expects a predictable state model and clear handling of transitions.",
        },
    ]
    scenario = [
        {
            "question": "A React page works locally but fails after hitting a Django endpoint in staging. How would you debug the contract quickly?",
            "expectation": "The answer should move through network inspection, payload shape, auth headers, CORS, and backend logs methodically.",
        },
        {
            "question": "You inherit a Django + React codebase where filters are slow and the UI feels inconsistent. What would you fix first?",
            "expectation": "A strong answer prioritizes instrumentation, bottleneck isolation, and the highest-user-impact improvement first.",
        },
    ]

    if missing_skills:
        first_gap = missing_skills[0]["skill"]
        conceptual.append(
            {
                "question": f"What tradeoffs would you consider when introducing {first_gap} into an existing React + Django product?",
                "expectation": "The interviewer wants practical reasoning, not a textbook definition.",
            }
        )

    return {
        "conceptual_questions": conceptual[:3],
        "practical_questions": practical[:3],
        "scenario_questions": scenario[:3],
    }


def _fullstack_product_upgrades(is_fullstack_role: bool) -> list[dict]:
    if not is_fullstack_role:
        return []

    return [
        {"area": "Portfolio", "action": "Feature one React + Django project with architecture notes, API flow diagrams, and both UI and backend screenshots."},
        {"area": "GitHub", "action": "Pin one full-stack repo with a strong README covering setup, data model, API routes, and product decisions."},
        {"area": "Deployment", "action": "Deploy the frontend and backend separately, then document environment variables, API base URLs, and authentication flow."},
        {"area": "UI polish", "action": "Show loading, empty, success, validation, and error states so the product looks handled beyond the happy path."},
    ]


def generate_ai_feedback(resume: dict, job_description: str, match_result: dict | None = None) -> dict:
    import json
    from services.ai_runtime import get_generative_model
    from utils.cleaner import clean_json

    match_result = match_result or {}
    summary = match_result.get("summary", {})
    overall_score = summary.get("overall_score", 0)
    matched_skills = match_result.get("matched_skills", [])
    missing_required = match_result.get("missing_required_skills", [])
    
    prompt = f"""You are a world-class AI Career Intelligence Architect, Resume Forensic Analyst, and Recruiter Psychology Expert operating at the level of a $500/hr career coach combined with a senior FAANG recruiter and a hiring science researcher.

CANDIDATE CONTEXT:
- Name: {resume.get("name", "Candidate")}
- Overall Match Score: {overall_score}% 
- Matched Skills: {", ".join(matched_skills[:8]) or "None detected"}
- Missing Required Skills: {", ".join(missing_required[:6]) or "None"}
- Years of Experience: {resume.get("years_of_experience", 0)}
- Achievements on Resume: {"; ".join(resume.get("achievements", [])[:3]) or "None extracted"}
- GitHub: {"Yes" if resume.get("github_url") else "No"}
- LinkedIn: {"Yes" if resume.get("linkedin_url") else "No"}
- Skills Count: {len(resume.get("skills", []))}
- Projects: {len(resume.get("projects", []))}

YOUR MISSION:
Generate brutally honest, hyper-specific, recruiter-grade career intelligence. Every insight must reference THIS specific candidate's resume, not generic advice. If skills match well, focus on differentiation and salary upside. If gaps exist, provide exact 30-day fix plans.

ABSOLUTE REQUIREMENTS:
1. NO generic "No gaps detected" — always find growth opportunities
2. Reference specific skills, companies, or achievements from this resume
3. ATS score must reflect actual keyword density vs job description
4. Interview readiness score (0-100) based on proof depth in resume
5. Market tier must reflect real hiring market conditions for this skill set
6. Bullet transformations must use ACTUAL bullets from experience/projects
7. Recruiter objections must reflect THIS specific profile's actual weak spots

Return ONLY valid JSON matching this exact schema:
{{
  "executive_snapshot": {{
    "candidate_archetype": "(e.g., Execution-Ready Full Stack Builder, AI-Augmented Frontend Specialist, Early-Career Backend Engineer with Project Proof)",
    "market_tier": "(Underprepared | Emerging | Competitive | Strong | Premium Hireable)",
    "hiring_velocity": "(e.g., 2-4 weeks with resume fix, 3-6 months as-is, ready to hire now)",
    "top_3_strengths": ["", "", ""],
    "top_3_risks": ["", "", ""],
    "recruiter_first_impression_score": 0,
    "resume_credibility_score": 0,
    "ats_score": 0,
    "interview_readiness_score": 0,
    "one_line_verdict": "(crisp 1-sentence recruiter-view verdict)"
  }},
  "career_trajectory": {{
    "current_level": "(Junior | Mid | Senior | Lead | Principal)",
    "target_level": "(what level this JD expects)",
    "gap_years": 0,
    "fastest_path": "(specific 90-day action plan)",
    "salary_range_current": "(realistic current market range based on skills + exp)",
    "salary_range_achievable": "(range after resume fixes + skill adds)",
    "promotion_blockers": [""]
  }},  
  "skill_gap_intelligence": [
    {{
      "gap_type": "(Missing hard skill | Missing depth proof | Missing business impact | Missing architecture knowledge)",
      "skill": "",
      "severity": "(Critical | High | Medium | Low)",
      "why_recruiters_care": "",
      "how_it_affects_hiring": "",
      "exact_fix": "",
      "time_to_fix": "(e.g., 2 weeks with focused project)"
    }}
  ],
  "bullet_transformation_engine": [
    {{
      "before": "(actual weak bullet from resume)",
      "after": "(rewritten with STAR format + quantified impact)",
      "impact_change": "(what recruiter perceives differently)"
    }}
  ],
  "market_positioning": {{
    "startup_readiness": {{"score": 0, "why": "", "blocker": ""}},
    "enterprise_readiness": {{"score": 0, "why": "", "blocker": ""}},
    "product_readiness": {{"score": 0, "why": "", "blocker": ""}},
    "remote_global_readiness": {{"score": 0, "why": "", "blocker": ""}},
    "freelance_readiness": {{"score": 0, "why": "", "blocker": ""}},
    "leadership_readiness": {{"score": 0, "why": "", "blocker": ""}}
  }},
  "recruiter_objection_simulator": [
    {{
      "concern": "(specific objection a recruiter would raise about THIS profile)",
      "severity": "(Dealbreaker | High | Medium | Low)",
      "counter_strategy": "(exact 2-sentence response the candidate should prepare)"
    }}
  ],
  "preparation_hub": [
    {{
      "weakness": "(specific gap from this resume)",
      "fix_7_day": "(exact task with deliverable)",
      "upgrade_30_day": "(project or course with measurable output)",
      "career_leap_90_day": "(portfolio or certification milestone)",
      "best_project": "(specific project idea for this role)",
      "best_certification": "(most impactful cert for this JD)",
      "best_portfolio_proof": "(what to showcase + how)",
      "interview_narrative": "(exact story arc for behavioral questions)",
      "linkedin_branding": "(specific headline + about section tip)"
    }}
  ],
  "skill_coverage_map": {{
    "resume_skills_detected": [""],
    "market_expected_skills": [""],
    "missing_competitive_skills": [""],
    "semantic_match_percent": {overall_score},
    "skill_depth_percent": 0,
    "skill_proof_percent": 0,
    "ats_match_percent": 0,
    "differentiation_score": 0
  }},
  "hirable_acceleration": {{
    "project_roi": ["(specific project that gives maximum hiring ROI for this role)"],
    "bullet_rewrites": ["(specific bullet rewrite from actual experience)"],
    "missing_metrics": ["(what to quantify that's currently vague)"],
    "interview_narrative": ["(specific STAR story to prepare based on projects)"],
    "salary_upside_opportunity": "(how much salary increase is possible with fixes)"
  }},
  "strength_signals": [
    {{
      "signal": "(specific signal of strength from resume)",
      "why_it_matters": "(why this matters to recruiters)"
    }}
  ],
  "risk_signals": [
    {{
      "title": "(risk title)",
      "severity": "(High | Medium | Low)",
      "explanation": "(why it is a risk)"
    }}
  ],
  "evidence_highlights": [
    {{
      "relevance": "(skill name)",
      "project_or_context": "(where they used it)",
      "action": "(what they did)",
      "impact": "(what happened)"
    }}
  ],
  "improvements": ["(actionable improvement tip)"],
  "additional_value_for_candidate": [
    {{
      "area": "(area for improvement)",
      "action": "(specific action to take)"
    }}
  ],
  "missing_skills": ["(missing skill)"],
  "strengths": ["(strength)"]
}}

RESUME DATA:
{json.dumps({"resume": resume, "job_description": job_description[:3000], "match_summary": summary}, ensure_ascii=False)[:12000]}
"""

    try:
        from services.ai_runtime import safe_generate_content
        response_text = safe_generate_content(prompt)
        feedback_data = json.loads(clean_json(response_text))
        # Ensure backward compat keys
        if "preparation_hub" in feedback_data and "preparation_hub_2" not in feedback_data:
            feedback_data["preparation_hub_2"] = feedback_data["preparation_hub"]
        return feedback_data
    except Exception as e:
        print(f"Error generating AI feedback: {e}")
        return {
            "executive_snapshot": {
                "candidate_archetype": "Profile Under Analysis",
                "market_tier": "Emerging",
                "hiring_velocity": "Requires profile strengthening",
                "top_3_strengths": matched_skills[:3] or ["Technical foundation", "Project experience", "Skill diversity"],
                "top_3_risks": missing_required[:3] or ["Limited quantified impact", "Sparse proof depth", "ATS optimization needed"],
                "recruiter_first_impression_score": max(30, int(overall_score * 0.8)),
                "resume_credibility_score": max(25, int(overall_score * 0.75)),
                "ats_score": max(20, int(overall_score * 0.7)),
                "interview_readiness_score": max(20, int(overall_score * 0.65)),
                "one_line_verdict": f"Candidate shows {overall_score}% match with room for targeted improvement."
            },
            "career_trajectory": {
                "current_level": "Mid",
                "target_level": "Senior",
                "gap_years": 1,
                "fastest_path": "Add 2 quantified projects and close the top 2 skill gaps within 30 days.",
                "salary_range_current": "Market rate based on current skill set",
                "salary_range_achievable": "15-25% uplift after targeted improvements",
                "promotion_blockers": ["Missing proof of leadership", "No quantified business impact shown"]
            },
            "skill_gap_intelligence": [{"gap_type": "Missing proof depth", "skill": s, "severity": "High", "why_recruiters_care": "Required for this role", "how_it_affects_hiring": "Reduces shortlist probability", "exact_fix": f"Build one project showcasing {s}", "time_to_fix": "2-3 weeks"} for s in missing_required[:3]],
            "bullet_transformation_engine": [],
            "market_positioning": {k: {"score": max(20, int(overall_score * r)), "why": "", "blocker": ""} for k, r in [("startup_readiness", 0.9), ("enterprise_readiness", 0.7), ("product_readiness", 0.8), ("remote_global_readiness", 0.75), ("freelance_readiness", 0.65), ("leadership_readiness", 0.5)]},
            "recruiter_objection_simulator": [],
            "preparation_hub_2": [],
            "preparation_hub": [],
            "skill_coverage_map": {"resume_skills_detected": matched_skills[:8], "market_expected_skills": [], "missing_competitive_skills": missing_required[:5], "semantic_match_percent": overall_score, "skill_depth_percent": 0, "skill_proof_percent": 0, "ats_match_percent": 0, "differentiation_score": 0},
            "hirable_acceleration": {"project_roi": [], "bullet_rewrites": [], "missing_metrics": [], "interview_narrative": [], "salary_upside_opportunity": ""},
            "strength_signals": ["Strong foundation in core technical competencies.", "Demonstrated capability in project execution."],
            "risk_signals": [{"title": "Missing Proof", "severity": "High", "explanation": "Lack of quantified evidence for required skills."}],
            "evidence_highlights": [{"relevance": matched_skills[0] if matched_skills else "General", "project_or_context": "Previous roles", "action": "Applied technical skills", "impact": "Contributed to team goals"}],
            "improvements": ["Add specific metrics to project descriptions.", "Highlight cross-functional collaboration."],
            "additional_value_for_candidate": [{"area": "Portfolio", "action": "Add a link to a live project demonstrating core skills."}],
            "missing_skills": missing_required[:5],
            "strengths": matched_skills[:5],
        }
