export const constant = {
    // =====================
    // REGEX PATTERNS
    // =====================
    EMPTY_OR_BLANK_REGEX: /^\s*$/,
    EMAIL_REGEX:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i,
    URL_REGEX:
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
    NAME_REGEX: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
    ID_REGEX: /^[a-fA-F0-9]{24}$/,

    // =====================
    // PASSWORD
    // =====================
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 20,

    // =====================
    // MODELO: PROJECT
    // =====================
    TECHNOLOGIES: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Zustand', 'Tailwind'] as const,
    PROJECT_STATUSES: ['completed', 'in-progress', 'archived'] as const,

    // =====================
    // MODELO: EXPERIENCE
    // =====================
    EXPERIENCE_TYPES: ['freelance', 'full-time', 'part-time', 'internship'] as const,

    // =====================
    // MODELO: EDUCATION
    // =====================
    EDUCATION_LEVELS: ['bootcamp', 'diploma', 'degree', 'certification'] as const,

    // =====================
    // MODELO: SKILL
    // =====================
    SKILL_CATEGORIES: ['frontend', 'backend', 'devops', 'tools', 'design'] as const,

    // =====================
    // MODELO: BLOG POST
    // =====================
    BLOG_TAGS: ['tech', 'career', 'design', 'personal', 'tutorial'] as const,

    // =====================
    // GENERAL
    // =====================
    LANGUAGES_SUPPORTED: ['es', 'en'] as const,
    DATE_FORMAT: 'YYYY-MM-DD',
};
