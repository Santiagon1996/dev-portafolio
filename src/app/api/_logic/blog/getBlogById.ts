import { BlogPost, IBlogPost } from "@lib/db/models/index";  // Aquí usas un tipo (IBlogPost), eso es TS
import { errors, validators } from "@shared";

const { validateId } = validators;
const { SystemError, ValidationError, NotFoundError } = errors;

/**
 * getBlogById - Función para obtener un blog por ID de la base de datos.
 * 
 * @param blogData - Objeto con el ID del blog a buscar.
 * @returns Promise<IBlogPost> - Retorna una promesa que resuelve con el documento Blog tipado.
 * 
 * Explicación:
 * 1. Se define la interfaz BlogInput para tipar el ID requerido.
 * 2. Se valida el ID usando `validateId`.
 * 3. Se busca el blog por ID.
 * 4. Si no se encuentra, se lanza un error `NotFoundError`.
 * 5. Si se encuentra, se retorna el blog completo.
 * 
 * Casos de uso:
 * - Mostrar contenido completo del blog
 * - Cargar datos para formulario de edición  
 * - Vista detallada de blog
 * - Auditoría y logs
 */

// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface BlogInput {
    id: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IBlogPost **
export const getBlogById = async (blogData: BlogInput): Promise<IBlogPost> => {
    try {
        // 1. Validar que el ID sea válido
        const validatedId = validateId(blogData.id);

        // 2. Buscar blog por ID
        const blog = await BlogPost.findById(validatedId);

        if (!blog) {
            throw new NotFoundError(
                "No se encontró un blog con ese ID", // frontend
                { id: validatedId },
                "Blog no encontrado para consulta" // consola
            );
        }

        return blog;
        // ** TS: Definir el tipo del parámetro error como unknown para un control más seguro **
    } catch (error: unknown) {

        // ** TS: Comprobación de tipo seguro usando instanceof para errores específicos **
        if (error instanceof ValidationError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error;
        }
        if (error instanceof NotFoundError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error;
        }

        // ** TS: si el error es una instancia de Error, se maneja como tal **
        if (error instanceof Error) {
            console.error(`[SystemError] ${error.message}`);
            throw new SystemError(
                "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.",
                { message: error.message }
            );
        }
        // ** TS: para cualquier otro tipo de error se convierte a string **
        console.error(`[UnknownError] ${String(error)}`);
        throw new SystemError(
            "Error desconocido. Contacte a soporte.",
            { message: String(error) }
        );
    }
};
