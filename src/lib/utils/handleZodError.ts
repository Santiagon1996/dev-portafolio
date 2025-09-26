import { ZodError } from 'zod';
import { ValidationError, SystemError } from "@shared/errors/errors";

//Funcion que maneja errores de Zod y lanza un ValidationError personalizado
// Recibe el error de Zod y un contexto para el mensaje de error
// Esto permite que puedas reutilizar esta función en diferentes validaciones
export function handleZodError(error: unknown, context: string) {
    if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        throw new ValidationError(`Validation failed for ${context}`, details);
    }
    throw new SystemError(`Unexpected error during ${context} validation`, [{ message: (error as Error).message }]);
}

/*
// En tu frontend podrías hacer:
try {
    await createBlog(blogData);
} catch (error) {
    if (error.type === 'VALIDATION') {
        // Mostrar errores específicos por campo
        error.details.forEach(fieldError => {
            console.log(`Campo: ${fieldError.field}`);
            console.log(`Error: ${fieldError.message}`);
            
            // Mostrar en UI
            showFieldError(fieldError.field, fieldError.message);
        });
    }
}
    /*
    En tu backend podrías hacer:
    try {
        await createBlog(blogData);
    } catch (error) {
        if (error instanceof ValidationError) {
            // Manejar errores de validación
            console.error('Errores de validación:', error.details);
        } else {
            // Manejar otros tipos de errores
            console.error('Error inesperado:', error);
        }
    }
    */