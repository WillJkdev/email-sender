"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileParser } from "@/lib/parsers/file-parser";
import type { EmailData } from "@/services/email/types";
import { FileSpreadsheet, FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileProcessed: (data: EmailData[]) => void;
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    const allowedTypes = [".xlsx", ".xls", ".csv"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Archivo no válido", {
        description:
          "Solo se permiten archivos Excel (.xlsx, .xls) y CSV (.csv)",
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const result = await FileParser.parseFile(file);

      if (result.errors.length > 0) {
        toast.error("Errores en el archivo", {
          description: `Se encontraron ${result.errors.length} errores. Revisa la consola para más detalles.`,
        });
        console.error("Errores de parsing:", result.errors);
      }

      if (result.data.length === 0) {
        toast.error("Sin datos válidos", {
          description: "No se encontraron datos válidos en el archivo",
        });
        return;
      }

      onFileProcessed(result.data);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error", {
        description: "Error al procesar el archivo",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension === "csv" ? FileText : FileSpreadsheet;
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 text-center space-y-4">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Arrastra tu archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-muted-foreground">
                Formatos soportados: Excel (.xlsx, .xls) y CSV (.csv)
              </p>
            </div>
            <Button variant="outline" className="mt-4 bg-transparent">
              Seleccionar Archivo
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {React.createElement(getFileIcon(selectedFile.name), {
                className: "h-8 w-8 text-primary",
              })}
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isProcessing && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Procesando archivo...
              </p>
            </div>
          )}
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          <strong>Formato requerido:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>
            Columna de <strong>email</strong> (email, correo, e-mail, mail)
          </li>
          <li>
            Columna de <strong>nombre</strong> (name, nombre, full name,
            fullname)
          </li>
          <li>
            Columna de <strong>descripción</strong> (description, descripcion,
            desc, message, mensaje)
          </li>
        </ul>
      </div>
    </div>
  );
}
