/** Must support `response_format: { type: "json_object" }` on Groq chat completions. */
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim();
  return key ? key : null;
}

export function getGroqModel(): string {
  const configured = process.env.GROQ_MODEL?.trim();
  return configured || DEFAULT_GROQ_MODEL;
}

export const GROQ_REQUEST_TIMEOUT_MS = 25_000;

export const GROQ_DEFAULT_MODEL = DEFAULT_GROQ_MODEL;
