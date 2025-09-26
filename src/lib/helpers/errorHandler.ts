import { NextResponse } from "next/server";
import {
    BaseError,
    httpStatusByErrorType,
    ErrorType,
    JsonParseError,
} from "@shared/errors/errors";
import { ZodError } from "zod"; // Tipado correcto para errores de Zod

export function errorHandler(error: unknown) {
    // 1. Si es un error de nuestra app (incluye JsonParseError lanzados manualmente)
    if (error instanceof BaseError) {
        // ↑ Esto captura TODAS las clases que heredan de BaseError
        const statusCode = httpStatusByErrorType[error.type] ?? 500;
        return NextResponse.json(
            {
                error: error.publicMessage, // ← Accede a propiedades de BaseError
                details: error.details, // ← Funciona para todas las subclases
                type: error.type, // ← Diferencia el tipo específico
            },
            { status: statusCode }
        );
    }

    // 2. Si es un ZodError directo (caso raro, normalmente ya está convertido a ValidationError)
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Error de validación de datos",
                details: error.issues, // Tipado: ZodIssue[]
                type: ErrorType.VALIDATION,
            },
            { status: httpStatusByErrorType[ErrorType.VALIDATION] }
        );
    }

    // 3. 🔍 DETECTAR Y CONVERTIR ERRORES NATIVOS DE JSON PARSING
    // Next.js lanza SyntaxError para JSON malformado - necesitamos convertirlos
    if (error instanceof Error &&
        (error.name === 'SyntaxError' || error.message.includes('JSON')) &&
        (error.message.includes('Unexpected token') ||
            error.message.includes('Expected') ||
            error.message.includes('not valid JSON'))) {
        const jsonParseError = new JsonParseError(
            "JSON malformado - revise la sintaxis",
            { originalError: error.message },
            "Failed to parse request body as JSON"
        );
        const statusCode = httpStatusByErrorType[jsonParseError.type] ?? 400;
        return NextResponse.json(
            {
                error: jsonParseError.publicMessage,
                details: jsonParseError.details,
                type: jsonParseError.type,
            },
            { status: statusCode }
        );
    }

    // 4. 🔒 ERRORES DE JWT (token malformado o expirado)
    // Si el error es lanzado por la librería JWT, devolvemos 401 y tipo AUTHORIZATION
    if (
        error instanceof Error &&
        (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
    ) {
        return NextResponse.json(
            {
                error: error.message, // Mensaje de la librería JWT
                type: 'AUTHORIZATION'
            },
            { status: 401 }
        );
    }
    /**
     * 🔒 DOCUMENTACIÓN:
     * Este bloque captura errores lanzados por la librería JWT (jsonwebtoken).
     * Ejemplo: token malformado, expirado, firma inválida, etc.
     * Así, cualquier error de autenticación por token inválido se gestiona como 401 Unauthorized
     * y se unifica el formato de respuesta para el frontend.
     */

    // 5. Si es un error nativo de JavaScript
    if (error instanceof Error) {
        return NextResponse.json(
            {
                error: error.message || "Error desconocido",
                type: ErrorType.SYSTEM,
            },
            { status: httpStatusByErrorType[ErrorType.SYSTEM] }
        );
    }

    // 6. Caso final: error desconocido que no es Error
    return NextResponse.json(
        {
            error: "Error interno del servidor",
            type: ErrorType.SYSTEM,
        },
        { status: httpStatusByErrorType[ErrorType.SYSTEM] }
    );
}
/**
 * 🧠 EXPLICACIÓN DEL HANDLER DE ERRORES CON TYPESCRIPT Y NEXT.JS
 *
 * 1- Importación de tipos y errores personalizados:  
 *    → Se importan clases de error personalizadas desde `@shared/errors/error` para discriminarlos.
 *
 * 2- Manejo de errores específicos:
 *    - Si el error es una instancia de `BaseError`, se obtiene el código HTTP correspondiente del mapa `httpStatusByErrorType`.
 *    - Se retorna una respuesta JSON con el mensaje público, detalles y tipo del error.
 *
 * 3- Manejo de errores de validación:
 *    - Si el error es una instancia de `ZodError`, se retorna un mensaje específico de validación con los detalles de los problemas encontrados.
 *
 * 4- Manejo de errores nativos:
 *    - Si el error es una instancia de `Error`, se retorna un mensaje genérico del sistema.
 *
 * 5- Manejo de errores desconocidos:
 *    - Si el error no es una instancia de `Error`, se retorna un mensaje genérico indicando un error interno del servidor.
 */