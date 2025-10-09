// types/api.ts

// Mapeamos las propiedades públicas de tu BaseError y ErrorType
export type ErrorType =
    "DUPLICITY" | "VALIDATION" | "CREDENTIALS" | "NOT_FOUND" | "SYSTEM" |
    "OWNERSHIP" | "AUTHORIZATION" | "JSON_PARSE";

export type ErrorDetails = Record<string, unknown> | unknown[];

// La estructura exacta que tu API devuelve en caso de error (res.json())
export interface ApiErrorResponse {
    error: string;         // Mapea a error.publicMessage
    details?: ErrorDetails;
    type: ErrorType;       // Mapea a error.type
}