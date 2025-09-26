/**
 * 🧪 DELETE BLOG - TEST SUITE COMPLETO
 * 
 * Esta suite de tests cubre exhaustivamente la función deleteBlog con:
 * ✅ Happy Path - Eliminación exitosa
 * ❌ Validation Errors - Errores de validación de ID
 * ❌ Not Found Errors - Blog no encontrado
 * ❌ System Errors - Errores del sistema/base de datos
 * 🔗 Integration-like Tests - Pruebas de flujo completo
 * 
 * Todos los tests están diseñados para ser type-safe sin usar 'any'.
 */

// ** IMPORTS **
import { deleteBlog } from '@app/api/_logic/blog/deleteBlog';
import { BlogPost } from '@lib/db/models/index';
import { validateId } from '@shared/validate/validate';
import { ValidationError, NotFoundError, SystemError } from '@shared/errors/errors';

// ** MOCKS **
jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/validate');

// Mock console
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

// ** INTERFACES PARA TYPE SAFETY **
interface BlogInputTest {
    id: string;
}

interface MockDeletedBlog {
    _id: string;
    title: string;
    content: string;
    slug: string;
    tags?: string[];
    author: string;
    isPublished: boolean;
    viewsCount: number;
    publishedAt: Date;
}

// ** TYPED MOCKS **
const mockBlogPost = BlogPost as jest.Mocked<typeof BlogPost>;
const mockValidateId = validateId as jest.MockedFunction<typeof validateId>;

