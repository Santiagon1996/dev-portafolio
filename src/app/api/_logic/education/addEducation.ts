import { Education, IEducation } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateEducation } = validators;
const { SystemError, ValidationError, DuplicityError } = errors;


/**
 * addEducation - Función para crear un nuevo post de educación en la base de datos.
 *
 * @param educationData - Objeto con las propiedades necesarias para crear un EducationPost (title, content, etc.).
 * @returns Promise<IEducationPost> - Retorna una promesa que resuelve con el nuevo documento Education tipado.
 *
 * Explicación:
 * 1. Se define la interfaz EducationInput para tipar claramente la estructura de entrada esperada.
 * 2. Se valida la entrada usando una función externa `validateEducation`. Esta es lógica normal,
 *    pero el tipado TS garantiza que educationData tenga las propiedades correctas.
 * 3. Se consulta la base de datos para verificar duplicidad por título y slug.
 * 4. Si ya existe un post de educación con ese título, se lanza un error personalizado `DuplicityError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si no hay duplicidad, se crea el nuevo post de educación con `EducationPost.create()`.
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


interface EducationInput {
    degree: string;
    institution: string;
    field: string;
    startDate: Date;
    endDate: Date
    description: string;
}

export const addEducation = async (educationData: EducationInput): Promise<IEducation> => {

    try {

        const validatedData = validateEducation(educationData);

        const potentialSlug = slugify(validatedData.degree);


        const existingEducation = await Education.findOne({
            $or: [{ degree: validatedData.degree }, { slug: potentialSlug }],
        });

        if (existingEducation) {
            const conflictType = existingEducation.degree === validatedData.degree ? "degree" : "slug";
            throw new DuplicityError("Ya existe una educación con ese título", // publicMessage (más claro)
                {
                    degree: validatedData.degree,
                    slug: potentialSlug,
                    //  Información adicional para debugging
                    conflictsWith: existingEducation._id.toString(),
                    conflictType: conflictType,
                    existingDegree: existingEducation.degree,
                    existingSlug: existingEducation.slug
                }, // details
                `Educación duplicada por ${conflictType}` // internalMessage
            );
        }

        const newEducation = await Education.create(validatedData);
        return newEducation;
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

}
