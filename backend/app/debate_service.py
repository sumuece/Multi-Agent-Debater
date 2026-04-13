import json
import re
import uuid
from typing import Any

import httpx

from app.config import settings
from app.models import DebateRequest, DebateResponse, DebaterProfile, DebaterTurn, JudgeVerdict

DEFAULT_DEBATERS: list[DebaterProfile] = [
    DebaterProfile(id="a1", name="Analyst", stance="Evidence-first: cite trade-offs, risks, and measurable outcomes."),
    DebaterProfile(id="a2", name="Strategist", stance="Big-picture: long-term positioning, stakeholders, and execution path."),
    DebaterProfile(id="a3", name="Skeptic", stance="Challenge assumptions; surface failure modes and hidden costs."),
]


def _default_debaters() -> list[DebaterProfile]:
    return [d.model_copy() for d in DEFAULT_DEBATERS]


async def _openai_chat(messages: list[dict[str, str]], model: str, api_key: str, base_url: str) -> str:
    if not api_key:
        raise RuntimeError("LLM API key not set")
    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
    return data["choices"][0]["message"]["content"].strip()


def _mock_debater_turn(topic: str, debater: DebaterProfile, peer_snippet: str | None) -> str:
    peer = f" A prior line of argument to factor in: {peer_snippet[:220].strip()}…" if peer_snippet else ""
    return (
        f"Regarding «{topic}», {debater.name} ({debater.stance}) recommends anchoring on what we can validate this "
        f"quarter, documenting explicit assumptions, and sequencing work so we can stop early if leading indicators "
        f"miss threshold.{peer} "
        f"Success means agreed metrics, owners, and a reversible first step—not a big-bang commitment."
    )


def _mock_judge(topic: str, turns: list[DebaterTurn]) -> JudgeVerdict:
    best = max(turns, key=lambda t: len(t.content))
    return JudgeVerdict(
        winner_debater_id=best.debater_id,
        winner_name=best.debater_name,
        rationale=(
            f"Among the arguments on «{topic}», {best.debater_name}'s answer best balances "
            f"actionable structure with explicit risk awareness. (Demo mode: heuristic pick when no LLM.)"
        ),
        confidence="medium",
    )


def _extract_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        raise ValueError("Judge did not return JSON")
    return json.loads(m.group())


async def run_debate(
    req: DebateRequest,
    *,
    llm_api_key: str | None = None,
    llm_base_url: str | None = None,
    debate_model: str | None = None,
    judge_model: str | None = None,
) -> DebateResponse:
    topic = req.topic.strip()
    raw = req.debaters if req.debaters else _default_debaters()
    debaters: list[DebaterProfile] = []
    for d in raw:
        nid = d.id.strip() if d.id else str(uuid.uuid4())[:8]
        debaters.append(DebaterProfile(id=nid, name=d.name, stance=d.stance))

    api_key = (llm_api_key or "").strip() or (settings.openai_api_key or "")
    base_url = (llm_base_url or "").strip() or settings.openai_base_url
    dm = (debate_model or "").strip() or settings.debate_model
    jm = (judge_model or "").strip() or settings.judge_model

    use_llm = bool(api_key)
    turns: list[DebaterTurn] = []
    previous: str | None = None

    if use_llm:
        for debater in debaters:
            sys = (
                f"You are {debater.name} in a structured workplace debate. "
                f"Argue according to: {debater.stance} "
                "Be concise (under 180 words), professional, no markdown headings."
            )
            user_parts = [f"Topic: {topic}"]
            if previous:
                user_parts.append(f"Prior argument to respond to (briefly): {previous[:1200]}")
            content = await _openai_chat(
                [{"role": "system", "content": sys}, {"role": "user", "content": "\n".join(user_parts)}],
                dm,
                api_key,
                base_url,
            )
            turns.append(
                DebaterTurn(
                    debater_id=debater.id,
                    debater_name=debater.name,
                    stance=debater.stance,
                    content=content,
                )
            )
            previous = content
    else:
        for debater in debaters:
            content = _mock_debater_turn(topic, debater, previous)
            turns.append(
                DebaterTurn(
                    debater_id=debater.id,
                    debater_name=debater.name,
                    stance=debater.stance,
                    content=content,
                )
            )
            previous = content

    if use_llm:
        judge_sys = (
            "You are an impartial executive judge. Given the topic and each debater's argument, "
            "pick the single best answer for a business decision context. "
            "Return ONLY valid JSON with keys: winner_debater_id, winner_name, rationale (2-4 sentences), "
            "confidence (one of: low, medium, high). winner_debater_id must match one of the provided ids."
        )
        lines = [f"Topic: {topic}", "Debaters and arguments:"]
        for t in turns:
            lines.append(f"- id={t.debater_id} name={t.debater_name}: {t.content}")
        raw = await _openai_chat(
            [{"role": "system", "content": judge_sys}, {"role": "user", "content": "\n".join(lines)}],
            jm,
            api_key,
            base_url,
        )
        try:
            obj = _extract_json_object(raw)
            verdict = JudgeVerdict(
                winner_debater_id=str(obj["winner_debater_id"]),
                winner_name=str(obj["winner_name"]),
                rationale=str(obj["rationale"]),
                confidence=str(obj.get("confidence", "medium")).lower(),
            )
        except (KeyError, ValueError, json.JSONDecodeError):
            verdict = _mock_judge(topic, turns)
    else:
        verdict = _mock_judge(topic, turns)

    return DebateResponse(topic=topic, turns=turns, verdict=verdict, used_llm=use_llm)
