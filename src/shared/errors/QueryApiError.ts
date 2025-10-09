import { ApiErrorResponse } from "@lib/types/api";

/**
 * Error personalizado para el frontend que contiene la respuesta de error del API.
 * Permite tipar el 'error' devuelto por useQuery/useMutation.
 */
export class QueryApiError extends Error {
    public apiError: ApiErrorResponse;
    public statusCode: number;

    constructor(apiError: ApiErrorResponse, statusCode: number) {
        super(apiError.error || "Ocurrió un error en el servidor.");
        this.name = "QueryApiError";
        this.apiError = apiError;
        this.statusCode = statusCode;
    }
}
