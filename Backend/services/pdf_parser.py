from PyPDF2 import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text.strip():
            text.append(page_text.strip())

    return "\n".join(text).strip()
