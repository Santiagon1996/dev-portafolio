import { Project, IProject } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateProject } = validators;
const { SystemError, ValidationError, DuplicityError } = errors;


/**
 * addProject - Función para crear un nuevo proyecto en la base de datos.
 *
 * @param projectData - Objeto con las propiedades necesarias para crear un Project (title, content, etc.).
 * @returns Promise<IProject> - Retorna una promesa que resuelve con el nuevo documento Project tipado.
 *
 * Explicación:
 * 1. Se define la interfaz ProjectInput para tipar claramente la estructura de entrada esperada.
 * 2. Se valida la entrada usando una función externa `validateProject`. Esta es lógica normal,
 *    pero el tipado TS garantiza que projectData tenga las propiedades correctas.
 * 3. Se consulta la base de datos para verificar duplicidad por título y slug.
 * 4. Si ya existe un proyecto con ese título, se lanza un error personalizado `DuplicityError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si no hay duplicidad, se crea el nuevo proyecto con `Project.create()`.
 * 6. El bloque try/catch:
 *    - Atrapa errores y los tipa como `unknown` para forzar comprobaciones seguras.
 *    - Si el error es un `ValidationError` o `DuplicityError`, se relanza para que el handler externo
 *      pueda devolver el mensaje adecuado al cliente.
 *    - Si ocurre un error genérico, se encapsula en un `SystemError` con un mensaje amigable y un detalle
 *      para consola.
 * 
 * Ventajas TS:
 * - Tipado fuerte en entrada y salida.
 * - Uso seguro de errores con instanceof.
 * - Mejor autocompletado y detección temprana de errores de tipo.
 * 
 * Captura y manejo explícito de errores de validación de Zod:
 * - Zod lanza un ZodError con un arreglo de issues describiendo los errores.
 * - Al capturar este error, se transforma en un ValidationError personalizado
 *   con un mensaje claro para el frontend y detalles estructurados para debugging.
 * - Esto garantiza mensajes explícitos y uniformes en la interfaz de error.
 */


interface ProjectInput {
    title: string;
    description: string;
    techStack: string[];
    repoUrl: string;
    images: string[];
    tags: string[];
    featured?: boolean
    createdAt: Date;

}

export const addProject = async (projectData: ProjectInput): Promise<IProject> => {

    try {

        const validatedData = validateProject(projectData);

        const potentialSlug = slugify(validatedData.title);


        const existingProject = await Project.findOne({
            $or: [{ title: validatedData.title }, { slug: potentialSlug }],
        });

        if (existingProject) {
            const conflictType = existingProject.title === validatedData.title ? "title" : "slug";
            throw new DuplicityError("Ya existe un proyecto con ese título", // publicMessage (más claro)
                {
                    title: validatedData.title,
                    slug: potentialSlug,
                    //  Información adicional para debugging
                    conflictsWith: existingProject._id.toString(),
                    conflictType: conflictType,
                    existingTitle: existingProject.title,
                    existingSlug: existingProject.slug
                }, // details
                `Proyecto duplicado por ${conflictType}` // internalMessage
            );
        }

        const newProject = await Project.create(validatedData);
        return newProject;
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

}
