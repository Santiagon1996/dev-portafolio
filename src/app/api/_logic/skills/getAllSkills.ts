import { Skill, ISkill } from "@lib/db/models/index";
import { errors } from "@shared";

const { SystemError, NotFoundError } = errors;

/**
 * getAllSkills - Función para obtener todas las habilidades con paginación y filtros.
 * 
 * CONCEPTOS TYPESCRIPT APLICADOS:
 * - Interface para tipar parámetros de entrada (GetAllSkillsOptions)
 * - Interface para tipar respuesta estructurada (SkillsPaginatedResponse)
 * - Generic types con Promise<T>
 * - Optional properties con '?'
 * - Array typing con ISkill[]
 * - Record<string, unknown> para objetos dinámicos
 * - Destructuring con default values
 * - Union types con string | number
 * - Type guards con instanceof
 * - Utility type unknown para type safety
 */

// 📚 CONCEPTO TS: Interface para definir la estructura de parámetros opcionales
// ¿Por qué interface? Porque define la "forma" de un objeto de manera clara
// ¿Por qué propiedades opcionales? Porque queremos flexibilidad en las llamadas
interface GetAllProjectOptions {
    page?: number;        // OPCIONAL: ¿Qué página? (si no se pasa, default = 1)
    limit?: number;       // OPCIONAL: ¿Cuántos por página? (si no se pasa, default = 10)
    name?: string;      // OPCIONAL: ¿Filtrar por nombre? (undefined = no filtrar)
    level?: string;      // OPCIONAL: ¿Filtrar por nivel? (undefined = no filtrar)
}
// ⚡ BENEFICIO: Puedes llamar la función como:
// getAllProjects() ✅
// getAllProjects({}) ✅  
// getAllProjects({ page: 2 }) ✅
// getAllProjects({ page: 2, limit: 5, isPublished: true }) ✅

// 📚 CONCEPTO TS: Interface para definir la estructura de respuesta
// ¿Por qué otra interface? Porque la respuesta tiene una estructura fija y compleja
interface SkillPaginatedResponse {
    skills: ISkill[];   // ARRAY: Lista de skills (cada elemento es de tipo ISkill)
    total: number;        // PRIMITIVO: Total de skills en la BD que cumplen filtros
    page: number;         // PRIMITIVO: Página actual que estamos viendo
    totalPages: number;   // PRIMITIVO: Cuántas páginas hay en total
}
// ⚡ BENEFICIO: El llamador sabe exactamente qué propiedades va a recibir
// const { skills, total, page, totalPages } = await getAllSkills() ← Autocompletado perfecto

