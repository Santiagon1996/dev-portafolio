// import { jsonBodyParser } from "./jsonBodyParser";
// import { errors } from "../shared/errors/errors";
// const { NotFoundError, SystemError, UnauthorizedError } = errors;

// // Mapeo declarativo de códigos de estado a errores
// const errorMap: Record<number, typeof SystemError> = {
//     401: UnauthorizedError,
//     404: NotFoundError,
//     500: SystemError,
// };
// export async function apiClient<T>(endpoint: string): Promise<T> {
//     const res = await fetch(`${API_BASE_URL}${endpoint}`);

//     if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}));

//         const ErrorClass = errorMap[res.status] || SystemError;
//         throw new ErrorClass(
//             `Error en la solicitud: ${res.statusText}`,
//             { status: res.status, statusText: res.statusText, ...errorData },
//             `apiClient: respuesta no OK (${res.status})`
//         );
//     }

//     return jsonBodyParser<T>(res);

// }