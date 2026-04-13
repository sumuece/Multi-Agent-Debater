from contextlib import asynccontextmanager
from typing import Annotated

import httpx
import aiosqlite
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.activity_api import log_activity, router as activity_router
from app.auth_api import get_optional_user, router as auth_router
from app.config import settings
from app.database import get_db, init_db
from app.debate_service import run_debate
from app.models import DebateRequest, DebateResponse


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Multi Agent Debater API",
    description="Agents debate; a judge picks the best answer.",
    version="1.1.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(activity_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/debate", response_model=DebateResponse)
async def debate(
    req: DebateRequest,
    db: Annotated[aiosqlite.Connection, Depends(get_db)],
    user: Annotated[dict | None, Depends(get_optional_user)],
    x_llm_api_key: Annotated[str | None, Header(alias="X-LLM-Api-Key")] = None,
    x_llm_base_url: Annotated[str | None, Header(alias="X-LLM-Base-Url")] = None,
    x_llm_debate_model: Annotated[str | None, Header(alias="X-LLM-Debate-Model")] = None,
    x_llm_judge_model: Annotated[str | None, Header(alias="X-LLM-Judge-Model")] = None,
) -> DebateResponse:
    try:
        result = await run_debate(
            req,
            llm_api_key=x_llm_api_key,
            llm_base_url=x_llm_base_url,
            debate_model=x_llm_debate_model,
            judge_model=x_llm_judge_model,
        )
        if user:
            summary = req.topic[:200] + ("…" if len(req.topic) > 200 else "")
            await log_activity(
                db,
                int(user["id"]),
                "debate_completed",
                summary,
                {
                    "winner": result.verdict.winner_name,
                    "winner_id": result.verdict.winner_debater_id,
                    "confidence": result.verdict.confidence,
                    "used_llm": result.used_llm,
                },
            )
        return result
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Upstream LLM error: {e.response.text[:500]}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
