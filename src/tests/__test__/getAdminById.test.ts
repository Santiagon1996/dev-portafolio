// getAdminById.test.ts
import { getAdminById } from '@app/api/_logic/admin/getAdminById';
import { Admin } from '@lib/db/models';
import { validators, errors } from '@shared';

const { ValidationError, NotFoundError, SystemError } = errors;

jest.mock('@lib/db/models', () => ({
    Admin: {
        findById: jest.fn(),
    },
}));

jest.mock('@shared', () => ({
    validators: {
        validateId: jest.fn(),
    },
    errors: {
        ValidationError: class ValidationError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'ValidationError';
            }
        },
        NotFoundError: class NotFoundError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'NotFoundError';
            }
        },
        SystemError: class SystemError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'SystemError';
            }
        },
    },
}));

describe('getAdminById', () => {
    const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;

    // Tipo específico para el mock Query - solo necesitamos select()
    type MockQuery = {
        select: jest.MockedFunction<(fields: string) => Promise<unknown>>;
    };

    // Mock simple y directo para el chain: findById().select()
    const createMockQuery = (resolvedValue: unknown): MockQuery => ({
        select: jest.fn().mockResolvedValue(resolvedValue),
    });

    // Helper para obtener el mock tipado de forma segura
    const getMockFindById = () => Admin.findById as unknown as jest.MockedFunction<(id: string) => MockQuery>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Silenciar console.error durante los tests
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restaurar console.error después de cada test
        jest.restoreAllMocks();
    });

    test('✅ Obtiene admin exitosamente (sin password)', async () => {
        const mockAdmin = {
            _id: 'valid-id',
            username: 'testUser',
            email: 'test@example.com',
            createdAt: '2024-01-01T00:00:00.000Z',
            // Nota: password excluido por select('-password')
        };

        mockValidateId.mockReturnValue('valid-id');

        // Mock del query object que retorna findById
        const mockQuery = createMockQuery(mockAdmin);
        const mockFindById = getMockFindById();
        mockFindById.mockReturnValue(mockQuery);

        const result = await getAdminById({ id: '123' });

        expect(result).toEqual(mockAdmin);
        expect(mockValidateId).toHaveBeenCalledWith('123');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    test('❌ ID inválido lanza ValidationError', async () => {
        mockValidateId.mockImplementation(() => {
            throw new ValidationError('ID inválido', { id: 'bad-id' });
        });

        const mockFindById = getMockFindById();

        await expect(getAdminById({ id: 'bad-id' })).rejects.toThrow(ValidationError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    test('❌ Admin no encontrado lanza NotFoundError', async () => {
        mockValidateId.mockReturnValue('valid-id');

        // Mock query que retorna null (admin no existe)
        const mockQuery = createMockQuery(null);
        const mockFindById = getMockFindById();
        mockFindById.mockReturnValue(mockQuery);

        await expect(getAdminById({ id: '123' })).rejects.toThrow(NotFoundError);

        expect(mockValidateId).toHaveBeenCalledWith('123');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    test('❌ Error de base de datos lanza SystemError', async () => {
        mockValidateId.mockReturnValue('valid-id');

        // Mock query que falla
        const mockQuery: MockQuery = {
            select: jest.fn().mockRejectedValue(new Error('Database connection failed'))
        };
        const mockFindById = getMockFindById();
        mockFindById.mockReturnValue(mockQuery);

        await expect(getAdminById({ id: '123' })).rejects.toThrow(SystemError);

        expect(mockValidateId).toHaveBeenCalledWith('123');
        expect(mockFindById).toHaveBeenCalledWith('valid-id');
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    test('❌ Error desconocido lanza SystemError', async () => {
        mockValidateId.mockReturnValue('valid-id');

        // Mock query que falla con error no-Error
        const mockQuery: MockQuery = {
            select: jest.fn().mockRejectedValue('Unexpected error')
        };
        const mockFindById = getMockFindById();
        mockFindById.mockReturnValue(mockQuery);

        await expect(getAdminById({ id: '123' })).rejects.toThrow(SystemError);
    });

    test('✅ Password nunca está incluido en el resultado', async () => {
        const mockAdmin = {
            _id: 'valid-id',
            username: 'testUser',
            email: 'test@example.com',
            createdAt: '2024-01-01T00:00:00.000Z',
        };

        mockValidateId.mockReturnValue('valid-id');

        const mockQuery = createMockQuery(mockAdmin);
        const mockFindById = getMockFindById();
        mockFindById.mockReturnValue(mockQuery);

        const result = await getAdminById({ id: '123' });

        // Verificar que password no está presente
        expect(result).not.toHaveProperty('password');
        expect(result).toEqual(mockAdmin);

        // Verificar que se llama select con '-password'
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    test('✅ Maneja IDs de diferentes formatos válidos', async () => {
        const testCases = [
            '507f1f77bcf86cd799439011', // MongoDB ObjectId
            '123456789012345678901234', // 24 caracteres
            'valid-uuid-format-string',  // Otro formato válido
        ];

        for (const testId of testCases) {
            jest.clearAllMocks();

            const expectedAdmin = {
                _id: testId,
                username: 'testUser',
                email: 'test@example.com',
            };

            mockValidateId.mockReturnValue(testId);

            const mockQuery = createMockQuery(expectedAdmin);
            const mockFindById = getMockFindById();
            mockFindById.mockReturnValue(mockQuery);

            const result = await getAdminById({ id: testId });

            expect(result._id).toBe(testId);
            expect(mockValidateId).toHaveBeenCalledWith(testId);
            expect(mockFindById).toHaveBeenCalledWith(testId);
        }
    });

    test('✅ Maneja admin con campos mínimos requeridos', async () => {
        const minimalAdmin = {
            _id: 'valid-id',
            username: 'minimal',
            email: 'minimal@test.com',
        };

        mockValidateId.mockReturnValue('valid-id');

        const mockQuery = createMockQuery(minimalAdmin);
        const mockFindById = getMockFindById();
        mockFindById.mockReturnValue(mockQuery);

        const result = await getAdminById({ id: '123' });

        expect(result).toEqual(minimalAdmin);
        expect(Object.keys(result)).toEqual(['_id', 'username', 'email']);
    });
});
