import { Skill, ISkill } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateSkill } = validators;
const { SystemError, ValidationError, DuplicityError } = errors;


/*
 * addSkill - Función para crear una nueva habilidad en la base de datos.
 *
 * @param skillData - Objeto con las propiedades necesarias para crear una habilidad (name, level, etc.).
 * @returns Promise<ISkill> - Retorna una promesa que resuelve con el nuevo documento Skill tipado.
 *
 * Explicación:
 * 1. Se define la interfaz SkillInput para tipar claramente la estructura de entrada esperada.
 * 2. Se valida la entrada usando una función externa `validateSkill`. Esta es lógica normal,
 *    pero el tipado TS garantiza que skillData tenga las propiedades correctas.
 * 3. Se consulta la base de datos para verificar duplicidad por nombre y slug.
 * 4. Si ya existe una habilidad con ese nombre, se lanza un error personalizado `DuplicityError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si no hay duplicidad, se crea la nueva habilidad con `Skill.create()`.
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


interface SkillInput {
    name: string;
    level: string;
    category: string;
    icon?: string;
    color?: string;


}

export const addSkill = async (skillData: SkillInput): Promise<ISkill> => {

    try {

        const validatedData = validateSkill(skillData);

        const potentialSlug = slugify(validatedData.name);


        const existingSkill = await Skill.findOne({
            $or: [{ name: validatedData.name }, { slug: potentialSlug }],
        });

        if (existingSkill) {
            const conflictType = existingSkill.name === validatedData.name ? "name" : "slug";
            throw new DuplicityError("Ya existe una habilidad con ese nombre", // publicMessage (más claro)
                {
                    name: validatedData.name,
                    slug: potentialSlug,
                    //  Información adicional para debugging
                    conflictsWith: existingSkill._id.toString(),
                    conflictType: conflictType,
                    existingLevel: existingSkill.level,
                    existingSlug: existingSkill.slug
                }, // details
                `Habilidad duplicada por ${conflictType}` // internalMessage
            );
        }

        const newSkill = await Skill.create(validatedData);
        return newSkill;
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
