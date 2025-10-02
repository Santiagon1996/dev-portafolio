import { Schema, Document, models, model } from "mongoose";
import { slugify } from "../../utils/slugify"


export interface ISkill extends Document {
    name: string;
    level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    category?: "Frontend" | "Backend" | "DevOps" | "Database" | "Other";
    icon?: string;
    color?: string;
    slug: string;
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
        },
        icon: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
        },
        slug: { type: String, required: true, unique: true, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);
skillSchema.pre("validate", function (next) {
    if (this.isNew || this.isModified("name")) {
        this.slug = slugify(this.name);
    }
    next();
});

skillSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update && typeof update === "object" && "name" in update && typeof update.name === "string") {
        (update as { [key: string]: unknown; slug?: string; name?: string }).slug = slugify(update.name);
    }
    next();
});

const Skill = models.Skill || model<ISkill>("Skill", skillSchema);

export { Skill };