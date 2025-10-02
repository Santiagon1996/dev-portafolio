import { Schema, Document, model, models } from "mongoose";
import { slugify } from "../../utils/slugify"


export interface IEducation extends Document {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
    slug: string;

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
        slug: { type: String, required: true, unique: true, trim: true },

    },
    {
        timestamps: true,
        versionKey: false,
    }
);

educationSchema.pre("validate", function (next) {
    if (this.isNew || this.isModified("degree")) {
        this.slug = slugify(this.degree);
    }
    next();
});

educationSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update && typeof update === "object" && "degree" in update && typeof update.degree === "string") {
        (update as { [key: string]: unknown; slug?: string; degree?: string }).slug = slugify(update.degree);
    }
    next();
});
const Education = models.Education || model<IEducation>("Education", educationSchema);

export { Education };