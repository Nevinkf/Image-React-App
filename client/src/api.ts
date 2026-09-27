// Throws with the server's `{ error }` message so the UI can show it
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? `HTTP ${res.status}`)
  }
  return (res.status === 204 ? null : await res.json()) as T
}

export function postJson<T>(url: string, body: unknown) {
  return api<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}