"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, TestTube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TestEmail() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Error", {
        description: "Por favor ingresa un email válido",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Correo de prueba - Sistema de envío masivo",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar correo de prueba");
      }

      toast.success("Correo enviado", {
        description: result.message,
      });

      setEmail("");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Error desconocido al enviar correo de prueba",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <h3 className="font-semibold">Probar Configuración</h3>
        </div>

        <form onSubmit={handleTestEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email de prueba</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar correo de prueba
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          Esto enviará un correo de prueba para verificar que la configuración
          funciona correctamente.
        </p>
      </div>
    </Card>
  );
}
