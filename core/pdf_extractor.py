import pdfplumber
import re
from collections import Counter

def normalize_line(line):
    line = re.sub(r'\d+', '', line)    # Relace digits with empty string
    line = re.sub(r'\s+', ' ', line)   # Replace multiple spaces/newlines/tabs with single space
    return line.strip().lower()        # Normalize case and trim whitespace

def extract_pages(pdf_path):      # Extract text from each page and return as list of dicts
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                pages.append({
                    "page_num": page_num + 1,
                    "text": text
                })
    return pages

# Analyze top and bottom lines across pages to find common boilerplate (like headers/footers)
def detect_boilerplate(pages, top_lines=2, bottom_lines=2):  
    top_counter = Counter()    # Counter for top repeated lines
    bottom_counter = Counter()    # Counter for bottom repeated lines
    total_pages = len(pages)

    for page in pages:  
        lines = [l.strip() for l in page["text"].split('\n') if l.strip()]     # Split page into lines, Remove empty lines and Strip extra spaces

        # Counts the occurence of normalized lines in the top and bottom regions across all pages
        for line in lines[:top_lines]:     # Check top region lines
            norm = normalize_line(line)     # Normalize line
            if norm:   
                top_counter[norm] += 1     # Count repeated normalized lines

        for line in lines[-bottom_lines:]:
            norm = normalize_line(line)
            if norm:   
                bottom_counter[norm] += 1

    boilerplate_normalized = set()     # Set to store normalized boilerplate lines
    for norm, count in {**top_counter, **bottom_counter}.items():   # Combine top and bottom counters to find common lines
        if count / total_pages > 0.6 and len(norm) > 4:     # If line appears in >60% of pages and is not too short, then likely header/footer
            boilerplate_normalized.add(norm)     
    return boilerplate_normalized

# Extract cleaned text after removing headers/footers
def extract_clean_text(pdf_path):
    pages = extract_pages(pdf_path)    # Extract all pages
    boilerplate_normalized = detect_boilerplate(pages)     # Detect repeated boilerplate

    full_text = ""    # Final combined document text after removing boilerplate lines
    for page in pages:  
        lines = page["text"].split('\n')    # Split page into lines
        total = len(lines)    # Total lines in page

        top_region = max(1, int(total * 0.05))   # Define top region as top 5% of lines, but at least 1 line
        bottom_region = max(1, int(total * 0.05))   # Define bottom region as bottom 5% of lines, but at least 1 line

        clean_lines = []   # Store cleaned lines
        for i, line in enumerate(lines):
            stripped = line.strip()    # Remove leading/trailing whitespace for normalization
            norm = normalize_line(stripped)    # Normalize line for comparison

            is_top = i < top_region       # Check if line is in top region
            is_bottom = i >= total - bottom_region    # Check if line is in bottom region


            # Remove Roman numeral page numbers from header/footer
            # Remove page numbers from header/footer regions
            if (is_top or is_bottom):
                # Roman numerals
                if re.match(r'^\s*(i{1,3}|iv|vi{0,3}|ix|xi{0,3}|xiv|xv)\s*$',stripped,flags=re.IGNORECASE):
                    continue

            # Plain numeric page numbers
            if re.match(r'^\s*\d+\s*$', stripped):
                continue

            # "Page 12" style
            if re.match(r'^\s*page\s+\d+\s*$', stripped, flags=re.IGNORECASE):
                continue

            if (is_top or is_bottom) and norm in boilerplate_normalized: # If line is in top/bottom region and matches detected boilerplate, skip it
                continue

            clean_lines.append(line)   # Add non-boilerplate lines to clean_lines

        full_text += '\n'.join(clean_lines)   # Combine all cleaned lines of the current page into a single text block
        full_text += "\n\n"     # Add blank space between pages for better readability and separation

    return full_text
