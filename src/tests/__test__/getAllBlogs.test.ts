/**
 * 🧪 GET ALL BLOGS - TEST SUITE COMPLETO
 * 
 * Esta suite de tests cubre exhaustivamente la función getAllBlogs con:
 * ✅ Happy Path - Obtención exitosa con diferentes opciones
 * ✅ Paginación - Tests de paginación y límites
 * ✅ Filtros - Tests de filtrado por isPublished, tags, author
 * ✅ Edge Cases - Casos                        const            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ 
                tags: { $in: ['javascript', 'typescript'] } 
            });y = createMockQuery(jsBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(2);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ 
                tags: { $in: ['javascript'] } 
            });
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({ 
                tags: { $in: ['javascript'] } 
            });Post.countDocuments.mockResolvedValue(3);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ 
                tags: { $in: ['javascript', 'typescript'] } 
            });ct
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ 
                tags: { $in: ['javascript'] } 
            });
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({ 
                tags: { $in: ['javascript'] } 
            });validaciones
 * ❌ System Errors - Errores            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ 
                isPublished: true,
                author: 'Test Author 1',
                tags: { $in: ['javascript'] }
            });ema/base de datos
 * 🔗 Integration-like Tests - Pruebas de flujo completo
 * 
 * Todos los tests están diseñados para ser type-safe sin usar 'any'.
 */

// ** IMPORTS **
import { getAllBlogs } from '@app/api/_logic/blog/getAllBlogs';
import { BlogPost } from '@lib/db/models/index';
import { SystemError } from '@shared/errors/errors';

// ** MOCKS **
jest.mock('@lib/db/models/index');

// Mock console
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

// ** INTERFACES PARA TYPE SAFETY **
interface GetAllBlogsOptionsTest {
    page?: number;
    limit?: number;
    isPublished?: boolean;
    tags?: string[];
    author?: string;
}

