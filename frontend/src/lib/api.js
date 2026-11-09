const apiBase = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://askyra-tech.vercel.app" : "")
).replace(/\/$/, "");

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${apiBase}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      data?.error ?? `Request failed (${response.status}).`,
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
