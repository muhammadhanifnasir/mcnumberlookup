import { logger } from "@/utils/logger";

export type QueueResult<T, R> = {
  input: T;
  result?: R;
  error?: string;
  success: boolean;
};

/**
 * Processes items one at a time in strict sequential order.
 * Never uses Promise.all or any form of parallel execution.
 */
export async function processSequentialQueue<T, R>(
  items: T[],
  processor: (item: T, index: number, total: number) => Promise<R>,
): Promise<QueueResult<T, R>[]> {
  const results: QueueResult<T, R>[] = [];

  logger.info("Starting sequential queue", { total: items.length });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item === undefined) continue;
    logger.info(`Processing queue item ${i + 1}/${items.length}`, {
      item: String(item),
    });

    try {
      const result = await processor(item, i, items.length);
      results.push({ input: item, result, success: true });
      logger.info(`Queue item ${i + 1}/${items.length} succeeded`, {
        item: String(item),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ input: item, error: message, success: false });
      logger.error(`Queue item ${i + 1}/${items.length} failed`, {
        item: String(item),
        error: message,
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  logger.info("Sequential queue completed", {
    total: items.length,
    succeeded,
    failed,
  });

  return results;
}
