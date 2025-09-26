/**
 * 🧪 UPDATE BLOG - TEST SUITE COMPLETO
 * 
 * Esta suite de tests cubre exhaustivamente la función updateBlog con:
 * ✅ Happy Path - Actualización exitosa con diferentes escenarios
 * ❌ ID Validation Errors - Errores de validación de ID (MUY RIGUROSO)
 * ❌ Duplicity Errors - Errores de duplicidad de título/slug
 * ❌ Not Found Errors - Blog no encontrado
 * ❌ System Errors - Errores del sistema/base de datos
 * 🔗 Integration-like Tests - Pruebas de flujo completo
 * 
 * ENFOQUE RIGUROSO EN VALIDACIÓN:
 * - Múltiples tipos de IDs inválidos
 * - Casos edge de validación
 * - Verificación exhaustiva de mensajes de error
 * - Validación de logging de errores
 * 
 * Todos los tests están diseñados para ser type-safe sin            mockBlogPost.findOne.mockImplementation(() => {
                throw 'String error';
            });

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(SystemError);
            await expect(updateBlog(validUpdateInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[UnknownError] String error'
            );.
 */

// ** IMPORTS **
import { updateBlog } from '@app/api/_logic/blog/updateBlog';
import { BlogPost } from '@lib/db/models/index';
import { validateId, validateUpdateBlog } from '@shared/validate/validate';
import { slugify } from '@lib/utils/slugify';
import { ValidationError, NotFoundError, DuplicityError, SystemError } from '@shared/errors/errors';

// ** MOCKS **
jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/validate');
jest.mock('@lib/utils/slugify');

// Mock console
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

// ** INTERFACES PARA TYPE SAFETY **
interface BlogUpdateInputTest {
    id: string;
    title?: string;
    content?: string;
    summary?: string;
    tags?: string[];
    author?: string;
    isPublished?: boolean;
    publishedAt?: Date | string;
}

