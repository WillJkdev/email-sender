"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Mail } from "lucide-react"

interface EmailFormProps {
  onSendEmails: (subject: string, customMessage?: string) => void
  isLoading: boolean
  totalRecipients: number
}

export function EmailForm({ onSendEmails, isLoading, totalRecipients }: EmailFormProps) {
  const [subject, setSubject] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [useCustomMessage, setUseCustomMessage] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim()) {
      return
    }

    onSendEmails(subject, useCustomMessage ? customMessage : undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto del correo *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Información importante para ti"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomMessage"
                checked={useCustomMessage}
                onChange={(e) => setUseCustomMessage(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="useCustomMessage">Usar mensaje personalizado</Label>
            </div>

            {useCustomMessage && (
              <div className="space-y-2">
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Escribe tu mensaje personalizado aquí. Puedes usar {name} y {description} como variables."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles: <code>{"{name}"}</code> y <code>{"{description}"}</code>
                </p>
              </div>
            )}
          </div>
        </div>

        <Card className="p-4 bg-muted/50">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Resumen del envío</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Destinatarios:</span>
                <Badge variant="secondary">{totalRecipients}</Badge>
              </div>

              <div className="flex justify-between">
                <span>Proveedor:</span>
                <Badge variant="outline">Gmail (por defecto)</Badge>
              </div>

              {!useCustomMessage && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded">
                  <strong>Plantilla por defecto:</strong>
                  <br />
                  Se usará el nombre y descripción de cada contacto automáticamente.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button type="submit" disabled={!subject.trim() || isLoading} size="lg" className="min-w-48">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Enviando correos...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar {totalRecipients} correos
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
