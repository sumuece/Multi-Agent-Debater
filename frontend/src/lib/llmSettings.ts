function pingUi() {
  try {
    window.dispatchEvent(new Event("mad-local-storage"));
  } catch {
    /* no window */
  }
}

const KEY_API = "multi_agent_debater_llm_api_key";
const KEY_BASE = "multi_agent_debater_llm_base_url";
const KEY_DEBATE_MODEL = "multi_agent_debater_llm_debate_model";
const KEY_JUDGE_MODEL = "multi_agent_debater_llm_judge_model";

export type LlmSettings = {
  apiKey: string;
  baseUrl: string;
  debateModel: string;
  judgeModel: string;
};

export function getLlmSettings(): LlmSettings {
  try {
    return {
      apiKey: localStorage.getItem(KEY_API) ?? "",
      baseUrl: localStorage.getItem(KEY_BASE) ?? "",
      debateModel: localStorage.getItem(KEY_DEBATE_MODEL) ?? "",
      judgeModel: localStorage.getItem(KEY_JUDGE_MODEL) ?? "",
    };
  } catch {
    return { apiKey: "", baseUrl: "", debateModel: "", judgeModel: "" };
  }
}

/** Updates URL/models always. Set `newApiKey` only when replacing the key; omit to leave the stored key as-is. */
export function saveLlmSettings(
  fields: {
    baseUrl: string;
    debateModel: string;
    judgeModel: string;
    newApiKey?: string;
  }
) {
  if (fields.newApiKey !== undefined && fields.newApiKey.trim()) {
    localStorage.setItem(KEY_API, fields.newApiKey.trim());
  }
  const bu = fields.baseUrl.trim();
  if (bu) localStorage.setItem(KEY_BASE, bu);
  else localStorage.removeItem(KEY_BASE);
  const dm = fields.debateModel.trim();
  if (dm) localStorage.setItem(KEY_DEBATE_MODEL, dm);
  else localStorage.removeItem(KEY_DEBATE_MODEL);
  const jm = fields.judgeModel.trim();
  if (jm) localStorage.setItem(KEY_JUDGE_MODEL, jm);
  else localStorage.removeItem(KEY_JUDGE_MODEL);
  pingUi();
}

export function clearLlmApiKey() {
  localStorage.removeItem(KEY_API);
  pingUi();
}

export function hasStoredLlmKey(): boolean {
  return Boolean(getLlmSettings().apiKey);
}
