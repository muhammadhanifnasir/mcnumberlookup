type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

function tryParseJson<T>(raw: string): T | null {
  if (!raw.trim()) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  const parsed = tryParseJson<ApiEnvelope<T>>(raw);

  if (!response.ok) {
    const message =
      (parsed && typeof parsed.error === "string" && parsed.error) ||
      raw.trim() ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!parsed || parsed.success !== true || typeof parsed.data === "undefined") {
    throw new Error("Invalid server response format.");
  }

  return parsed.data;
}
