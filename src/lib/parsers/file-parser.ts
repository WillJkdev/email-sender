import * as XLSX from "xlsx"
import Papa from "papaparse"
import type { EmailData } from "@/services/email/types"

export interface ParseResult {
  data: EmailData[]
  errors: string[]
}

export class FileParser {
  static async parseFile(file: File): Promise<ParseResult> {
    const result: ParseResult = {
      data: [],
      errors: [],
    }

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension === "xlsx" || fileExtension === "xls") {
        return await this.parseExcelFile(file)
      } else if (fileExtension === "csv") {
        return await this.parseCSVFile(file)
      } else {
        result.errors.push("Formato de archivo no soportado. Solo se permiten archivos .xlsx, .xls y .csv")
        return result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el archivo"
      result.errors.push(`Error al procesar el archivo: ${errorMessage}`)
      return result
    }
  }

  private static async parseExcelFile(file: File): Promise<ParseResult> {
    const result: ParseResult = {
      data: [],
      errors: [],
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        result.errors.push("El archivo Excel no contiene hojas de trabajo")
        return result
      }

      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

      if (jsonData.length === 0) {
        result.errors.push("El archivo Excel está vacío")
        return result
      }

      // Process the data
      return this.processRawData(jsonData, result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      result.errors.push(`Error al procesar archivo Excel: ${errorMessage}`)
      return result
    }
  }

  private static async parseCSVFile(file: File): Promise<ParseResult> {
    const result: ParseResult = {
      data: [],
      errors: [],
    }

    return new Promise((resolve) => {
      Papa.parse(file, {
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              result.errors.push(...results.errors.map((err) => `Error CSV: ${err.message}`))
            }

            if (!results.data || results.data.length === 0) {
              result.errors.push("El archivo CSV está vacío")
              resolve(result)
              return
            }

            const processedResult = this.processRawData(results.data as string[][], result)
            resolve(processedResult)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido"
            result.errors.push(`Error al procesar archivo CSV: ${errorMessage}`)
            resolve(result)
          }
        },
        error: (error) => {
          result.errors.push(`Error al leer archivo CSV: ${error.message}`)
          resolve(result)
        },
      })
    })
  }

  private static processRawData(rawData: string[][], result: ParseResult): ParseResult {
    if (rawData.length < 2) {
      result.errors.push("El archivo debe contener al menos una fila de encabezados y una fila de datos")
      return result
    }

    const headers = rawData[0].map((header) => header?.toString().toLowerCase().trim() || "")
    const dataRows = rawData.slice(1)

    // Find column indices
    const emailIndex = this.findColumnIndex(headers, ["email", "correo", "e-mail", "mail"])
    const nameIndex = this.findColumnIndex(headers, ["name", "nombre", "full name", "fullname"])
    const descriptionIndex = this.findColumnIndex(headers, ["description", "descripcion", "desc", "message", "mensaje"])

    if (emailIndex === -1) {
      result.errors.push("No se encontró una columna de email. Las columnas válidas son: email, correo, e-mail, mail")
      return result
    }

    if (nameIndex === -1) {
      result.errors.push(
        "No se encontró una columna de nombre. Las columnas válidas son: name, nombre, full name, fullname",
      )
      return result
    }

    if (descriptionIndex === -1) {
      result.errors.push(
        "No se encontró una columna de descripción. Las columnas válidas son: description, descripcion, desc, message, mensaje",
      )
      return result
    }

    // Process each row
    dataRows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because we start from row 1 (0-indexed) and skip header

      const email = row[emailIndex]?.toString().trim() || ""
      const name = row[nameIndex]?.toString().trim() || ""
      const description = row[descriptionIndex]?.toString().trim() || ""

      if (!email) {
        result.errors.push(`Fila ${rowNumber}: Email vacío`)
        return
      }

      if (!this.isValidEmail(email)) {
        result.errors.push(`Fila ${rowNumber}: Email inválido (${email})`)
        return
      }

      if (!name) {
        result.errors.push(`Fila ${rowNumber}: Nombre vacío`)
        return
      }

      if (!description) {
        result.errors.push(`Fila ${rowNumber}: Descripción vacía`)
        return
      }

      result.data.push({
        email,
        name,
        description,
      })
    })

    console.log(`[FileParser] Procesadas ${result.data.length} filas válidas, ${result.errors.length} errores`)
    return result
  }

  private static findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex((header) => header.includes(name))
      if (index !== -1) return index
    }
    return -1
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
