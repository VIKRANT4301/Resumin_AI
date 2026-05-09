import asyncio
from services.matcher_service import match_resume_to_job

resume = {
    "name": "Jane Doe",
    "skills": ["Python", "Django", "React", "PostgreSQL"],
    "experience": [
        {
            "title": "Full Stack Engineer",
            "company": "Tech Corp",
            "dates": "Jan 2020 - Present",
            "description": "Built web apps with React and Django. Used PostgreSQL."
        }
    ]
}

job_text = """
We need a Backend Developer.
Must have Python and Django.
Preferred: PostgreSQL, Redis.
3 years experience.
"""

def test():
    result = match_resume_to_job(resume, job_text)
    print(f"Overall Score: {result.get('summary', {}).get('overall_score')}")
    print("Scores:")
    for key, score in result.get("skill_scores", {}).items():
        print(f"  {key}: matched={score.get('matched')} (similarity={score.get('similarity')}) -> {score.get('evidence_text')}")

if __name__ == "__main__":
    test()
