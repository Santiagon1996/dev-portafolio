import { Schema, Document, models, model } from "mongoose";
import { slugify } from "../../utils/slugify"



export interface IExperience extends Document {
    company: string;
    role: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    technologies?: string[];
    isCurrent?: boolean;
    slug: string;

}

const experienceSchema = new Schema<IExperience>(
    {
        company: {
            type: String,
            required: [true, "El nombre de la empresa es obligatorio"],
            trim: true,
        },
        role: {
            type: String,
            required: [true, "El rol es obligatorio"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "La descripción es obligatoria"],
        },
        startDate: {
            type: Date,
            required: [true, "La fecha de inicio es obligatoria"],
        },
        endDate: {
            type: Date,
        },
        location: {
            type: String,
            trim: true,
        },
        technologies: [{
            type: String,
            trim: true,
        }],
        isCurrent: {
            type: Boolean,
            default: false,
        },
        slug: { type: String, required: true, unique: true, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);
experienceSchema.pre("validate", function (next) {
    if (this.isNew || this.isModified("role")) {
        this.slug = slugify(this.role);
    }
    next();
});

experienceSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update && typeof update === "object" && "role" in update && typeof update.role === "string") {
        (update as { [key: string]: unknown; slug?: string; role?: string }).slug = slugify(update.role);
    }
    next();
});
const Experience = models.Experience || model<IExperience>("Experience", experienceSchema);

export { Experience };