interface MockUpdatedBlog {
    _id: string;
    title: string;
    content: string;
    slug: string;
    summary?: string;
    tags: string[];
    author: string;
    isPublished: boolean;
    viewsCount: number;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface MockExistingConflictBlog {
    _id: string;
    title: string;
    slug: string;
}

// ** TYPED MOCKS **
const mockBlogPost = BlogPost as jest.Mocked<typeof BlogPost>;
const mockValidateId = validateId as jest.MockedFunction<typeof validateId>;
type UpdateBlogReturnType = {
    title?: string;
    slug?: string;
    content?: string;
    publishedAt?: Date;
    isPublished?: boolean;
    tags?: string[];
    author?: string;
};

const mockValidateUpdateBlog = validateUpdateBlog as jest.MockedFunction<(input: any) => UpdateBlogReturnType>;
const mockSlugify = slugify as jest.MockedFunction<typeof slugify>;

describe('🧪 updateBlog - Test Suite Completo', () => {

    // ** TEST DATA **
    const validBlogId = '507f1f77bcf86cd799439011';
    const differentValidId = '507f1f77bcf86cd799439012';

    const validUpdateInput: BlogUpdateInputTest = {
        id: validBlogId,
        title: 'Título Actualizado',
        content: 'Contenido actualizado del blog',
        author: 'Updated Author',
        tags: ['javascript', 'updated'],
        isPublished: true
    };

    const originalBlog: MockUpdatedBlog = {
        _id: validBlogId,
        title: 'Título Original',
        content: 'Contenido original',
        slug: 'titulo-original',
        tags: ['javascript', 'original'],
        author: 'Original Author',
        isPublished: false,
        viewsCount: 50,
        publishedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    };

    const updatedBlogMock: MockUpdatedBlog = {
        _id: validBlogId,
        title: 'Título Actualizado',
        content: 'Contenido actualizado del blog',
        slug: 'titulo-actualizado',
        tags: ['javascript', 'updated'],
        author: 'Updated Author',
        isPublished: true,
        viewsCount: 50,
        publishedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Actualización Exitosa', () => {

        test('✅ Debe actualizar un blog con todos los campos', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockResolvedValue(null); // No hay conflictos
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(updatedBlogMock as never);

            // Act
            const result = await updateBlog(validUpdateInput);

            // Assert
            expect(mockValidateId).toHaveBeenCalledWith(validBlogId);
            expect(mockSlugify).toHaveBeenCalledWith('Título Actualizado');
            expect(mockBlogPost.findOne).toHaveBeenCalledWith({
                $and: [
                    { _id: { $ne: validBlogId } },
                    {
                        $or: [
                            { title: 'Título Actualizado' },
                            { slug: 'titulo-actualizado' }
                        ]
                    }
                ]
            });
            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledWith(
                validBlogId,
                {
                    title: 'Título Actualizado',
                    content: 'Contenido actualizado del blog',
                    author: 'Updated Author',
                    tags: ['javascript', 'updated'],
                    isPublished: true
                },
                { new: true, runValidators: true }
            );
            expect(result).toEqual(updatedBlogMock);
        });

        test('✅ Debe actualizar solo algunos campos', async () => {
            // Arrange
            const partialUpdate: BlogUpdateInputTest = {
                id: validBlogId,
                content: 'Solo actualizo contenido',
                isPublished: true
            };
            const partialUpdatedBlog = {
                ...updatedBlogMock,
                content: 'Solo actualizo contenido',
                title: 'Título Original', // Se mantiene
                slug: 'titulo-original'   // Se mantiene
            };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                content: 'Solo actualizo contenido',
                isPublished: true
            });
            // No se llama slugify porque no hay title
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(partialUpdatedBlog as never);

            // Act
            const result = await updateBlog(partialUpdate);

            // Assert
            expect(mockValidateId).toHaveBeenCalledWith(validBlogId);
            expect(mockSlugify).not.toHaveBeenCalled(); // No title = No slugify
            expect(mockBlogPost.findOne).not.toHaveBeenCalled(); // No title = No duplicity check
            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledWith(
                validBlogId,
                {
                    content: 'Solo actualizo contenido',
                    isPublished: true
                },
                { new: true, runValidators: true }
            );
            expect(result.content).toBe('Solo actualizo contenido');
            expect(result.title).toBe('Título Original');
        });

        test('✅ Debe actualizar solo el título sin conflictos', async () => {
            // Arrange
            const titleOnlyUpdate: BlogUpdateInputTest = {
                id: validBlogId,
                title: 'Nuevo Título Único'
            };
            const titleUpdatedBlog = {
                ...updatedBlogMock,
                title: 'Nuevo Título Único',
                slug: 'nuevo-titulo-unico'
            };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Nuevo Título Único'
            });
            mockSlugify.mockReturnValue('nuevo-titulo-unico');
            mockBlogPost.findOne.mockResolvedValue(null); // Sin conflictos
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(titleUpdatedBlog as never);

            // Act
            const result = await updateBlog(titleOnlyUpdate);

