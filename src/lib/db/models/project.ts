
import { Schema, Document, model, models } from "mongoose";

/**
 * 1️⃣ Tipado con TypeScript:
 * Definimos una interfaz IProject para describir el tipo de los documentos en MongoDB.
 * Esto te da autocompletado y seguridad de tipos al trabajar con datos del modelo.
 */
export interface IProject extends Document {
    title: string;
    description: string;
    techStack: string[]; //array de tecnologías utilizadas en formato de string
    repoUrl?: string;//el signo de interrogación indica que este campo es opcional
    demoUrl?: string;
    images?: string[];
    tags?: string[];
    featured: boolean;
    createdAt?: Date;
}

const projectSchema = new Schema<IProject>(// <- Aquí usamos la interfaz IProject para tipar el esquema
    {
        title: {
            type: String,
            required: [true, "El título del proyecto es obligatorio"],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: [true, "La descripción del proyecto es obligatoria"],
            trim: true,
        },
        techStack: {
            type: [String],
            required: true,
        },
        repoUrl: {
            type: String,
            trim: true,
        },

        images: {
            type: [String],
            default: [],
        },
        tags: {
            type: [String],
            default: [],
        },
        featured: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Project = models.Project || model<IProject>("Project", projectSchema);

export { Project };
