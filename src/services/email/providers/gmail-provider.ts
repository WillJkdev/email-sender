import type { EmailProvider } from "../types";

export class GmailProvider implements EmailProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      // 🔹 Codificar el asunto en UTF-8 Base64
      const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString(
        "base64"
      )}?=`;

      // Crear el mensaje en formato RFC 2822
      const message = [
        `To: ${to}`,
        `Subject: ${encodedSubject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "",
        body,
      ].join("\n");

      // Encode the message in base64url format
      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raw: encodedMessage,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gmail API error: ${error}`);
      }

      console.log(`[Gmail] Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`[Gmail] Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
