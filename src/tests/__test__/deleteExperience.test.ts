/**
 * 🧪 DELETE EXPERIENCE - TEST SUITE COMPLETO
 * Basado en la estructura de los tests de eliminación previos
 */

import { deleteExperience } from '@app/api/_logic/experience/deleteExperience';
import { Experience } from '@lib/db/models/index';
import { validateId } from '@shared/validate/validate';
import { ValidationError, NotFoundError, SystemError } from '@shared/errors/errors';

jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/validate');

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

interface ExperienceInputTest {
    id: string;
}

interface MockDeletedExperience {
    _id: string;
    company: string;
    role: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    technologies?: string[];
    isCurrent?: boolean;
}

const mockExperience = Experience as jest.Mocked<typeof Experience>;
const mockValidateId = validateId as jest.MockedFunction<typeof validateId>;

describe('🧪 deleteExperience - Test Suite Completo', () => {
    const validExperienceId = '507f1f77bcf86cd799439011';
    const validExperienceInput: ExperienceInputTest = { id: validExperienceId };

    const deletedExperienceMock: MockDeletedExperience = {
        _id: validExperienceId,
        company: 'Empresa Test',
        role: 'Desarrollador',
        description: 'Experiencia de prueba para eliminar',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
        location: 'Remoto',
        technologies: ['Node.js', 'React'],
        isCurrent: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Eliminación Exitosa', () => {
        test('✅ Debe eliminar una experiencia exitosamente', async () => {
            mockValidateId.mockReturnValue(validExperienceId);
            mockExperience.findByIdAndDelete.mockResolvedValue(deletedExperienceMock as never);

            const result = await deleteExperience(validExperienceInput);

            expect(mockValidateId).toHaveBeenCalledWith(validExperienceId);
            expect(mockExperience.findByIdAndDelete).toHaveBeenCalledWith(validExperienceId);
            expect(result).toEqual(deletedExperienceMock);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Experiencia eliminada exitosamente: ${validExperienceId} - "${deletedExperienceMock.role}"`
            );
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {
        test('❌ Debe fallar con ID inválido', async () => {
            const invalidInput: ExperienceInputTest = { id: 'invalid-id' };
            const validationError = new ValidationError('ID inválido', [
                { field: 'id', message: 'Invalid ObjectId format' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            await expect(deleteExperience(invalidInput)).rejects.toThrow(ValidationError);
            await expect(deleteExperience(invalidInput)).rejects.toThrow('ID inválido');

            expect(mockValidateId).toHaveBeenCalledWith('invalid-id');
            expect(mockExperience.findByIdAndDelete).not.toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID inválido, Detalles:',
                [{ field: 'id', message: 'Invalid ObjectId format' }]
            );
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ Not Found Errors - Experiencia No Encontrada', () => {
        test('❌ Debe fallar cuando no existe la experiencia', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const input: ExperienceInputTest = { id: nonExistentId };

            mockValidateId.mockReturnValue(nonExistentId);
            mockExperience.findByIdAndDelete.mockResolvedValue(null);

            await expect(deleteExperience(input)).rejects.toThrow(NotFoundError);
            await expect(deleteExperience(input)).rejects.toThrow('No se encontró una experiencia con ese ID');

            expect(mockValidateId).toHaveBeenCalledWith(nonExistentId);
            expect(mockExperience.findByIdAndDelete).toHaveBeenCalledWith(nonExistentId);
            expect(mockConsoleLog).not.toHaveBeenCalled();
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe manejar errores de base de datos', async () => {
            const dbError = new Error('Database connection failed');

            mockValidateId.mockReturnValue(validExperienceId);
            mockExperience.findByIdAndDelete.mockRejectedValue(dbError);

            await expect(deleteExperience(validExperienceInput)).rejects.toThrow(SystemError);
            await expect(deleteExperience(validExperienceInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Database connection failed'
            );
        });
    });

    // 🔗 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {
        test('🔗 Debe verificar el flujo completo de eliminación exitosa', async () => {
            mockValidateId.mockReturnValue(validExperienceId);
            mockExperience.findByIdAndDelete.mockResolvedValue(deletedExperienceMock as never);

            const result = await deleteExperience(validExperienceInput);

            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockExperience.findByIdAndDelete).toHaveBeenCalledTimes(1);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Experiencia eliminada exitosamente: ${validExperienceId} - "${deletedExperienceMock.role}"`
            );
            expect(result).toEqual(deletedExperienceMock);
            expect(result).toHaveProperty('_id', validExperienceId);
            expect(result).toHaveProperty('company');
        });
    });
});
