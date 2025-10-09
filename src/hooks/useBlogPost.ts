'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogPost, BlogListResult, CreateBlogPostData, UpdateBlogPostData, BlogsParams } from '@lib/types/blog.types';
import { fetchApiClient } from '@lib/utils/fetchApiClient';
import { QueryApiError } from '@shared/errors/QueryApiError';

// Clave única para la caché de la lista de blogs
const BLOG_QUERY_KEY = 'blogs';

// =======================================================================
// 1. GET ALL: Obtener blogs con paginación
// =======================================================================
export function useBlogs(params: BlogsParams = {}) {
    const { page = 1, limit = 10, author, tags, isPublished } = params;

    // Tipado: Resultado (BlogListResult), Error (QueryApiError)
    return useQuery<BlogListResult, QueryApiError>({
        // La clave de caché debe ser única y reflejar los filtros
        queryKey: [BLOG_QUERY_KEY, { page, limit, author, tags, isPublished }],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (author) queryParams.append('author', author);
            if (tags) queryParams.append('tags', tags);
            if (isPublished !== undefined) queryParams.append('isPublished', String(isPublished));

            // ⭐ USO: Captura automáticamente errores 404/400/500 y los lanza como QueryApiError
            return fetchApiClient<BlogListResult>(`/api/blog?${queryParams.toString()}`);
        },
    });
}

// =======================================================================
// 2. GET BY ID: Obtener un blog por ID
// =======================================================================
export function useBlogById(id: string | null) {
    // Si id es nulo, el hook retorna inmediatamente y enabled: false evita el fetch
    return useQuery<BlogPost, QueryApiError>({
        // La clave de caché para un elemento individual es [KEY, ID]
        queryKey: [BLOG_QUERY_KEY, id],
        queryFn: () => fetchApiClient<BlogPost>(`/api/blog/${id}`),
        // ⭐ OPTIMIZACIÓN: Solo se ejecuta si el ID no es nulo/vacío
        enabled: !!id,
    });
}

// =======================================================================
// 3. POST: Crear un nuevo blog (Mutación)
// =======================================================================
export function useCreateBlog() {
    const queryClient = useQueryClient();

    // Tipado: Respuesta (BlogPost), Error (QueryApiError), Variables de entrada (CreateBlogPostData)
    return useMutation<BlogPost, QueryApiError, CreateBlogPostData>({
        mutationFn: (newBlog) => fetchApiClient<BlogPost>('/api/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBlog),
            credentials: 'include', // Enviar cookies para autenticación
        }),
        onSuccess: () => {
            // ⭐ INVALIDEZ DE CACHÉ: Invalida la lista completa para forzar un refetch y mostrar el nuevo post
            queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
        },
    });
}

// =======================================================================
// 4. PATCH: Actualizar un blog (Mutación)
// =======================================================================
export function useUpdateBlog() {
    const queryClient = useQueryClient();

    // Tipado: Variables de entrada ahora incluyen el ID y los campos opcionales (UpdateBlogPostData)
    return useMutation<BlogPost, QueryApiError, UpdateBlogPostData>({
        mutationFn: (data) => {
            const { id, ...updates } = data;
            return fetchApiClient<BlogPost>(`/api/blog/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
                credentials: 'include', // Enviar cookies para autenticación
            });
        },
        onSuccess: (updatedPost) => {
            // ⭐ INVALIDEZ FINA: Invalida el caché del post individual (para que se recargue en la vista de detalle)
            queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY, updatedPost.id] });
            // Invalida la lista completa (si el cambio afecta la paginación o filtros)
            queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
        },
    });
}

// =======================================================================
// 5. DELETE: Eliminar un blog (Mutación)
// =======================================================================
export function useDeleteBlog() {
    const queryClient = useQueryClient();

    // Tipado: Respuesta (BlogPost - el eliminado), Error, Variables de entrada (string - el ID)
    return useMutation<BlogPost, QueryApiError, string>({
        mutationFn: (id) => fetchApiClient<BlogPost>(`/api/blog/${id}`, {
            method: 'DELETE',
            credentials: 'include', // Enviar cookies para autenticación
        }),
        onSuccess: () => {
            // Invalida la lista para que el post eliminado ya no aparezca
            queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
        },
    });
}