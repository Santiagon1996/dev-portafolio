/**
 * 🧪 DELETE SKILL - TEST SUITE COMPLETO
 * Basado en la estructura de los tests de eliminación previos
 */

import { deleteSkill } from '@app/api/_logic/skills/deleteSkill';
import { Skill } from '@lib/db/models/index';
import { validateId } from '@shared/validate/validate';
import { ValidationError, NotFoundError, SystemError } from '@shared/errors/errors';

jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/validate');

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

interface SkillInputTest {
    id: string;
}

interface MockDeletedSkill {
    _id: string;
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    category: "Frontend" | "Backend" | "DevOps" | "Database" | "Other";
    icon?: string;
    color?: string;
}

const mockSkill = Skill as jest.Mocked<typeof Skill>;
const mockValidateId = validateId as jest.MockedFunction<typeof validateId>;

describe('🧪 deleteSkill - Test Suite Completo', () => {
    const validSkillId = '507f1f77bcf86cd799439011';
    const validSkillInput: SkillInputTest = { id: validSkillId };

    const deletedSkillMock: MockDeletedSkill = {
        _id: validSkillId,
        name: 'React',
        level: 'Intermediate',
        category: 'Frontend',
        icon: 'react-icon',
        color: '#61dafb'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Eliminación Exitosa', () => {
        test('✅ Debe eliminar una habilidad exitosamente', async () => {
            mockValidateId.mockReturnValue(validSkillId);
            mockSkill.findByIdAndDelete.mockResolvedValue(deletedSkillMock as never);

            const result = await deleteSkill(validSkillInput);

            expect(mockValidateId).toHaveBeenCalledWith(validSkillId);
            expect(mockSkill.findByIdAndDelete).toHaveBeenCalledWith(validSkillId);
            expect(result).toEqual(deletedSkillMock);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Habilidad eliminada exitosamente: ${validSkillId} - "${deletedSkillMock.name}"`
            );
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {
        test('❌ Debe fallar con ID inválido', async () => {
            const invalidInput: SkillInputTest = { id: 'invalid-id' };
            const validationError = new ValidationError('ID inválido', [
                { field: 'id', message: 'Invalid ObjectId format' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            await expect(deleteSkill(invalidInput)).rejects.toThrow(ValidationError);
            await expect(deleteSkill(invalidInput)).rejects.toThrow('ID inválido');

            expect(mockValidateId).toHaveBeenCalledWith('invalid-id');
            expect(mockSkill.findByIdAndDelete).not.toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID inválido, Detalles:',
                [{ field: 'id', message: 'Invalid ObjectId format' }]
            );
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ Not Found Errors - Skill No Encontrada', () => {
        test('❌ Debe fallar cuando no existe la habilidad', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const input: SkillInputTest = { id: nonExistentId };

            mockValidateId.mockReturnValue(nonExistentId);
            mockSkill.findByIdAndDelete.mockResolvedValue(null);

            await expect(deleteSkill(input)).rejects.toThrow(NotFoundError);
            await expect(deleteSkill(input)).rejects.toThrow('No se encontró una habilidad con ese ID');

            expect(mockValidateId).toHaveBeenCalledWith(nonExistentId);
            expect(mockSkill.findByIdAndDelete).toHaveBeenCalledWith(nonExistentId);
            expect(mockConsoleLog).not.toHaveBeenCalled();
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe manejar errores de base de datos', async () => {
            const dbError = new Error('Database connection failed');

            mockValidateId.mockReturnValue(validSkillId);
            mockSkill.findByIdAndDelete.mockRejectedValue(dbError);

            await expect(deleteSkill(validSkillInput)).rejects.toThrow(SystemError);
            await expect(deleteSkill(validSkillInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Database connection failed'
            );
        });
    });

    // 🔗 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {
        test('🔗 Debe verificar el flujo completo de eliminación exitosa', async () => {
            mockValidateId.mockReturnValue(validSkillId);
            mockSkill.findByIdAndDelete.mockResolvedValue(deletedSkillMock as never);

            const result = await deleteSkill(validSkillInput);

            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockSkill.findByIdAndDelete).toHaveBeenCalledTimes(1);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Habilidad eliminada exitosamente: ${validSkillId} - "${deletedSkillMock.name}"`
            );
            expect(result).toEqual(deletedSkillMock);
            expect(result).toHaveProperty('_id', validSkillId);
            expect(result).toHaveProperty('name');
        });
    });
});
