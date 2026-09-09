/**
 * Central request gateway. Domain modules deliberately contain no guessed routes.
 * Add verified Crow paths there once the backend source is available.
 */
import { runCancellableRequest } from '../utils/requestManager';

export class BackendContractPendingError extends Error {
  constructor(domain) {
    super(`${domain} API contract has not been verified against the Crow backend.`);
    this.name = 'BackendContractPendingError';
  }
}

export async function request(path, options = {}, requestKey = path) {
  return runCancellableRequest(requestKey, async (signal) => {
    const response = await fetch(path, {
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
      signal,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status}).`);
    return response.status === 204 ? null : response.json();
  });
}

export function contractPending(domain) {
  return Promise.reject(new BackendContractPendingError(domain));
}
