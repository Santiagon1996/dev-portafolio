'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogPost, BlogListResult, CreateBlogPostData, UpdateBlogPostData, BlogsParams } from '@lib/types/blog.types';
import { fetchApiClient } from '@lib/utils/fetchApiClient';
import { QueryApiError } from '@shared/errors/QueryApiError';

// Clave única para la caché de la lista de blogs
const BLOG_QUERY_KEY = 'blogs';

/**
 * Hook para obtener la lista de blogs con paginación y filtros.
 * - useQuery se usa para consultas GET (lectura).
 * - queryKey: identifica de forma única la consulta en la caché, incluye los filtros.
 * - queryFn: función que realiza la petición.
 *
 * Destructuración:
 * const { data, error, isLoading, isSuccess, isError, refetch } = useBlogs(params);
 * - data: BlogListResult | undefined
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - refetch: función para volver a consultar
 */
export function useBlogs(params: BlogsParams = {}) {
    const { page = 1, limit = 10, author, tags, isPublished } = params;

    // queryKey: Clave que identifica la consulta. Al incluir los parámetros, cada combinación de filtros/página tiene su propia entrada de caché.
    return useQuery<BlogListResult, QueryApiError>({
        queryKey: [BLOG_QUERY_KEY, { page, limit, author, tags, isPublished }],
        queryFn: async () => {
            // Construcción segura y dinámica de los parámetros de la URL
            const queryParams = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (author) queryParams.append('author', author);
            if (tags) queryParams.append('tags', Array.isArray(tags) ? tags.join(',') : tags);
            if (isPublished !== undefined) queryParams.append('isPublished', String(isPublished));

            return fetchApiClient<BlogListResult>(`/api/blog?${queryParams.toString()}`);
        },
    });
}

/**
 * Hook para obtener un blog por ID.
 * - useQuery se usa para consultas GET (lectura).
 * - queryKey: clave única para el blog individual.
 * - enabled: solo ejecuta la consulta si hay un ID.
 *
 * Destructuración:
 * const { data, error, isLoading, isSuccess, isError, refetch } = useBlogById(id);
 * - data: BlogPost | undefined
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - refetch: función para volver a consultar
 */
export function useBlogById(id: string | null) {
    return useQuery<BlogPost, QueryApiError>({
        // queryKey: Clave única para el ítem individual (ej: ['blogs', 'post-123']). Es esencial para 'setQueryData' en la mutación.
        queryKey: [BLOG_QUERY_KEY, id],
        queryFn: () => fetchApiClient<BlogPost>(`/api/blog/${id}`),
        // enabled: Solo se ejecuta el fetch si el ID es un valor truthy.
        enabled: !!id,
    });
}

/**
 * Hook para crear un nuevo blog.
 * - useMutation se usa para operaciones que modifican datos (POST).
 * - mutationFn: función que realiza la petición POST.
 * - onSuccess: invalida la consulta de la lista para refrescar los datos.
 *
 * Destructuración:
 * const { mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset } = useCreateBlog();
 * - mutate: función para ejecutar la mutación (mutate(newBlog))
 * - mutateAsync: igual que mutate pero retorna una promesa
 * - data: BlogPost | undefined (blog creado)
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - reset: función para resetear el estado del hook
 */
export function useCreateBlog() {
    const queryClient = useQueryClient();

    return useMutation<BlogPost, QueryApiError, CreateBlogPostData>({
        mutationFn: (newBlog) => fetchApiClient<BlogPost>('/api/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBlog),
            credentials: 'include',
        }),
        onSuccess: (newPost) => {
            // 1. INVALIDEZ BÁSICA: Invalida la lista completa (Red de seguridad).
            // Forzará el refetch en segundo plano si es necesario.
            queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });

            // 2. OPTIMIZACIÓN DE CACHÉ DE LISTA (MEJOR PRÁCTICA):
            // Añade el nuevo post al inicio de la primera página de la lista en caché (si existe).
            queryClient.setQueryData([BLOG_QUERY_KEY, { page: 1, limit: 10 }], (oldData: BlogListResult | undefined) => {
                if (oldData) {
                    // Crea una nueva estructura de datos: nuevo post + posts existentes.
                    return {
                        ...oldData,
                        data: [newPost, ...oldData.blogs],
                        // Opcional: ajustar el total y la paginación si es necesario.
                    };
                }
                return oldData;
            });
        },
    });
}

