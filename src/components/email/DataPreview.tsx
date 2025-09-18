"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EmailData } from "@/services/email/types"

interface DataPreviewProps {
  data: EmailData[]
}

export function DataPreview({ data }: DataPreviewProps) {
  const maxRows = 10

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{data.length} registros cargados</Badge>
          {data.length > maxRows && <Badge variant="outline">Mostrando primeros {maxRows}</Badge>}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.slice(0, maxRows).map((row, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{row.email}</td>
                  <td className="px-4 py-3 text-sm">{row.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="max-w-xs truncate" title={row.description}>
                      {row.description}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {data.length > maxRows && (
        <p className="text-sm text-muted-foreground text-center">... y {data.length - maxRows} registros más</p>
      )}
    </div>
  )
}