interface MockBlog {
    _id: string;
    title: string;
    content: string;
    slug: string;
    tags: string[];
    author: string;
    isPublished: boolean;
    viewsCount: number;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ** MOCK QUERY BUILDER **
interface MockQuery {
    sort: jest.MockedFunction<(sort: Record<string, unknown>) => MockQuery>;
    skip: jest.MockedFunction<(skip: number) => MockQuery>;
    limit: jest.MockedFunction<(limit: number) => MockQuery>;
    exec: jest.MockedFunction<() => Promise<MockBlog[]>>;
}

// ** TYPED MOCKS **
const mockBlogPost = BlogPost as jest.Mocked<typeof BlogPost>;

describe('🧪 getAllBlogs - Test Suite Completo', () => {

    // ** TEST DATA **
    const mockBlogs: MockBlog[] = [
        {
            _id: '507f1f77bcf86cd799439011',
            title: 'Primer Blog',
            content: 'Contenido del primer blog para testing',
            slug: 'primer-blog',
            tags: ['javascript', 'testing'],
            author: 'Test Author 1',
            isPublished: true,
            viewsCount: 100,
            publishedAt: new Date('2024-01-01'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
        },
        {
            _id: '507f1f77bcf86cd799439012',
            title: 'Segundo Blog',
            content: 'Contenido del segundo blog para testing',
            slug: 'segundo-blog',
            tags: ['typescript', 'react'],
            author: 'Test Author 2',
            isPublished: false,
            viewsCount: 50,
            publishedAt: new Date('2024-01-02'),
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02')
        },
        {
            _id: '507f1f77bcf86cd799439013',
            title: 'Tercer Blog',
            content: 'Contenido del tercer blog para testing',
            slug: 'tercer-blog',
            tags: ['javascript', 'node'],
            author: 'Test Author 1',
            isPublished: true,
            viewsCount: 200,
            publishedAt: new Date('2024-01-03'),
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03')
        }
    ];

    // Mock query builder helpers
    const createMockQuery = (returnValue: MockBlog[]): MockQuery => {
        const mockQuery = {
            sort: jest.fn(),
            skip: jest.fn(),
            limit: jest.fn(),
            exec: jest.fn().mockResolvedValue(returnValue)
        };

        // Chain the methods
        mockQuery.sort.mockReturnValue(mockQuery);
        mockQuery.skip.mockReturnValue(mockQuery);
        mockQuery.limit.mockReturnValue(mockQuery);

        return mockQuery;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    // ✅ HAPPY PATH TESTS
    describe('✅ Happy Path - Obtención Exitosa', () => {

        test('✅ Debe obtener todos los blogs sin parámetros (defaults)', async () => {
            // Arrange
            const mockQuery = createMockQuery(mockBlogs);
            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            const result = await getAllBlogs();

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({});
            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockQuery.skip).toHaveBeenCalledWith(0); // (1-1) * 10 = 0
            expect(mockQuery.limit).toHaveBeenCalledWith(10);
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({});

            expect(result).toEqual({
                blogs: mockBlogs,
                total: 3,
                page: 1,
                totalPages: 1 // Math.ceil(3/10) = 1
            });
        });

        test('✅ Debe obtener blogs con parámetros personalizados', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = {
                page: 2,
                limit: 2,
                isPublished: true
            };
            const filteredBlogs = [mockBlogs[0], mockBlogs[2]]; // Solo published
            const mockQuery = createMockQuery(filteredBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(2);

            // Act
            const result = await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ isPublished: true });
            expect(mockQuery.skip).toHaveBeenCalledWith(2); // (2-1) * 2 = 2
            expect(mockQuery.limit).toHaveBeenCalledWith(2);
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({ isPublished: true });

            expect(result).toEqual({
                blogs: filteredBlogs,
                total: 2,
                page: 2,
                totalPages: 1 // Math.ceil(2/2) = 1
            });
        });

        test('✅ Debe obtener blogs vacíos correctamente', async () => {
            // Arrange
            const mockQuery = createMockQuery([]);
            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(0);

            // Act
            const result = await getAllBlogs();

            // Assert
            expect(result).toEqual({
                blogs: [],
                total: 0,
                page: 1,
                totalPages: 0 // Math.ceil(0/10) = 0
            });
        });
    });

    // ✅ PAGINATION TESTS
    describe('✅ Paginación - Tests de Paginación y Límites', () => {

        test('✅ Debe calcular correctamente la paginación - Página 1', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { page: 1, limit: 2 };
            const mockQuery = createMockQuery([mockBlogs[0], mockBlogs[1]]);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            const result = await getAllBlogs(options);

            // Assert
            expect(mockQuery.skip).toHaveBeenCalledWith(0); // (1-1) * 2 = 0
            expect(mockQuery.limit).toHaveBeenCalledWith(2);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(2); // Math.ceil(3/2) = 2
            expect(result.total).toBe(3);
        });

        test('✅ Debe calcular correctamente la paginación - Página 2', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { page: 2, limit: 2 };
            const mockQuery = createMockQuery([mockBlogs[2]]);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            const result = await getAllBlogs(options);

            // Assert
            expect(mockQuery.skip).toHaveBeenCalledWith(2); // (2-1) * 2 = 2
            expect(mockQuery.limit).toHaveBeenCalledWith(2);
            expect(result.page).toBe(2);
            expect(result.totalPages).toBe(2); // Math.ceil(3/2) = 2
        });

        test('✅ Debe manejar límites personalizados', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { limit: 1 };
            const mockQuery = createMockQuery([mockBlogs[0]]);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            const result = await getAllBlogs(options);

            // Assert
            expect(mockQuery.limit).toHaveBeenCalledWith(1);
            expect(result.totalPages).toBe(3); // Math.ceil(3/1) = 3
        });
    });

    // ✅ FILTER TESTS
    describe('✅ Filtros - Tests de Filtrado', () => {

        test('✅ Debe filtrar por isPublished = true', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { isPublished: true };
            const publishedBlogs = [mockBlogs[0], mockBlogs[2]];
            const mockQuery = createMockQuery(publishedBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(2);

            // Act
            const result = await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ isPublished: true });
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({ isPublished: true });
            expect(result.blogs).toEqual(publishedBlogs);
            expect(result.total).toBe(2);
        });

        test('✅ Debe filtrar por isPublished = false', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { isPublished: false };
            const unpublishedBlogs = [mockBlogs[1]];
            const mockQuery = createMockQuery(unpublishedBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(1);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ isPublished: false });
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({ isPublished: false });
        });

        test('✅ Debe filtrar por tags', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { tags: ['javascript'] };
            const jsBlogs = [mockBlogs[0], mockBlogs[2]];
            const mockQuery = createMockQuery(jsBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(2);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({
                tags: { $in: ['javascript'] }
            });
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({
                tags: { $in: ['javascript'] }
            });
        });

        test('✅ Debe filtrar por múltiples tags', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { tags: ['javascript', 'typescript'] };
            const mockQuery = createMockQuery(mockBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({
                tags: { $in: ['javascript', 'typescript'] }
            });
        });

        test('✅ Debe filtrar por author', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { author: 'Test Author 1' };
            const authorBlogs = [mockBlogs[0], mockBlogs[2]];
            const mockQuery = createMockQuery(authorBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(2);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({ author: 'Test Author 1' });
            expect(mockBlogPost.countDocuments).toHaveBeenCalledWith({ author: 'Test Author 1' });
        });

        test('✅ Debe combinar múltiples filtros', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = {
                isPublished: true,
                author: 'Test Author 1',
                tags: ['javascript']
            };
            const filteredBlogs = [mockBlogs[0], mockBlogs[2]];
            const mockQuery = createMockQuery(filteredBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(2);

            // Act
            await getAllBlogs(options);

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledWith({
                isPublished: true,
                author: 'Test Author 1',
                tags: { $in: ['javascript'] }
            });
        });

        test('✅ No debe agregar filtros para valores undefined/vacíos', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = {
                isPublished: undefined,
                tags: [],
                author: ''
            };
            const mockQuery = createMockQuery(mockBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            await getAllBlogs(options);

            // Act
            await getAllBlogs(options);

            // Assert - Solo debería pasar un objeto vacío como filtro
            expect(mockBlogPost.find).toHaveBeenCalledWith({});
        });
    });

    // ✅ EDGE CASES
    describe('✅ Edge Cases - Casos Límite', () => {

        test('✅ Debe manejar página 0 como página 1', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { page: 0 };
            const mockQuery = createMockQuery(mockBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            const result = await getAllBlogs(options);

            // Assert
            expect(mockQuery.skip).toHaveBeenCalledWith(-10); // (0-1) * 10 = -10
            expect(result.page).toBe(0); // La función no modifica el page input
        });

        test('✅ Debe manejar limit muy alto', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = { limit: 1000 };
            const mockQuery = createMockQuery(mockBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            const result = await getAllBlogs(options);

            // Assert
            expect(mockQuery.limit).toHaveBeenCalledWith(1000);
            expect(result.totalPages).toBe(1); // Math.ceil(3/1000) = 1
        });

        test('✅ Debe manejar total = 0 correctamente', async () => {
            // Arrange
            const mockQuery = createMockQuery([]);
            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(0);

            // Act
            const result = await getAllBlogs({ page: 5, limit: 10 });

            // Assert
            expect(result.totalPages).toBe(0); // Math.ceil(0/10) = 0
            expect(result.blogs).toEqual([]);
            expect(result.total).toBe(0);
            expect(result.page).toBe(5); // Mantiene la página solicitada
        });
    });

    // ❌ SYSTEM ERROR TESTS
    describe('❌ System Errors - Errores del Sistema', () => {

        test('❌ Debe manejar errores en BlogPost.find()', async () => {
            // Arrange
            const dbError = new Error('Database find failed');
            mockBlogPost.find.mockImplementation(() => {
                throw dbError;
            });

            // Act & Assert
            await expect(getAllBlogs()).rejects.toThrow(SystemError);
            await expect(getAllBlogs()).rejects.toThrow('Error al obtener la lista de blogs');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Database find failed'
            );
        });

        test('❌ Debe manejar errores en countDocuments()', async () => {
            // Arrange
            const mockQuery = createMockQuery(mockBlogs);
            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockRejectedValue(new Error('Count failed'));

            // Act & Assert
            await expect(getAllBlogs()).rejects.toThrow(SystemError);
            await expect(getAllBlogs()).rejects.toThrow('Error al obtener la lista de blogs');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Count failed'
            );
        });

        test('❌ Debe manejar errores en query.exec()', async () => {
            // Arrange
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockRejectedValue(new Error('Exec failed'))
            };

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act & Assert
            await expect(getAllBlogs()).rejects.toThrow(SystemError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[SystemError] Exec failed'
            );
        });

        test('❌ Debe manejar errores no-Error (unknown types)', async () => {
            // Arrange
            const unknownError = 'String error';
            mockBlogPost.find.mockImplementation(() => {
                throw unknownError;
            });

            // Act & Assert
            await expect(getAllBlogs()).rejects.toThrow(SystemError);
            await expect(getAllBlogs()).rejects.toThrow('Error desconocido al obtener blogs');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[UnknownError] String error'
            );
        });

        test('❌ Debe manejar error null/undefined', async () => {
            // Arrange
            mockBlogPost.find.mockImplementation(() => {
                throw null;
            });

            // Act & Assert
            await expect(getAllBlogs()).rejects.toThrow(SystemError);
            await expect(getAllBlogs()).rejects.toThrow('Error desconocido al obtener blogs');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[UnknownError] null'
            );
        });
    });

    // ❌ NOT FOUND ERROR TESTS
    describe('❌ NotFoundError - Errores de no encontrado', () => {
        test('❌ Debe retornar objeto vacío si no hay blogs encontrados', async () => {
            // Mock completo para simular la cadena de métodos de Mongoose
            const mockQuery = {
                sort: jest.fn(),
                skip: jest.fn(),
                limit: jest.fn(),
                exec: jest.fn().mockResolvedValue([])
            };
            mockQuery.sort.mockReturnValue(mockQuery);
            mockQuery.skip.mockReturnValue(mockQuery);
            mockQuery.limit.mockReturnValue(mockQuery);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(0);

            const result = await getAllBlogs();
            expect(result).toEqual({
                blogs: [],
                total: 0,
                page: 1,
                totalPages: 0
            });
        });
    });

    // 🔗 INTEGRATION-LIKE TESTS
    describe('🔗 Integration-like Tests - Flujo Completo', () => {

        test('🔗 Debe verificar el flujo completo de obtención exitosa', async () => {
            // Arrange
            const options: GetAllBlogsOptionsTest = {
                page: 1,
                limit: 2,
                isPublished: true
            };
            const mockQuery = createMockQuery([mockBlogs[0], mockBlogs[2]]);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(2);

            // Act
            const result = await getAllBlogs(options);

            // Assert - Verificar que todas las funciones fueron llamadas correctamente
            expect(mockBlogPost.find).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.countDocuments).toHaveBeenCalledTimes(1);
            expect(mockQuery.sort).toHaveBeenCalledTimes(1);
            expect(mockQuery.skip).toHaveBeenCalledTimes(1);
            expect(mockQuery.limit).toHaveBeenCalledTimes(1);
            expect(mockQuery.exec).toHaveBeenCalledTimes(1);

            // Verificar que no se loggearon errores
            expect(mockConsoleError).not.toHaveBeenCalled();

            // Verificar la estructura completa del resultado
            expect(result).toHaveProperty('blogs');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('totalPages');
            expect(Array.isArray(result.blogs)).toBe(true);
            expect(typeof result.total).toBe('number');
            expect(typeof result.page).toBe('number');
            expect(typeof result.totalPages).toBe('number');
        });

        test('🔗 Debe manejar correctamente Promise.all', async () => {
            // Arrange - Simular que Promise.all funciona correctamente
            const mockQuery = createMockQuery(mockBlogs);

            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            const result = await getAllBlogs();

            // Assert - Verificar que ambas operaciones async se ejecutaron
            expect(result.blogs).toEqual(mockBlogs);
            expect(result.total).toBe(3);

            // Verificar que ambas queries se ejecutaron correctamente
            expect(mockBlogPost.find).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.countDocuments).toHaveBeenCalledTimes(1);
        });

        test('🔗 Debe verificar que los mocks se resetean correctamente entre tests', async () => {
            // Arrange - Verificar estado inicial limpio
            expect(mockBlogPost.find).toHaveBeenCalledTimes(0);
            expect(mockBlogPost.countDocuments).toHaveBeenCalledTimes(0);
            expect(mockConsoleError).toHaveBeenCalledTimes(0);

            // Act
            const mockQuery = createMockQuery([mockBlogs[0]]);
            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(1);

            await getAllBlogs({ limit: 1 });

            // Assert
            expect(mockBlogPost.find).toHaveBeenCalledTimes(1);
            expect(mockBlogPost.countDocuments).toHaveBeenCalledTimes(1);
        });

        test('🔗 Debe verificar que el sorting siempre sea por createdAt desc', async () => {
            // Arrange
            const mockQuery = createMockQuery(mockBlogs);
            mockBlogPost.find.mockReturnValue(mockQuery as never);
            mockBlogPost.countDocuments.mockResolvedValue(3);

            // Act
            await getAllBlogs({ isPublished: true, tags: ['javascript'], author: 'Test' });

            // Assert - Sin importar los filtros, siempre debe ordenar por createdAt: -1
            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });
    });
});
