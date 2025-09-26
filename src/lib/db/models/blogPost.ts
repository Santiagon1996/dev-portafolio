//title, slug, content, summary, tags, publishedAt, isPublished
// models/BlogPost.ts
import { Schema, Document, model, models } from "mongoose"
import { slugify } from "../../utils/slugify"

// Definición de la interfaz para el modelo de BlogPost
export interface IBlogPost extends Document {
    title: string;
    summary?: string;
    slug?: string;
    content: string;
    tags?: string[];
    author: string;
    publishedAt?: Date;
    isPublished: boolean;
    viewsCount: number;
}

const blogPostSchema = new Schema<IBlogPost>(
    {
        title: {
            type: String,
            required: [true, "El título del post es obligatorio"],
            trim: true,
            unique: true,
        },
        summary: {
            type: String,
            trim: true,
            maxlength: [300, "El resumen no puede exceder los 300 caracteres"],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        content: {
            type: String,
            required: [true, "El contenido es obligatorio"],
        },
        tags: [String],
        author: {
            type: String,
            required: true,
            default: "Yo mismo",
        },
        publishedAt: {
            type: Date,
            default: Date.now,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Generar slug automáticamente antes de guardar o actualizar
blogPostSchema.pre("validate", function (next) {
    if (this.isNew || this.isModified("title")) {
        this.slug = slugify(this.title);
    }
    next();
});

// Actualizar slug automáticamente al modificar el título
blogPostSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update && typeof update === "object" && "title" in update && typeof update.title === "string") {
        (update as { [key: string]: unknown; slug?: string; title?: string }).slug = slugify(update.title);
    }
    next();
});

const BlogPost = models.BlogPost || model<IBlogPost>("BlogPost", blogPostSchema);

export { BlogPost };
