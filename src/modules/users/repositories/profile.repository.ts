/**
 * Repository for user profile API calls.
 */
export async function fetchProfileMe(token?: string): Promise<any> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/profiles/me`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch {}
    throw new Error(`Profile fetch failed: ${res.status} ${errorText}`);
  }
  return res.json();
}
