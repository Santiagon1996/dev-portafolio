import { BlogPost, IBlogPost } from "@lib/db/models/index";
import { errors } from "@shared";

const { SystemError, NotFoundError } = errors;

/**
 * getBlogBySlug - Función para obtener un blog por su slug.
 * 
 * @param slug - El slug del blog a buscar.
 * @returns Promise<IBlogPost> - Retorna el blog encontrado.
 */

export const getBlogBySlug = async (slug: string): Promise<IBlogPost> => {
    try {
        if (!slug || typeof slug !== 'string') {
            throw new Error('Slug inválido');
        }

        const blog = await BlogPost.findOne({ slug });

        if (!blog) {
            throw new NotFoundError(
                "No se encontró un blog con ese slug",
                { slug },
                "Blog no encontrado por slug"
            );
        }

        // Incrementar contador de vistas
        await BlogPost.findByIdAndUpdate(blog._id, { $inc: { viewsCount: 1 } });

        return blog;
    } catch (error: unknown) {
        if (error instanceof NotFoundError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error;
        }

        if (error instanceof Error) {
            console.error(`[SystemError] ${error.message}`);
            throw new SystemError(
                "Error al obtener el blog por slug",
                { message: error.message }
            );
        }
        console.error(`[UnknownError] ${String(error)}`);
        throw new SystemError(
            "Error desconocido al obtener blog por slug",
            { message: String(error) }
        );
    }
};
