import re
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


def _normalize_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def is_url(value: str) -> bool:
    text = _normalize_text(value)
    if not text:
        return False

    parsed = urlparse(text)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def extract_job_description_from_url(url: str) -> str:
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=20)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "header", "footer", "nav"]):
        tag.decompose()

    selectors = [
        "[class*='job']",
        "[class*='description']",
        "[class*='role']",
        "[class*='content']",
        "main",
        "article",
        "section",
    ]

    blocks = []
    seen = set()

    for selector in selectors:
        for node in soup.select(selector):
            text = _normalize_text(node.get_text(" ", strip=True))
            if len(text) < 120:
                continue
            key = text.lower()
            if key in seen:
                continue
            seen.add(key)
            blocks.append(text)

    if not blocks:
        for node in soup.find_all(["div", "p", "li"]):
            text = _normalize_text(node.get_text(" ", strip=True))
            if len(text) < 120:
                continue
            key = text.lower()
            if key in seen:
                continue
            seen.add(key)
            blocks.append(text)

    if not blocks:
        raise ValueError("Could not extract a usable job description from this URL")

    return "\n".join(blocks[:30]).strip()


def resolve_job_input(job_input: str) -> str:
    text = _normalize_text(job_input)
    if not text:
        return ""
    if is_url(text):
        return extract_job_description_from_url(text)
    return text
