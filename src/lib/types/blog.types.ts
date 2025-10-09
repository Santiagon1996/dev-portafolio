import { z } from 'zod';
import { blogSchema, updateBlogSchema } from '@shared/validate/schemas';

// Modelo principal del blog
export interface BlogPost {
    id: string;
    title: string;
    content: string;
    slug?: string;
    publishedAt?: Date;
    isPublished?: boolean;
    summary?: string;
    tags?: string[];
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    viewsCount?: number;
    [key: string]: unknown;
}

// Tipo para crear un blog, sincronizado con Zod
export type CreateBlogPostData = z.infer<typeof blogSchema>;

// Tipo para actualizar un blog, sincronizado con Zod
export type UpdateBlogPostData = { id: string } & z.infer<typeof updateBlogSchema>;

// Resultado de lista paginada
export interface BlogListResult {
    blogs: BlogPost[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

// Parámetros para filtrar/buscar blogs
export type BlogsParams = {
    page?: number;
    limit?: number;
    author?: string;
    tags?: string[];
    isPublished?: boolean;
};