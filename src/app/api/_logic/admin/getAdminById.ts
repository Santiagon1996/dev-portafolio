import { Admin, IAdmin } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { validateId } = validators;
const { NotFoundError, SystemError, ValidationError } = errors;

/**
 * getAdminById - Función para obtener un administrador por ID de la base de datos.
 * 
 * @param adminData - Objeto con el ID del administrador a buscar.
 * @returns Promise<IAdmin> - Retorna una promesa que resuelve con el documento Admin tipado (sin password).
 * 
 * Explicación:
 * 1. Se define la interfaz AdminInput para tipar el ID requerido.
 * 2. Se valida el ID usando `validateId`.
 * 3. Se busca el administrador por ID, excluyendo el password por seguridad.
 * 4. Si no se encuentra, se lanza un error `NotFoundError`.
 * 5. Si se encuentra, se retorna el admin sin datos sensibles.
 * 
 * Casos de uso:
 * - Mostrar perfil de admin en dashboard
 * - Cargar datos para formulario de edición  
 * - Vista detallada de admin
 * - Auditoría y logs
 */

// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface AdminInput {
    id: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const getAdminById = async (adminData: AdminInput): Promise<Omit<IAdmin, 'password'>> => {
    try {
        // 1. Validar que el ID sea válido
        const validatedId = validateId(adminData.id);

        // 2. Buscar admin por ID (excluyendo password por seguridad)
        const admin = await Admin.findById(validatedId).select('-password');

        if (!admin) {
            throw new NotFoundError(
                "No se encontró un administrador con ese ID", // frontend
                { id: validatedId },
                "Admin no encontrado para consulta" // consola
            );
        }

        return admin;
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
