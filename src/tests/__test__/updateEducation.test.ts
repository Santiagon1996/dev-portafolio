/**
 * 🧪 UPDATE EDUCATION - TEST SUITE COMPLETO
 * Basado en la lógica, modelo y schema Zod de education
 */

import { updateEducation } from '@app/api/_logic/education/updateEducation';
import { Education, IEducation } from '@lib/db/models/index';
import { validators } from '@shared/validate/index';
import { ValidationError, DuplicityError, NotFoundError, SystemError } from '@shared/errors/errors';

jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/index');

const mockEducation = Education as jest.Mocked<typeof Education>;
const mockValidateUpdateEducation = validators.validateUpdateEducation as jest.MockedFunction<typeof validators.validateUpdateEducation>;
const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;

interface EducationUpdateInputTest {
    id: string;
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
}

describe('🧪 updateEducation - Test Suite Completo', () => {
    const validEducationId = '507f1f77bcf86cd799439011';
    const validInput: EducationUpdateInputTest = {
        id: validEducationId,
        institution: 'Universidad Test',
        degree: 'Ingeniería',
        field: 'Sistemas',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
        description: 'Actualización de educación de prueba'
    };

    const validatedUpdateMock = {
        institution: 'Universidad Test',
        degree: 'Ingeniería',
        field: 'Sistemas',
        startDate: '2022-01-01',
        endDate: '2023-01-01',
        description: 'Actualización de educación de prueba'
    };

    const updatedEducationMock: IEducation = {
        _id: validEducationId,

        ...validatedUpdateMock
    } as unknown as IEducation;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Actualización Exitosa', () => {
        test('✅ Debe actualizar una educación exitosamente', async () => {
            mockValidateId.mockReturnValue(validEducationId);
            mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
            mockEducation.findOne.mockResolvedValue(null);
            mockEducation.findByIdAndUpdate.mockResolvedValue(updatedEducationMock);

            const result = await updateEducation(validInput);

            expect(mockValidateId).toHaveBeenCalledWith(validEducationId);
            expect(mockValidateUpdateEducation).toHaveBeenCalledWith({
                institution: validInput.institution,
                degree: validInput.degree,
                field: validInput.field,
                startDate: validInput.startDate,
                endDate: validInput.endDate,
                description: validInput.description
            });
            expect(mockEducation.findOne).toHaveBeenCalled();
            expect(mockEducation.findByIdAndUpdate).toHaveBeenCalledWith(
                validEducationId,
                validatedUpdateMock,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(updatedEducationMock);
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {
        test('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
            const validationError = new ValidationError('Datos inválidos', [{ field: 'degree', message: 'Requerido' }]);
            mockValidateId.mockReturnValue(validEducationId);
            mockValidateUpdateEducation.mockImplementation(() => { throw validationError; });

            await expect(updateEducation({ ...validInput, degree: '' })).rejects.toThrow(ValidationError);
        });
    });

    // ❌ DUPLICITY ERROR TESTS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {
        test('❌ Debe lanzar DuplicityError si ya existe educación con ese degree o slug', async () => {
            mockValidateId.mockReturnValue(validEducationId);
            mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
            mockEducation.findOne.mockResolvedValue(updatedEducationMock);

            await expect(updateEducation(validInput)).rejects.toThrow(DuplicityError);
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ Not Found Errors - Educación No Encontrada', () => {
        test('❌ Debe lanzar NotFoundError si no existe la educación', async () => {
            mockValidateId.mockReturnValue(validEducationId);
            mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
            mockEducation.findOne.mockResolvedValue(null);
            mockEducation.findByIdAndUpdate.mockResolvedValue(null);

            await expect(updateEducation(validInput)).rejects.toThrow(NotFoundError);
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
            mockValidateId.mockReturnValue(validEducationId);
            mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
            mockEducation.findOne.mockResolvedValue(null);
            mockEducation.findByIdAndUpdate.mockRejectedValue(new Error('DB Error'));

            await expect(updateEducation(validInput)).rejects.toThrow(SystemError);
        });
    });
});
