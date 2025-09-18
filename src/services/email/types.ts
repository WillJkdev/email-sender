export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<void>
}

export interface EmailData {
  email: string
  name: string
  description: string
}

export interface BulkEmailResult {
  success: number
  failed: number
  errors: string[]
}
