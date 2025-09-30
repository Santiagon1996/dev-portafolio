/**
 * 🧪 DELETE PROJECT - TEST SUITE COMPLETO
 * Basado en la estructura de los tests de eliminación previos
 */

import { deleteProject } from '@app/api/_logic/project/deleteProject';
import { Project } from '@lib/db/models/index';
import { validateId } from '@shared/validate/validate';
import { ValidationError, NotFoundError, SystemError } from '@shared/errors/errors';

jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/validate');

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

interface ProjectInputTest {
    id: string;
}

interface MockDeletedProject {
    _id: string;
    title: string;
    description: string;
    techStack: string[];
    repoUrl?: string;
    demoUrl?: string;
    images?: string[];
    tags?: string[];
    featured: boolean;
    createdAt?: Date;
}

const mockProject = Project as jest.Mocked<typeof Project>;
const mockValidateId = validateId as jest.MockedFunction<typeof validateId>;

describe('🧪 deleteProject - Test Suite Completo', () => {
    const validProjectId = '507f1f77bcf86cd799439011';
    const validProjectInput: ProjectInputTest = { id: validProjectId };

    const deletedProjectMock: MockDeletedProject = {
        _id: validProjectId,
        title: 'Proyecto Test',
        description: 'Proyecto de prueba para eliminar',
        techStack: ['Node.js', 'React'],
        repoUrl: 'https://github.com/test/project',
        demoUrl: 'https://demo.com/project',
        images: ['https://img.com/1.png'],
        tags: ['test', 'delete'],
        featured: false,
        createdAt: new Date('2024-01-01')
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Eliminación Exitosa', () => {
        test('✅ Debe eliminar un proyecto exitosamente', async () => {
            mockValidateId.mockReturnValue(validProjectId);
            mockProject.findByIdAndDelete.mockResolvedValue(deletedProjectMock as never);

            const result = await deleteProject(validProjectInput);

            expect(mockValidateId).toHaveBeenCalledWith(validProjectId);
            expect(mockProject.findByIdAndDelete).toHaveBeenCalledWith(validProjectId);
            expect(result).toEqual(deletedProjectMock);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Proyecto eliminado exitosamente: ${validProjectId} - "${deletedProjectMock.title}"`
            );
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {
        test('❌ Debe fallar con ID inválido', async () => {
            const invalidInput: ProjectInputTest = { id: 'invalid-id' };
            const validationError = new ValidationError('ID inválido', [
                { field: 'id', message: 'Invalid ObjectId format' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            await expect(deleteProject(invalidInput)).rejects.toThrow(ValidationError);
            await expect(deleteProject(invalidInput)).rejects.toThrow('ID inválido');

            expect(mockValidateId).toHaveBeenCalledWith('invalid-id');
            expect(mockProject.findByIdAndDelete).not.toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID inválido, Detalles:',
                [{ field: 'id', message: 'Invalid ObjectId format' }]
            );
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ Not Found Errors - Proyecto No Encontrado', () => {
        test('❌ Debe fallar cuando no existe el proyecto', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const input: ProjectInputTest = { id: nonExistentId };

            mockValidateId.mockReturnValue(nonExistentId);
            mockProject.findByIdAndDelete.mockResolvedValue(null);

            await expect(deleteProject(input)).rejects.toThrow(NotFoundError);
            await expect(deleteProject(input)).rejects.toThrow('No se encontró un proyecto con ese ID');

            expect(mockValidateId).toHaveBeenCalledWith(nonExistentId);
            expect(mockProject.findByIdAndDelete).toHaveBeenCalledWith(nonExistentId);
            expect(mockConsoleLog).not.toHaveBeenCalled();
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {
        test('❌ Debe manejar errores de base de datos', async () => {
            const dbError = new Error('Database connection failed');

            mockValidateId.mockReturnValue(validProjectId);
            mockProject.findByIdAndDelete.mockRejectedValue(dbError);

            await expect(deleteProject(validProjectInput)).rejects.toThrow(SystemError);
            await expect(deleteProject(validProjectInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Database connection failed'
            );
        });
    });

    // 🔗 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {
        test('🔗 Debe verificar el flujo completo de eliminación exitosa', async () => {
            mockValidateId.mockReturnValue(validProjectId);
            mockProject.findByIdAndDelete.mockResolvedValue(deletedProjectMock as never);

            const result = await deleteProject(validProjectInput);

            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockProject.findByIdAndDelete).toHaveBeenCalledTimes(1);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Proyecto eliminado exitosamente: ${validProjectId} - "${deletedProjectMock.title}"`
            );
            expect(result).toEqual(deletedProjectMock);
            expect(result).toHaveProperty('_id', validProjectId);
            expect(result).toHaveProperty('title');
        });
    });
});
