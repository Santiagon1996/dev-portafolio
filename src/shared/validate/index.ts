// Reexporta todos los esquemas y validaciones centralizadas

import {
    projectSchema,
    updateProjectSchema,
    experienceSchema,
    updateExperienceSchema,
    educationSchema,
    updateEducationSchema,
    skillSchema,
    updateSkillSchema,
    blogSchema,
    updateBlogSchema,

} from './schemas';

import {
    validateProject,
    validateExperience,
    validateEducation,
    validateSkill,
    validateUserRegister,
    validateUserLogin,
    validateContactForm,
    validateId,
    validateBlog,
    validateUpdateBlog,
    validateUpdateEducation,
    validateUpdateExperience,
    validateUpdateProject,
    validateUpdateSkill
} from './validate';

export const schemas = {
    projectSchema,
    updateProjectSchema,
    experienceSchema,
    updateExperienceSchema,
    educationSchema,
    updateEducationSchema,
    skillSchema,
    updateSkillSchema,
    blogSchema,
    updateBlogSchema,
};

export const validators = {
    validateProject,
    validateExperience,
    validateEducation,
    validateSkill,
    validateUserRegister,
    validateUserLogin,
    validateContactForm,
    validateId,
    validateBlog,
    validateUpdateBlog,
    validateUpdateEducation,
    validateUpdateExperience,
    validateUpdateProject,
    validateUpdateSkill

};
