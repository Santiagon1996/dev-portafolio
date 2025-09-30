import { Experience, IExperience } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { validateId } = validators;
const { NotFoundError, SystemError, ValidationError } = errors;

/**
 * getExperienceById - Función para obtener una experiencia por ID de la base de datos.
 *
 * @param experienceData - Objeto con el ID de la experiencia a buscar.
 * @returns Promise<IExperience> - Retorna una promesa que resuelve con el documento Experience tipado.
 *
 * Explicación:
 * 1. Se define la interfaz ExperienceInput para tipar el ID requerido.
 * 2. Se valida el ID usando `validateId`.
 * 3. Se busca la experiencia por ID.
 * 4. Si no se encuentra, se lanza un error `NotFoundError`.
 * 5. Si se encuentra, se retorna la experiencia.
 *
 * Casos de uso:
 * - Mostrar experiencia en dashboard
 * - Cargar datos para formulario de edición  
 * - Vista detallada de la experiencia
 *
 * Manejo de errores:
 * - Auditoría y logs
 */

// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface ExperienceInput {
    id: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const getExperienceById = async (experienceData: ExperienceInput): Promise<IExperience> => {
    try {
        // 1. Validar que el ID sea válido
        const validatedId = validateId(experienceData.id);

        // 2. Buscar experiencia por ID
        const experience = await Experience.findById(validatedId);

        if (!experience) {
            throw new NotFoundError(
                "No se encontró una experiencia con ese ID", // frontend
                { id: validatedId },
                "Experiencia no encontrada para consulta" // consola
            );
        }

        return experience;
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
