import { Project, IProject } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { validateId } = validators;
const { NotFoundError, SystemError, ValidationError } = errors;

/**
 * getProjectById - Función para obtener un proyecto por ID de la base de datos.
 *
 * @param projectData - Objeto con el ID del proyecto a buscar.
 * @returns Promise<IProject> - Retorna una promesa que resuelve con el documento Project tipado.
 *
 * Explicación:
 * 1. Se define la interfaz ProjectInput para tipar el ID requerido.
 * 2. Se valida el ID usando `validateId`.
 * 3. Se busca el proyecto por ID.
 * 4. Si no se encuentra, se lanza un error `NotFoundError`.
 * 5. Si se encuentra, se retorna el proyecto.
 *
 * Casos de uso:
 * - Mostrar proyecto en dashboard
 * - Cargar datos para formulario de edición  
 * - Vista detallada del proyecto
 * - Auditoría y logs
 */

// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface ProjectInput {
    id: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const getProjectById = async (projectData: ProjectInput): Promise<IProject> => {
    try {
        // 1. Validar que el ID sea válido
        const validatedId = validateId(projectData.id);

        // 2. Buscar proyecto por ID
        const project = await Project.findById(validatedId);

        if (!project) {
            throw new NotFoundError(
                "No se encontró un proyecto con ese ID", // frontend
                { id: validatedId },
                "Proyecto no encontrado para consulta" // consola
            );
        }

        return project;
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
