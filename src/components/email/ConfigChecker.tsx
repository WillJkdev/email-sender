"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Mail,
  RefreshCw,
  Settings,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ConfigStatus {
  activeProvider: string;
  providerDetails: {
    type?: string;
    description?: string;
    fromEmail?: string;
  };
  hasGmail: boolean;
  hasResend: boolean;
  isConfigured: boolean;
  isHealthy: boolean;
  healthDetails: string;
}

export function ConfigChecker() {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error("Error al verificar la configuración");
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Verificando configuración...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Error al verificar la configuración: {error}
          <Button
            variant="outline"
            size="sm"
            onClick={checkConfig}
            className="ml-2 bg-transparent"
          >
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!config) {
    return null;
  }

  // Colores diferenciados por proveedor
  const providerColor =
    config.providerDetails.type === "Gmail"
      ? "bg-blue-100 text-blue-800"
      : config.providerDetails.type === "Resend"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <h3 className="font-semibold">Estado de Configuración</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={checkConfig}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {config.isConfigured ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {config.isHealthy ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">
                {config.isHealthy
                  ? "Proveedor en buen estado"
                  : "Proveedor con problemas"}
              </span>
              <Badge className={providerColor}>
                {config.providerDetails.type || "Desconocido"}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>{config.providerDetails.description}</p>
              {config.providerDetails.fromEmail && (
                <p>
                  Email remitente:{" "}
                  <code>{config.providerDetails.fromEmail}</code>
                </p>
              )}
              <p>Detalles: {config.healthDetails}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>Gmail:</span>
                {config.hasGmail ? (
                  <Badge variant="outline" className="text-green-600">
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    No configurado
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>Resend:</span>
                {config.hasResend ? (
                  <Badge variant="outline" className="text-green-600">
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    No configurado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>No hay proveedores de email configurados.</p>
                <div className="text-sm">
                  <p>
                    <strong>Para usar Gmail:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Configure <code>GOOGLE_CLIENT_ID</code>
                    </li>
                    <li>
                      Configure <code>GOOGLE_CLIENT_SECRET</code>
                    </li>
                  </ul>
                  <p className="mt-2">
                    <strong>Para usar Resend:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Configure <code>RESEND_API_KEY</code>
                    </li>
                    <li>
                      Configure <code>RESEND_FROM_EMAIL</code> (opcional)
                    </li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
