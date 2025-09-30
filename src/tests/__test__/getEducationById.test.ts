/**
 * 🧪 GET EDUCATION BY ID - TEST SUITE COMPLETO
 *
 * Casos cubiertos:
 * ✅ Happy Path - Retorna la educación correctamente
 * ❌ ValidationError - ID inválido
 * ❌ NotFoundError - Educación no encontrada
 * ❌ SystemError - Error inesperado
 * ❌ SystemError genérico - Error desconocido
 */

import { getEducationById } from '@app/api/_logic/education/getEducationById';
import { Education } from '@lib/db/models/index';
import { validators, errors } from '@shared';

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

describe('🧪 getEducationById - Test Suite Completo', () => {
    const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;
    const mockFindById = Education.findById as jest.MockedFunction<typeof Education.findById>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Debe retornar la educación correctamente si existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        const educationDoc = {
            _id: 'valid-id',
            degree: 'Ingeniería',
            institution: 'Universidad',
            field: 'Sistemas',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Descripción',
        };
        mockFindById.mockResolvedValue(educationDoc as unknown);

        const result = await getEducationById({ id: 'valid-id' });
        expect(result).toEqual(educationDoc);
        expect(mockValidateId).toHaveBeenCalledWith('valid-id');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
    });

    test('❌ Debe lanzar ValidationError si el ID es inválido', async () => {
        mockValidateId.mockImplementation(() => { throw new ValidationError('ID inválido'); });
        await expect(getEducationById({ id: 'bad-id' })).rejects.toThrow(ValidationError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    test('❌ Debe lanzar NotFoundError si la educación no existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockResolvedValue(null);
        await expect(getEducationById({ id: 'valid-id' })).rejects.toThrow(NotFoundError);
    });

    test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockRejectedValue(new Error('DB fail'));
        await expect(getEducationById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getEducationById({ id: 'valid-id' })).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');
    });

    test('❌ Debe lanzar SystemError genérico si el error es desconocido', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockImplementation(() => { throw 'Unknown error'; });
        await expect(getEducationById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getEducationById({ id: 'valid-id' })).rejects.toThrow('Error desconocido. Contacte a soporte.');
    });
});
