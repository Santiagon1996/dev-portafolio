import { Schema, Document, models, model } from "mongoose";

export interface ISkill extends Document {
    name: string;
    level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    category?: "Frontend" | "Backend" | "DevOps" | "Database" | "Other";
    icon?: string;
    color?: string;
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
            enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
            default: "Intermediate",
        },
        category: {
            type: String,
            enum: ["Frontend", "Backend", "DevOps", "Database", "Other"],
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