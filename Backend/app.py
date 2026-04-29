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

from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logging.basicConfig(
    level=logging.INFO if os.environ.get("ENV") != "development" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "An internal server error occurred", "detail": str(exc) if os.environ.get("ENV") == "development" else "Server error"},
    )

frontend_url = os.environ.get("FRONTEND_URL", "").strip().rstrip("/")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://resumin-ai.vercel.app",
]
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
