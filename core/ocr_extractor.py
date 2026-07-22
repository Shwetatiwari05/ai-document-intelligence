import fitz
import re
import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from mistralai.client.sdk import Mistral

load_dotenv()

# MISTRAL CLIENT 
_client = None

def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise ValueError("MISTRAL_API_KEY not found in .env file!")
        _client = Mistral(api_key=api_key)
    return _client


# SCANNED PDF DETECTION 

def is_scanned_pdf(pdf_path: str, sample_pages: int = 3) -> bool:
    """
    Detect if PDF is scanned (image-based) or text-based.
    Strategy: extract text from first few pages — if avg < 50 chars, it's scanned.
    """
    doc = fitz.open(pdf_path)
    pages_to_check = min(sample_pages, len(doc))
    total_chars = sum(len(doc[i].get_text("text").strip()) for i in range(pages_to_check))
    doc.close()

    avg_chars = total_chars / pages_to_check if pages_to_check > 0 else 0

    if avg_chars < 50:
        print(f"Scanned PDF detected (avg {avg_chars:.0f} chars/page) → using Mistral OCR")
        return True
    else:
        print(f"Text-based PDF detected (avg {avg_chars:.0f} chars/page) → using normal extraction")
        return False


# MISTRAL OCR 

def extract_text_ocr(pdf_path: str, **kwargs) -> str:
    """
    Extract text from scanned PDF using Mistral OCR API.
    Sends PDF as base64 — no need to convert to images.
    """
    client = get_client()

    print(f"Sending to Mistral OCR...")

    file_size = os.path.getsize(pdf_path)

    if file_size > 20 * 1024 * 1024:
        raise ValueError(
            "PDF too large for OCR processing. Upload PDF smaller than 20MB."
        )

    with open(pdf_path, "rb") as f:
        pdf_data = base64.b64encode(f.read()).decode("utf-8")

    # Call Mistral OCR API
    response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": f"data:application/pdf;base64,{pdf_data}",
        }
    )

    # Extract text from all pages
    pages_text = []
    for page in response.pages:
        if page.markdown:
            pages_text.append(page.markdown)

    full_text = "\n\n".join(pages_text)
    full_text = clean_ocr_text(full_text)

    print(f" Mistral OCR complete — {len(response.pages)} page(s) processed")
    return full_text

# OCR TEXT CLEANING 

def clean_ocr_text(text: str) -> str:
    """Light cleanup of Mistral OCR output — it's already very clean."""
    # Remove markdown image tags (Mistral sometimes adds these)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# MISTRAL OCR WITH BOUNDING BOXES (for redaction on scanned PDFs)

def extract_blocks_with_boxes(pdf_path: str):
    """
    Run OCR on a scanned PDF and return each page's text blocks with bbox.
    Uses pytesseract instead of Mistral (which doesn't support bounding boxes in SDK 2.5).
    """
    import pytesseract
    from PIL import Image
    import io

    doc = fitz.open(pdf_path)
    pages_blocks = []

    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))

        scale_x = page.rect.width / img.width
        scale_y = page.rect.height / img.height

        ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

        n = len(ocr_data["text"])
        blocks = []
        for i in range(n):
            w = ocr_data["text"][i].strip()
            if not w:
                continue
            x = ocr_data["left"][i]
            y = ocr_data["top"][i]
            ww = ocr_data["width"][i]
            hh = ocr_data["height"][i]
            blocks.append({
                "text": w,
                "bbox": (
                    x * scale_x,
                    y * scale_y,
                    (x + ww) * scale_x,
                    (y + hh) * scale_y,
                ),
                "page_width": img.width,
                "page_height": img.height,
            })
        pages_blocks.append(blocks)

    doc.close()
    return pages_blocks

# NORMAL PDF EXTRACTION 

