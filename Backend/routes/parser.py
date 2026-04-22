import os
import shutil
import uuid

from fastapi import APIRouter, File, UploadFile

from services.candidate_store import save_candidate
from services.ocr_service import extract_text_from_image
from services.pdf_parser import extract_text_from_pdf
from services.resume_parser import parse_resume


router = APIRouter()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def parse_resume_api(file: UploadFile = File(...)):
    temp_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, temp_name)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extension = file.filename.split(".")[-1].lower()
        if extension == "pdf":
            text = extract_text_from_pdf(file_path)
        elif extension in {"jpg", "jpeg", "png"}:
            text = extract_text_from_image(file_path)
        else:
            return {"status": "error", "message": "Unsupported file type"}

        if not str(text or "").strip():
            return {"status": "error", "message": "No text extracted from file"}

        result = parse_resume(text, file.filename)
        if result.get("_parse_status") != "success":
            return {"status": "error", "message": result.get("_error", "Resume parsing failed")}

        stored = save_candidate(result)
        return {"status": "success", "data": stored}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
