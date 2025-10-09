
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IAdmin } from '@lib/db/models/index';
import { fetchApiClient } from '@lib/utils/fetchApiClient';

// 1. Obtener admin por ID
export function useAdminById(id: string | null) {
    return useQuery<IAdmin, Error>({
        queryKey: ['admin', id],
        queryFn: () => fetchApiClient<IAdmin>(`/api/admin/${id}`),
        enabled: !!id,
    });
}

// 2. Crear admin
export function useCreateAdmin() {
    const queryClient = useQueryClient();
    return useMutation<IAdmin, Error, Partial<IAdmin>>({
        mutationFn: (adminData) => fetchApiClient<IAdmin>('/api/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
    });
}

// 3. Actualizar admin
export function useUpdateAdmin() {
    const queryClient = useQueryClient();
    return useMutation<IAdmin, Error, { id: string; data: Partial<IAdmin> }>({
        mutationFn: ({ id, data }) => fetchApiClient<IAdmin>(`/api/admin/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
    });
}

// 4. Eliminar admin
export function useDeleteAdmin() {
    const queryClient = useQueryClient();
    return useMutation<IAdmin, Error, { id: string }>({
        mutationFn: ({ id }) => fetchApiClient<IAdmin>(`/api/admin/${id}`, {
            method: 'DELETE',
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
    });
}

// 5. Login de admin
export function useAdminLogin() {
    return useMutation<{ token: string; admin: { id: string; username: string } }, Error, { username: string; password: string }>({
        mutationFn: (credentials) => fetchApiClient<{ token: string; admin: { id: string; username: string } }>(
            '/api/admin/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            }
        ),
    });
}