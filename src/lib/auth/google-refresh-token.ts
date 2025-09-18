export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("No se pudo refrescar el token");

  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
  }>;
}
