from fastapi import Header, HTTPException
from core.supabase_client import supabase

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(401, "Invalid token")