            // Assert
            expect(mockSlugify).toHaveBeenCalledWith('Nuevo Título Único');
            expect(mockBlogPost.findOne).toHaveBeenCalledWith({
                $and: [
                    { _id: { $ne: validBlogId } },
                    {
                        $or: [
                            { title: 'Nuevo Título Único' },
                            { slug: 'nuevo-titulo-unico' }
                        ]
                    }
                ]
            });
            expect(result.title).toBe('Nuevo Título Único');
        });

        test('✅ Debe actualizar tags como array vacío', async () => {
            // Arrange
            const tagsUpdate: BlogUpdateInputTest = {
                id: validBlogId,
                tags: []
            };
            const noTagsBlog = { ...updatedBlogMock, tags: [] };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                tags: []
            });
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(noTagsBlog as never);

            // Act
            const result = await updateBlog(tagsUpdate);

            // Assert
            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledWith(
                validBlogId,
                { tags: [] },
                { new: true, runValidators: true }
            );
            expect(result.tags).toEqual([]);
        });
    });

    // ❌ ID VALIDATION ERRORS - MUY RIGUROSO
    describe('❌ ID Validation Errors - Errores de Validación de ID (RIGUROSO)', () => {

        test('❌ Debe fallar con ID completamente inválido', async () => {
            // Arrange
            const invalidInput: BlogUpdateInputTest = {
                id: 'invalid-id-format',
                title: 'Título'
            };
            const validationError = new ValidationError('ID inválido', [
                { field: 'id', message: 'Invalid ObjectId format' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(invalidInput)).rejects.toThrow(ValidationError);
            await expect(updateBlog(invalidInput)).rejects.toThrow('ID inválido');

            expect(mockValidateId).toHaveBeenCalledWith('invalid-id-format');
            expect(mockBlogPost.findOne).not.toHaveBeenCalled();
            expect(mockBlogPost.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID inválido, Detalles:',
                [{ field: 'id', message: 'Invalid ObjectId format' }]
            );
        });

        test('❌ Debe fallar con ID muy corto', async () => {
            // Arrange
            const shortIdInput: BlogUpdateInputTest = {
                id: '123',
                title: 'Título'
            };
            const validationError = new ValidationError('ID muy corto', [
                { field: 'id', message: 'ObjectId must be 24 characters long' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(shortIdInput)).rejects.toThrow(ValidationError);
            await expect(updateBlog(shortIdInput)).rejects.toThrow('ID muy corto');

            expect(mockValidateId).toHaveBeenCalledWith('123');
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID muy corto, Detalles:',
                [{ field: 'id', message: 'ObjectId must be 24 characters long' }]
            );
        });

        test('❌ Debe fallar con ID muy largo', async () => {
            // Arrange
            const longIdInput: BlogUpdateInputTest = {
                id: '507f1f77bcf86cd799439011EXTRA',
                title: 'Título'
            };
            const validationError = new ValidationError('ID muy largo', [
                { field: 'id', message: 'ObjectId must be exactly 24 characters' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(longIdInput)).rejects.toThrow(ValidationError);
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID muy largo, Detalles:',
                [{ field: 'id', message: 'ObjectId must be exactly 24 characters' }]
            );
        });

        test('❌ Debe fallar con ID con caracteres inválidos', async () => {
            // Arrange
            const badCharsInput: BlogUpdateInputTest = {
                id: '507f1f77bcf86cd799439XYZ',
                title: 'Título'
            };
            const validationError = new ValidationError('ID con caracteres inválidos', [
                { field: 'id', message: 'ObjectId must contain only hexadecimal characters' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(badCharsInput)).rejects.toThrow(ValidationError);
            expect(mockValidateId).toHaveBeenCalledWith('507f1f77bcf86cd799439XYZ');
        });

        test('❌ Debe fallar con ID null', async () => {
            // Arrange
            const nullIdInput = {
                id: null as unknown as string,
                title: 'Título'
            };
            const validationError = new ValidationError('ID es requerido', [
                { field: 'id', message: 'ID cannot be null or undefined' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(nullIdInput)).rejects.toThrow(ValidationError);
            expect(mockValidateId).toHaveBeenCalledWith(null);
        });

        test('❌ Debe fallar con ID undefined', async () => {
            // Arrange
            const undefinedIdInput = {
                id: undefined as unknown as string,
                title: 'Título'
            };
            const validationError = new ValidationError('ID es requerido', [
                { field: 'id', message: 'ID is required' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(undefinedIdInput)).rejects.toThrow(ValidationError);
            expect(mockValidateId).toHaveBeenCalledWith(undefined);
        });

        test('❌ Debe fallar con ID vacío', async () => {
            // Arrange
            const emptyIdInput: BlogUpdateInputTest = {
                id: '',
                title: 'Título'
            };
            const validationError = new ValidationError('ID vacío', [
                { field: 'id', message: 'ID cannot be empty string' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(emptyIdInput)).rejects.toThrow(ValidationError);
            expect(mockValidateId).toHaveBeenCalledWith('');
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] ID vacío, Detalles:',
                [{ field: 'id', message: 'ID cannot be empty string' }]
            );
        });

        test('❌ Debe fallar con ID solo espacios', async () => {
            // Arrange
            const spacesIdInput: BlogUpdateInputTest = {
                id: '   ',
                title: 'Título'
            };
            const validationError = new ValidationError('ID solo espacios', [
                { field: 'id', message: 'ID cannot be only whitespace' }
            ]);

            mockValidateId.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(updateBlog(spacesIdInput)).rejects.toThrow(ValidationError);
            expect(mockValidateId).toHaveBeenCalledWith('   ');
        });

        test('❌ Debe fallar con múltiples errores de validación en ID', async () => {
            // Arrange
            const multiErrorInput: BlogUpdateInputTest = {
                id: 'bad',
                title: 'Título'
            };
            const multiValidationError = new ValidationError('Múltiples errores de ID', [
                { field: 'id', message: 'Too short' },
                { field: 'id', message: 'Invalid format' },
                { field: 'id', message: 'Contains invalid characters' }
            ]);

            mockValidateId.mockImplementation(() => { throw multiValidationError; });

            // Act & Assert
            await expect(updateBlog(multiErrorInput)).rejects.toThrow(ValidationError);
            expect(mockConsoleError).toHaveBeenCalledWith(
                '[ValidationError] Múltiples errores de ID, Detalles:',
                [
                    { field: 'id', message: 'Too short' },
                    { field: 'id', message: 'Invalid format' },
                    { field: 'id', message: 'Contains invalid characters' }
                ]
            );
        });
    });

    // ❌ DUPLICITY ERRORS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {

        test('❌ Debe fallar cuando existe otro blog con el mismo título', async () => {
            // Arrange
            const conflictBlog: MockExistingConflictBlog = {
                _id: differentValidId,
                title: 'Título Actualizado',
                slug: 'titulo-actualizado-diferente'
            };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockResolvedValue(conflictBlog as never);

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(DuplicityError);
            await expect(updateBlog(validUpdateInput)).rejects.toThrow('Ya existe un blog con ese título');

            expect(mockBlogPost.findOne).toHaveBeenCalledWith({
                $and: [
                    { _id: { $ne: validBlogId } },
                    {
                        $or: [
                            { title: 'Título Actualizado' },
                            { slug: 'titulo-actualizado' }
                        ]
                    }
                ]
            });
            expect(mockBlogPost.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('❌ Debe fallar cuando existe otro blog con slug conflictivo', async () => {
            // Arrange
            const conflictBlog: MockExistingConflictBlog = {
                _id: differentValidId,
                title: 'Título Diferente',
                slug: 'titulo-actualizado' // Mismo slug que se generaría
            };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockResolvedValue(conflictBlog as never);

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(DuplicityError);

            // Verificar detalles del error
            try {
                await updateBlog(validUpdateInput);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(DuplicityError);
                if (error instanceof DuplicityError) {
                    expect(error.details).toEqual({
                        title: 'Título Actualizado',
                        conflictsWith: differentValidId,
                        conflictType: 'slug',
                        existingTitle: 'Título Diferente',
                        existingSlug: 'titulo-actualizado'
                    });
                }
            }
        });

        test('❌ Debe loggear correctamente el error de duplicidad', async () => {
            // Arrange
            const conflictBlog: MockExistingConflictBlog = {
                _id: differentValidId,
                title: 'Título Actualizado',
                slug: 'titulo-actualizado'
            };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockResolvedValue(conflictBlog as never);

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(DuplicityError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[DuplicityError] Ya existe un blog con ese título, Detalles:',
                {
                    title: 'Título Actualizado',
                    conflictsWith: differentValidId,
                    conflictType: 'title',
                    existingTitle: 'Título Actualizado',
                    existingSlug: 'titulo-actualizado'
                }
            );
        });

        test('❌ No debe verificar duplicidad si no se actualiza el título', async () => {
            // Arrange
            const noTitleUpdate: BlogUpdateInputTest = {
                id: validBlogId,
                content: 'Solo contenido',
                author: 'Nuevo autor'
            };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                content: 'Solo contenido',
                author: 'Nuevo autor'
            });
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(updatedBlogMock as never);

            // Act
            await updateBlog(noTitleUpdate);

            // Assert
            expect(mockBlogPost.findOne).not.toHaveBeenCalled();
            expect(mockSlugify).not.toHaveBeenCalled();
        });
    });

    // ❌ NOT FOUND ERRORS
    describe('❌ Not Found Errors - Blog No Encontrado', () => {

        test('❌ Debe fallar cuando no existe el blog a actualizar', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockResolvedValue(null); // Sin conflictos
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(null); // Blog no encontrado

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(NotFoundError);
            await expect(updateBlog(validUpdateInput)).rejects.toThrow('No se encontró un blog con ese ID');

            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledWith(
                validBlogId,
                {
                    title: 'Título Actualizado',
                    content: 'Contenido actualizado del blog',
                    author: 'Updated Author',
                    tags: ['javascript', 'updated'],
                    isPublished: true
                },
                { new: true, runValidators: true }
            );
        });

        test('❌ Debe loggear correctamente el error NotFound', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                content: 'Nuevo contenido'
            });
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(null);

            const simpleUpdate: BlogUpdateInputTest = {
                id: validBlogId,
                content: 'Nuevo contenido'
            };

            // Act & Assert
            await expect(updateBlog(simpleUpdate)).rejects.toThrow(NotFoundError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[NotFoundError] No se encontró un blog con ese ID, Detalles:',
                { id: validBlogId }
            );
        });

        test('❌ Debe verificar propiedades del error NotFoundError', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(null);

            // Act & Assert
            try {
                await updateBlog(validUpdateInput);
            } catch (error: unknown) {
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

        test('❌ Debe manejar errores en findOne durante verificación de duplicidad', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockRejectedValue(dbError);

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(SystemError);
            await expect(updateBlog(validUpdateInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Database connection failed'
            );
        });

        test('❌ Debe manejar errores en findByIdAndUpdate', async () => {
            // Arrange
            const updateError = new Error('Update operation failed');

            mockValidateId.mockReturnValue(validBlogId);
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockResolvedValue(null);
            mockBlogPost.findByIdAndUpdate.mockRejectedValue(updateError);

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(SystemError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Update operation failed'
            );
        });

        test('❌ Debe manejar errores de slugify', async () => {
            // Arrange
            const slugifyError = new Error('Slugify failed');

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockImplementation(() => { throw slugifyError; });

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(SystemError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Slugify failed'
            );
        });

        test('❌ Debe manejar errores no-Error (unknown types)', async () => {
            // Arrange
            const unknownError = 'String error';

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockImplementation(() => {
                throw unknownError;
            });

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(SystemError);
            await expect(updateBlog(validUpdateInput)).rejects.toThrow('Error desconocido. Contacte a soporte.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[UnknownError] String error'
            );
        });

        test('❌ Debe manejar error null/undefined', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockImplementation(() => {
                throw null;
            });

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(SystemError);
            await expect(updateBlog(validUpdateInput)).rejects.toThrow('Error desconocido. Contacte a soporte.');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[UnknownError] null'
            );
        });
    });

    // 🔗 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {

        test('🔗 Debe verificar el flujo completo de actualización exitosa', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Actualizado',
                content: 'Contenido actualizado del blog',
                author: 'Updated Author',
                tags: ['javascript', 'updated'],
                isPublished: true
            });
            mockSlugify.mockReturnValue('titulo-actualizado');
            mockBlogPost.findOne.mockResolvedValue(null);
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(updatedBlogMock as never);

            // Act
            const result = await updateBlog(validUpdateInput);

            // Assert - Verificar orden de ejecución
            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockSlugify).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.findOne).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledTimes(1);

            // Verificar que no se loggearon errores
            expect(mockConsoleError).not.toHaveBeenCalled();

            // Verificar estructura del resultado
            expect(result).toHaveProperty('_id');
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('content');
            expect(result).toHaveProperty('slug');
            expect(result).toEqual(updatedBlogMock);
        });

        test('🔗 Debe manejar correctamente la prioridad de errores', async () => {
            // Arrange - ValidationError (ID) tiene prioridad sobre otros errores
            const validationError = new ValidationError('ID inválido', []);

            mockValidateId.mockImplementation(() => { throw validationError; });
            // Estos no se deberían llamar
            mockSlugify.mockImplementation(() => { throw new Error('No debería ejecutarse'); });
            mockBlogPost.findOne.mockRejectedValue(new Error('No debería ejecutarse'));

            // Act & Assert
            await expect(updateBlog(validUpdateInput)).rejects.toThrow(ValidationError);
            await expect(updateBlog(validUpdateInput)).rejects.toThrow('ID inválido');

            // Verificar que las operaciones posteriores no se ejecutaron
            expect(mockSlugify).not.toHaveBeenCalled();
            expect(mockBlogPost.findOne).not.toHaveBeenCalled();
            expect(mockBlogPost.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('🔗 Debe manejar el flujo sin title (sin verificación de duplicidad)', async () => {
            // Arrange
            const noTitleUpdate: BlogUpdateInputTest = {
                id: validBlogId,
                content: 'Solo contenido actualizado',
                isPublished: true
            };
            const contentOnlyBlog = {
                ...updatedBlogMock,
                content: 'Solo contenido actualizado'
            };

            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                content: 'Solo contenido actualizado',
                isPublished: true
            });
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(contentOnlyBlog as never);

            // Act
            const result = await updateBlog(noTitleUpdate);

            // Assert - Flujo simplificado sin duplicity check
            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockSlugify).not.toHaveBeenCalled();
            expect(mockBlogPost.findOne).not.toHaveBeenCalled();
            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledTimes(1);

            expect(result.content).toBe('Solo contenido actualizado');
        });

        test('🔗 Debe verificar que los mocks se resetean correctamente', async () => {
            // Arrange - Verificar estado inicial limpio
            expect(mockValidateId).toHaveBeenCalledTimes(0);
            expect(mockSlugify).toHaveBeenCalledTimes(0);
            expect(mockBlogPost.findOne).toHaveBeenCalledTimes(0);
            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledTimes(0);
            expect(mockConsoleError).toHaveBeenCalledTimes(0);

            // Act
            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Test'
            });
            mockSlugify.mockReturnValue('test-slug');
            mockBlogPost.findOne.mockResolvedValue(null);
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(updatedBlogMock as never);

            await updateBlog({ id: validBlogId, title: 'Test' });

            // Assert
            expect(mockValidateId).toHaveBeenCalledTimes(1);
            expect(mockSlugify).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.findOne).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        });

        test('🔗 Debe verificar la estructura correcta de la query de duplicidad', async () => {
            // Arrange
            mockValidateId.mockReturnValue(validBlogId);
            mockValidateUpdateBlog.mockReturnValue({
                title: 'Título Test'
            });
            mockSlugify.mockReturnValue('titulo-test');
            mockBlogPost.findOne.mockResolvedValue(null);
            mockBlogPost.findByIdAndUpdate.mockResolvedValue(updatedBlogMock as never);

            const testInput: BlogUpdateInputTest = {
                id: validBlogId,
                title: 'Título Test'
            };

            // Act
            await updateBlog(testInput);

            // Assert - Verificar estructura exacta de la query
            expect(mockBlogPost.findOne).toHaveBeenCalledWith({
                $and: [
                    { _id: { $ne: validBlogId } },
                    {
                        $or: [
                            { title: 'Título Test' },
                            { slug: 'titulo-test' }
                        ]
                    }
                ]
            });
        });
    });
});
