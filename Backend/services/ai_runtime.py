import os
from functools import lru_cache

from dotenv import load_dotenv


_ENV_LOADED = False


def load_backend_env() -> None:
    global _ENV_LOADED
    if _ENV_LOADED:
        return

    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
    _ENV_LOADED = True


@lru_cache(maxsize=None)
def get_generative_model(
    model_name: str = "gemini-2.5-flash-lite",
    response_mime_type: str = "application/json",
):
    load_backend_env()

    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)

    return genai.GenerativeModel(
        model_name,
        generation_config={"response_mime_type": response_mime_type},
    )


@lru_cache(maxsize=None)
def get_sentence_transformer(model_name: str = "all-MiniLM-L6-v2"):
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(model_name)
