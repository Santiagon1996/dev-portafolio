import { errors } from "@shared";

const { SystemError, ValidationError, DuplicityError, NotFoundError } = errors;

/**
 * Manejo centralizado de errores para lógica de negocio.
 * Relanza errores conocidos, envuelve errores inesperados en SystemError.
 */
export function handleLogicError(error: unknown): never {
    // Errores de validación
    if (error instanceof ValidationError) {
        console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
        throw error;
    }
    // Errores de duplicidad
    if (error instanceof DuplicityError) {
        console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
        throw error;
    }
    // Errores de not found (opcional, si lo usas en la lógica)
    if (error instanceof NotFoundError) {
        console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
        throw error;
    }
    // Errores inesperados
    if (error instanceof Error) {
        console.error(`[SystemError] ${error.message}`);
        throw new SystemError(
            "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.",
            { message: error.message }
        );
    }
    // Errores desconocidos
    console.error(`[UnknownError] ${String(error)}`);
    throw new SystemError(
        "Error desconocido. Contacte a soporte.",
        { message: String(error) }
    );
}