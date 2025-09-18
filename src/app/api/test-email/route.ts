import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { EmailTemplates } from "@/lib/email/templates";
import { EmailService, GmailProvider, ResendProvider } from "@/services/email";
import { type NextRequest, NextResponse } from "next/server";

interface TestEmailRequest {
  to: string;
  subject?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TestEmailRequest = await request.json();
    const { to, subject = "Correo de prueba" } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!to || !emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Email de destino inválido" },
        { status: 400 }
      );
    }

    console.log(`[API] Sending test email to ${to}`);

    // Obtener servicio de email
    const emailService = await getEmailService();

    // Crear datos de prueba
    const testData = {
      email: to,
      name: "Usuario de Prueba",
      description:
        "Este es un correo de prueba para verificar que el sistema de envío funciona correctamente.",
    };

    // Enviar correo de prueba
    const emailBody = EmailTemplates.getDefaultTemplate(testData);
    await emailService.sendSingleEmail(to, subject, emailBody);

    console.log(`[API] Test email sent successfully to ${to}`);

    return NextResponse.json({
      success: true,
      message: `Correo de prueba enviado exitosamente a ${to}`,
    });
  } catch (error) {
    console.error("[API] Error in test-email:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json(
      {
        error: "Error al enviar correo de prueba",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

async function getEmailService(): Promise<EmailService> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Usuario no autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { accounts: true },
  });

  const googleAccount = user?.accounts.find((acc) => acc.provider === "google");

  if (googleAccount?.access_token) {
    let accessToken = googleAccount.access_token;
    const now = Math.floor(Date.now() / 1000);

    if (googleAccount.expires_at && googleAccount.expires_at <= now) {
      console.log("[API] Token expirado, refrescando...");

      if (!googleAccount.refresh_token) {
        throw new Error("No hay refresh_token para renovar el token");
      }

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret: process.env.AUTH_GOOGLE_SECRET!,
          refresh_token: googleAccount.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      const newTokens = await tokenRes.json();

      if (!tokenRes.ok || !newTokens.access_token) {
        console.error("[API] Error refreshing token:", newTokens);
        throw new Error("No se pudo renovar el access_token");
      }

      accessToken = newTokens.access_token;

      await prisma.account.update({
        where: { id: googleAccount.id },
        data: {
          access_token: newTokens.access_token,
          expires_at: Math.floor(
            Date.now() / 1000 + (newTokens.expires_in ?? 3600)
          ),
        },
      });

      console.log("[API] Token renovado correctamente");
    }

    console.log("[API] Usando Gmail provider");
    return new EmailService(new GmailProvider(accessToken));
  }

  // fallback → Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";
    return new EmailService(new ResendProvider(resendApiKey, fromEmail));
  }

  throw new Error("No hay proveedores de email configurados");
}
