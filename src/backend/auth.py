import jwt
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
import models

# Supabase JWT token decoding / payload extraction
async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Extracts authenticated user metadata from Bearer token.
    Decodes the unverified claims or standard Supabase JWT payload.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # For development / unauthenticated endpoints that allow fallback
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token."
        )

    token = authorization.split(" ")[1].strip()
    try:
        # Decode token payload without requiring shared secret if verifying via Supabase
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub") or payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid auth token: Missing user identity."
            )
        return {
            "id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
            "user_metadata": payload.get("user_metadata", {})
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}"
        )

async def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None

def require_company_access(min_role: str = "viewer"):
    """
    Dependency factory to check if the current user belongs to the requested company_id
    and holds at least the required role permission level.
    Role hierarchy: admin > engineer > viewer
    """
    role_levels = {
        "viewer": 1,
        "engineer": 2,
        "admin": 3
    }

    async def _verifier(
        company_id: int,
        current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> Dict[str, Any]:
        # If no user token provided
        if not current_user:
            # Check if there are any existing members for this company
            # If the company was created legacy-style or dev-mode without members, allow open access
            res_any = await db.execute(
                select(models.OrganizationMember).where(models.OrganizationMember.company_id == company_id)
            )
            has_members = len(res_any.scalars().all()) > 0
            if not has_members:
                # Legacy open company
                return {"user_id": None, "company_id": company_id, "role": "admin"}
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to access this company workspace."
            )

        uid = current_user["id"]
        res = await db.execute(
            select(models.OrganizationMember).where(
                models.OrganizationMember.company_id == company_id,
                models.OrganizationMember.user_id == uid
            )
        )
        membership = res.scalar_one_or_none()

        if not membership:
            # Check if user is the company creator in industries table
            res_ind = await db.execute(
                select(models.Industry).where(
                    models.Industry.id == company_id,
                    models.Industry.created_by == uid
                )
            )
            if res_ind.scalar_one_or_none():
                # Auto-grant admin
                return {"user_id": uid, "company_id": company_id, "role": "admin"}

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this company workspace."
            )

        user_role = membership.role.lower()
        if role_levels.get(user_role, 0) < role_levels.get(min_role.lower(), 1):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {min_role.capitalize()} role required for this action."
            )

        return {
            "user_id": uid,
            "company_id": company_id,
            "role": user_role
        }

    return _verifier
