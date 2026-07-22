# from sentence_transformers import SentenceTransformer
# import numpy as np

# _model = None

# def get_model():
#     global _model

#     if _model is None:
#         print("Loading embedding model...")
#         _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

#     return _model

# print("Loading embedding model...")
# def generate_embeddings(chunks):

#     model = get_model()

#     texts = [
#         "passage: " + chunk["text"]
#         for chunk in chunks
#     ]

#     all_embeddings = []
#     print("Encoding starts")
#     for i in range(0, len(texts), 32):
#         batch = texts[i:i+32]
#         emb = model.encode(
#             batch,
#             normalize_embeddings=True,
#             show_progress_bar=False
#         )
#         all_embeddings.extend(emb)
#     print("Encoding finished")

#     embeddings = np.array(all_embeddings, dtype=np.float32)

#     return np.array(embeddings, dtype=np.float32)

from sentence_transformers import SentenceTransformer
import numpy as np

_model = None

def get_model():
    global _model

    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        print("Embedding model loaded!")

    return _model


def generate_embeddings(chunks):
    model = get_model()

    texts = [
        "passage: " + chunk["text"]
        for chunk in chunks
    ]

    print(f"Total chunks: {len(texts)}")
    print("Encoding starts...")

    all_embeddings = []

    for i in range(0, len(texts), 16):   # 16 = aur kam RAM use hogi
        print(f"Encoding batch {i//16 + 1}")
        batch = texts[i:i + 16]

        emb = model.encode(
            batch,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )

        all_embeddings.extend(emb)

    print("Encoding finished!")

    embeddings = np.array(all_embeddings, dtype=np.float32)

    return embeddings
