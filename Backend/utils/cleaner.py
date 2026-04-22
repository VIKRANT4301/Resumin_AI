import re

def clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"```json|```", "", text)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    return match.group(0) if match else text