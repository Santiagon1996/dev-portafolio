import { addBlog } from '@app/api/_logic/blog/addBlog';
import { BlogPost, IBlogPost } from '@lib/db/models/index';
import { ValidationError, DuplicityError, SystemError } from '@shared/errors/errors';
import { validateBlog } from '@shared/validate/validate';
import { slugify } from '@lib/utils/slugify';

// 🧪 MOCKS - Simulamos las dependencias
jest.mock('@lib/db/models/index');
jest.mock('@shared/validate/validate');
jest.mock('@lib/utils/slugify');

// Type casting para los mocks
const mockBlogPost = BlogPost as jest.Mocked<typeof BlogPost>;
const mockValidateBlog = validateBlog as jest.MockedFunction<typeof validateBlog>;
const mockSlugify = slugify as jest.MockedFunction<typeof slugify>;

// 📋 TIPOS AUXILIARES PARA TESTING
interface MockExistingBlog {
    _id: string;
    title: string;
    slug: string;
}

interface BlogInputTest {
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    author?: string;
    isPublished?: boolean;
}

describe('🧪 addBlog - Test Suite Completo', () => {

    // 🧹 SETUP - Limpiar mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // 📋 DATOS DE PRUEBA
    const validBlogInput: BlogInputTest = {
        title: 'Mi primer blog',
        content: 'Este es el contenido del blog con más de 20 caracteres',
        summary: 'Resumen del blog',
        tags: ['javascript', 'typescript'],
        author: 'Juan Pérez',
        isPublished: true
    };

    // Mock del objeto validado que retorna validateBlog
    const validatedDataMock = {
        title: 'Mi primer blog',
        content: 'Este es el contenido del blog con más de 20 caracteres',
        slug: 'mi-primer-blog',
        isPublished: true,
        publishedAt: new Date('2025-01-01')
    };

    const createdBlogMock: IBlogPost = {
        _id: '507f1f77bcf86cd799439011',
        title: validBlogInput.title,
        content: validBlogInput.content,
        slug: 'mi-primer-blog',
        summary: validBlogInput.summary,
        tags: validBlogInput.tags || [],
        author: validBlogInput.author || 'Usuario',
        isPublished: validBlogInput.isPublished || false,
        viewsCount: 0,
        publishedAt: new Date('2025-01-01')
    } as IBlogPost;

    // 🎯 HAPPY PATH TESTS
    describe('✅ Happy Path - Casos Exitosos', () => {

        test('✅ Debe crear un blog exitosamente con todos los campos', async () => {
            // Arrange
            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockResolvedValue(null); // No existe duplicado
            mockBlogPost.create.mockResolvedValue(createdBlogMock as never);

            // Act
            const result = await addBlog(validBlogInput);

            // Assert
            expect(mockSlugify).toHaveBeenCalledWith(validBlogInput.title);
            expect(mockValidateBlog).toHaveBeenCalledWith({
                ...validBlogInput,
                slug: 'mi-primer-blog'
            });
            expect(mockBlogPost.findOne).toHaveBeenCalledWith({
                $or: [
                    { title: validBlogInput.title },
                    { slug: 'mi-primer-blog' }
                ]
            });
            expect(mockBlogPost.create).toHaveBeenCalledWith(validatedDataMock);
            expect(result).toEqual(createdBlogMock);
        });

        test('✅ Debe crear un blog con campos mínimos requeridos', async () => {
            // Arrange
            const minimalInput: BlogInputTest = {
                title: 'Blog mínimo',
                content: 'Contenido mínimo de más de 20 caracteres'
            };
            const expectedValidated = {
                title: 'Blog mínimo',
                content: 'Contenido mínimo de más de 20 caracteres',
                slug: 'blog-minimo',
                isPublished: false
            };
            const minimalCreatedBlog = {
                _id: 'test-id',
                title: minimalInput.title,
                content: minimalInput.content,
                slug: 'blog-minimo',
                tags: [],
                author: 'Usuario',
                isPublished: false,
                viewsCount: 0,
                publishedAt: new Date('2025-01-01')
            };

            mockSlugify.mockReturnValue('blog-minimo');
            mockValidateBlog.mockReturnValue(expectedValidated);
            mockBlogPost.findOne.mockResolvedValue(null);
            mockBlogPost.create.mockResolvedValue(minimalCreatedBlog as never);

            // Act
            const result = await addBlog(minimalInput);

            // Assert
            expect(mockSlugify).toHaveBeenCalledWith('Blog mínimo');
            expect(mockValidateBlog).toHaveBeenCalledWith({
                title: 'Blog mínimo',
                content: 'Contenido mínimo de más de 20 caracteres',
                slug: 'blog-minimo'
            });
            expect(result).toHaveProperty('_id');
        });
    });

    // 💥 VALIDATION ERROR TESTS  
    describe('❌ Validation Errors - Errores por Campo', () => {

        test('❌ Debe fallar cuando title es muy corto', async () => {
            // Arrange
            const invalidInput = { ...validBlogInput, title: 'Hi' }; // Muy corto
            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'title', message: 'String must contain at least 5 character(s)' }
            ]);

            mockSlugify.mockReturnValue('hi');
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInput)).rejects.toThrow(ValidationError);
            await expect(addBlog(invalidInput)).rejects.toThrow('Validation failed for blog');

            expect(mockSlugify).toHaveBeenCalledWith('Hi');
            expect(mockValidateBlog).toHaveBeenCalled();
        });

        test('❌ Debe fallar cuando title es muy largo', async () => {
            // Arrange
            const longTitle = 'a'.repeat(201); // Más de 200 caracteres
            const invalidInput = { ...validBlogInput, title: longTitle };
            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'title', message: 'String must contain at most 200 character(s)' }
            ]);

            mockSlugify.mockReturnValue('a'.repeat(201).toLowerCase());
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInput)).rejects.toThrow(ValidationError);
            expect(console.error).toHaveBeenCalledWith(
                '[ValidationError] Validation failed for blog, Detalles:',
                [{ field: 'title', message: 'String must contain at most 200 character(s)' }]
            );
        });

        test('❌ Debe fallar cuando content es muy corto', async () => {
            // Arrange
            const invalidInput = { ...validBlogInput, content: 'Corto' }; // Menos de 20 caracteres
            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'content', message: 'String must contain at least 20 character(s)' }
            ]);

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInput)).rejects.toThrow(ValidationError);
            await expect(addBlog(invalidInput)).rejects.toThrow('Validation failed for blog');
        });

        test('❌ Debe fallar cuando title está vacío', async () => {
            // Arrange
            const invalidInput = { ...validBlogInput, title: '' };
            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'title', message: 'String must contain at least 5 character(s)' }
            ]);

            mockSlugify.mockReturnValue('');
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInput)).rejects.toThrow(ValidationError);
        });

        test('❌ Debe fallar cuando content está vacío', async () => {
            // Arrange
            const invalidInput = { ...validBlogInput, content: '' };
            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'content', message: 'String must contain at least 20 character(s)' }
            ]);

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInput)).rejects.toThrow(ValidationError);
        });

        test('❌ Debe fallar con múltiples errores de validación', async () => {
            // Arrange
            const invalidInput = { title: 'Hi', content: 'Mal' }; // Ambos muy cortos
            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'title', message: 'String must contain at least 5 character(s)' },
                { field: 'content', message: 'String must contain at least 20 character(s)' }
            ]);

            mockSlugify.mockReturnValue('hi');
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInput)).rejects.toThrow(ValidationError);

            try {
                await addBlog(invalidInput);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(ValidationError);
                if (error instanceof ValidationError) {
                    const details = error.details as Array<{ field: string; message: string }>;
                    expect(details).toHaveLength(2);
                    expect(details[0]).toEqual({
                        field: 'title',
                        message: 'String must contain at least 5 character(s)'
                    });
                    expect(details[1]).toEqual({
                        field: 'content',
                        message: 'String must contain at least 20 character(s)'
                    });
                }
            }
        });

        test('❌ Debe fallar cuando tags no es array', async () => {
            // Arrange - Creamos input con tipo incorrecto para tags
            const invalidInputData = { ...validBlogInput };
            // Simulamos que llega un string en lugar de array
            (invalidInputData as Record<string, unknown>).tags = 'not-an-array';

            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'tags', message: 'Expected array, received string' }
            ]);

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInputData as BlogInputTest)).rejects.toThrow(ValidationError);
        });

        test('❌ Debe fallar cuando isPublished no es boolean', async () => {
            // Arrange - Creamos input con tipo incorrecto para isPublished
            const invalidInputData = { ...validBlogInput };
            // Simulamos que llega un string en lugar de boolean
            (invalidInputData as Record<string, unknown>).isPublished = 'yes';

            const validationError = new ValidationError('Validation failed for blog', [
                { field: 'isPublished', message: 'Expected boolean, received string' }
            ]);

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockImplementation(() => { throw validationError; });

            // Act & Assert
            await expect(addBlog(invalidInputData as BlogInputTest)).rejects.toThrow(ValidationError);
        });
    });

    // 🔄 DUPLICITY ERROR TESTS
    describe('❌ Duplicity Errors - Errores de Duplicidad', () => {

        test('❌ Debe fallar cuando existe blog con el mismo título', async () => {
            // Arrange
            const existingBlog: MockExistingBlog = {
                _id: 'existing-blog-id',
                title: validBlogInput.title,
                slug: 'slug-diferente'
            };

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockResolvedValue(existingBlog);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(DuplicityError);
            await expect(addBlog(validBlogInput)).rejects.toThrow('Blog duplicado (título o slug)');

            try {
                await addBlog(validBlogInput);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(DuplicityError);
                if (error instanceof DuplicityError) {
                    expect(error.publicMessage).toBe('Ya existe un blog con ese título');
                    // Note: internalMessage might not be accessible on the error instance
                    expect(error.details).toEqual({
                        title: validBlogInput.title,
                        slug: 'mi-primer-blog',
                        conflictsWith: 'existing-blog-id',
                        conflictType: 'title', // Conflicto por título
                        existingTitle: validBlogInput.title,
                        existingSlug: 'slug-diferente'
                    });
                }
            }
        });

        test('❌ Debe fallar cuando existe blog con el mismo slug', async () => {
            // Arrange
            const existingBlog: MockExistingBlog = {
                _id: 'existing-blog-id-2',
                title: 'Título Diferente',
                slug: 'mi-primer-blog'
            };

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockResolvedValue(existingBlog);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(DuplicityError);

            try {
                await addBlog(validBlogInput);
            } catch (error: unknown) {
                if (error instanceof DuplicityError) {
                    expect(error.details).toMatchObject({ conflictType: 'slug' }); // Conflicto por slug
                    expect(error.details).toMatchObject({ existingTitle: 'Título Diferente' });
                    expect(error.details).toMatchObject({ existingSlug: 'mi-primer-blog' });
                }
            }
        });

        test('❌ Debe fallar cuando existe blog con título Y slug iguales', async () => {
            // Arrange
            const existingBlog: MockExistingBlog = {
                _id: 'existing-blog-id-3',
                title: validBlogInput.title,  // Mismo título
                slug: 'mi-primer-blog'        // Mismo slug
            };

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockResolvedValue(existingBlog);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(DuplicityError);

            try {
                await addBlog(validBlogInput);
            } catch (error: unknown) {
                if (error instanceof DuplicityError) {
                    // El conflicto se detecta por título (primera condición)
                    expect(error.details).toMatchObject({ conflictType: 'title' });
                    expect(error.details).toMatchObject({ existingTitle: validBlogInput.title });
                    expect(error.details).toMatchObject({ existingSlug: 'mi-primer-blog' });
                    expect(error.details).toMatchObject({ conflictsWith: 'existing-blog-id-3' });
                }
            }
        });

        test('❌ Debe loggear el error de duplicidad correctamente', async () => {
            // Arrange
            const existingBlog: MockExistingBlog = {
                _id: 'existing-blog-id',
                title: validBlogInput.title,
                slug: 'diferente-slug'
            };

            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockResolvedValue(existingBlog);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(DuplicityError);

            expect(console.error).toHaveBeenCalledWith(
                '[DuplicityError] Blog duplicado (título o slug), Detalles:',
                expect.objectContaining({
                    title: validBlogInput.title,
                    slug: 'mi-primer-blog',
                    conflictType: 'title'
                })
            );
        });
    });

    // 💥 SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {

        test('❌ Debe manejar errores de base de datos', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockRejectedValue(dbError);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(SystemError);
            await expect(addBlog(validBlogInput)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');

            expect(console.error).toHaveBeenCalledWith(
                '[SystemError] Database connection failed'
            );
        });

        test('❌ Debe manejar error en BlogPost.create()', async () => {
            // Arrange
            const createError = new Error('Failed to create document');
            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockResolvedValue(null);
            mockBlogPost.create.mockRejectedValue(createError);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(SystemError);

            try {
                await addBlog(validBlogInput);
            } catch (error: unknown) {
                if (error instanceof SystemError) {
                    expect(error.publicMessage).toBe('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');
                    expect(error.details).toEqual({ message: 'Failed to create document' });
                }
            }
        });

        test('❌ Debe manejar errores no-Error (unknown types)', async () => {
            // Arrange
            const weirdError = 'String error';
            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockRejectedValue(weirdError);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(SystemError);
            await expect(addBlog(validBlogInput)).rejects.toThrow('Error desconocido. Contacte a soporte.');

            expect(console.error).toHaveBeenCalledWith(
                '[UnknownError] String error'
            );
        });

        test('❌ Debe manejar error null/undefined', async () => {
            // Arrange
            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockRejectedValue(null);

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(SystemError);

            try {
                await addBlog(validBlogInput);
            } catch (error: unknown) {
                if (error instanceof SystemError) {
                    expect(error.publicMessage).toBe('Error desconocido. Contacte a soporte.');
                    expect(error.details).toEqual({ message: 'null' });
                }
            }
        });
    });

    // 🔍 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {

        test('🔗 Debe verificar el flujo completo de creación exitosa', async () => {
            // Arrange
            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockReturnValue(validatedDataMock);
            mockBlogPost.findOne.mockResolvedValue(null);
            mockBlogPost.create.mockResolvedValue(createdBlogMock as never);

            // Act
            const result = await addBlog(validBlogInput);

            // Assert - Verificar que todas las funciones fueron llamadas
            expect(mockSlugify).toHaveBeenCalledTimes(1);
            expect(mockValidateBlog).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.findOne).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.create).toHaveBeenCalledTimes(1);

            // Verificar que no se loggearon errores
            expect(console.error).not.toHaveBeenCalled();

            // Verificar resultado final
            expect(result).toEqual(createdBlogMock);
        });

        test('🔗 Debe manejar correctamente la prioridad de errores (ValidationError antes que SystemError)', async () => {
            // Arrange - ValidationError debería tener prioridad sobre errores de DB
            const validationError = new ValidationError('Validation failed', []);
            mockSlugify.mockReturnValue('mi-primer-blog');
            mockValidateBlog.mockImplementation(() => { throw validationError; });
            // Aunque la DB también falle, no debería llegar a ejecutarse
            mockBlogPost.findOne.mockRejectedValue(new Error('DB Error'));

            // Act & Assert
            await expect(addBlog(validBlogInput)).rejects.toThrow(ValidationError);
            await expect(addBlog(validBlogInput)).rejects.not.toThrow(SystemError);

            // Verificar que la DB nunca se consultó
            expect(mockBlogPost.findOne).not.toHaveBeenCalled();
        });
    });
});
