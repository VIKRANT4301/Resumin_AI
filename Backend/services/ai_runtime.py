import os
import time
import logging
from functools import lru_cache
from typing import Optional, List

from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_ENV_LOADED = False

def load_backend_env() -> None:
    global _ENV_LOADED
    if _ENV_LOADED:
        return
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
    _ENV_LOADED = True

@lru_cache(maxsize=None)
def _get_api_configured():
    load_backend_env()
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
    return genai

def get_generative_model(
    model_name: str = "gemini-1.5-flash",
    response_mime_type: str = "application/json",
):
    genai = _get_api_configured()
    return genai.GenerativeModel(
        model_name,
        generation_config={"response_mime_type": response_mime_type},
    )

def safe_generate_content(
    prompt: str,
    models: Optional[List[str]] = None,
    max_retries: int = 3,
    initial_delay: float = 1.0
) -> str:
    """
    Generates content with automatic fallback (Toggle Mode) and exponential backoff.
    Primary: gemini-1.5-flash (High Quota)
    Secondary: gemini-2.0-flash-exp or gemini-1.5-pro
    """
    if models is None:
        models = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-pro-latest",
            "gemini-1.0-pro"
        ]
    
    current_delay = initial_delay
    
    for model_name in models:
        for attempt in range(max_retries):
            try:
                model = get_generative_model(model_name)
                response = model.generate_content(prompt)
                if response and response.text:
                    logger.info(f"Successfully generated content using {model_name}")
                    return response.text
                raise ValueError(f"Empty response from {model_name}")
            
            except Exception as e:
                error_msg = str(e).lower()
                is_quota_error = "429" in error_msg or "resource_exhausted" in error_msg
                
                logger.warning(f"Attempt {attempt + 1} failed for {model_name}: {e}")
                
                if attempt < max_retries - 1:
                    time.sleep(current_delay)
                    current_delay *= 2 # Exponential backoff
                    continue
                else:
                    logger.error(f"Model {model_name} exhausted. Switching to fallback...")
                    break # Try next model
    
    raise Exception("All AI models and retries exhausted. Please check your API quota.")

@lru_cache(maxsize=None)
def get_sentence_transformer(model_name: str = "all-MiniLM-L6-v2"):
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(model_name)
