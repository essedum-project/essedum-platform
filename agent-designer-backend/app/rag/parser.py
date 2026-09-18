"""
Document parsers for supported file types.
Supported: PDF (pdfminer.six), DOCX, TXT, CSV, HTML, JSON.
"""

from pathlib import Path


def parse_pdf(content: bytes) -> str:
    import io
    from pdfminer.high_level import extract_text

    return extract_text(io.BytesIO(content))


def parse_docx(content: bytes) -> str:
    import io
    from docx import Document

    doc = Document(io.BytesIO(content))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def parse_txt(content: bytes) -> str:
    return content.decode("utf-8", errors="replace")


def parse_csv(content: bytes) -> str:
    import csv
    import io

    reader = csv.reader(io.StringIO(content.decode("utf-8", errors="replace")))
    return "\n".join(",".join(row) for row in reader)


def parse_html(content: bytes) -> str:
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(content, "html.parser")
    return soup.get_text(separator="\n", strip=True)


def parse_json(content: bytes) -> str:
    import json

    data = json.loads(content.decode("utf-8", errors="replace"))
    return json.dumps(data, indent=2, ensure_ascii=False)


_PARSERS = {
    ".pdf": parse_pdf,
    ".docx": parse_docx,
    ".txt": parse_txt,
    ".md": parse_txt,
    ".csv": parse_csv,
    ".html": parse_html,
    ".htm": parse_html,
    ".json": parse_json,
}


def parse_document(filename: str, content: bytes) -> str:
    ext = Path(filename).suffix.lower()
    parser = _PARSERS.get(ext)
    if parser is None:
        raise ValueError(
            f"Unsupported file type '{ext}'. "
            f"Supported: {sorted(_PARSERS)}"
        )
    return parser(content)
