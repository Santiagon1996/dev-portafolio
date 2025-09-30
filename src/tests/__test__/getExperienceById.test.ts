/**
 * 🧪 GET EXPERIENCE BY ID - TEST SUITE COMPLETO
 *
 * Casos cubiertos:
 * ✅ Happy Path - Retorna la experiencia correctamente
 * ❌ ID inválido - Lanza ValidationError
 * ❌ Experiencia no encontrada - Lanza NotFoundError
 * ❌ Error inesperado - Lanza SystemError
 * ❌ Error desconocido - Lanza SystemError genérico
 */

import { getExperienceById } from '@app/api/_logic/experience/getExperienceById';
import { Experience } from '@lib/db/models/index';
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

describe('🧪 getExperienceById - Test Suite Completo', () => {
    const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;
    const mockFindById = Experience.findById as jest.MockedFunction<typeof Experience.findById>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Debe retornar la experiencia correctamente si existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        const experienceDoc = {
            _id: 'valid-id',
            role: 'Dev',
            company: 'Empresa',
            description: 'Descripción',
            technologies: ['Node', 'React'],
            startDate: new Date(),
            endDate: new Date(),
        };
        mockFindById.mockResolvedValue(experienceDoc as unknown);

        const result = await getExperienceById({ id: 'valid-id' });
        expect(result).toEqual(experienceDoc);
        expect(mockValidateId).toHaveBeenCalledWith('valid-id');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
    });

    test('❌ Debe lanzar ValidationError si el ID es inválido', async () => {
        mockValidateId.mockImplementation(() => { throw new ValidationError('ID inválido'); });
        await expect(getExperienceById({ id: 'bad-id' })).rejects.toThrow(ValidationError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    test('❌ Debe lanzar NotFoundError si la experiencia no existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockResolvedValue(null);
        await expect(getExperienceById({ id: 'valid-id' })).rejects.toThrow(NotFoundError);
    });

    test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockRejectedValue(new Error('DB fail'));
        await expect(getExperienceById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getExperienceById({ id: 'valid-id' })).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');
    });

    test('❌ Debe lanzar SystemError genérico si el error es desconocido', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockImplementation(() => { throw 'Unknown error'; });
        await expect(getExperienceById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getExperienceById({ id: 'valid-id' })).rejects.toThrow('Error desconocido. Contacte a soporte.');
    });
});
