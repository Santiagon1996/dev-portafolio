import { parseApiError } from '@lib/helpers/parseApiError';
/**
 * Función central para manejar la respuesta HTTP.
 */
export async function fetchApiClient<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, options);

    if (!res.ok) {
        const errorData = await res.json();
        throw parseApiError(errorData, res.status);
    }

    return res.json() as Promise<T>;
}