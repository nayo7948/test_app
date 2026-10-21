/**
 * JSON fetch for client components; throws an Error carrying the server's message.
 * A FormData body is sent as multipart (for file uploads), anything else as JSON.
 */
export async function api<T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(url, {
    method,
    headers: body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "요청에 실패했어요. 잠시 후 다시 시도해주세요.");
  return data as T;
}
