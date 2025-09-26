import { Education, IEducation } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { validateId } = validators;
const { NotFoundError, SystemError, ValidationError } = errors;

/**
 * getEducationById - Función para obtener una educación por ID de la base de datos.
 *
 * @param educationData - Objeto con el ID de la educación a buscar.
 * @returns Promise<IEducation> - Retorna una promesa que resuelve con el documento Education tipado.
 *
 * Explicación:
 * 1. Se define la interfaz EducationInput para tipar el ID requerido.
 * 2. Se valida el ID usando `validateId`.
 * 3. Se busca la educación por ID.
 * 4. Si no se encuentra, se lanza un error `NotFoundError`.
 * 5. Si se encuentra, se retorna la educación.
 *
 * Casos de uso:
 * - Mostrar educación en dashboard
 * - Cargar datos para formulario de edición  
 * - Vista detallada de educación
 *
 * Manejo de errores:
 * - Auditoría y logs
 */

// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface EducationInput {
    id: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const getEducationById = async (educationData: EducationInput): Promise<IEducation> => {
    try {
        // 1. Validar que el ID sea válido
        const validatedId = validateId(educationData.id);

        // 2. Buscar educación por ID
        const education = await Education.findById(validatedId);

        if (!education) {
            throw new NotFoundError(
                "No se encontró una educación con ese ID", // frontend
                { id: validatedId },
                "Educación no encontrada para consulta" // consola
            );
        }

        return education;
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
