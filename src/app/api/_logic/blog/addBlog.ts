import { BlogPost, IBlogPost } from "@lib/db/models/index";  // Aquí usas un tipo (IBlogPost), eso es TS
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateBlog } = validators;
const { DuplicityError, SystemError, ValidationError } = errors;

/**
 * addBlog - Función para crear un nuevo post de blog en la base de datos.
 * 
 * @param blogData - Objeto con las propiedades necesarias para crear un BlogPost (title, content, etc.).
 * @returns Promise<IBlogPost> - Retorna una promesa que resuelve con el nuevo documento Blog tipado.
 * 
 * Explicación:
 * 1. Se define la interfaz BlogInput para tipar claramente la estructura de entrada esperada.
 * 2. Se valida la entrada usando una función externa `validateBlog`. Esta es lógica normal,
 *    pero el tipado TS garantiza que blogData tenga las propiedades correctas.
 * 3. Se consulta la base de datos para verificar duplicidad por título y slug.
 * 4. Si ya existe un blog con ese título, se lanza un error personalizado `DuplicityError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si no hay duplicidad, se crea el nuevo blog con `BlogPost.create()`.
 * 6. El bloque try/catch:
 *    - Atrapa errores y los tipa como `unknown` para forzar comprobaciones seguras.
 *    - Si el error es un `ValidationError` o `DuplicityError`, se relanza para que el handler externo
 *      pueda devolver el mensaje adecuado al cliente.
 *    - Si ocurre un error genérico, se encapsula en un `SystemError` con un mensaje amigable y un detalle
 *      para consola.
 * 
 * Ventajas TS:
 * - Tipado fuerte en entrada y salida.
 * - Uso seguro de errores con instanceof.
 * - Mejor autocompletado y detección temprana de errores de tipo.
 * 
 * Captura y manejo explícito de errores de validación de Zod:
 * - Zod lanza un ZodError con un arreglo de issues describiendo los errores.
 * - Al capturar este error, se transforma en un ValidationError personalizado
 *   con un mensaje claro para el frontend y detalles estructurados para debugging.
 * - Esto garantiza mensajes explícitos y uniformes en la interfaz de error.
 */

// ** Definición de una interfaz para tipar el objeto que esperas recibir **
// ** Solo incluimos los campos que el usuario debe proporcionar **
interface BlogInput {
    title: string;                    // ✅ Obligatorio - título del post
    content: string;                  // ✅ Obligatorio - contenido del post
    summary?: string;                 // ⭕ Opcional - resumen breve
    tags?: string[];                  // ⭕ Opcional - etiquetas del post
    author?: string;                  // ⭕ Opcional - autor (tiene default)
    isPublished?: boolean;            // ⭕ Opcional - estado de publicación
    publishedAt?: Date | string;      // ⭕ Opcional - fecha de publicación
    // NOTA: slug se genera automáticamente desde el título
    // NOTA: viewsCount inicia en 0 automáticamente
    // NOTA: timestamps (createdAt, updatedAt) son automáticos
}

// ** Función asíncrona que devuelve una promesa de tipo IBlogPost **
export const addBlog = async (blogData: BlogInput): Promise<IBlogPost> => {
    try {
        // 1. ✅ VALIDAR DATOS PRIMERO
        const validatedData = validateBlog(blogData);

        // 2. 🏷️ GENERAR SLUG PARA VERIFICACIÓN DE DUPLICIDAD
        // Generamos el slug manualmente para poder verificar duplicidad
        // Mongoose también lo generará automáticamente, pero esto nos permite verificar antes
        const potentialSlug = slugify(validatedData.title);

        // 3. 🔍 VERIFICACIÓN DE DUPLICADOS POR TÍTULO Y SLUG
        // Verificamos si ya existe un blog con ese título O ese slug
        const existingBlog = await BlogPost.findOne({
            $or: [
                { title: validatedData.title },
                { slug: potentialSlug }
            ]
        });

        if (existingBlog) {
            // Determinar el tipo de conflicto
            const conflictType = existingBlog.title === validatedData.title ? 'title' : 'slug';

            throw new DuplicityError(
                "Ya existe un blog con ese título", // publicMessage (más claro)
                {
                    title: validatedData.title,
                    slug: potentialSlug,
                    //  Información adicional para debugging
                    conflictsWith: existingBlog._id.toString(),
                    conflictType: conflictType,
                    existingTitle: existingBlog.title,
                    existingSlug: existingBlog.slug
                }, // details
                `Blog duplicado por ${conflictType}` // internalMessage
            );
        }

        // 4. ✨ CREAR NUEVO BLOG
        // Mongoose generará automáticamente el slug via middleware pre("validate")
        const newBlog = await BlogPost.create(validatedData);
        return newBlog;
        // ** TS: Definir el tipo del parámetro error como unknown para un control más seguro **
    } catch (error: unknown) {

        // ** TS: Comprobación de tipo seguro usando instanceof para errores específicos **
        // ** TS: Si el error es una instancia de ValidationError o DuplicityError, se maneja específicamente **
        if (error instanceof ValidationError) {
            // Log detallado para el dev 
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            // Lo relanzas para que lo maneje el frontend o API
            throw error;
        }
        if (error instanceof DuplicityError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error; // Lo relanzas para que el handler externo lo maneje
        }

        // ** TS: si el error es una instancia de Error, se maneja como tal **
        if (error instanceof Error) {
            // Errores no esperados se envuelven en SystemError
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
