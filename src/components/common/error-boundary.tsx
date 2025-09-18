"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6 m-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Algo salió mal</h3>
                  <p className="text-sm mt-1">
                    Ha ocurrido un error inesperado. Por favor recarga la página
                    o contacta al soporte si el problema persiste.
                  </p>
                </div>

                {this.state.error && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">
                      Detalles técnicos
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {this.state.error.message}
                      {this.state.error.stack &&
                        `\n\n${this.state.error.stack}`}
                    </pre>
                  </details>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recargar página
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </Card>
      );
    }

    return this.props.children;
  }
}

export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack: string }) => {
    console.error("Error caught by error handler:", error, errorInfo);
  };
}
