import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Admin, CreateAdminData, UpdateAdminData, AdminListResult, LoginResponse } from '@lib/types/admin.types';
import { fetchApiClient } from '@lib/utils/fetchApiClient';
import { QueryApiError } from '@shared/errors/QueryApiError';

const ADMIN_QUERY_KEY = 'admin'
/**
 * Hook para obtener un admin por ID.
 * - useQuery se usa para consultas GET (lectura).
 * - queryKey: identifica de forma única la consulta en la caché.
 * - queryFn: función que realiza la petición.
 * - enabled: solo ejecuta la consulta si hay un ID.
 *
 * Destructuración:
 * const { data, error, isLoading, isSuccess, isError, refetch } = useAdminById(id);
 * - data: Admin | undefined
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - refetch: función para volver a consultar
 * Dentro de useQuery<aqui le va el tipo de dato que retorna, y el tipo de error que puede dar>
 */
export function useAdminById(id: string | null) {
    return useQuery<Admin, QueryApiError>({
        queryKey: [ADMIN_QUERY_KEY, id],
        queryFn: () => fetchApiClient<Admin>(`/api/admin/${id}`, {
            credentials: 'include', // <-- Esto envía la cookie con el JWT
        }),
        enabled: !!id,
    });
}

/**
 * Hook para crear un nuevo admin.
 * - useMutation se usa para operaciones que modifican datos (POST, PUT, PATCH, DELETE).
 * - mutationFn: función que realiza la petición POST.
 * - onSuccess: callback que se ejecuta si la mutación fue exitosa.
 *   - invalidateQueries: fuerza la recarga de la consulta 'admin' para mantener los datos actualizados.
 *
 * Destructuración:
 * const { mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset } = useCreateAdmin();
 * - mutate: función para ejecutar la mutación (mutate(adminData))
 * - mutateAsync: igual que mutate pero retorna una promesa
 * - data: Admin | undefined (admin creado)
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - reset: función para resetear el estado del hook
 * Dentro de useMutation<va el tipo de dato que retorna, el tipo de error, y el tipo de dato que recibe la mutación>
 */
export function useCreateAdmin() {
    // Inicializa el cliente de consultas para gestionar la caché.
    const queryClient = useQueryClient();

    // Define la mutación con tipado estricto.
    return useMutation<Admin, QueryApiError, CreateAdminData>({
        // TData: IAdmin (el tipo del administrador creado, devuelto por el servidor)
        // TError: QueryApiError (error tipado)
        // TVariables: Partial<IAdmin> (el objeto de datos que se envía, excluyendo el ID, que es generado por el servidor)

        // mutationFn: función asíncrona que ejecuta la API call POST.
        mutationFn: (adminData) => fetchApiClient<Admin>('/api/admin/register', {
            method: 'POST', // Método HTTP para creación de recursos.
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData), // Envía los datos del nuevo administrador.
        }),

        // onSuccess se ejecuta cuando el nuevo administrador ha sido creado exitosamente.
        // Recibe la respuesta del servidor (newAdmin) y las variables de entrada (variables).
        onSuccess: (newAdmin) => {
            // 1. INVALIDEZ BÁSICA: Invalida la lista completa.
            // Esto es una red de seguridad. Forzará el refetch en segundo plano.
            queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });

            // 2. OPTIMIZACIÓN DE CACHÉ DE LISTA (MEJOR PRÁCTICA):
            // Actualiza la caché de la lista directamente con el nuevo ítem.
            // Esto hace que el nuevo administrador aparezca INSTANTÁNEAMENTE en la tabla sin esperar el refetch.
            queryClient.setQueryData(
                [ADMIN_QUERY_KEY],
                (oldData: AdminListResult | undefined) => {
                    // Asumimos que oldData es un objeto que contiene una lista 'admins'.
                    // Verifica que los datos antiguos existan y tengan una propiedad 'admins' (la lista).
                    if (oldData && oldData.admins) {
                        // Agrega el nuevo administrador al inicio de la lista existente.
                        return {
                            ...oldData,
                            admins: [newAdmin, ...oldData.admins],
                        };
                    }
                    // Si no hay datos antiguos, simplemente retorna los datos (o invoca el refetch).
                    return oldData;
                }
            );
        },
    });
}

/**
 * Hook para actualizar un admin existente.
 * - mutationFn: realiza la petición PATCH con los datos a actualizar.
 * - onSuccess: invalida la consulta ADMIN_QUERY_KEY para refrescar los datos.
 *
 * Destructuración:
 * const { mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset } = useUpdateAdmin();
 * - mutate: función para ejecutar la mutación (mutate({ id, data }))
 * - mutateAsync: igual que mutate pero retorna una promesa
 * - data: IAdmin | undefined (admin actualizado)
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - reset: función para resetear el estado del hook
 * Dentro de useMutation<va el tipo de dato que retorna, el tipo de error, y el tipo de dato que recibe la mutación, exepto el ID que es aparte, que no se actualiza>
 */
