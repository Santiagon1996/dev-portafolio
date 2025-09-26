import { Experience, IExperience } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateExperience } = validators;
const { SystemError, ValidationError, DuplicityError } = errors;


/**
 * addExperience - Función para crear una nueva experiencia en la base de datos.
 *
 * @param experienceData - Objeto con las propiedades necesarias para crear una experiencia (title, content, etc.).
 * @returns Promise<IExperience> - Retorna una promesa que resuelve con el nuevo documento Experience tipado.
 *
 * Explicación:
 * 1. Se define la interfaz ExperienceInput para tipar claramente la estructura de entrada esperada.
 * 2. Se valida la entrada usando una función externa `validateExperience`. Esta es lógica normal,
 *    pero el tipado TS garantiza que experienceData tenga las propiedades correctas.
 * 3. Se consulta la base de datos para verificar duplicidad por título y slug.
 * 4. Si ya existe una experiencia con ese título, se lanza un error personalizado `DuplicityError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si no hay duplicidad, se crea la nueva experiencia con `Experience.create()`.
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


interface ExperienceInput {
    company: string;
    role: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    technologies?: string[]
    isCurrent?: boolean;

}

export const addExperience = async (experienceData: ExperienceInput): Promise<IExperience> => {

    try {

        const validatedData = validateExperience(experienceData);

        const potentialSlug = slugify(validatedData.role);


        const existingExperience = await Experience.findOne({
            $or: [{ role: validatedData.role }, { slug: potentialSlug }],
        });

        if (existingExperience) {
            const conflictType = existingExperience.role === validatedData.role ? "role" : "slug";
            throw new DuplicityError("Ya existe una experiencia con ese rol", // publicMessage (más claro)
                {
                    role: validatedData.role,
                    slug: potentialSlug,
                    //  Información adicional para debugging
                    conflictsWith: existingExperience._id.toString(),
                    conflictType: conflictType,
                    existingRole: existingExperience.role,
                    existingSlug: existingExperience.slug
                }, // details
                `Experiencia duplicada por ${conflictType}` // internalMessage
            );
        }

        const newExperience = await Experience.create(validatedData);
        return newExperience;
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
