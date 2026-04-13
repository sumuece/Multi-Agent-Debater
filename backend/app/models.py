from pydantic import BaseModel, Field


class DebaterProfile(BaseModel):
    id: str = ""
    name: str = Field(min_length=1, max_length=120)
    stance: str = Field(min_length=1, max_length=500, description="How this debater argues")


class DebateRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=4000)
    debaters: list[DebaterProfile] | None = None


class DebaterTurn(BaseModel):
    debater_id: str
    debater_name: str
    stance: str
    content: str


class JudgeVerdict(BaseModel):
    winner_debater_id: str
    winner_name: str
    rationale: str
    confidence: str = Field(description="low | medium | high")


class DebateResponse(BaseModel):
    topic: str
    turns: list[DebaterTurn]
    verdict: JudgeVerdict
    used_llm: bool
