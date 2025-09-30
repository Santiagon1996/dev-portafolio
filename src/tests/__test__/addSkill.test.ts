import { addSkill } from '@app/api/_logic/skills/addSkill';
import { Skill, ISkill } from '@lib/db/models/index';
import { validators } from '@shared/validate/index';
import { ValidationError, DuplicityError, SystemError } from '@shared/errors/errors';

// 🧪 MOCKS - Simulamos las dependencias
jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/index');

const mockSkill = Skill as jest.Mocked<typeof Skill>;
const mockValidateSkill = validators.validateSkill as jest.MockedFunction<typeof validators.validateSkill>;

describe('addSkill - lógica de negocio', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    // 📋 DATOS DE PRUEBA
    const validInput: {
        name: string;
        level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category: "Frontend" | "Backend" | "DevOps" | "Database" | "Other";
        icon: string;
        color: string;
    } = {
        name: 'React',
        level: 'Intermediate',
        category: 'Frontend',
        icon: 'react-icon',
        color: '#61dafb',
    };

    const validatedMock: {
        name: string;
        level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category: "Frontend" | "Backend" | "DevOps" | "Database" | "Other";
        icon: string;
        color: string;
        slug: string;
    } = {
        ...validInput,
        slug: 'react'
    };

    const createdMock: ISkill = {
        _id: '507f1f77bcf86cd799439011',
        ...validatedMock
    } as unknown as ISkill;

    // 🎯 HAPPY PATH TESTS
    describe('✅ Happy Path - Casos Exitosos', () => {
        test('✅ Debe crear una skill exitosamente', async () => {
            mockValidateSkill.mockReturnValue(validatedMock);
            mockSkill.findOne.mockResolvedValue(null);
            mockSkill.create.mockResolvedValue(createdMock as never);

            const result = await addSkill(validInput);

            expect(mockValidateSkill).toHaveBeenCalledWith(validInput);
            expect(mockSkill.findOne).toHaveBeenCalledWith({
                $or: [
                    { name: validatedMock.name },
                    { slug: 'react' }
                ]
            });
            expect(mockSkill.create).toHaveBeenCalledWith(validatedMock);
            expect(result).toEqual(createdMock);
        });
    });

    // 💥 VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores por Campo', () => {
        test('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
            const validationError = new ValidationError('Datos inválidos', [{ field: 'name', message: 'Requerido' }]);
            mockValidateSkill.mockImplementation(() => { throw validationError; });

            await expect(addSkill({ ...validInput, name: '' })).rejects.toThrow(ValidationError);
        });
    });

    // 🔄 DUPLICITY ERROR TESTS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {
        test('❌ Debe lanzar DuplicityError si ya existe skill con ese nombre o slug', async () => {
            mockValidateSkill.mockReturnValue(validatedMock);
            mockSkill.findOne.mockResolvedValue(createdMock);
            await expect(addSkill(validInput)).rejects.toThrow(DuplicityError);
        });
    });

    // 💥 SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
            mockValidateSkill.mockReturnValue(validatedMock);
            mockSkill.findOne.mockRejectedValue(new Error('DB Error'));
            await expect(addSkill(validInput)).rejects.toThrow(SystemError);
        });

        test('❌ Debe lanzar SystemError si ocurre un error no-Error (unknown)', async () => {
            mockValidateSkill.mockReturnValue(validatedMock);
            mockSkill.findOne.mockRejectedValue('Unknown error');
            await expect(addSkill(validInput)).rejects.toThrow(SystemError);
        });
    });
});