describe('🧪 deleteBlog - Test Suite Completo', () => {

    // ** TEST DATA **
    const validBlogId = '507f1f77bcf86cd799439011';
    const validBlogInput: BlogInputTest = { id: validBlogId };

    const deletedBlogMock: MockDeletedBlog = {
        _id: validBlogId,
        title: 'Blog a eliminar',
        content: 'Este blog será eliminado para testing',
        slug: 'blog-a-eliminar',
        tags: ['test', 'delete'],
        author: 'Test Author',
        isPublished: true,
        viewsCount: 100,
        publishedAt: new Date('2024-01-01')
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Eliminación Exitosa', () => {

        test('✅ Debe eliminar un blog exitosamente', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(deletedBlogMock as never);

            // Act
            const result = await deleteBlog(validBlogInput);

            // Assert
            expect(mockValidateId).toHaveBeenCalledWith(validBlogId);
            expect(mockBlogPost.findByIdAndDelete).toHaveBeenCalledWith(validBlogId);
            expect(result).toEqual(deletedBlogMock);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Blog eliminado exitosamente: ${validBlogId} - "${deletedBlogMock.title}"`
            );
        });

        test('✅ Debe eliminar un blog con ID válido diferente', async () => {
            // Arrange
            const differentId = '507f1f77bcf86cd799439012';
            const differentBlog: MockDeletedBlog = {
                ...deletedBlogMock,
                _id: differentId,
                title: 'Otro blog a eliminar'
            };
            const input: BlogInputTest = { id: differentId };

            mockValidateId.mockReturnValue(differentId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(differentBlog as never);

            // Act
            const result = await deleteBlog(input);

            // Assert
            expect(mockValidateId).toHaveBeenCalledWith(differentId);
            expect(mockBlogPost.findByIdAndDelete).toHaveBeenCalledWith(differentId);
            expect(result).toEqual(differentBlog);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Blog eliminado exitosamente: ${differentId} - "${differentBlog.title}"`
            );
        });
    });

    // ❌ VALIDATION ERROR TESTS
    describe('❌ Validation Errors - Errores de Validación', () => {

        test('❌ Debe fallar con ID inválido', async () => {
            // Arrange
            const invalidInput: BlogInputTest = { id: 'invalid-id' };
            const validationError = new ValidationError('ID inválido', [
                { field: 'id', message: 'Invalid ObjectId format' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(deleteBlog(invalidInput)).rejects.toThrow(ValidationError);
            await expect(deleteBlog(invalidInput)).rejects.toThrow('ID inválido');

            expect(mockValidateId).toHaveBeenCalledWith('invalid-id');
            expect(mockBlogPost.findByIdAndDelete).not.toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID inválido, Detalles:',
                [{ field: 'id', message: 'Invalid ObjectId format' }]
            );
        });

        test('❌ Debe fallar con ID vacío', async () => {
            // Arrange
            const emptyIdInput: BlogInputTest = { id: '' };
            const validationError = new ValidationError('ID es requerido', [
                { field: 'id', message: 'ID cannot be empty' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(deleteBlog(emptyIdInput)).rejects.toThrow(ValidationError);
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID es requerido, Detalles:',
                [{ field: 'id', message: 'ID cannot be empty' }]
            );
        });

        test('❌ Debe fallar con ID null/undefined', async () => {
            // Arrange
            const nullIdInput = { id: null as unknown as string };
            const validationError = new ValidationError('ID inválido', [
                { field: 'id', message: 'ID must be a valid string' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(deleteBlog(nullIdInput)).rejects.toThrow(ValidationError);
            expect(mockValidateId).toHaveBeenCalledWith(null);
        });
    });

    // ❌ NOT FOUND ERROR TESTS  
    describe('❌ Not Found Errors - Blog No Encontrado', () => {

        test('❌ Debe fallar cuando no existe el blog', async () => {
            // Arrange
            const nonExistentId = '507f1f77bcf86cd799439999';
            const input: BlogInputTest = { id: nonExistentId };

            mockValidateId.mockReturnValue(nonExistentId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(null);

            // Act & Assert
            await expect(deleteBlog(input)).rejects.toThrow(NotFoundError);
            await expect(deleteBlog(input)).rejects.toThrow('No se encontró un blog con ese ID');

            expect(mockValidateId).toHaveBeenCalledWith(nonExistentId);
            expect(mockBlogPost.findByIdAndDelete).toHaveBeenCalledWith(nonExistentId);
            expect(mockConsoleLog).not.toHaveBeenCalled();
        });

        test('❌ Debe loggear el error de NotFound correctamente', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(null);

            // Act & Assert
            await expect(deleteBlog(validBlogInput)).rejects.toThrow(NotFoundError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[NotFoundError] No se encontró un blog con ese ID, Detalles:',
                { id: validBlogId }
            );
        });

        test('❌ Debe manejar correctamente el error properties en NotFoundError', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(null);

            try {
                await deleteBlog(validBlogInput);
            } catch (error: unknown) {
                // Assert
                expect(error).toBeInstanceOf(NotFoundError);
                if (error instanceof NotFoundError) {
                    expect(error.publicMessage).toBe('No se encontró un blog con ese ID');
                    expect(error.details).toEqual({ id: validBlogId });
                    expect(error.type).toBe('NOT_FOUND');
                }
            }
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {

        test('❌ Debe manejar errores de base de datos', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');

            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockRejectedValue(dbError);

            // Act & Assert
            await expect(deleteBlog(validBlogInput)).rejects.toThrow(SystemError);
            await expect(deleteBlog(validBlogInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Database connection failed'
            );
        });

        test('❌ Debe manejar errores en findByIdAndDelete()', async () => {
            // Arrange
            const deleteError = new Error('Failed to delete document');

            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockRejectedValue(deleteError);

            // Act & Assert
            await expect(deleteBlog(validBlogInput)).rejects.toThrow(SystemError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Failed to delete document'
            );
        });

        test('❌ Debe manejar errores no-Error (unknown types)', async () => {
            // Arrange
            const unknownError = 'String error';

            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockRejectedValue(unknownError);

            // Act & Assert
            await expect(deleteBlog(validBlogInput)).rejects.toThrow(SystemError);
            await expect(deleteBlog(validBlogInput)).rejects.toThrow('Error desconocido. Contacte a soporte.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[UnknownError] String error'
            );
        });

        test('❌ Debe manejar error null/undefined', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockRejectedValue(null);

            // Act & Assert
            await expect(deleteBlog(validBlogInput)).rejects.toThrow(SystemError);
            await expect(deleteBlog(validBlogInput)).rejects.toThrow('Error desconocido. Contacte a soporte.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[UnknownError] null'
            );
        });
    });

    // 🔗 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {

        test('🔗 Debe verificar el flujo completo de eliminación exitosa', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(deletedBlogMock as never);

            // Act
            const result = await deleteBlog(validBlogInput);

            // Assert - Verificar que todas las funciones fueron llamadas
            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.findByIdAndDelete).toHaveBeenCalledTimes(1);

            // Verificar que se loggeó el éxito
            expect(mockConsoleLog).toHaveBeenCalledWith(
                `Blog eliminado exitosamente: ${validBlogId} - "${deletedBlogMock.title}"`
            );

            // Verificar que no se loggearon errores
            expect(mockConsoleError).not.toHaveBeenCalled();

            // Verificar el resultado
            expect(result).toEqual(deletedBlogMock);
            expect(result).toHaveProperty('_id', validBlogId);
            expect(result).toHaveProperty('title');
        });

        test('🔗 Debe manejar correctamente la prioridad de errores (ValidationError antes que SystemError)', async () => {
            // Arrange - ValidationError tiene prioridad
            const validationError = new ValidationError('ID inválido', []);

            mockValidateId.mockImplementation(() => { throw validationError; });
            // Este mock no debería ser llamado, pero lo preparamos por si acaso
            mockBlogPost.findByIdAndDelete.mockRejectedValue(new Error('Este error no debería aparecer'));

            // Act & Assert
            await expect(deleteBlog({ id: 'invalid' })).rejects.toThrow(ValidationError);
            await expect(deleteBlog({ id: 'invalid' })).rejects.toThrow('ID inválido');

            // Verificar que findByIdAndDelete no se llamó porque la validación falló primero
            expect(mockBlogPost.findByIdAndDelete).not.toHaveBeenCalled();
        });

        test('🔗 Debe manejar correctamente el orden NotFound vs SystemError', async () => {
            // Arrange - Si la validación pasa pero no se encuentra el blog
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(null); // No encontrado

            // Act & Assert
            await expect(deleteBlog(validBlogInput)).rejects.toThrow(NotFoundError);

            // Verificar que se intentó la eliminación
            expect(mockBlogPost.findByIdAndDelete).toHaveBeenCalledWith(validBlogId);
        });

        test('🔗 Debe verificar que los mocks se resetean correctamente entre tests', async () => {
            // Arrange - Test que verifica la limpieza de mocks
            expect(mockValidateId).toHaveBeenCalledTimes(0);
            expect(mockBlogPost.findByIdAndDelete).toHaveBeenCalledTimes(0);
            expect(mockConsoleLog).toHaveBeenCalledTimes(0);
            expect(mockConsoleError).toHaveBeenCalledTimes(0);

            // Act
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndDelete.mockResolvedValue(deletedBlogMock as never);

            await deleteBlog(validBlogInput);

            // Assert
            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.findByIdAndDelete).toHaveBeenCalledTimes(1);
        });
    });
});
