export interface BlogPost {
    id: string; // ID de MongoDB
    title: string;
    summary?: string;
    slug: string;
    content: string;
    tags?: string[];
    author: string;
    publishedAt: string; // La API lo devuelve como string (ISO date)
    isPublished: boolean;
    viewsCount: number;
    createdAt: string; // Timestamps automáticos
    updatedAt: string; // Timestamps automáticos
    [key: string]: unknown; // <-- Esto lo hace compatible con Record<string, unknown>
}

// 1. Tipo para los datos que se envían al POST (Create)
// Se basa en tu interfaz BlogInput, pero adaptada para el cliente
export type CreateBlogPostData = {
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    author?: string; // Tienes un default, pero es bueno permitir la opción
    isPublished?: boolean;
};

// 2. Tipo para los datos que se envían al PATCH (Update)
// Necesita el ID y el resto de campos opcionales
export type UpdateBlogPostData = {
    id: string;
} & Partial<Omit<BlogPost, '_id' | 'slug' | 'createdAt' | 'updatedAt' | 'viewsCount'>>;

// 3. Tipo para la respuesta de la paginación (GET /api/blog)
// Se alinea con tu BlogsPaginatedResponse del backend
export interface BlogListResult {
    blogs: BlogPost[]; // <--- USAMOS 'blogs' (el nombre de tu propiedad)
    total: number;     // Mapea a totalDocs
    totalPages: number;
    page: number;      // Mapea a currentPage
    limit: number;     // Puedes añadir limit si lo devuelve la API para consistencia
    // hasNextPage: boolean; // Si tu getAllBlogs lo calcula y lo devuelve, añádelo
    // hasPrevPage: boolean; // Si tu getAllBlogs lo calcula y lo devuelve, añádelo
}

export type BlogsParams = {
    page?: number;
    limit?: number;
    author?: string;
    tags?: string;
    isPublished?: boolean;
};