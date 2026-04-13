from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import jwt
import aiosqlite
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

from app.config import settings
from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(None, max_length=120)


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str | None


def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)


def create_access_token(user_id: int, email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload: dict[str, Any] = {"sub": str(user_id), "email": email, "exp": exp}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


async def get_optional_user(
    db: Annotated[aiosqlite.Connection, Depends(get_db)],
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict[str, Any] | None:
    if not creds or creds.scheme.lower() != "bearer":
        return None
    try:
        data = decode_token(creds.credentials)
        uid = int(data["sub"])
    except Exception:
        return None
    cur = await db.execute(
        "SELECT id, email, display_name FROM users WHERE id = ?",
        (uid,),
    )
    row = await cur.fetchone()
    if not row:
        return None
    return {"id": row["id"], "email": row["email"], "display_name": row["display_name"]}


async def get_current_user(
    user: Annotated[dict[str, Any] | None, Depends(get_optional_user)],
) -> dict[str, Any]:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterBody, db: Annotated[aiosqlite.Connection, Depends(get_db)]) -> TokenResponse:
    email = body.email.strip().lower()
    cur = await db.execute("SELECT id FROM users WHERE email = ?", (email,))
    if await cur.fetchone():
        raise HTTPException(status_code=409, detail="Email already registered")
    ph = hash_password(body.password)
    name = body.display_name.strip() if body.display_name else None
    await db.execute(
        "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
        (email, ph, name),
    )
    await db.commit()
    cur = await db.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = await cur.fetchone()
    assert row
    token = create_access_token(int(row["id"]), email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginBody, db: Annotated[aiosqlite.Connection, Depends(get_db)]) -> TokenResponse:
    email = body.email.strip().lower()
    cur = await db.execute(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        (email,),
    )
    row = await cur.fetchone()
    if not row or not verify_password(body.password, str(row["password_hash"])):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(int(row["id"]), str(row["email"]))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[dict[str, Any], Depends(get_current_user)]) -> UserOut:
    return UserOut(id=int(user["id"]), email=str(user["email"]), display_name=user.get("display_name"))