/**
 * Hook para actualizar un blog existente.
 * - useMutation se usa para operaciones que modifican datos (PATCH).
 * - mutationFn: realiza la petición PATCH con los datos a actualizar.
 * - onSuccess: invalida la consulta del blog individual y la lista.
 *
 * Destructuración:
 * const { mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset } = useUpdateBlog();
 * - mutate: función para ejecutar la mutación (mutate(updateBlogData))
 * - mutateAsync: igual que mutate pero retorna una promesa
 * - data: BlogPost | undefined (blog actualizado)
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - reset: función para resetear el estado del hook
 */
export function useUpdateBlog() {
    const queryClient = useQueryClient();

    // TData: BlogPost (respuesta), TError: QueryApiError, TVariables: { id: string, updates: Partial<BlogPost> }
    return useMutation<BlogPost, QueryApiError, UpdateBlogPostData>({
        mutationFn: (data) => {
            const { id, ...updates } = data;
            return fetchApiClient<BlogPost>(`/api/blog/${id}`, {
                method: 'PATCH', // Método HTTP para actualización parcial.
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
                credentials: 'include',
            });
        },
        // onSuccess recibe el post actualizado del servidor.
        onSuccess: (updatedPost) => {
            // 1. ACTUALIZACIÓN DIRECTA (MEJOR PRÁCTICA):
            // Usa 'setQueryData' para escribir el post actualizado directamente en la caché del ítem individual.
            // Esto actualiza la vista de detalle (useBlogById) sin latencia.
            queryClient.setQueryData([BLOG_QUERY_KEY, updatedPost.id], updatedPost);

            // 2. INVALIDEZ DE LISTA: 
            // Invalida la clave de la lista raíz para forzar el refetch de la lista completa en segundo plano.
            // Esto asegura que si la actualización afecta la paginación, filtros o tags mostrados en la lista, estos se sincronicen.
            queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
        },
    });
}

/**
 * Hook para eliminar un blog.
 * - useMutation se usa para operaciones que modifican datos (DELETE).
 * - mutationFn: realiza la petición DELETE.
 * - onSuccess: invalida la consulta de la lista para actualizar los datos.
 *
 * Destructuración:
 * const { mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset } = useDeleteBlog();
 * - mutate: función para ejecutar la mutación (mutate(id))
 * - mutateAsync: igual que mutate pero retorna una promesa
 * - data: BlogPost | undefined (blog eliminado)
 * - error: QueryApiError | null
 * - isLoading: boolean
 * - isSuccess: boolean
 * - isError: boolean
 * - reset: función para resetear el estado del hook
 */
export function useDeleteBlog() {
    const queryClient = useQueryClient();

    // TData: BlogPost (respuesta, aunque se ignora), TError: QueryApiError, TVariables: string (ID)
    return useMutation<BlogPost, QueryApiError, { id: string }>({
        mutationFn: ({ id }) => fetchApiClient<BlogPost>(`/api/blog/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        }),
        // Utilizamos '_' en 'deletedPost' ya que la respuesta del servidor no es necesaria para la lógica de caché.
        onSuccess: (_, { id }) => {
            // 1. LIMPIEZA FINA: Remueve la entrada individual del caché.
            // Esto garantiza que cualquier componente que use useBlogById(id) ya no tenga datos obsoletos.
            queryClient.removeQueries({ queryKey: [BLOG_QUERY_KEY, id] });

            // 2. INVALIDEZ DE LISTA: Invalida el caché de la lista completa.
            // Fuerza a que useBlogs se refetchee para que el blog eliminado desaparezca de la tabla.
            queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
        },
    });
}