export function useUpdateAdmin() {
    // Inicializa el cliente de consultas. Necesario para interactuar con la caché de Tanstack Query (ej. invalidar).
    const queryClient = useQueryClient();

    // Define la mutación con tipado estricto.
    return useMutation<Admin, QueryApiError, { id: string; data: UpdateAdminData }>({
        // TData: IAdmin (el tipo de la respuesta exitosa del servidor)
        // TError: QueryApiError (el tipo de error tipado que lanzamos)
        // TVariables: { id: string; data: Partial<IAdmin> } (el tipo exacto de los datos de entrada)

        // mutationFn es la función asíncrona que realiza la llamada a la API.
        mutationFn: ({ id, data }) => fetchApiClient<Admin>(`/api/admin/${id}`, {
            // El 'id' se extrae de las variables para construir la URL del recurso específico.
            // El 'data' se usa en el cuerpo (body).
            method: 'PATCH', // Usamos PATCH para actualizaciones parciales (solo los campos modificados).
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',

            body: JSON.stringify(data),
        }),

        // onSuccess se ejecuta inmediatamente después de que la mutación es exitosa.
        // Recibe la respuesta del servidor (updatedAdmin) y las variables de entrada (variables).
        onSuccess: (updatedAdmin, variables) => {
            //  1. ACTUALIZACIÓN DIRECTA (Mejor Práctica):
            // Aplica la respuesta del servidor (updatedAdmin) directamente a la caché del ítem individual.
            // Esto actualiza la vista de detalle instantáneamente sin una llamada GET adicional.
            queryClient.setQueryData([ADMIN_QUERY_KEY, variables.id], updatedAdmin);;

            // 2. INVALIDEZ DE LISTA: Invalida la lista completa (para reflejar cambios en la tabla)
            // Esto asegura que la tabla principal (ej: useFetchAdmins) se refetchee, mostrando el dato actualizado.
            // Esta invalidez es necesaria porque el cambio afecta la vista de la lista completa.
            queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });
        },
    });
}


/**
 * Hook para eliminar un admin.
 * - mutationFn: realiza la petición DELETE.
 * - onSuccess: invalida la consulta ADMIN_QUERY_KEY para actualizar la lista.
 *
 * Destructuración:
 * const { mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset } = useDeleteAdmin();
 * - mutate: función para ejecutar la mutación (mutate({ id }))
 * - mutateAsync: igual que mutate pero retorna una promesa
 * - data: IAdmin | undefined (admin eliminado)
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - reset: función para resetear el estado del hook
 */
export function useDeleteAdmin() {
    const queryClient = useQueryClient();
    //Tipado estricto: IAdmin (respuesta, si retorna el objeto eliminado), QueryApiError (error tipado), y { id: string } (variables de entrada, solo necesitamos el ID).
    return useMutation<Admin, QueryApiError, { id: string }>({
        mutationFn: ({ id }) => fetchApiClient<Admin>(`/api/admin/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        }),
        onSuccess: (deletedAdmin, variables) => {
            // 1. LIMPIEZA FINA: Remueve la entrada específica del caché.
            // Si hay un hook useQuery escuchando este ID individual, su caché es purgado.
            queryClient.removeQueries({ queryKey: [ADMIN_QUERY_KEY, variables.id] });

            // 2. INVALIDEZ DE LISTA: Invalida el caché de la lista de administradores.
            // Esto fuerza a que la tabla principal se actualice y el ítem eliminado desaparezca.
            queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });
        },
    });
}

/**
 * Hook para login de admin.
 * - useMutation porque es una operación que modifica el estado (autenticación).
 * - mutationFn: realiza la petición POST con las credenciales, usando 'credentials: include' para manejar la cookie HTTP-only.
 * - onSuccess: guarda los datos públicos del admin en la caché 'currentUser' para acceso instantáneo de la UI.
 *
 * Destructuración y Uso:
 * const { mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset } = useAdminLogin();
 * * - mutate: función para ejecutar la mutación (ej: mutate({ username, password }))
 * - mutateAsync: igual que mutate, pero retorna una promesa (útil para `async/await` en un `onSubmit`).
 * - data: LoginResponse | undefined. Contiene { token, admin, message } tras el éxito.
 * - error: QueryApiError | null. Contiene el error tipado del backend.
 * - isLoading: boolean. Indica si la petición está en curso (útil para deshabilitar botones).
 * - isSuccess: boolean. Indica que el login fue exitoso.
 * - isError: boolean. Indica que ocurrió un error (ej: credenciales incorrectas).
 * - reset: función para resetear el estado del hook (limpiar `data` y `error`).
 */
export function useAdminLogin() {
    const queryClient = useQueryClient();

    // Tipado: TData, TError, TVariables
    return useMutation<LoginResponse, QueryApiError, { username: string; password: string }>({

        mutationFn: (credentials) => fetchApiClient<LoginResponse>(
            '/api/admin/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                // IMPORTANTE: 'include' asegura que la cookie de sesión sea enviada y recibida
                credentials: 'include',
            }
        ),

        // onSuccess se ejecuta cuando el login es exitoso y la cookie ha sido establecida.
        onSuccess: (data) => {
            // 1. CACHÉ DE AUTENTICACIÓN: 
            // Guarda los datos del admin en una clave de caché específica ('currentUser').
            // Esto permite que cualquier componente que necesite el nombre o ID del usuario 
            // lo obtenga instantáneamente con useQuery(['currentUser']).
            queryClient.setQueryData(['currentUser'], data.admin);

            // 2. INVALIDEZ:
            // Opcionalmente, invalida cualquier clave de consulta que requiera autenticación
            // y que haya estado inactiva o con errores antes del login.
            queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });

            // NOTA: La redirección debe hacerse en el componente de UI que llama a este hook,
            // utilizando el hook `router` de Next.js.
        },
    });
}