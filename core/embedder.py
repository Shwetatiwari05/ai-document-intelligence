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

import gc
import numpy as np
import torch
from sentence_transformers import SentenceTransformer


_model = None


def get_model():
    global _model

    if _model is None:
        print("BEFORE MODEL LOAD")

        torch.set_num_threads(1)

        _model = SentenceTransformer(
            "sentence-transformers/paraphrase-MiniLM-L3-v2",
            device="cpu"
        )

        print("AFTER MODEL LOAD")

    return _model



def generate_embeddings(chunks):
    print("CHUNKS RECEIVED =", len(chunks))

    model = get_model()

    texts = [
        "passage: " + chunk["text"]
        for chunk in chunks
    ]

    print(f"Total chunks: {len(texts)}")
    print("Encoding starts...")

    embeddings = []

    batch_size = 4

    for i in range(0, len(texts), batch_size):

        print(
            f"Encoding batch {(i//batch_size)+1}/{(len(texts)-1)//batch_size+1}"
        )

        batch = texts[i:i+batch_size]

        emb = model.encode(
            batch,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True,
            batch_size=batch_size
        )

        embeddings.append(emb)

        del emb
        gc.collect()


    print("Encoding finished!")

    final_embeddings = np.vstack(
        embeddings
    ).astype(np.float32)


    del embeddings
    del texts

    gc.collect()

    print(
        "Embedding shape:",
        final_embeddings.shape
    )

    return final_embeddings