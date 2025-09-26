import { Skill, ISkill } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { validateId } = validators;
const { NotFoundError, SystemError, ValidationError } = errors;

/**
 * getSkillById - Función para obtener un proyecto por ID de la base de datos.
 *
 * @param SkillData - Objeto con el ID del proyecto a buscar.
 * @returns Promise<ISkill> - Retorna una promesa que resuelve con el documento Skill tipado.
 *
 * Explicación:
 * 1. Se define la interfaz SkillInput para tipar el ID requerido.
 * 2. Se valida el ID usando `validateId`.
 * 3. Se busca el proyecto por ID.
 * 4. Si no se encuentra, se lanza un error `NotFoundError`.
 * 5. Si se encuentra, se retorna el proyecto.
 *
 * Casos de uso:
 * - Mostrar la habilidad en dashboard
 * - Cargar datos para formulario de edición  
 * - Vista detallada la habilidad
 * - Auditoría y logs
 * 
 * Manejo de errores:
 * - Auditoría y logs
 */

// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface SkillInput {
    id: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const getSkillById = async (skillData: SkillInput): Promise<ISkill> => {
    try {
        // 1. Validar que el ID sea válido
        const validatedId = validateId(skillData.id);

        // 2. Buscar proyecto por ID
        const skill = await Skill.findById(validatedId);

        if (!skill) {
            throw new NotFoundError(
                "No se encontró un proyecto con ese ID", // frontend
                { id: validatedId },
                "Proyecto no encontrado para consulta" // consola
            );
        }

        return skill;
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
