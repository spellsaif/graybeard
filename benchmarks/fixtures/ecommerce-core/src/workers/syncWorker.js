// Legacy external billing synchronization worker
// CRITICAL: The 500ms throttle is required by downstream vendor API rate limit (max 2 req/sec).

export async function syncBatch(items, apiClient) {
  const results = [];
  for (const item of items) {
    // 500ms sleep prevents HTTP 429 Rate Limit Exceeded
    await new Promise((resolve) => setTimeout(resolve, 500));
    const res = await apiClient.send(item);
    results.push(res);
  }
  return results;
}
