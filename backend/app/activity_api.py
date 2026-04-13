import json
from typing import Annotated, Any

import aiosqlite
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.auth_api import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/activity", tags=["activity"])


class ActivityItem(BaseModel):
    id: int
    event_type: str
    summary: str
    detail: str | None
    created_at: str


class ActivityListResponse(BaseModel):
    items: list[ActivityItem]


async def log_activity(
    db: aiosqlite.Connection,
    user_id: int,
    event_type: str,
    summary: str,
    detail: dict[str, Any] | None = None,
) -> None:
    detail_json = json.dumps(detail) if detail is not None else None
    await db.execute(
        "INSERT INTO activity_logs (user_id, event_type, summary, detail) VALUES (?, ?, ?, ?)",
        (user_id, event_type, summary, detail_json),
    )
    await db.commit()


@router.get("", response_model=ActivityListResponse)
async def list_activity(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[aiosqlite.Connection, Depends(get_db)],
    limit: int = Query(100, ge=1, le=500),
) -> ActivityListResponse:
    cur = await db.execute(
        """
        SELECT id, event_type, summary, detail, created_at
        FROM activity_logs
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT ?
        """,
        (int(user["id"]), limit),
    )
    rows = await cur.fetchall()
    items = [
        ActivityItem(
            id=int(r["id"]),
            event_type=str(r["event_type"]),
            summary=str(r["summary"]),
            detail=r["detail"],
            created_at=str(r["created_at"]),
        )
        for r in rows
    ]
    return ActivityListResponse(items=items)
