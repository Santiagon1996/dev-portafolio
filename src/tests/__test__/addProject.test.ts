import { addProject } from '@app/api/_logic/project/addProject';
import { Project, IProject } from '@lib/db/models/index';
import { validators } from '@shared/validate/index';
import { ValidationError, DuplicityError, SystemError } from '@shared/errors/errors';

// 🧪 MOCKS - Simulamos las dependencias
jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/index');

// Type casting para los mocks
const mockProject = Project as jest.Mocked<typeof Project>;
const mockValidateProject = validators.validateProject as jest.MockedFunction<typeof validators.validateProject>;



describe('addProject - lógica de negocio', () => {
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
        title: 'Project 1',
        description: 'una description',
        link: 'https://github.com/user/project1',
        images: ['https://example.com/image1.png'],
        techStack: ['JavaScript', 'React'],
        repoUrl: 'https://github.com/user/project1',
        featured: true,
        tags: ['web', 'app'],
        createdAt: new Date(),
    };

    // Mock del objeto validado que retorna validateProject
    const validatedMock = {
        ...validInput,
        slug: 'project-1'
    };

    const createdMock: IProject = {
        _id: '507f1f77bcf86cd799439011',
        ...validatedMock
    } as unknown as IProject;

    // 🎯 HAPPY PATH TESTS
    describe('✅ Happy Path - Casos Exitosos', () => {

        test('✅ Debe crear un proyecto exitosamente', async () => {
            // Arrange
            mockValidateProject.mockReturnValue(validatedMock);
            mockProject.findOne.mockResolvedValue(null);
            mockProject.create.mockResolvedValue(createdMock as never);

            // Act
            const result = await addProject(validInput);

            // Assert
            expect(mockValidateProject).toHaveBeenCalledWith(validInput);
            expect(mockProject.findOne).toHaveBeenCalledWith({
                $or: [
                    { title: validatedMock.title },
                    { slug: 'project-1' }
                ]
            });
            expect(mockProject.create).toHaveBeenCalledWith(validatedMock);
            expect(result).toEqual(createdMock);
        });
    });

    // 💥 VALIDATION ERROR TESTS  
    describe('❌ Validation Errors - Errores por Campo', () => {

        test('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
            // Arrange
            const validationError = new ValidationError('Datos inválidos', [{ field: 'role', message: 'Requerido' }]);
            mockValidateProject.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addProject({ ...validInput, title: '' })).rejects.toThrow(ValidationError);
        });
    });

    // 🔄 DUPLICITY ERROR TESTS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {
        test('❌ Debe lanzar DuplicityError si ya existe proyecto con ese título o slug', async () => {
            // Arrange
            mockValidateProject.mockReturnValue(validatedMock);
            mockProject.findOne.mockResolvedValue(createdMock);
            // Act & Assert
            await expect(addProject(validInput)).rejects.toThrow(DuplicityError);
        });
    });

    // 💥 SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
            // Arrange
            mockValidateProject.mockReturnValue(validatedMock);
            mockProject.findOne.mockRejectedValue(new Error('DB Error'));
            // Act & Assert
            await expect(addProject(validInput)).rejects.toThrow(SystemError);
        });

        test('❌ Debe lanzar SystemError si ocurre un error no-Error (unknown)', async () => {
            // Arrange
            mockValidateProject.mockReturnValue(validatedMock);
            mockProject.findOne.mockRejectedValue('Unknown error');
            // Act & Assert
            await expect(addProject(validInput)).rejects.toThrow(SystemError);
        });
    });
});
