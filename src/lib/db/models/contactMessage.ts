import { Schema, Document, models, model } from "mongoose";

export interface IContactMessage extends Document {
    name: string;
    email: string;
    subject?: string;
    message: string;
    createdAt?: Date;
    isRead: boolean;
}

const contactMessageSchema = new Schema<IContactMessage>(
    {
        name: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "El correo electrónico es obligatorio"],
            trim: true,
            lowercase: true,
        },
        subject: {
            type: String,
            trim: true,
            default: "",
        },
        message: {
            type: String,
            required: [true, "El mensaje es obligatorio"],
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ContactMessage =
    models.ContactMessage || model<IContactMessage>("ContactMessage", contactMessageSchema);

export { ContactMessage };
