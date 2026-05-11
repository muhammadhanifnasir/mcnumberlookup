import { sleep } from "./delay";
import { logger } from "./logger";

export type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
};

/**
 * Executes fn, retrying on failure up to maxAttempts times with exponential back-off.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  label = "operation",
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1_000,
    maxDelayMs = 30_000,
    shouldRetry = () => true,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt >= maxAttempts || !shouldRetry(lastError, attempt)) {
        logger.error(`${label} failed after ${attempt} attempt(s)`, {
          error: lastError.message,
        });
        throw lastError;
      }

      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      logger.warn(`${label} attempt ${attempt}/${maxAttempts} failed – retrying in ${delay}ms`, {
        error: lastError.message,
      });
      await sleep(delay);
    }
  }

  throw lastError ?? new Error(`${label} failed after ${maxAttempts} attempts`);
}
