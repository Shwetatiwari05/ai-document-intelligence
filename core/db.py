from core.supabase_client import supabase

def insert_document(metadata, user_id):
    return (
        supabase.table("documents")
        .insert({
            "user_id": user_id,
            "pdf_id": metadata["pdf_id"],
            "pdf_name": metadata["pdf_name"],
            "page_count": metadata["page_count"],
            "chunk_count": metadata["chunk_count"],
            "word_count": metadata["word_count"],
            "force_ocr": metadata.get("force_ocr", False),
            "source_path": None,
            "storage_path": metadata.get("storage_path"),
        })
        .execute()
    )


def get_documents(user_id):
    result = (
        supabase.table("documents")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


def get_document(pdf_id, user_id):
    print("SUPABASE =", supabase)
    print("PDF ID =", pdf_id)
    print("USER ID =", user_id)

    try:
        result = (
            supabase.table("documents")
            .select("*")
            .eq("pdf_id", pdf_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )

        print("RESULT =", result)
        print("RESULT TYPE =", type(result))

        if result is None:
            return None

        return result.data

    except Exception as e:
        print("DB EXCEPTION =", repr(e))
        raise


def delete_document_db(pdf_id, user_id):
    return (
        supabase.table("documents")
        .delete()
        .eq("pdf_id", pdf_id)
        .eq("user_id", user_id)
        .execute()
    )