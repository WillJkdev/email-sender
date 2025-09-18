import type { EmailData } from "@/services/email/types"

export class EmailTemplates {
  static getDefaultTemplate(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Hola ${data.name},</h2>
            </div>
            <div class="content">
              <p>${data.description}</p>
            </div>
            <div class="footer">
              <p>Este correo fue enviado automáticamente. Por favor no responder a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  static getCustomTemplate(data: EmailData, customMessage: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Hola ${data.name},</h2>
            </div>
            <div class="content">
              <p>${customMessage.replace(/\{name\}/g, data.name).replace(/\{description\}/g, data.description)}</p>
            </div>
            <div class="footer">
              <p>Este correo fue enviado automáticamente. Por favor no responder a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
