import os
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading {pdf_path}: {e}"

def main():
    directory = "."
    for filename in os.listdir(directory):
        if filename.endswith(".pdf"):
            print(f"--- START content of {filename} ---")
            content = extract_text_from_pdf(os.path.join(directory, filename))
            print(content)
            print(f"--- END content of {filename} ---")

if __name__ == "__main__":
    main()
