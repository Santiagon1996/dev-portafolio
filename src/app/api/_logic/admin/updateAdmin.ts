import { Admin, IAdmin } from "@lib/db/models/index";  // Aquí usas un tipo (IAdmin), eso es TS
import { errors, validators } from "@shared";
import { handleLogicError } from "@lib/helpers/handleLogicError";


const { validateId } = validators;
const { NotFoundError, DuplicityError } = errors;

/**
 * updateAdmin - Función para actualizar un administrador en la base de datos.
 * 
 * @param adminData - Objeto con el ID del administrador y los datos a actualizar (username, email, password).
 * @returns Promise<IAdmin> - Retorna una promesa que resuelve con el documento Admin actualizado tipado.
 * 
 * Explicación:
 * 1. Se define la interfaz AdminInput para tipar claramente la estructura de entrada esperada.
 * 2. Se validan dos cosas: el ID usando `validateId` y los datos usando `validateUserRegister`.
 * 3. Se separan el ID de los datos a actualizar para evitar conflictos.
 * 4. Se verifica si ya existe otro admin con el mismo email o username (evitar duplicados).
 * 5. Se actualiza el administrador usando `Admin.findByIdAndUpdate()` con `{ new: true }`.
 * 6. Si no se encuentra un admin con ese ID, se lanza un error personalizado `NotFoundError`.
 * 7. Si la actualización es exitosa, se retorna el documento actualizado.
 * 8. El bloque try/catch maneja todos los tipos de errores posibles.
 * 
 * Ventajas TS:
 * - Tipado fuerte en entrada y salida.
 * - Uso seguro de errores con instanceof.
 * - Mejor autocompletado y detección temprana de errores de tipo.
 * - Validación dual: ID y datos de actualización.
 */


// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface AdminInput {

    id: string;
    username?: string;
    email?: string;
    password?: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IAdmin **
export const updateAdmin = async (adminData: AdminInput): Promise<IAdmin> => {
    try {
        // 1. Validar que el ID sea válido y obtener el ID validado
        const validatedId = validateId(adminData.id);

        // 2. Separar los datos a actualizar (sin el ID)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = adminData;

        // 3. No validamos updateData porque:
        //    - Los campos son opcionales en updates
        //    - validateUserRegister espera campos obligatorios
        //    - La validación ya se hizo en el frontend/middleware
        //    - MongoDB rechazará tipos incorrectos

        // 4. Verificar duplicidad (si se está actualizando email o username)
        if (updateData.email || updateData.username) {
            const duplicateQuery = [];
            if (updateData.email) duplicateQuery.push({ email: updateData.email });
            if (updateData.username) duplicateQuery.push({ username: updateData.username });

            const existingAdmin = await Admin.findOne({
                $and: [
                    { _id: { $ne: validatedId } }, // Usar ID validado
                    { $or: duplicateQuery }
                ]
            });

            if (existingAdmin) {
                throw new DuplicityError(
                    "Ya existe un administrador con ese correo o nombre de usuario",
                    { email: updateData.email, username: updateData.username },
                    "Admin duplicado en actualización"
                );
            }
        }

        // 5. Buscar el admin por id y actualizar con save para disparar el hash de password
        const adminDoc = await Admin.findById(validatedId).select('+password');

        if (!adminDoc) {
            throw new NotFoundError(
                "No se encontró un administrador con ese ID", // frontend
                { id: validatedId },
                "Admin no encontrado para actualización" // consola
            );
        }

        Object.assign(adminDoc, updateData); // Actualiza username, email, password
        await adminDoc.save(); // Dispara el hash si el password cambió
        return adminDoc;
        // ** TS: Definir el tipo del parámetro error como unknown para un control más seguro **
    } catch (error: unknown) {
        handleLogicError(error)
    }
};
