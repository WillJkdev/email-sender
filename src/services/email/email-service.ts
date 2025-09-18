import type { EmailProvider, EmailData, BulkEmailResult } from "./types"

export class EmailService {
  private provider: EmailProvider

  constructor(provider: EmailProvider) {
    this.provider = provider
  }

  async sendBulkEmails(
    emailData: EmailData[],
    subject: string,
    getEmailBody: (data: EmailData) => string,
  ): Promise<BulkEmailResult> {
    const result: BulkEmailResult = {
      success: 0,
      failed: 0,
      errors: [],
    }

    console.log(`[EmailService] Starting bulk email send to ${emailData.length} recipients`)

    for (const data of emailData) {
      try {
        const body = getEmailBody(data)
        await this.provider.send(data.email, subject, body)
        result.success++

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        result.failed++
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        result.errors.push(`Failed to send to ${data.email}: ${errorMessage}`)
        console.error(`[EmailService] Error sending to ${data.email}:`, error)
      }
    }

    console.log(`[EmailService] Bulk send completed. Success: ${result.success}, Failed: ${result.failed}`)
    return result
  }

  async sendSingleEmail(to: string, subject: string, body: string): Promise<void> {
    return this.provider.send(to, subject, body)
  }
}
