const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = `Server returned status ${response.status}`;
      try {
        const errJson = JSON.parse(text);
        if (errJson.message) msg = errJson.message;
      } catch {
        if (text) msg = text;
      }
      throw new Error(msg);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: true, text };
    }
  } catch (err) {
    console.warn(`[GCCS API] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export async function getSystemStatus() {
  return request('/status');
}

