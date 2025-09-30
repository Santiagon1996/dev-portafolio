import { z } from 'zod';
import { constant } from '../constants/constants';



// --- User Register Schema ---
export const userRegisterSchema = z.object({
    username: z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede superar los 50 caracteres')
        .regex(constant.NAME_REGEX, 'El nombre solo puede contener letras y espacios'),
    email: z
        .string()
        .max(50, 'El email no puede superar los 50 caracteres')
        .regex(constant.EMAIL_REGEX, 'El email debe ser válido'),
    password: z
        .string()
        .min(constant.PASSWORD_MIN_LENGTH, 'La contraseña es muy corta')
        .max(constant.PASSWORD_MAX_LENGTH, 'La contraseña es muy larga'),
});

// --- User Login Schema ---
export const userLoginSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(50)
        .regex(constant.NAME_REGEX),
    password: z
        .string()
        .min(8)
        .max(50),
});

// --- ID Schema (reutilizable para cualquier _id) ---
export const idSchema = z.object({
    id: z
        .string()
        .length(24, 'El ID debe tener exactamente 24 caracteres')
        .regex(constant.ID_REGEX, 'Formato de ID inválido'),
});

// --- Contact Form Schema ---
export const contactFormSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    subject: z.string().min(5).max(100),
    message: z.string().min(10).max(500),
});

// --- Project Schema ---
export const projectSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    techStack: z.array(z.string().min(1)).min(1),
    repoUrl: z.string().regex(constant.URL_REGEX, 'Debe ser una URL válida').optional(),
    demoUrl: z.string().regex(constant.URL_REGEX, 'Debe ser una URL válida').optional(),
    images: z.array(z.string().url('Debe ser una URL válida')).optional(),
    tags: z.array(z.string().min(1)).optional(),
    featured: z.boolean().default(false),
    createdAt: z.preprocess((arg) => {
        if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
    }, z.date()).optional(),
});
export const updateProjectSchema = projectSchema.partial();

// --- Experience Schema ---
export const experienceSchema = z.object({
    role: z.string().min(2).max(100),
    company: z.string().min(2).max(100),
    location: z.string().optional(),
    startDate: z.string().min(4),
    endDate: z.string().optional(),
    description: z.string().min(10).max(500),
    isCurrent: z.boolean().default(false),
});
export const updateExperienceSchema = experienceSchema.partial();

// --- Education Schema ---
export const educationSchema = z.object({
    degree: z.string().min(2).max(100),
    institution: z.string().min(2).max(100),
    startDate: z.string().min(4),
    endDate: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
});
export const updateEducationSchema = educationSchema.partial();

// --- Skill Schema ---
export const skillSchema = z.object({
    name: z.string().min(2).max(50),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    category: z.enum(['Frontend', 'Backend', 'DevOps', 'Database', 'Other']),
});
export const updateSkillSchema = skillSchema.partial();

// --- Blog Schema (si usas uno también en el portafolio) ---
export const blogSchema = z.object({
    title: z.string()
        .min(5, "El título debe tener al menos 5 caracteres")
        .max(200, "El título no puede exceder 200 caracteres"),
    content: z.string()
        .min(20, "El contenido debe tener al menos 20 caracteres"),
    slug: z.string()
        .toLowerCase()
        .min(1, "El slug no puede estar vacío")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
            message: 'El slug debe contener solo minúsculas, números y guiones (formato: ejemplo-de-slug)',
        })
        .optional(), // 
    publishedAt: z
        .preprocess(
            (arg) =>
                typeof arg === 'string' || arg instanceof Date
                    ? new Date(arg)
                    : undefined,
            z.date()
        )
        .optional(),
    isPublished: z.boolean().default(false),
});
export const updateBlogSchema = blogSchema.partial();