// 📚 CONCEPTO TS: Función async con tipos específicos en parámetros y retorno
// ¿Por qué GetAllProjectOptions = {}? Para que la función sea llamable sin parámetros
// ¿Por qué Promise<SkillPaginatedResponse>? Porque es async y devuelve una estructura específica
export const getAllSkills = async (
    options: GetAllProjectOptions = {} // DEFAULT: objeto vacío si no se pasa nada
): Promise<SkillPaginatedResponse> => {
    try {
        // 📚 CONCEPTO TS: Destructuring assignment con default values
        // Si options.page no existe, usa 1
        // Si options.limit no existe, usa 10  
        // Si options.isPublished, tags, author no existen, quedan undefined
        const {
            page = 1,           // number (con default)
            limit = 10,         // number (con default) 
            name,        // string | undefined
            level,               // string | undefined
        } = options;
        // ⚡ BENEFICIO: Código más limpio y values por defecto garantizados

        // 📚 CONCEPTO TS: Record<string, unknown> para objetos dinámicos
        // ¿Por qué Record? Porque vamos a construir el objeto agregando propiedades dinámicamente
        // ¿Por qué <string, unknown>? Claves=string, valores=cualquier tipo (boolean, object, string, etc.)
        // ¿Por qué unknown y no any? Porque unknown es type-safe, any no
        const filter: Record<string, unknown> = {};

        // 📚 CONCEPTO TS: Construcción condicional del objeto filter
        // Solo agregamos propiedades si los valores existen y son válidos
        if (name !== undefined) {
            filter.name = name;  // Agrega: { name: "JavaScript" }
        }

        if (level) {
            filter.level = level;            // Agrega: { level: "intermediate" }
        }
        // ⚡ RESULTADO: filter puede ser {} o { title: ["MIT", "Harvard"] } o { repoUrl: "https://github.com/user/repo" }

        // 📚 CONCEPTO TS: Operaciones matemáticas con tipos number
        // TypeScript sabe que page y limit son number, por lo que skip también es number
        const skip: number = (page - 1) * limit;
        // ⚡ BENEFICIO: Si pasaras un string por error, TypeScript te avisaría

        // 📚 CONCEPTO TS: Promise.all con array destructuring y tipos inferidos
        // Promise.all<[ISkill[], number]> - TypeScript infiere los tipos de retorno
        const [skills, total] = await Promise.all([
            // Primera promesa: Skill.find() retorna Promise<ISkill[]>
            Skill.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            // Segunda promesa: countDocuments() retorna Promise<number>
            Skill.countDocuments(filter)
        ]);
        // ⚡ RESULTADO: skills es ISkill[], total es number - TypeScript lo sabe automáticamente


        // 📚 CONCEPTO TS: Operaciones matemáticas con Math y tipos number
        const totalPages: number = Math.ceil(total / limit);
        // TypeScript garantiza que total y limit son numbers, por lo que totalPages también

        // 📚 CONCEPTO TS: Object literal que cumple con la interface EducationPaginatedResponse
        // TypeScript verifica que este objeto tenga exactamente las propiedades requeridas
        return {
            skills,        // ISkill[] ✅ Cumple con la interface
            total,        // number ✅ Cumple con la interface
            page,         // number ✅ Cumple con la interface
            totalPages    // number ✅ Cumple con la interface
        };
        // ⚡ BENEFICIO: Si faltara alguna propiedad, TypeScript te avisaría con error


    } catch (error: unknown) {
        // 📚 CONCEPTO TS: Type parameter 'unknown' para error handling seguro
        // ¿Por qué unknown? Porque no sabemos qué tipo de error puede llegar
        // ¿Por qué no any? Porque unknown nos obliga a verificar el tipo antes de usar

        // 📚 CONCEPTO TS: Type guard con 'instanceof' para verificación de tipos
        // Verificamos si error es una instancia de la clase Error nativa de JS
        if (error instanceof NotFoundError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error; // Lo relanzas para que el handler externo lo maneje
        } else if (error instanceof Error) {
            // Dentro de este bloque, TypeScript SABE que error es de tipo Error
            // Por eso puedes acceder a error.message sin problemas
            console.error(`[SystemError] ${error.message}`); // ✅ error.message existe en Error

            throw new SystemError(
                "Error al obtener la lista de blogs",
                { message: error.message }  // ✅ TypeScript sabe que message es string
            );
        }

        // 📚 CONCEPTO TS: String() conversion para unknown types
        // Si el error NO es instancia de Error, lo convertimos a string de forma segura
        console.error(`[UnknownError] ${String(error)}`);
        throw new SystemError(
            "Error desconocido al obtener blogs",
            { message: String(error) }  // String() maneja cualquier tipo de forma segura
        );
        // ⚡ BENEFICIO: Manejo de errores completamente type-safe
    }
};

/* 
📚 EJEMPLOS DE USO Y CONCEPTOS TS APLICADOS:

✅ EJEMPLO 1: Sin parámetros (usa defaults)
const resultado1 = await getAllBlogs();
 TypeScript sabe que resultado1 es: BlogsPaginatedResponse
Por lo que puedes hacer: resultado1.blogs, resultado1.total, etc.

 EJEMPLO 2: Con parámetros parciales  
const resultado2 = await getAllBlogs({ 
    page: 1, 
    limit: 5, 
    isPublished: true 
});
 TypeScript verifica que los tipos sean correctos:
 page debe ser number ✅
 limit debe ser number ✅ 
 isPublished debe ser boolean ✅

 ✅ EJEMPLO 3: Destructuring con types inferidos
const { blogs, totalPages } = await getAllBlogs({ 
    page: 2,
    tags: ["javascript", "typescript"]
});
 TypeScript sabe que:
 - blogs es IBlogPost[]
 - totalPages es number
 - Tienes autocompletado perfecto

 ❌ EJEMPLO 4: Error detectado por TypeScript
const mal = await getAllBlogs({
    page: "2",        // ❌ Error! Expected number, got string
    limit: true,      // ❌ Error! Expected number, got boolean  
    tags: "invalid"   // ❌ Error! Expected string[], got string
});

📋 RESUMEN DE CONCEPTOS TS UTILIZADOS:
✅ Interface para tipado de objetos
✅ Optional properties (?)
✅ Generic types Promise<T>
✅ Array typing T[]
✅ Record<K, V> para objetos dinámicos  
✅ Destructuring con defaults
✅ Type guards (instanceof)
✅ Unknown type para safety
✅ Type inference automática
✅ Union types (T | undefined)
✅ Object literal type checking
*/