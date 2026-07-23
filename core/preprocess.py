import re
_nlp = None

def get_nlp():
    global _nlp

    if _nlp is None:
        import spacy
        print("LOADING SPACY MODEL")
        _nlp = spacy.load("en_core_web_sm")
        print("SPACY MODEL LOADED")

    return _nlp

# removes noisy/useless chunks 
def is_low_quality_chunk(text):
    text_lower = text.lower()
    bad_patterns = [
        "table of contents",
        "copyright",
        "preface",
        "acknowledgments",
    ]

    # Build a normalized list of non-empty lines.
    lines = [line.strip() for line in text.split('\n') if line.strip()]   
    word_count = len(text.split()) # Count total words in the chunk

    # Tiny fragments
    if word_count < 10:
        return True

    # Many newlines but too few words => noisy heading/index-like text
    if text.count('\n') > 8 and word_count < 90:
        return True

    # TOC dotted leader patterns
    if text.count(". .") > 5:
        return True

    # Heading-heavy chunk using ratio + word bound (if there are too many new lines with short text then it could be a garbage chunk)
    short_lines = sum(1 for line in lines if len(line.split()) <= 6)
    short_line_ratio = short_lines / max(1, len(lines))  
    if short_line_ratio > 0.6 and word_count < 120:
        return True

    # Known noisy sections
    if any(pattern in text_lower for pattern in bad_patterns):
        return True

    return False

def clean_text(text):

    # Fix hyphenated line-break words
    text = re.sub(r'(\w)[‐-]\s+(\w)', r'\1\2', text)

    # Replace newlines followed by lowercase letters with a space to merge broken sentences
    text = re.sub(r'\n(?=[a-z])', ' ', text) 
    
    # Replace newlines followed by spaces with a single space
    text = re.sub(r'\n\s+', ' ', text) 
    
    # Remove page number patterns
    text = re.sub(
        r'\bpage\s*\d+\s*(of\s*\d+)?\b',  # Remove patterns like "Page 3" or "Page 3 of 10"
        '',
        text,
        flags=re.IGNORECASE   # Case-insensitive matching
    )

    # Remove extra spaces
    text = re.sub(r' +', ' ', text)      # Replace multiple spaces with a single space 

    # Remove too many newlines
    text = re.sub(r'\n{3,}', '\n\n', text)  # Replace 3 or more newlines with just 2

    # Remove patterns like "1 | Chapter 1: Introduction" which are common in headers/footers
    # text = re.sub(r'\d+\s*\|\s*Chapter\s+\d+.*', '', text) 

    # Replace multiple spaces/tabs with a single space
    text = re.sub(r'[ \t]+', ' ', text) 

    return text.strip()

def chunk_text(text, chunk_size=500, overlap=80):
    nlp = get_nlp()
    doc = nlp(text)

    sentences = [sent.text.strip() for sent in doc.sents]  # Split text into sentences using spaCy's sentence segmentation
    chunks = []
    current_chunk = []
    current_length = 0
    chunk_id = 0
    for sentence in sentences:
        sentence_words = len(sentence.split())   # Count words in the sentence
        if current_length + sentence_words <= chunk_size:     # If adding this sentence doesn't exceed chunk size, add it to current chunk
            current_chunk.append(sentence)
            current_length += sentence_words
        else:
            chunk_text = " ".join(current_chunk)     # Now that chunk_size is full,  Combine sentences to form the chunk text
            if not is_low_quality_chunk(chunk_text): # Check if the chunk is not low quality before adding to chunks list
                chunks.append({                      # Add chunk metadata and text to chunks list
                    "chunk_id": chunk_id,
                    "text": chunk_text,
                    "word_count": current_length
                })

                chunk_id += 1                       # Increment chunk ID for next chunk

            # overlap
            overlap_words = chunk_text.split()[-overlap:]     # Get last 'overlap' words from the current chunk to start the next chunk with some context
            overlap_text = " ".join(overlap_words)            # Create the overlap text for the next chunk
            current_chunk = [overlap_text, sentence]          # Start new chunk with the overlap text and the current sentence
            current_length = len(overlap_text.split()) + sentence_words   # Update current length to include the overlap and the new sentence

    # final chunk
    if current_chunk:      # If there are any remaining sentences in the current chunk after the loop, create a final chunk
        chunk_text = " ".join(current_chunk)   # Combine remaining sentences to form the final chunk text
        if not is_low_quality_chunk(chunk_text): # Check if the final chunk is not low quality before adding to chunks list
            chunks.append({
                "chunk_id": chunk_id,
                "text": chunk_text,
                "word_count": current_length
            })

    # Fallback: short or sparse documents — certificates, single-page
    # forms, heavily redacted PDFs — can have their only content filtered
    # out entirely by the low-quality check above (it's tuned for noise
    # *within* a larger document, not for rejecting a whole short one).
    # That used to leave "chunks" empty, which crashed embedding/vector
    # store creation downstream. Keep the whole document as a single
    # chunk instead of discarding it.
    if not chunks and text.strip():
        chunks.append({
            "chunk_id": 0,
            "text": text.strip(),
            "word_count": len(text.split()),
        })

    return chunks