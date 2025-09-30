/**
 * 🧪 GET PROJECT BY ID - TEST SUITE COMPLETO
 *
 * Casos cubiertos:
 * ✅ Happy Path - Retorna el proyecto correctamente
 * ❌ ID inválido - Lanza ValidationError
 * ❌ Proyecto no encontrado - Lanza NotFoundError
 * ❌ Error inesperado - Lanza SystemError
 * ❌ Error desconocido - Lanza SystemError genérico
 */

import { getProjectById } from '@app/api/_logic/project/getProjectById';
import { Project } from '@lib/db/models/index';
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

describe('🧪 getProjectById - Test Suite Completo', () => {
    const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;
    const mockFindById = Project.findById as jest.MockedFunction<typeof Project.findById>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Debe retornar el proyecto correctamente si existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        const projectDoc = {
            _id: 'valid-id',
            title: 'Proyecto Test',
            repoUrl: 'https://github.com/test',
            description: 'Descripción de prueba',
            technologies: ['Node', 'React'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockFindById.mockResolvedValue(projectDoc as unknown);

        const result = await getProjectById({ id: 'valid-id' });
        expect(result).toEqual(projectDoc);
        expect(mockValidateId).toHaveBeenCalledWith('valid-id');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
    });

    test('❌ Debe lanzar ValidationError si el ID es inválido', async () => {
        mockValidateId.mockImplementation(() => { throw new ValidationError('ID inválido'); });
        await expect(getProjectById({ id: 'bad-id' })).rejects.toThrow(ValidationError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    test('❌ Debe lanzar NotFoundError si el proyecto no existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockResolvedValue(null);
        await expect(getProjectById({ id: 'valid-id' })).rejects.toThrow(NotFoundError);
    });

    test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockRejectedValue(new Error('DB fail'));
        await expect(getProjectById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getProjectById({ id: 'valid-id' })).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');
    });

    test('❌ Debe lanzar SystemError genérico si el error es desconocido', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockImplementation(() => { throw 'Unknown error'; });
        await expect(getProjectById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getProjectById({ id: 'valid-id' })).rejects.toThrow('Error desconocido. Contacte a soporte.');
    });
});
