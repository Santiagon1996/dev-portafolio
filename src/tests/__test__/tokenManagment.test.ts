import { createToken, verifyToken } from '../../lib/utils/tokenManagment';
import { SystemError, CredentialsError } from '@shared/errors/errors';

describe('tokenManagment', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules(); // Limpia el cache para cargar variables nuevas si hacen falta
        process.env = { ...OLD_ENV }; // Clona el env original para no romper nada
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restaura el env original al terminar todos los tests
    });

    describe('createToken', () => {
        it('lanza error si JWT_SECRET no está definido', () => {
            delete process.env.JWT_SECRET;
            process.env.JWT_EXPIRES_IN = '1h';

            expect(() => createToken('userId123')).toThrow(SystemError);
            expect(() => createToken('userId123')).toThrow('JWT_SECRET no configurado en variables de entorno.');
        });

        it('genera un token válido si JWT_SECRET está definido', () => {
            process.env.JWT_SECRET = 'supersecret';
            process.env.JWT_EXPIRES_IN = '1h';

            const token = createToken('userId123');
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // Token JWT tiene 3 partes separadas por puntos
        });
    });

    describe('verifyToken', () => {
        beforeEach(() => {
            process.env.JWT_SECRET = 'supersecret';
            process.env.JWT_EXPIRES_IN = '1h';
        });

        it('lanza error si JWT_SECRET no está definido', () => {
            delete process.env.JWT_SECRET;
            process.env.JWT_EXPIRES_IN = '1h'; // Aunque no se usa, es para simular un entorno real
            const dummyToken = 'token';

            expect(() => verifyToken(dummyToken)).toThrow(SystemError);
            expect(() => verifyToken(dummyToken)).toThrow('JWT_SECRET no configurado en variables de entorno.');
        });

        it('lanza CredentialsError si el token es inválido o sin id', () => {
            const invalidToken = createToken(''); // Token con id vacía

            expect(() => verifyToken(invalidToken)).toThrow(CredentialsError);
            expect(() => verifyToken(invalidToken)).toThrow('Token inválido: faltan campos requeridos.');
        });

        it('decodifica correctamente un token válido', () => {
            const id = 'userId123';
            const token = createToken(id);

            const payload = verifyToken(token);
            expect(payload).toHaveProperty('id', id);
        });
    });
});
