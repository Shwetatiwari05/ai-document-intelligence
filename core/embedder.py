from sentence_transformers import SentenceTransformer
import numpy as np

# Load embedding model
model = SentenceTransformer("BAAI/bge-small-en-v1.5")   

def generate_embeddings(chunks):
    """
    Convert text chunks into semantic embeddings.
    """

    texts = []

    # Preparing texts for embedding by adding a prefix to provide context to the model that these are passages to be represented for search
    for chunk in chunks:
        texts.append("passage: " + chunk["text"]) 

    # Generate embeddings with normalization for better cosine similarity performance
    embeddings = model.encode(
        texts,
        normalize_embeddings=True, 
        show_progress_bar=True
    )

    return np.array(embeddings, dtype=np.float32)


