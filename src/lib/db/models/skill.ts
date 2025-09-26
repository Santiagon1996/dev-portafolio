import { Schema, Document, models, model } from "mongoose";

export interface ISkill extends Document {
    name: string;
    level?: "beginner" | "intermediate" | "advanced";
    category?: string; // frontend, backend, tools, etc
    icon?: string; // nombre de ícono o URL
    color?: string; // color opcional (ej. para badges)
}

const skillSchema = new Schema<ISkill>(
    {
        name: {
            type: String,
            required: [true, "El nombre de la habilidad es obligatorio"],
            unique: true,
            trim: true,
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "intermediate",
        },
        category: {
            type: String,
            trim: true,
            lowercase: true,
        },
        icon: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Skill = models.Skill || model<ISkill>("Skill", skillSchema);

export { Skill };