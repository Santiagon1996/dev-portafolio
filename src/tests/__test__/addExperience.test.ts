import { addExperience } from '@app/api/_logic/experience/addExperience';
import { Experience, IExperience } from '@lib/db/models/index';
import { validators } from '@shared/validate/index';
import { ValidationError, DuplicityError, SystemError } from '@shared/errors/errors';

// 🧪 MOCKS - Simulamos las dependencias
jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/index');

// Type casting para los mocks
const mockExperience = Experience as jest.Mocked<typeof Experience>;
const mockValidateExperience = validators.validateExperience as jest.MockedFunction<typeof validators.validateExperience>;



describe('addExperience - lógica de negocio', () => {
    // 🧹 SETUP - Limpiar mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // 📋 DATOS DE PRUEBA
    const validInput = {
        company: 'Acme Corp',
        role: 'Developer',
        description: 'Desarrollador fullstack',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-01-01'),
        location: 'Remote',
        technologies: ['TypeScript', 'React'],
        isCurrent: false
    };

    // Mock del objeto validado que retorna validateBlog
    const validatedMock = {
        ...validInput,
        startDate: '2022-01-01',
        endDate: '2023-01-01'
    };

    const createdMock: IExperience = {
        _id: '507f1f77bcf86cd799439011',
        ...validInput,
        slug: 'developer'
    } as unknown as IExperience;

    // 🎯 HAPPY PATH TESTS
    describe('✅ Happy Path - Casos Exitosos', () => {

        test('✅ Debe crear una experiencia exitosamente', async () => {
            // Arrange
            mockValidateExperience.mockReturnValue(validatedMock);
            mockExperience.findOne.mockResolvedValue(null);
            mockExperience.create.mockResolvedValue(createdMock as never);

            // Act
            const result = await addExperience(validInput);

            // Assert
            expect(mockValidateExperience).toHaveBeenCalledWith(validInput);
            expect(mockExperience.findOne).toHaveBeenCalledWith({
                $or: [
                    { role: validatedMock.role },
                    { slug: 'developer' }
                ]
            });
            expect(mockExperience.create).toHaveBeenCalledWith(validatedMock);
            expect(result).toEqual(createdMock);
        });
    });

    // 💥 VALIDATION ERROR TESTS  
    describe('❌ Validation Errors - Errores por Campo', () => {

        test('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
            // Arrange
            const validationError = new ValidationError('Datos inválidos', [{ field: 'role', message: 'Requerido' }]);
            mockValidateExperience.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addExperience({ ...validInput, role: '' })).rejects.toThrow(ValidationError);
        });
    });

    // 🔄 DUPLICITY ERROR TESTS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {

        test('❌ Debe lanzar DuplicityError si ya existe experiencia con ese rol', async () => {
            // Arrange
            mockValidateExperience.mockReturnValue(validatedMock);
            mockExperience.findOne.mockResolvedValue(createdMock);

            // Act & Assert
            await expect(addExperience(validInput)).rejects.toThrow(DuplicityError);
        });
    });

    // 💥 SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {

        test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
            // Arrange
            mockValidateExperience.mockReturnValue(validatedMock);
            mockExperience.findOne.mockRejectedValue(new Error('DB Error'));

            // Act & Assert
            await expect(addExperience(validInput)).rejects.toThrow(SystemError);
        });

        test('❌ Debe lanzar SystemError si ocurre un error no-Error (unknown)', async () => {
            // Arrange
            mockValidateExperience.mockReturnValue(validatedMock);
            mockExperience.findOne.mockRejectedValue('Unknown error');

            // Act & Assert
            await expect(addExperience(validInput)).rejects.toThrow(SystemError);
        });
    });
});
