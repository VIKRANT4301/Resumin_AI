import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import matcher, parser


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(
    title="ProRes AI Hiring Platform",
    description="Automated LLM resume parsing, embedding-based semantic matching, AI coaching, and recruiter ranking APIs.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parser.router, prefix="/api/parser", tags=["Resume Parser"])
app.include_router(matcher.router, prefix="/api/matcher", tags=["Matcher"])


@app.get("/")
def home():
    return {
        "status": "API running",
        "service": "ProRes",
        "features": [
            "LLM Resume Parsing",
            "Embedding-Based Semantic Matching",
            "AI Candidate Feedback",
            "Recruiter Bulk Ranking",
            "SQLite Candidate Vault",
        ],
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
