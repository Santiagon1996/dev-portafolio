/**
 * 🧪 UPDATE PROJECT - TEST SUITE COMPLETO
 * Basado en la lógica, modelo y schema Zod de project
 */

import { updateProject } from '@app/api/_logic/project/updateProject';
import { Project, IProject } from '@lib/db/models/index';
import { validators } from '@shared/validate/index';
import { ValidationError, DuplicityError, NotFoundError, SystemError } from '@shared/errors/errors';

jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/index');

const mockProject = Project as jest.Mocked<typeof Project>;
const mockValidateUpdateProject = validators.validateUpdateProject as jest.MockedFunction<typeof validators.validateUpdateProject>;
const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;

interface ProjectUpdateInputTest {
    id: string;
    title?: string;
    description?: string;
    techStack?: string[];
    repoUrl?: string;
    images?: string[];
    tags?: string[];
}

describe('🧪 updateProject - Test Suite Completo', () => {
    const validProjectId = '507f1f77bcf86cd799439011';
    const validInput: ProjectUpdateInputTest = {
        id: validProjectId,
        title: 'Proyecto Test',
        description: 'Actualización de proyecto de prueba',
        techStack: ['Node.js', 'React'],
        repoUrl: 'https://github.com/test/project',
        images: ['https://img.com/1.png'],
        tags: ['test', 'update']
    };

    const validatedUpdateMock = {
        title: 'Proyecto Test',
        description: 'Actualización de proyecto de prueba',
        techStack: ['Node.js', 'React'],
        repoUrl: 'https://github.com/test/project',
        images: ['https://img.com/1.png'],
        tags: ['test', 'update']
    };

    const updatedProjectMock: IProject = {
        _id: validProjectId,
        ...validatedUpdateMock
    } as unknown as IProject;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Actualización Exitosa', () => {
        test('✅ Debe actualizar un proyecto exitosamente', async () => {
            mockValidateId.mockReturnValue(validProjectId);
            mockValidateUpdateProject.mockReturnValue(validatedUpdateMock);
            mockProject.findOne.mockResolvedValue(null);
            mockProject.findByIdAndUpdate.mockResolvedValue(updatedProjectMock);

            const result = await updateProject(validInput);

            expect(mockValidateId).toHaveBeenCalledWith(validProjectId);
            expect(mockValidateUpdateProject).toHaveBeenCalledWith({
                title: validInput.title,
                description: validInput.description,
                techStack: validInput.techStack,
                repoUrl: validInput.repoUrl,
                images: validInput.images,
                tags: validInput.tags
            });
            expect(mockProject.findOne).toHaveBeenCalled();
            expect(mockProject.findByIdAndUpdate).toHaveBeenCalledWith(
                validProjectId,
                validatedUpdateMock,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(updatedProjectMock);
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {
        test('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
            const validationError = new ValidationError('Datos inválidos', [{ field: 'title', message: 'Requerido' }]);
            mockValidateId.mockReturnValue(validProjectId);
            mockValidateUpdateProject.mockImplementation(() => { throw validationError; });

            await expect(updateProject({ ...validInput, title: '' })).rejects.toThrow(ValidationError);
        });
    });

    // ❌ DUPLICITY ERROR TESTS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {
        test('❌ Debe lanzar DuplicityError si ya existe proyecto con ese título o slug', async () => {
            mockValidateId.mockReturnValue(validProjectId);
            mockValidateUpdateProject.mockReturnValue(validatedUpdateMock);
            mockProject.findOne.mockResolvedValue(updatedProjectMock);

            await expect(updateProject(validInput)).rejects.toThrow(DuplicityError);
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ Not Found Errors - Proyecto No Encontrado', () => {
        test('❌ Debe lanzar NotFoundError si no existe el proyecto', async () => {
            mockValidateId.mockReturnValue(validProjectId);
            mockValidateUpdateProject.mockReturnValue(validatedUpdateMock);
            mockProject.findOne.mockResolvedValue(null);
            mockProject.findByIdAndUpdate.mockResolvedValue(null);

            await expect(updateProject(validInput)).rejects.toThrow(NotFoundError);
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
            mockValidateId.mockReturnValue(validProjectId);
            mockValidateUpdateProject.mockReturnValue(validatedUpdateMock);
            mockProject.findOne.mockResolvedValue(null);
            mockProject.findByIdAndUpdate.mockRejectedValue(new Error('DB Error'));

            await expect(updateProject(validInput)).rejects.toThrow(SystemError);
        });
    });
});
