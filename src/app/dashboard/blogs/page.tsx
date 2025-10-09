"use client";
// Importamos los hooks de consulta y mutación de React Query
import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@hooks/useBlogPost";
import { GenericDataTable } from "@components/organism/DataTable";
import { DataTableForm } from "@components/molecules/DataTableForm";

// Importa el tipo BlogPost para usar sus claves
import type { BlogPost, UpdateBlogPostData } from "@lib/types/blog.types";

// Define las columnas para la tabla de blogs
const blogColumns: { key: keyof BlogPost; header: string; render?: (item: BlogPost) => string }[] = [
    // La clave 'key' debe coincidir con los campos del objeto BlogPost
    { key: "title", header: "Título" },
    { key: "author", header: "Autor" },
    { key: "publishedAt", header: "Fecha de publicación" },
];

export default function BlogsPage() {
    // 1. Hook de consulta para obtener la lista de blogs y el estado general
    const {
        data,
        isLoading,
        error,
        refetch, // <-- Añade refetch para recargar datos
    } = useBlogs({ page: 1, limit: 10 });

    // 2. Hooks de mutación para las operaciones CRUD
    const { mutateAsync: createBlog } = useCreateBlog();
    const { mutateAsync: updateBlog } = useUpdateBlog();
    const { mutateAsync: deleteBlog } = useDeleteBlog();


    // 3. Implementación de las acciones CRUD para el GenericDataTable
    interface CreateBlogItemArgs extends Partial<BlogPost> { }

    interface UpdateBlogItemArgs extends Partial<BlogPost> { }

    interface CrudActions {
        createItem: (blog: CreateBlogItemArgs) => Promise<boolean>;
        updateItem: (id: string | number, blog: UpdateBlogItemArgs) => Promise<boolean>;
        deleteItem: (id: string | number) => Promise<boolean>;
    }

    const crudActions: CrudActions = {
        /**
         * Lógica de creación: llama a la mutación de creación
         */
        createItem: async (blog: CreateBlogItemArgs): Promise<boolean> => {
            try {
                // Validar que los campos requeridos existen
                if (!blog.title || !blog.author) {
                    console.error("Faltan campos requeridos para crear el blog.");
                    return false;
                }
                // Construir el objeto CreateBlogPostData asegurando los campos requeridos
                const createData = {
                    title: blog.title,
                    content: blog.content ?? "", // Agrega el campo obligatorio 'content'
                    author: blog.author,
                    tags: blog.tags ?? [],
                    isPublished: blog.isPublished ?? false,
                    publishedAt: blog.publishedAt ?? "",
                };
                await createBlog(createData);
                return true;
            } catch (e) {
                // Se registra el error en consola y se retorna false para que la tabla lo maneje
                console.error("Error al crear blog:", e);
                // Si es necesario, usar hookState.setError(e.message)
                return false;
            }
        },

        /**
         * Lógica de actualización: llama a la mutación de actualización
         */
        updateItem: async (
            id: string | number,
            blog: UpdateBlogItemArgs
        ): Promise<boolean> => {
            try {
                // Combina el ID con los datos de actualización, como espera useUpdateBlog
                const updateData: UpdateBlogPostData = { id: String(id), ...blog };
                await updateBlog(updateData);
                return true;
            } catch (e) {
                console.error("Error al actualizar blog:", e);
                return false;
            }
        },

        /**
         * Lógica de eliminación: llama a la mutación de eliminación
         */
        deleteItem: async (id: string | number): Promise<boolean> => {
            try {
                // useDeleteBlog espera el ID como string
                await deleteBlog(String(id));
                return true;
            } catch (e) {
                console.error("Error al eliminar blog:", e);
                return false;
            }
        },
    };

    return (
        <GenericDataTable
            data={data?.blogs ?? []}
            title="Gestión de Blogs"
            columns={blogColumns}
            actions={crudActions}
            hookState={{
                loading: isLoading,
                error: error ? error.message : null, // <-- Propaga el error de React Query
                fetchData: refetch, // <-- Recarga los datos usando React Query   
            }}
            FormContent={DataTableForm}
            entityType="blog"
        />
    );
}
