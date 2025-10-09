import { z } from 'zod';
import { userRegisterSchema, userLoginSchema } from '@shared/validate/schemas';

export interface Admin {
    id: string;
    username: string;
    email: string;
    [key: string]: unknown;
}

export type CreateAdminData = z.infer<typeof userRegisterSchema>;
export type UpdateAdminData = Partial<Omit<Admin, 'id'>>;
export type AdminLoginData = z.infer<typeof userLoginSchema>;

export interface AdminListResult {
    admins: Admin[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}


export type LoginResponse = {
    message: string;
    token: string; // Incluido en el body por la API, pero usado principalmente por la cookie.
    admin: { id: string; username: string };
};