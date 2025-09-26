// lib/db.ts
import mongoose from "mongoose";

const { MONGODB_URI, DATABASE_URL, DATABASE_NAME } = process.env;


//Las unicas diferencias al incluit TS en este archivo son:
//1. Importar mongoose desde "mongoose" para usar sus tipos
//2. Usar tipos de TypeScript para las variables y funciones
//3. Usar tipos de TypeScript para las variables de entorno
//4. Usar tipos de TypeScript para las funciones de conexión y desconexión



// Decide qué URI usar
let DATABASE_URI: string;
//1. Verifica si MONGODB_URI está definido
//2. Si no, verifica si DATABASE_URL y DATABASE_NAME están definidos
//3. Si ninguno de los anteriores está definido, lanza un error
if (MONGODB_URI) {
    DATABASE_URI = MONGODB_URI;
} else if (DATABASE_URL && DATABASE_NAME) {
    DATABASE_URI = `${DATABASE_URL}/${DATABASE_NAME}`;
} else {
    throw new Error("No se ha definido ninguna URI para la base de datos");
}

//4. Con el declare global lo utilizo para evitar el uso de 'any' en la propiedad mongoose
//5. Esto es necesario para que TypeScript reconozca la propiedad mongoose en el objeto global
//6. Esto es útil para evitar problemas de tipado y mejorar la mantenibilidad del código
declare global {
    // Extiende la interfaz Global para incluir la propiedad mongoose
    // Esto evita el uso de 'any'
    // eslint-disable-next-line no-var
    var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

//7. Utilizo un objeto global para almacenar la conexión de Mongoose
//8. Esto es útil para evitar múltiples conexiones a la base de datos en un entorno de desarrollo
//9. Esto es especialmente útil en Next.js, donde el código se ejecuta en el servidor y en el cliente
//10. Almacenar la conexión en un objeto global permite reutilizar la misma conexión en lugar de crear una nueva cada vez que se importa el módulo
//11. Esto mejora el rendimiento y reduce el uso de recursos
const globalWithMongoose = global as typeof global & {
    mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

//12. Verifica si la propiedad mongoose ya está definida en el objeto global
//13. Si no está definida, la inicializa con un objeto que contiene conn y promise 
if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { conn: null, promise: null };
}

//14. con el cached almaceno la conexión y la promesa de conexión
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = globalWithMongoose.mongoose!;

//15. Exporta la función connectToDatabase para que pueda ser utilizada en otros módulos
//16. Esta función se encarga de conectar a la base de datos MongoDB
export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(DATABASE_URI).then((mongooseInstance) => {
            console.log(
                `Conectado a MongoDB: ${DATABASE_URI.includes("localhost") ? "local" : "Atlas"
                }`
            );
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error de conexión a MongoDB (${DATABASE_URI}):`, error.message);
        } else {
            console.error(`Error de conexión a MongoDB (${DATABASE_URI}):`, error);
        }
        throw error;
    }
}

//17. Exporta la función disconnectFromDatabase para que pueda ser utilizada en otros módulos
//18. Esta función se encarga de desconectar de la base de datos MongoDB
export async function disconnectFromDatabase(): Promise<void> {
    if (!cached.conn) {
        console.log("No hay conexión activa para desconectar");
        return;
    }

    try {
        await mongoose.disconnect();
        console.log("Desconectado de MongoDB");
        cached.conn = null;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error al desconectar de MongoDB:", error.message);
        } else {
            console.error("Error al desconectar de MongoDB:", error);
        }
        throw error;
    }
}

//19. con el process.on se maneja la señal SIGINT para cerrar la conexión a la base de datos
//20. Esto es útil para evitar conexiones abiertas al finalizar el proceso
process.on("SIGINT", async () => {
    await disconnectFromDatabase();
    process.exit(0);
});
