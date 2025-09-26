import { Schema, Document, model, models } from "mongoose";

export interface IEducation extends Document {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
}

const educationSchema = new Schema<IEducation>(
    {
        institution: {
            type: String,
            required: [true, "La institución es obligatoria"],
            trim: true,
        },
        degree: {
            type: String,
            required: [true, "El título es obligatorio"],
            trim: true,
        },
        field: {
            type: String,
            required: [true, "El campo de estudio es obligatorio"],
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, "La fecha de inicio es obligatoria"],
        },
        endDate: {
            type: Date,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Education = models.Education || model<IEducation>("Education", educationSchema);

export { Education };