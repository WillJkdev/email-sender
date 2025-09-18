"use client";

import { ConfigChecker } from "@/components/email/ConfigChecker";
import { DataPreview } from "@/components/email/DataPreview";
import { EmailForm } from "@/components/email/EmailForm";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { FileUpload } from "@/components/email/FileUpload";
import { TestEmail } from "@/components/email/TestEmail";
import type { EmailData } from "@/services/email/types";
import { useState } from "react";
import { toast } from "sonner";

export function MainContent() {
  const [emailData, setEmailData] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileProcessed = (data: EmailData[]) => {
    setEmailData(data);
    toast.success("Archivo procesado", {
      description: `Se cargaron ${data.length} registros correctamente`,
    });
  };

  const handleSendEmails = async (subject: string, customMessage?: string) => {
    if (emailData.length === 0) {
      toast.error("Error", {
        description:
          "No hay datos para enviar. Por favor carga un archivo primero.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailData,
          subject,
          customMessage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar correos");
      }

      toast.success("Correos enviados", {
        description: `${result.success} correos enviados exitosamente. ${result.failed} fallaron.`,
      });

      if (result.errors && result.errors.length > 0) {
        console.error("Errores al enviar correos:", result.errors);
        toast.error("Algunos correos fallaron", {
          description: `${result.errors.length} correos no pudieron ser enviados. Revisa la consola para más detalles.`,
        });
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Error desconocido al enviar correos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                Envío Masivo de Correos
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sube un archivo Excel o CSV con los datos de tus contactos y
                envía correos personalizados de forma masiva.
              </p>
            </div>

            {/* Configuration Status */}
            <ConfigChecker />

            {/* Test Email */}
            <TestEmail />

            {/* File Upload Section */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                1. Cargar Archivo
              </h2>
              <FileUpload onFileProcessed={handleFileProcessed} />
            </div>

            {/* Data Preview Section */}
            {emailData.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                  2. Vista Previa de Datos
                </h2>
                <DataPreview data={emailData} />
              </div>
            )}

            {/* Email Form Section */}
            {emailData.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                  3. Configurar y Enviar Correos
                </h2>
                <EmailForm
                  onSendEmails={handleSendEmails}
                  isLoading={isLoading}
                  totalRecipients={emailData.length}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
