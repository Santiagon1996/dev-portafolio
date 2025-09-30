/**
 * 🧪 DELETE EDUCATION - TEST SUITE COMPLETO
 * Basado en la referencia de deleteBlog.test.ts
 */

import { deleteEducation } from '@app/api/_logic/education/deleteEducation';
import { Education } from '@lib/db/models/index';
import { validateId } from '@shared/validate/validate';
import { ValidationError, NotFoundError, SystemError } from '@shared/errors/errors';

jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/validate');

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

interface EducationInputTest {
    id: string;
}

interface MockDeletedEducation {
    _id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
}

const mockEducation = Education as jest.Mocked<typeof Education>;
const mockValidateId = validateId as jest.MockedFunction<typeof validateId>;

describe('🧪 deleteEducation - Test Suite Completo', () => {
    const validEducationId = '507f1f77bcf86cd799439011';
    const validEducationInput: EducationInputTest = { id: validEducationId };

    const deletedEducationMock: MockDeletedEducation = {
        _id: validEducationId,
        institution: 'Universidad Test',
        degree: 'Ingeniería',
        field: 'Sistemas',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
        description: 'Educación de prueba para eliminar'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Eliminación Exitosa', () => {
        test('✅ Debe eliminar una educación exitosamente', async () => {
            mockValidateId.mockReturnValue(validEducationId);
            mockEducation.findByIdAndDelete.mockResolvedValue(deletedEducationMock as never);

            const result = await deleteEducation(validEducationInput);

            expect(mockValidateId).toHaveBeenCalledWith(validEducationId);
            expect(mockEducation.findByIdAndDelete).toHaveBeenCalledWith(validEducationId);
            expect(result).toEqual(deletedEducationMock);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Educación eliminada exitosamente: ${validEducationId} - "${deletedEducationMock.degree}"`
            );
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {
        test('❌ Debe fallar con ID inválido', async () => {
            const invalidInput: EducationInputTest = { id: 'invalid-id' };
            const validationError = new ValidationError('ID inválido', [
                { field: 'id', message: 'Invalid ObjectId format' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            await expect(deleteEducation(invalidInput)).rejects.toThrow(ValidationError);
            await expect(deleteEducation(invalidInput)).rejects.toThrow('ID inválido');

            expect(mockValidateId).toHaveBeenCalledWith('invalid-id');
            expect(mockEducation.findByIdAndDelete).not.toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID inválido, Detalles:',
                [{ field: 'id', message: 'Invalid ObjectId format' }]
            );
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ Not Found Errors - Educación No Encontrada', () => {
        test('❌ Debe fallar cuando no existe la educación', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const input: EducationInputTest = { id: nonExistentId };

            mockValidateId.mockReturnValue(nonExistentId);
            mockEducation.findByIdAndDelete.mockResolvedValue(null);

            await expect(deleteEducation(input)).rejects.toThrow(NotFoundError);
            await expect(deleteEducation(input)).rejects.toThrow('No se encontró una educación con ese ID');

            expect(mockValidateId).toHaveBeenCalledWith(nonExistentId);
            expect(mockEducation.findByIdAndDelete).toHaveBeenCalledWith(nonExistentId);
            expect(mockConsoleLog).not.toHaveBeenCalled();
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe manejar errores de base de datos', async () => {
            const dbError = new Error('Database connection failed');

            mockValidateId.mockReturnValue(validEducationId);
            mockEducation.findByIdAndDelete.mockRejectedValue(dbError);

            await expect(deleteEducation(validEducationInput)).rejects.toThrow(SystemError);
            await expect(deleteEducation(validEducationInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Database connection failed'
            );
        });
    });

    // 🔗 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {
        test('🔗 Debe verificar el flujo completo de eliminación exitosa', async () => {
            mockValidateId.mockReturnValue(validEducationId);
            mockEducation.findByIdAndDelete.mockResolvedValue(deletedEducationMock as never);

            const result = await deleteEducation(validEducationInput);

            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockEducation.findByIdAndDelete).toHaveBeenCalledTimes(1);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Educación eliminada exitosamente: ${validEducationId} - "${deletedEducationMock.degree}"`
            );
            expect(result).toEqual(deletedEducationMock);
            expect(result).toHaveProperty('_id', validEducationId);
            expect(result).toHaveProperty('institution');
        });
    });
});
