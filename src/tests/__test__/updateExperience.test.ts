/**
 * 🧪 UPDATE EXPERIENCE - TEST SUITE COMPLETO
 * Basado en la lógica, modelo y schema Zod de experience
 */

import { updateExperience } from '@app/api/_logic/experience/updateExperience';
import { Experience, IExperience } from '@lib/db/models/index';
import { validators } from '@shared/validate/index';
import { ValidationError, DuplicityError, NotFoundError, SystemError } from '@shared/errors/errors';

jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/index');

const mockExperience = Experience as jest.Mocked<typeof Experience>;
const mockValidateUpdateExperience = validators.validateUpdateExperience as jest.MockedFunction<typeof validators.validateUpdateExperience>;
const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;

interface ExperienceUpdateInputTest {
    id: string;
    company?: string;
    role?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    technologies?: string[];
    isCurrent?: boolean;
}

describe('🧪 updateExperience - Test Suite Completo', () => {
    const validExperienceId = '507f1f77bcf86cd799439011';
    const validInput: ExperienceUpdateInputTest = {
        id: validExperienceId,
        company: 'Empresa Test',
        role: 'Desarrollador',
        description: 'Actualización de experiencia de prueba',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
        location: 'Remoto',
        technologies: ['Node.js', 'React'],
        isCurrent: false
    };

    const validatedUpdateMock = {
        company: 'Empresa Test',
        role: 'Desarrollador',
        description: 'Actualización de experiencia de prueba',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
        location: 'Remoto',
        technologies: ['Node.js', 'React'],
        isCurrent: false
    };

    const updatedExperienceMock: IExperience = {
        _id: validExperienceId,
        ...validatedUpdateMock
    } as unknown as IExperience;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Actualización Exitosa', () => {
        test('✅ Debe actualizar una experiencia exitosamente', async () => {
            mockValidateId.mockReturnValue(validExperienceId);
            mockValidateUpdateExperience.mockReturnValue(validatedUpdateMock);
            mockExperience.findOne.mockResolvedValue(null);
            mockExperience.findByIdAndUpdate.mockResolvedValue(updatedExperienceMock);

            const result = await updateExperience(validInput);

            expect(mockValidateId).toHaveBeenCalledWith(validExperienceId);
            expect(mockValidateUpdateExperience).toHaveBeenCalledWith({
                company: validInput.company,
                role: validInput.role,
                description: validInput.description,
                startDate: validInput.startDate,
                endDate: validInput.endDate,
                location: validInput.location,
                technologies: validInput.technologies,
                isCurrent: validInput.isCurrent
            });
            expect(mockExperience.findOne).toHaveBeenCalled();
            expect(mockExperience.findByIdAndUpdate).toHaveBeenCalledWith(
                validExperienceId,
                validatedUpdateMock,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(updatedExperienceMock);
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {
        test('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
            const validationError = new ValidationError('Datos inválidos', [{ field: 'role', message: 'Requerido' }]);
            mockValidateId.mockReturnValue(validExperienceId);
            mockValidateUpdateExperience.mockImplementation(() => { throw validationError; });

            await expect(updateExperience({ ...validInput, role: '' })).rejects.toThrow(ValidationError);
        });
    });

    // ❌ DUPLICITY ERROR TESTS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {
        test('❌ Debe lanzar DuplicityError si ya existe experiencia con ese company o slug', async () => {
            mockValidateId.mockReturnValue(validExperienceId);
            mockValidateUpdateExperience.mockReturnValue(validatedUpdateMock);
            mockExperience.findOne.mockResolvedValue(updatedExperienceMock);

            await expect(updateExperience(validInput)).rejects.toThrow(DuplicityError);
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ Not Found Errors - Experiencia No Encontrada', () => {
        test('❌ Debe lanzar NotFoundError si no existe la experiencia', async () => {
            mockValidateId.mockReturnValue(validExperienceId);
            mockValidateUpdateExperience.mockReturnValue(validatedUpdateMock);
            mockExperience.findOne.mockResolvedValue(null);
            mockExperience.findByIdAndUpdate.mockResolvedValue(null);

            await expect(updateExperience(validInput)).rejects.toThrow(NotFoundError);
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
            mockValidateId.mockReturnValue(validExperienceId);
            mockValidateUpdateExperience.mockReturnValue(validatedUpdateMock);
            mockExperience.findOne.mockResolvedValue(null);
            mockExperience.findByIdAndUpdate.mockRejectedValue(new Error('DB Error'));

            await expect(updateExperience(validInput)).rejects.toThrow(SystemError);
        });
    });
});
