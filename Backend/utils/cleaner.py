import re

def clean_json(text: str) -> str:
    text = text.strip()
    # Remove markdown code blocks
    text = re.sub(r"```[A-Za-z]*\s*", "", text)
    text = re.sub(r"```", "", text)
    # Extract json object or array
    match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if match:
        text = match.group(0)
    
    # Remove trailing commas that break json.loads
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    
    return text