def extract_text_normal(pdf_path: str) -> str:
    """Fast text extraction for normal (non-scanned) PDFs using fitz."""
    doc = fitz.open(pdf_path)
    pages_text = []

    for page in doc:
        words = page.get_text("words")
        if not words:
            continue
        lines_dict = {}
        for w in words:
            y_key = round(w[1], 1)
            if y_key not in lines_dict:
                lines_dict[y_key] = []
            lines_dict[y_key].append((w[0], w[4]))

        page_lines = []
        for y in sorted(lines_dict.keys()):
            line_words = sorted(lines_dict[y], key=lambda x: x[0])
            page_lines.append(" ".join(ww[1] for ww in line_words))
        pages_text.append("\n".join(page_lines))

    doc.close()
    raw = "\n\n".join(pages_text)
    raw = re.sub(r'^[\s|]+$', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'^\|\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'[ \t]+', ' ', raw)
    raw = re.sub(r'\n{3,}', '\n\n', raw)
    return raw.strip()

# SMART ENTRY POINT 

def extract_text_smart(pdf_path: str, force_ocr: bool = False, **kwargs) -> str:
    """
    MAIN FUNCTION — auto-detects scanned vs text-based PDF.
    force_ocr=True → always use Mistral (for mixed text+image PDFs)
    """
    print(f"Analyzing PDF: {pdf_path}")

    if force_ocr or is_scanned_pdf(pdf_path):
        return extract_text_ocr(pdf_path)
    else:
        return extract_text_normal(pdf_path)








# import fitz
# import re
# import os
# import base64
# from pathlib import Path
# from dotenv import load_dotenv
# from mistralai.client.sdk import Mistral

# load_dotenv()

# # MISTRAL CLIENT 
# _client = None

# def get_client():
#     global _client
#     if _client is None:
#         api_key = os.getenv("MISTRAL_API_KEY")
#         if not api_key:
#             raise ValueError("MISTRAL_API_KEY not found in .env file!")
#         _client = Mistral(api_key=api_key)
#     return _client


# # SCANNED PDF DETECTION 

# def is_scanned_pdf(pdf_path: str, sample_pages: int = 3) -> bool:
#     """
#     Detect if PDF is scanned (image-based) or text-based.
#     Strategy: extract text from first few pages — if avg < 50 chars, it's scanned.
#     """
#     doc = fitz.open(pdf_path)
#     pages_to_check = min(sample_pages, len(doc))
#     total_chars = sum(len(doc[i].get_text("text").strip()) for i in range(pages_to_check))
#     doc.close()

#     avg_chars = total_chars / pages_to_check if pages_to_check > 0 else 0

#     if avg_chars < 50:
#         print(f"Scanned PDF detected (avg {avg_chars:.0f} chars/page) → using Mistral OCR")
#         return True
#     else:
#         print(f"Text-based PDF detected (avg {avg_chars:.0f} chars/page) → using normal extraction")
#         return False


# # MISTRAL OCR 

# def extract_text_ocr(pdf_path: str, **kwargs) -> str:
#     """
#     Extract text from scanned PDF using Mistral OCR API.
#     Sends PDF as base64 — no need to convert to images.
#     """
#     client = get_client()

#     print(f"Sending to Mistral OCR...")

#     # Read PDF as base64
#     with open(pdf_path, "rb") as f:
#         pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")

#     # Call Mistral OCR API
#     response = client.ocr.process(
#         model="mistral-ocr-latest",
#         document={
#             "type": "document_url",
#             "document_url": f"data:application/pdf;base64,{pdf_data}",
#         }
#     )

#     # Extract text from all pages
#     pages_text = []
#     for page in response.pages:
#         if page.markdown:
#             pages_text.append(page.markdown)

#     full_text = "\n\n".join(pages_text)
#     full_text = clean_ocr_text(full_text)

#     print(f" Mistral OCR complete — {len(response.pages)} page(s) processed")
#     return full_text

# # OCR TEXT CLEANING 

# def clean_ocr_text(text: str) -> str:
#     """Light cleanup of Mistral OCR output — it's already very clean."""
#     # Remove markdown image tags (Mistral sometimes adds these)
#     text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
#     # Normalize whitespace
#     text = re.sub(r'[ \t]+', ' ', text)
#     text = re.sub(r'\n{3,}', '\n\n', text)
#     return text.strip()

# # NORMAL PDF EXTRACTION 

# def extract_text_normal(pdf_path: str) -> str:
#     """Fast text extraction for normal (non-scanned) PDFs using fitz."""
#     doc = fitz.open(pdf_path)
#     pages_text = []

#     for page in doc:
#         words = page.get_text("words")
#         if not words:
#             continue
#         lines_dict = {}
#         for w in words:
#             y_key = round(w[1], 1)
#             if y_key not in lines_dict:
#                 lines_dict[y_key] = []
#             lines_dict[y_key].append((w[0], w[4]))

#         page_lines = []
#         for y in sorted(lines_dict.keys()):
#             line_words = sorted(lines_dict[y], key=lambda x: x[0])
#             page_lines.append(" ".join(ww[1] for ww in line_words))
#         pages_text.append("\n".join(page_lines))

#     doc.close()
#     raw = "\n\n".join(pages_text)
#     raw = re.sub(r'^[\s|]+$', '', raw, flags=re.MULTILINE)
#     raw = re.sub(r'^\|\s*', '', raw, flags=re.MULTILINE)
#     raw = re.sub(r'[ \t]+', ' ', raw)
#     raw = re.sub(r'\n{3,}', '\n\n', raw)
#     return raw.strip()

# # SMART ENTRY POINT 

# def extract_text_smart(pdf_path: str, force_ocr: bool = False, **kwargs) -> str:
#     """
#     MAIN FUNCTION — auto-detects scanned vs text-based PDF.
#     force_ocr=True → always use Mistral (for mixed text+image PDFs)
#     """
#     print(f"Analyzing PDF: {pdf_path}")

#     if force_ocr or is_scanned_pdf(pdf_path):
#         return extract_text_ocr(pdf_path)
#     else:
#         return extract_text_normal(pdf_path)


