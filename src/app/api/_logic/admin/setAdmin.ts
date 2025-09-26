import { Admin } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import bcrypt from "bcryptjs";

const { validateUserLogin } = validators;
const { CredentialsError, SystemError, ValidationError, NotFoundError } = errors;

/**
 * setAdmin - Funcion para comprobar las credenciales de un administrador y devolver su información. 
 * 
 * @param adminData - Objeto con las propiedades username y password del administrador.
 * 
    * @returns Promise<AuthenticatedAdmin> - Retorna una promesa que resuelve con un objeto que contiene el id y username del administrador autenticado.
    * 
    * Explicación:
    * 1. Se define una interfaz AdminInput para tipar claramente la estructura de entrada esperada.
    * 2. Se valida la entrada usando una función externa `validateUserLogin`. Esta es lógica normal, pero el tipado TS garantiza que adminData tenga las propiedades correctas.
    * 3. Se consulta la base de datos para verificar si existe un administrador con el username proporcionado.
    * 4. Si no se encuentra el administrador, se lanza un error NotFoundError con un mensaje amigable para el usuario y un detalle técnico para la consola.
    * 5. Si se encuentra el administrador, se compara la contraseña proporcionada con la almacenada en la base de datos usando bcrypt.
    * 6. Si la contraseña no coincide, se lanza un CredentialsError con un mensaje amigable para el usuario y un detalle técnico para la consola.
    * 7. Si las credenciales son correctas, se retorna un objeto con el id y username del administrador autenticado.
    * 8. El bloque try/catch:
    *    - Atrapa errores y los tipa como `unknown` para forzar comprobaciones seguras.
    *    - Si el error es un ValidateError o CredentialsError, se relanza para que el handler externo pueda devolver el mensaje adecuado al cliente.
    *    - Si ocurre un error NotFoundError, se maneja específicamente para que el frontend o API pueda mostrar un mensaje amigable.
    *   - Si ocurre un error genérico, se encapsula en un SystemError con un mensaje amigable y un detalle para consola.
    * - Si el error no es un objeto Error, se convierte a string y también se lanza un SystemError.
    * Ventajas TS:
    * - Tipado fuerte en entrada y salida.
    * - Uso seguro de errores con instanceof.
    * Mejor autocompletado y detección temprana de errores de tipo.
    * Captura y manejo explícito de errores de validación de Zod:
    * - Zod lanza un ZodError con un arreglo de issues describiendo los errores.
    * - Al capturar este error, se transforma en un ValidateError personalizado con un mensaje claro para el frontend y detalles estructurados para debugging.
    * - Esto garantiza mensajes explícitos y uniformes en la interfaz de error.
 */


// ** Definición de una interfaz para tipar el objeto que esperas recibir **
export interface AdminInput {
    username: string;
    password: string;
}
// ** Definición de una interfaz para el objeto que se retorna al autenticar un administrador **
export interface AuthenticatedAdmin {
    id: string;
    username: string;
}

// ** Función asíncrona que devuelve una promesa de tipo AuthenticatedAdmin **
// ** Esta función se encarga de autenticar al administrador y devolver su información básica **
export const setAdmin = async (adminData: AdminInput): Promise<AuthenticatedAdmin> => {

    try {
        // Validar datos de entrada
        const validatedData = validateUserLogin(adminData);

        // Verificamos si ya existe un admin con ese username, Consulta en la base de datos

        const existingAdmin = await Admin.findOne({ username: validatedData.username }).select('+password').exec();

        if (!existingAdmin) {
            throw new NotFoundError(
                'Administrador no encontrado',
                { username: validatedData.username },
                'Admin not found'
            );
        }

        let match: boolean = false;

        match = await bcrypt.compare(validatedData.password, existingAdmin.password);

        if (!match) {
            throw new CredentialsError(
                'Las credenciales proporcionadas son incorrectas',
                {},
                'Invalid admin credentials'
            );
        }

        return {
            id: existingAdmin._id.toString(),
            username: existingAdmin.username,
        };
    } catch (error: unknown) {
        // ** TS: Comprobación de tipo seguro usando instanceof para errores específicos **
        // ** TS: Si el error es una instancia de ValidationError o DuplicityError, se maneja específicamente **
        if (error instanceof ValidationError) {
            // Log detallado para el dev 
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            // Lo relanzas para que lo maneje el frontend o API
            throw error;
        }
        if (error instanceof CredentialsError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error; // Lo relanzas para que el handler externo lo maneje
        }

        if (error instanceof NotFoundError) {
            // Log detallado para el dev 
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            // Lo relanzas para que lo maneje el frontend o API
            throw error;
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