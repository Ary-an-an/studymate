from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "StudyMate backend is running"}

@app.post("/extract")
async def extract(files: List[UploadFile] = File(...)):
    combined_parts = []
    file_meta = []

    for f in files:
        content = await f.read()
        try:
            text = content.decode(errors="ignore")
        except Exception:
            text = ""

        combined_parts.append(
            f"\n\n===== FILE: {f.filename} =====\n{text}\n"
        )
        file_meta.append({
            "filename": f.filename,
            "size": len(content)
        })

    combined_text = "".join(combined_parts) if combined_parts else ""

    return {
        "text": combined_text,
        "files": file_meta
    }
