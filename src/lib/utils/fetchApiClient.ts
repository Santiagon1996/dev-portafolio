import { QueryApiError } from '@shared/errors/QueryApiError';
import { ApiErrorResponse } from '@lib/types/api';
/**
 * Función central para manejar la respuesta HTTP.
 */
export async function fetchApiClient<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, options);

    if (!res.ok) {
        const errorBody = (await res.json()) as ApiErrorResponse;
        // Lanzamos nuestro QueryApiError tipado que contiene la info del backend
        throw new QueryApiError(errorBody, res.status);
    }

    return res.json() as Promise<T>;
}