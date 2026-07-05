from sentence_transformers import SentenceTransformer
import numpy as np

_model = None

def get_model():
    global _model

    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer("BAAI/bge-small-en-v1.5")

    return _model


def generate_embeddings(chunks):

    model = get_model()

    texts = [
        "passage: " + chunk["text"]
        for chunk in chunks
    ]

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    return np.array(embeddings, dtype=np.float32)


