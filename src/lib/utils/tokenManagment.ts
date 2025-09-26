import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { errors } from '@shared/errors/errors';
import { validators } from '@shared/validate';

const { CredentialsError, SystemError, ValidationError } = errors;
const { validateId } = validators;

// Payload personalizado
export interface AuthPayload extends JwtPayload {
    id: string;
}

/**
 * Crea un JWT con id del usuario.
 * @param id - ID del usuario
 * @returns token firmado
 */
export function createToken(id: string): string {
    try {
        validateId(id); // Validar el formato del ID antes de firmar

        const JWT_SECRET = process.env.JWT_SECRET;
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

        if (!JWT_SECRET) {
            throw new SystemError(
                'No se ha configurado la variable JWT_SECRET en el entorno.',
                { env: 'JWT_SECRET' },
                'Falta JWT_SECRET en variables de entorno.'
            );
        }

        const payload: AuthPayload = { id };
        const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };

        return jwt.sign(payload, JWT_SECRET, options);
    } catch (error: unknown) {
        if (error instanceof ValidationError) throw error;
        if (error instanceof SystemError) throw error;
        if (error instanceof Error) {
            throw new SystemError(
                'Ocurrió un error inesperado al crear el token.',
                { message: error.message },
                error.message
            );
        }
        throw new SystemError(
            'Error desconocido al crear el token.',
            { message: String(error) },
            String(error)
        );
    }
}

/**
 * Verifica un JWT y devuelve su payload si es válido.
 * @param token - Token JWT
 * @returns payload decodificado o lanza error
 */
export function verifyToken(token: string): AuthPayload {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new SystemError(
                'No se ha configurado la variable JWT_SECRET en el entorno.',
                { env: 'JWT_SECRET' },
                'Falta JWT_SECRET en variables de entorno.'
            );
        }

        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

        if (!decoded?.id) {
            throw new CredentialsError(
                'El token no contiene el campo id requerido.',
                { token },
                'Campo id faltante en el payload del token.'
            );
        }

        validateId(decoded.id); // Validar el formato del ID extraído del token

        return decoded;
    } catch (error: unknown) {
        if (error instanceof ValidationError) throw error;
        if (error instanceof CredentialsError) throw error;
        if (error instanceof SystemError) throw error;
        if (error instanceof jwt.JsonWebTokenError) {
            throw new CredentialsError(
                'El token JWT es inválido o ha sido manipulado.',
                { message: error.message },
                error.message
            );
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new CredentialsError(
                'El token JWT ha expirado.',
                { message: error.message },
                error.message
            );
        }
        if (error instanceof Error) {
            throw new SystemError(
                'Ocurrió un error inesperado al verificar el token.',
                { message: error.message },
                error.message
            );
        }
        throw new SystemError(
            'Error desconocido al verificar el token.',
            { message: String(error) },
            String(error)
        );
    }
}
