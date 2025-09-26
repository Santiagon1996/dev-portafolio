import { Schema, Document, model, models } from "mongoose";
import * as bcrypt from "bcryptjs";
/**
 * @file Admin Schema
 * @description Define el esquema y modelo para los administradores del sistema.
 * Utiliza TypeScript para tipar el esquema y asegurar la integridad de los datos.
 */
// ** Interface que extiende Document (de mongoose) para tipar el Admin **
export interface IAdmin extends Document {
    username: string;
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// ** Schema tipado con IAdmin para asegurar que el esquema cumple la interfaz **
const AdminSchema = new Schema<IAdmin>(
    {
        username: {
            type: String,
            required: [true, "El nombre de usuario es obligatorio"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "El correo electrónico es obligatorio"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "La contraseña es obligatoria"],
            minlength: 6,
            select: false, // No se devuelve el password por defecto en queries
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Middleware para hashear la contraseña antes de guardar
AdminSchema.pre<IAdmin>("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas (definido en la interfaz IAdmin)
AdminSchema.methods.comparePassword = async function (
    this: IAdmin,
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};


// Exportar modelo, reutilizando el ya creado para evitar recompilar el modelo
const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);

export default Admin;
/**
 * 🧠 EXPLICACIÓN DEL USO DE TYPESCRIPT EN ESTE SCHEMA (PASO A PASO)
 *
 * 1- `import { Schema, Document, model, models } from "mongoose";`
 *    → Importamos herramientas de Mongoose con soporte de tipos.
 *    → TypeScript ya incluye definiciones de tipo para ellas, así que obtienes autocompletado y validación.
 *
 * 2- `import bcrypt from "bcryptjs";`
 *    → Importamos la librería para hashear contraseñas.
 *    → Si tienes instalado `@types/bcryptjs`, TypeScript tipa automáticamente las funciones como `compare()` y `hash()`.
 *
 * 3- `interface IAdmin extends Document { ... }`
 *    → Creamos una interfaz que define la forma que tendrá cada documento del modelo `Admin`.
 *    → Al extender `Document`, incluimos todos los métodos de Mongoose (`.save()`, `.toObject()`, etc.).
 *    → También agregamos un método propio `comparePassword`, que devuelve una `Promise<boolean>`.
 *
 * 4- `const AdminSchema = new Schema<IAdmin>({...})`
 *    → Tipamos el esquema con `<IAdmin>`, lo que obliga a que coincida con la interfaz.
 *    → Esto activa validaciones de tipo y autocompletado al definir y usar el modelo.
 *
 * 5- Opciones del esquema:
 *    → `{ timestamps: true }`: agrega `createdAt` y `updatedAt`, bien tipado por Mongoose.
 *    → `{ versionKey: false }`: elimina el campo `__v`, también reconocido por TypeScript.
 *
 * 6- Middleware `.pre("save", function...)`
 *    → Este middleware corre antes de guardar un documento.
 *    → IMPORTANTE: Tipar el middleware como `.pre<IAdmin>("save", function...)` para que `this` esté bien tipado.
 *    → Esto permite acceder a `this.password` sin errores de tipo.
 *
 * 7- Método `comparePassword`
 *    → Método personalizado para comparar contraseñas.
 *    → Es mejor tiparlo así:
 *         `function (this: IAdmin, candidatePassword: string): Promise<boolean>`
 *      para que `this` esté correctamente tipado como instancia de `IAdmin`.
 *
 * 8- `const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);`
 *    → Creamos el modelo asegurándonos de tiparlo con `<IAdmin>`.
 *    → Esto asegura que cualquier instancia (por ejemplo, `await Admin.findOne(...)`) tenga tipado completo.
 *
 * ✅ Con este enfoque, TypeScript:
 *    - Valida tus campos y métodos.
 *    - Da autocompletado preciso.
 *    - Evita errores comunes por campos inexistentes.
 */
