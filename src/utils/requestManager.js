const activeRequests = new Map();

/** Cancels an in-flight request with the same key before starting a replacement. */
export async function runCancellableRequest(key, task) {
  activeRequests.get(key)?.abort();
  const controller = new AbortController();
  activeRequests.set(key, controller);
  try {
    return await task(controller.signal);
  } finally {
    if (activeRequests.get(key) === controller) activeRequests.delete(key);
  }
}

export function cancelRequest(key) {
  activeRequests.get(key)?.abort();
  activeRequests.delete(key);
}
