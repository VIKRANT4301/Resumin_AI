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
    model_name: str = "gemini-2.5-flash-lite",
    response_mime_type: str = "application/json",
):
    genai = _get_api_configured()
    return genai.GenerativeModel(
        model_name,
        generation_config={
            "response_mime_type": response_mime_type,
            "temperature": 0.0  # Force deterministic extraction
        },
    )

@lru_cache(maxsize=None)
def _get_openai_configured():
    load_backend_env()
    import openai
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY is not set.")
    return openai.OpenAI(api_key=api_key)

def safe_generate_content(
    prompt: str,
    model_name: str = "gemini-2.5-flash-lite",
    max_retries: int = 3,
    initial_delay: float = 1.0
) -> str:
    """
    Generates content with exponential backoff using a single AI model (Gemini or OpenAI).
    """
    current_delay = initial_delay
    is_openai = model_name.startswith("gpt-") or model_name.startswith("o1-") or model_name.startswith("o3-")
    
    for attempt in range(max_retries):
        try:
            if is_openai:
                client = _get_openai_configured()
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.0  # Force deterministic extraction
                )
                if response and response.choices and response.choices[0].message.content:
                    logger.info(f"Successfully generated content using {model_name}")
                    return response.choices[0].message.content
                raise ValueError(f"Empty response from {model_name}")
            else:
                model = get_generative_model(model_name)
                response = model.generate_content(prompt)
                if response and response.text:
                    logger.info(f"Successfully generated content using {model_name}")
                    return response.text
                raise ValueError(f"Empty response from {model_name}")
        
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed for {model_name}: {e}")
            
            if attempt < max_retries - 1:
                time.sleep(current_delay)
                current_delay *= 2 # Exponential backoff
                continue
            else:
                logger.error(f"Model {model_name} exhausted after {max_retries} attempts.")
                break
    
    raise Exception(f"Failed to generate content with {model_name}. Please check your API quota or input.")

@lru_cache(maxsize=None)
def get_sentence_transformer(model_name: str = "all-MiniLM-L6-v2"):
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(model_name)

def get_embeddings(text: str) -> List[float]:
    """Helper to get embeddings for a piece of text."""
    model = get_sentence_transformer()
    embedding = model.encode(text)
    return embedding.tolist()

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Helper to calculate cosine similarity between two vectors."""
    import numpy as np
    vec1 = np.array(v1)
    vec2 = np.array(v2)
    dot_product = np.dot(vec1, vec2)
    norm_v1 = np.linalg.norm(vec1)
    norm_v2 = np.linalg.norm(vec2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return float(dot_product / (norm_v1 * norm_v2))
