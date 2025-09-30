/**
 * 🧪 GET BLOG BY ID - TEST SUITE COMPLETO
 *
 * Casos cubiertos:
 * ✅ Happy Path - Retorna el blog correctamente
 * ❌ ID inválido - Lanza ValidationError
 * ❌ Blog no encontrado - Lanza NotFoundError
 * ❌ Error inesperado - Lanza SystemError
 * ❌ Error desconocido - Lanza SystemError genérico
 */

import { getBlogById } from '@app/api/_logic/blog/getBlogById';
import { BlogPost } from '@lib/db/models/index';
import { errors, validators } from '@shared';

const { ValidationError, NotFoundError, SystemError } = errors;

jest.mock('@lib/db/models/index');
jest.mock('@shared', () => ({
    validators: {
        validateId: jest.fn(),
    },
    errors: {
        ValidationError: class ValidationError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'ValidationError';
            }
        },
        NotFoundError: class NotFoundError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'NotFoundError';
            }
        },
        SystemError: class SystemError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'SystemError';
            }
        },
    },
}));

describe('🧪 getBlogById - Test Suite Completo', () => {
    const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;
    const mockFindById = BlogPost.findById as jest.MockedFunction<typeof BlogPost.findById>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Debe retornar el blog correctamente si existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        const blogDoc = {
            _id: 'valid-id',
            title: 'Blog Test',
            content: 'Contenido de prueba',
            author: 'Autor',
            tags: ['test'],
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockFindById.mockResolvedValue(blogDoc as unknown);

        const result = await getBlogById({ id: 'valid-id' });
        expect(result).toEqual(blogDoc);
        expect(mockValidateId).toHaveBeenCalledWith('valid-id');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
    });

    test('❌ Debe lanzar ValidationError si el ID es inválido', async () => {
        mockValidateId.mockImplementation(() => { throw new ValidationError('ID inválido'); });
        await expect(getBlogById({ id: 'bad-id' })).rejects.toThrow(ValidationError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    test('❌ Debe lanzar NotFoundError si el blog no existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockResolvedValue(null);
        await expect(getBlogById({ id: 'valid-id' })).rejects.toThrow(NotFoundError);
    });

    test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockRejectedValue(new Error('DB fail'));
        await expect(getBlogById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getBlogById({ id: 'valid-id' })).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');
    });

    test('❌ Debe lanzar SystemError genérico si el error es desconocido', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockImplementation(() => { throw 'Unknown error'; });
        await expect(getBlogById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getBlogById({ id: 'valid-id' })).rejects.toThrow('Error desconocido. Contacte a soporte.');
    });
});
