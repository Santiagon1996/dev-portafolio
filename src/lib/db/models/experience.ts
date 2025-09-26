import { Schema, Document, models, model } from "mongoose";

export interface IExperience extends Document {
    company: string;
    role: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    technologies?: string[];
    isCurrent?: boolean;
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
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Experience = models.Experience || model<IExperience>("Experience", experienceSchema);

export { Experience };
