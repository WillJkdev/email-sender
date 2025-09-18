import type { EmailProvider } from "../types"

export class ResendProvider implements EmailProvider {
  private apiKey: string
  private fromEmail: string

  constructor(apiKey: string, fromEmail = "noreply@yourdomain.com") {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: subject,
          html: body,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${error}`)
      }

      console.log(`[Resend] Email sent successfully to ${to}`)
    } catch (error) {
      console.error(`[Resend] Failed to send email to ${to}:`, error)
      throw error
    }
  }
}
