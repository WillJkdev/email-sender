import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { EmailTemplates } from "@/lib/email/templates";
import { EmailService, GmailProvider, ResendProvider } from "@/services/email";
import type { BulkEmailResult, EmailData } from "@/services/email/types";
import { type NextRequest, NextResponse } from "next/server";

interface SendEmailsRequest {
  emailData: EmailData[];
  subject: string;
  customMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailsRequest = await request.json();
    const { emailData, subject, customMessage } = body;

    if (!emailData || !Array.isArray(emailData) || emailData.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron datos de email válidos" },
        { status: 400 }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "El asunto del correo es requerido" },
        { status: 400 }
      );
    }

    for (const data of emailData) {
      if (!data.email || !data.name || !data.description) {
        return NextResponse.json(
          {
            error: "Todos los registros deben tener email, name y description",
          },
          { status: 400 }
        );
      }
    }

    console.log(
      `[API] Starting bulk email send for ${emailData.length} recipients`
    );

    const emailService = await getEmailService();

    const getEmailBody = (data: EmailData): string => {
      return customMessage
        ? EmailTemplates.getCustomTemplate(data, customMessage)
        : EmailTemplates.getDefaultTemplate(data);
    };

    const result: BulkEmailResult = await emailService.sendBulkEmails(
      emailData,
      subject,
      getEmailBody
    );

    console.log(
      `[API] Bulk email send completed. Success: ${result.success}, Failed: ${result.failed}`
    );

    return NextResponse.json({
      success: result.success,
      failed: result.failed,
      errors: result.errors,
      message: `Proceso completado. ${result.success} correos enviados exitosamente.`,
    });
  } catch (error) {
    console.error("[API] Error in send-emails:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json(
      {
        error: "Error al procesar la solicitud de envío de correos",
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
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (googleAccount.expires_at && googleAccount.expires_at <= nowInSeconds) {
      console.log("[API] Access token expired, refreshing...");

      if (!googleAccount.refresh_token) {
        throw new Error("No hay refresh_token para renovar el access_token");
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

      console.log("[API] Access token refreshed via refresh_token");
    }

    console.log("[API] Using Gmail provider");
    const gmailProvider = new GmailProvider(accessToken);
    return new EmailService(gmailProvider);
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";
    const resendProvider = new ResendProvider(resendApiKey, fromEmail);
    return new EmailService(resendProvider);
  }

  throw new Error("No hay proveedores de email configurados");
}
