type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

type ApiErrorEnvelope = {
  success: false;
  error: string;
};

type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

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
      (parsed && parsed.success === false && typeof parsed.error === "string" && parsed.error) ||
      raw.trim() ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (
    !parsed ||
    parsed.success !== true ||
    !Object.prototype.hasOwnProperty.call(parsed, "data")
  ) {
    throw new Error("Invalid server response format.");
  }

  return parsed.data;
}
