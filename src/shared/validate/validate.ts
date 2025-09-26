import { z } from 'zod';
import { userRegisterSchema, userLoginSchema, contactFormSchema, projectSchema, skillSchema, educationSchema, experienceSchema, idSchema, blogSchema, updateBlogSchema, updateEducationSchema, updateExperienceSchema, updateProjectSchema, updateSkillSchema } from './schemas';
import { handleZodError } from '@lib/utils/handleZodError';


// Validación de datos de entrada para el registro de usuarios
export function validateUserRegister(data: unknown): z.infer<typeof userRegisterSchema> {
    try {
        return userRegisterSchema.parse(data); // Si pasa, retorna data validada
    } catch (error) {
        handleZodError(error, 'user register');
        throw error; // Ensure function always returns or throws
    }
}

// Validación de datos de entrada para el inicio de sesión de usuarios
export function validateUserLogin(data: unknown): z.infer<typeof userLoginSchema> {
    try {
        return userLoginSchema.parse(data);
    } catch (error) {
        handleZodError(error, 'user login');
        throw error; // Ensure function always returns or throws
    }
}

// Validación de datos de entrada para el formulario de contacto
export function validateContactForm(data: unknown): z.infer<typeof contactFormSchema> {
    try {
        return contactFormSchema.parse(data);
    } catch (error) {
        handleZodError(error, 'contact form');
        throw error; // Ensure function always returns or throws
    }
}


// Validación de datos de entrada para el ID
export function validateId(data: unknown): string {
    try {
        const parsed = idSchema.parse({ id: data });
        return parsed.id;
    } catch (error) {
        handleZodError(error, 'id');
        throw error; // Ensure function always returns or throws
    }
}

// Validación de datos de entrada para proyectos
export function validateProject(data: unknown): z.infer<typeof projectSchema> {
    try {
        const parsed = projectSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'project');
        throw error; // Ensure function always returns or throws
    }
}

// Validación de datos de entrada para actualización de proyectos
export function validateUpdateProject(data: unknown): z.infer<typeof updateProjectSchema> {
    try {
        const parsed = updateProjectSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'update project');
        throw error; // Ensure function always returns or throws
    }
}

// Validación de datos de entrada para la experiencia laboral
export function validateExperience(data: unknown): z.infer<typeof experienceSchema> {
    try {
        const parsed = experienceSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'experience');
        throw error; // Ensure function always returns or throws
    }
}


// Validación de datos de entrada para actualización de experiencia
export function validateUpdateExperience(data: unknown): z.infer<typeof updateExperienceSchema> {
    try {
        const parsed = updateExperienceSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'update experience');
        throw error; // Ensure function always returns or throws
    }
}


// Validación de datos de entrada para la educación
export function validateEducation(data: unknown): z.infer<typeof educationSchema> {
    try {
        const parsed = educationSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'education');
        throw error; // Ensure function always returns or throws
    }
}
// Validación de datos de entrada para habilidades
export function validateSkill(data: unknown): z.infer<typeof skillSchema> {
    try {
        const parsed = skillSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'skill');
        throw error; // Ensure function always returns or throws
    }
}

// validacion de actualizacion de habilidad

export function validateUpdateSkill(data: unknown): z.infer<typeof updateSkillSchema> {
    try {
        const parsed = updateSkillSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'update skill');
        throw error; // Ensure function always returns or throws
    }
}

//Validacion de datos de entrada para Blogs

export function validateBlog(data: unknown): z.infer<typeof blogSchema> {
    try {
        const parsed = blogSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'blog');
        throw error; // Ensure function always returns or throws
    }
}

// Validación de datos de entrada para actualización de Blogs
export function validateUpdateBlog(data: unknown): z.infer<typeof updateBlogSchema> {
    try {
        const parsed = updateBlogSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'update blog');
        throw error; // Ensure function always returns or throws
    }
}

export function validateUpdateEducation(data: unknown): z.infer<typeof updateEducationSchema> {
    try {
        const parsed = updateEducationSchema.parse(data);
        return parsed;
    } catch (error) {
        handleZodError(error, 'update education');
        throw error; // Ensure function always returns or throws
    }
}