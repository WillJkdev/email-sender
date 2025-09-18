import { refreshAccessToken } from "@/lib/auth/google-refresh-token";
import { prisma } from "@/lib/database/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const account = await prisma.account.findFirst({
      where: { provider: "google" },
    });

    let accessToken = account?.access_token;
    let isHealthy = false;
    let healthDetails = "Sin conexión";

    // 🔄 Refrescar token si expiró
    if (
      account?.refresh_token &&
      (!accessToken || Date.now() >= (account.expires_at ?? 0) * 1000)
    ) {
      const newTokens = await refreshAccessToken(
        account.refresh_token,
        process.env.AUTH_GOOGLE_ID!,
        process.env.AUTH_GOOGLE_SECRET!
      );

      accessToken = newTokens.access_token;

      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: newTokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
        },
      });
    }

    // ✅ Chequear Gmail
    if (accessToken) {
      const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/profile",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.ok) {
        isHealthy = true;
        healthDetails = "Conexión Gmail OK";
      } else {
        const err = await res.json();
        healthDetails = `Error Gmail: ${err.error?.message || res.status}`;
      }
    }

    // ✅ Chequear Resend
    let hasResend = false;
    let resendDetails = "Resend no configurado";

    if (process.env.RESEND_API_KEY) {
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
        });

        if (r.ok) {
          hasResend = true;
          resendDetails = "Conexión Resend OK";
        } else {
          const err = await r.json();
          resendDetails = `Error Resend: ${err.error?.message || r.status}`;
        }
      } catch (err) {
        resendDetails = `Error Resend: ${(err as Error).message}`;
      }
    }

    return NextResponse.json({
      activeProvider: "gmail",
      providerDetails: {
        type: "Gmail",
        description: "Usando Gmail API con OAuth2",
      },
      hasGmail: !!accessToken,
      hasResend,
      isConfigured: true,
      isHealthy,
      healthDetails,
      resendDetails,
    });
  } catch (error) {
    console.error("[API] Error in config:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}
