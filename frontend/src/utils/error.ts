export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  const err = error as {
    message?: string;
    response?: { data?: { message?: string; detail?: string } | string };
  };
  return (
    (typeof err?.response?.data === 'object' ? err.response.data?.message : null) ||
    (typeof err?.response?.data === 'object' ? err.response.data?.detail : null) ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.message ||
    fallback
  );
}
