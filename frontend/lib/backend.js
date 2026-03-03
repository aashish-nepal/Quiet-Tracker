import { env } from './env';

export async function backendFetch(path, { method = 'GET', userId, body, headers = {} } = {}) {
  const finalHeaders = {
    ...headers
  };

  if (userId) {
    finalHeaders['x-user-id'] = userId;
  }

  let payload;
  if (body !== undefined) {
    finalHeaders['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${env.backendUrl}${path}`, {
    method,
    headers: finalHeaders,
    body: payload,
    cache: 'no-store'
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(data?.error || 'Backend request failed');
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}
