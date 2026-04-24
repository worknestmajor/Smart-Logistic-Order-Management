export function unwrapApiData<T>(response: { data?: unknown }): T {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function unwrapApiList<T>(response: { data?: unknown }): T[] {
  const payload = unwrapApiData<unknown>(response);
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray((payload as { results?: T[] }).results)) {
    return (payload as { results: T[] }).results;
  }
  return [];
}
