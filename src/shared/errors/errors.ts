
// 1. Tipos seguros para detalles
export type ErrorDetails = Record<string, unknown> | unknown[];

// 2. Enum para tipos de error (evita strings mágicos)
export enum ErrorType {
    DUPLICITY = "DUPLICITY",
    VALIDATION = "VALIDATION",
    CREDENTIALS = "CREDENTIALS",
    NOT_FOUND = "NOT_FOUND",
    OWNERSHIP = "OWNERSHIP",
    SYSTEM = "SYSTEM",
    AUTHORIZATION = "AUTHORIZATION",
    JSON_PARSE = "JSON_PARSE",
}

// 3. Mapeo tipo → código HTTP
export const httpStatusByErrorType: Record<ErrorType, number> = {
    [ErrorType.DUPLICITY]: 409,
    [ErrorType.VALIDATION]: 400,
    [ErrorType.CREDENTIALS]: 401,
    [ErrorType.NOT_FOUND]: 404,
    [ErrorType.OWNERSHIP]: 403,
    [ErrorType.SYSTEM]: 500,
    [ErrorType.AUTHORIZATION]: 401,
    [ErrorType.JSON_PARSE]: 400,
};

// 4. Clase base para todos los errores
export class BaseError extends Error {
    public readonly type: ErrorType;
    public readonly publicMessage: string;
    public readonly details?: ErrorDetails;
    public readonly internalMessage?: string;

    constructor(
        type: ErrorType,
        publicMessage: string,
        details?: ErrorDetails,
        internalMessage?: string
    ) {
        super(publicMessage); // Siempre usamos el publicMessage como mensaje principal
        this.name = new.target.name;// asiganamos nombre de error(clases hijas de base error)
        this.type = type;
        this.publicMessage = publicMessage;
        this.details = details;
        this.internalMessage = internalMessage;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // Método para serializar el error a JSON
    toJSON() {
        return {
            type: this.type,
            name: this.name,
            message: this.publicMessage,
            details: this.details,
        };
    }
}

// 5. Clases específicas que extienden BaseError
export class DuplicityError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.DUPLICITY, publicMessage, details, internalMessage);
    }
}

export class ValidationError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.VALIDATION, publicMessage, details, internalMessage);
    }
}

export class CredentialsError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.CREDENTIALS, publicMessage, details, internalMessage);
    }
}

export class NotFoundError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.NOT_FOUND, publicMessage, details, internalMessage);
    }
}

export class OwnershipError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.OWNERSHIP, publicMessage, details, internalMessage);
    }
}

export class SystemError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.SYSTEM, publicMessage, details, internalMessage);
    }
}

export class AuthorizationError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.AUTHORIZATION, publicMessage, details, internalMessage);
    }
}

export class JsonParseError extends BaseError {
    constructor(publicMessage: string, details?: ErrorDetails, internalMessage?: string) {
        super(ErrorType.JSON_PARSE, publicMessage, details, internalMessage);
    }
}

// 6. Exportación agrupada (DX friendly)
export const errors = {
    DuplicityError,
    ValidationError,
    CredentialsError,
    NotFoundError,
    OwnershipError,
    SystemError,
    AuthorizationError,
    JsonParseError,
};

/**
 * 🧠 EXPLICACIÓN DEL USO DE TYPESCRIPT EN LA IMPLEMENTACIÓN DE ERRORES PERSONALIZADOS
 *
 * 1. Tipos seguros para detalles:
 *   → Se define un tipo `ErrorDetails` para asegurar que los detalles del error sean un objeto o un array, mejorando   la seguridad de tipos.
 *
 * 2-  Enum para tipos de error (evita strings mágicos):
 *   → Se define un enum `ErrorType` para representar los diferentes tipos de errores, lo que mejora la legibilidad y evita errores tipográficos.
 *
 * 3- Mapeo de errores a códigos HTTP:  
 *    → Se establece un mapeo entre los tipos de error y los códigos de estado HTTP correspondientes.
 *
 * 4. Clase base para todos los errores:
 *   → Se crea una clase `BaseError` que extiende de `Error`, añadiendo propiedades como `type`, `publicMessage` y `details`.
 *  → Esto permite crear errores personalizados con un formato consistente y fácil de manejar.
 * METODOS:
 *   - `toJSON`: Serializa el error a un objeto JSON, útil para respuestas API.
 *  → Permite que los errores sean fácilmente convertibles a JSON para enviar en respuestas HTTP.
 *  → Incluye el tipo de error, nombre, mensaje y detalles opcionales.
 * 
 * 5. Clases específicas que extienden BaseError:
 *   → Se definen clases específicas para cada tipo de error, como `DuplicityError`, `ValidationError`, etc., que heredan de `BaseError`.
 * 
 */