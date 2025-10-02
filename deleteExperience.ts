import { Experience, IExperience } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { validateId } = validators;
const { SystemError, ValidationError, DuplicityError, NotFoundError } = errors;


/**
 * deleteExperience - Función para eliminar un post de experiencia en la base de datos.
 *
 * @param experienceData - Objeto con las propiedades necesarias para eliminar un ExperiencePost (title, content, etc.).
 * @returns Promise<IExperiencePost> - Retorna una promesa que resuelve con una Experience eliminada.
 *
 *  Explicación:
 * 1. Se define la interfaz ExperienceInput para tipar claramente la estructura de entrada esperada (solo ID).
 * 2. Se valida la entrada usando una función externa `validateId`. Esta es lógica normal,
 *    pero el tipado TS garantiza que experienceData tenga las propiedades correctas.
 * 3. Se elimina la experiencia directamente usando `Experience.findByIdAndDelete()`.
 * 4. Si no se encuentra una experiencia con ese ID, se lanza un error personalizado `NotFoundError`.
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



interface ExperienceInput {
    id: string;
}

export const deleteExperience = async (experienceData: ExperienceInput): Promise<IExperience> => {

    try {

        const validatedId = validateId(experienceData.id);



        const deletedExperience = await Experience.findByIdAndDelete(validatedId);

        if (!deletedExperience) {
            throw new NotFoundError(
                "No se encontró una experiencia con ese ID", // frontend
                { id: validatedId },
                "Experiencia no encontrada para eliminación" // consola
            );
        }


        console.log(`Experiencia eliminada exitosamente: ${deletedExperience._id} - "${deletedExperience.role}"`);

        return deletedExperience;
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
        if (error instanceof NotFoundError) {
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
