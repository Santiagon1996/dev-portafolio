import { Admin, IAdmin } from "@lib/db/models/index";  // Aquí usas un tipo (IAdmin), eso es TS
import { errors, validators } from "@shared";
import { handleLogicError } from "@lib/helpers/handleLogicError";


const { validateId } = validators;
const { NotFoundError } = errors;

/**
 * deleteAdmin - Función para eliminar un administrador de la base de datos.
 * 
 * @param adminData - Objeto con el ID del administrador a eliminar.
 * @returns Promise<IAdmin> - Retorna una promesa que resuelve con el documento Admin eliminado tipado.
 * 
 * Explicación:
 * 1. Se define la interfaz AdminInput para tipar claramente la estructura de entrada esperada (solo ID).
 * 2. Se valida la entrada usando una función externa `validateId`. Esta es lógica normal,
 *    pero el tipado TS garantiza que adminData tenga las propiedades correctas.
 * 3. Se elimina el administrador directamente usando `Admin.findByIdAndDelete()`.
 * 4. Si no se encuentra un admin con ese ID, se lanza un error personalizado `NotFoundError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si la eliminación es exitosa, se retorna el documento eliminado.
 * 6. El bloque try/catch:
 *    - Atrapa errores y los tipa como `unknown` para forzar comprobaciones seguras.
 *    - Si el error es un `ValidationError` o `NotFoundError`, se relanza para que el handler externo
 *      pueda devolver el mensaje adecuado al cliente.
 *    - Si ocurre un error genérico, se encapsula en un `SystemError` con un mensaje amigable y un detalle
 *      para consola.
 *    - Si el error no es un objeto Error, se convierte a string y también se lanza un `SystemError`.
 * 
 * Ventajas TS:
 * - Tipado fuerte en entrada y salida.
 * - Uso seguro de errores con instanceof.
 * - Mejor autocompletado y detección temprana de errores de tipo.
 * - Operación atómica de eliminación con verificación automática de existencia.
 */


// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface AdminInput {
    id: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const deleteAdmin = async (adminData: AdminInput): Promise<IAdmin> => {
    try {
        // Validar datos de entrada
        const validatedId = validateId(adminData.id);

        // Eliminar el admin por id directamente
        const deletedAdmin = await Admin.findByIdAndDelete(validatedId);

        if (!deletedAdmin) {
            throw new NotFoundError(
                "No se encontró un administrador con ese ID", // frontend
                { id: validatedId },
                "Admin no encontrado para eliminación" // consola
            );
        }

        return deletedAdmin;
        // ** TS: Definir el tipo del parámetro error como unknown para un control más seguro **
    } catch (error: unknown) {

        // ** TS: Comprobación de tipo seguro usando instanceof para errores específicos **
        // ** TS: Si el error es una instancia de ValidationError o NotFoundError, se maneja específicamente **
        handleLogicError(error)
    }
};
