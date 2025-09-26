import { Admin, IAdmin } from "@lib/db/models/index";  // Aquí usas un tipo (IAdmin), eso es TS
import { errors, validators } from "@shared";

const { validateUserRegister } = validators;
const { DuplicityError, SystemError, ValidationError } = errors;

/**
 * addAdmin - Función para crear un nuevo administrador en la base de datos.
 * 
 * @param adminData - Objeto con las propiedades necesarias para crear un Admin (username, email, password).
 * @returns Promise<IAdmin> - Retorna una promesa que resuelve con el nuevo documento Admin tipado.
 * 
 * Explicación:
 * 1. Se define la interfaz AdminInput para tipar claramente la estructura de entrada esperada.
 * 2. Se valida la entrada usando una función externa `validateUserRegister`. Esta es lógica normal,
 *    pero el tipado TS garantiza que adminData tenga las propiedades correctas.
 * 3. Se consulta la base de datos para verificar duplicidad por email o username.
 * 4. Si ya existe un admin con esos datos, se lanza un error personalizado `DuplicityError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si no hay duplicidad, se crea el nuevo administrador con `Admin.create()`.
 * 6. El bloque try/catch:
 *    - Atrapa errores y los tipa como `unknown` para forzar comprobaciones seguras.
 *    - Si el error es un `ValidateError` o `DuplicityError`, se relanza para que el handler externo
 *      pueda devolver el mensaje adecuado al cliente.
 *    - Si ocurre un error genérico, se encapsula en un `SystemError` con un mensaje amigable y un detalle
 *      para consola.
 *    - Si el error no es un objeto Error, se convierte a string y también se lanza un `SystemError`.
 * 
 * Ventajas TS:
 * - Tipado fuerte en entrada y salida.
 * - Uso seguro de errores con instanceof.
 * - Mejor autocompletado y detección temprana de errores de tipo.
 */
/**
 * Captura y manejo explícito de errores de validación de Zod:
 * - Zod lanza un ZodError con un arreglo de issues describiendo los errores.
 * - Al capturar este error, se transforma en un ValidateError personalizado
 *   con un mensaje claro para el frontend y detalles estructurados para debugging.
 * - Esto garantiza mensajes explícitos y uniformes en la interfaz de error.
 */


// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface AdminInput {
    username: string;
    email: string;
    password: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const addAdmin = async (adminData: AdminInput): Promise<IAdmin> => {
    try {
        // Validar datos de entrada y usar los datos validados
        const validatedData = validateUserRegister(adminData);

        // Verificamos si ya existe un admin con ese email o username
        const existingAdmin = await Admin.findOne({
            $or: [{ email: validatedData.email }, { username: validatedData.username }],
        });

        if (existingAdmin) {
            throw new DuplicityError(
                "Ya existe un administrador con ese correo o nombre de usuario", // frontend
                { email: validatedData.email, username: validatedData.username },
                "Admin duplicado (email o username)" // consola
            );
        }

        // Crear nuevo admin con datos validados
        const newAdmin = await Admin.create(validatedData);
        return newAdmin;
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
