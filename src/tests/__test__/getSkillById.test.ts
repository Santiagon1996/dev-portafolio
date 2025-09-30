/**
 * 🧪 GET SKILL BY ID - TEST SUITE COMPLETO
 *
 * Casos cubiertos:
 * ✅ Happy Path - Retorna la skill correctamente
 * ❌ ID inválido - Lanza ValidationError
 * ❌ Skill no encontrada - Lanza NotFoundError
 * ❌ Error inesperado - Lanza SystemError
 * ❌ Error desconocido - Lanza SystemError genérico
 */

import { getSkillById } from '@app/api/_logic/skills/getSkillById';
import { Skill } from '@lib/db/models/index';
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

describe('🧪 getSkillById - Test Suite Completo', () => {
    const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;
    const mockFindById = Skill.findById as jest.MockedFunction<typeof Skill.findById>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Debe retornar la skill correctamente si existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        const skillDoc = {
            _id: 'valid-id',
            name: 'JavaScript',
            level: 'Avanzado',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockFindById.mockResolvedValue(skillDoc as unknown);

        const result = await getSkillById({ id: 'valid-id' });
        expect(result).toEqual(skillDoc);
        expect(mockValidateId).toHaveBeenCalledWith('valid-id');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
    });

    test('❌ Debe lanzar ValidationError si el ID es inválido', async () => {
        mockValidateId.mockImplementation(() => { throw new ValidationError('ID inválido'); });
        await expect(getSkillById({ id: 'bad-id' })).rejects.toThrow(ValidationError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    test('❌ Debe lanzar NotFoundError si la skill no existe', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockResolvedValue(null);
        await expect(getSkillById({ id: 'valid-id' })).rejects.toThrow(NotFoundError);
    });

    test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockRejectedValue(new Error('DB fail'));
        await expect(getSkillById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getSkillById({ id: 'valid-id' })).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');
    });

    test('❌ Debe lanzar SystemError genérico si el error es desconocido', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindById.mockImplementation(() => { throw 'Unknown error'; });
        await expect(getSkillById({ id: 'valid-id' })).rejects.toThrow(SystemError);
        await expect(getSkillById({ id: 'valid-id' })).rejects.toThrow('Error desconocido. Contacte a soporte.');
    });
});
