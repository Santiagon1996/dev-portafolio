import { ApiErrorResponse, ErrorDetails } from "@lib/types/apiError.types";
import { QueryApiError } from "@shared/errors/QueryApiError";

/**
 * Recibe la respuesta de error de la API y devuelve una instancia de QueryApiError.
 * Garantiza que el error esté tipado y estructurado para el frontend.
 */
export function parseApiError(errorData: unknown, statusCode: number): QueryApiError {
    // Si el error ya es una instancia de QueryApiError, lo retorna directamente
    if (errorData instanceof QueryApiError) return errorData;

    // Si el error tiene la estructura esperada, lo envuelve
    if (
        errorData &&
        typeof errorData === "object" &&
        "error" in errorData
    ) {
        return new QueryApiError(errorData as ApiErrorResponse, statusCode);
    }

    // Si no, crea un error genérico
    return new QueryApiError({
        error: "Error desconocido de la API",
        type: "SYSTEM",
        details: Array.isArray(errorData) || typeof errorData === "object"
    ? (errorData as ErrorDetails)
    : undefined,
    }, statusCode);
}