// updateAdmin.test.ts
import { updateAdmin } from '@app/api/_logic/admin/updateAdmin';
import { Admin } from '@lib/db/models';
import { validators, errors } from '@shared';

const { ValidationError, NotFoundError, DuplicityError, SystemError } = errors;

jest.mock('@lib/db/models', () => ({
    Admin: {
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
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
        DuplicityError: class DuplicityError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'DuplicityError';
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

describe('updateAdmin', () => {
    const mockValidateId = validators.validateId as jest.MockedFunction<typeof validators.validateId>;
    const mockFindOne = Admin.findOne as jest.MockedFunction<typeof Admin.findOne>;
    const mockFindById = Admin.findById as jest.MockedFunction<typeof Admin.findById>;
    const mockFindByIdAndUpdate = Admin.findByIdAndUpdate as jest.MockedFunction<typeof Admin.findByIdAndUpdate>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFindById.mockReset();
    });

    describe('🧪 updateAdmin - Test Suite Completo', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockFindById.mockReset();
        });

        // Happy Path
        it('✅ Debe actualizar un admin exitosamente', async () => {
            mockValidateId.mockReturnValue('valid-id');
            mockFindOne.mockResolvedValue(null);
            // Mock completo para simular el flujo de Mongoose
            const adminDoc = {
                _id: 'valid-id',
                username: 'newUser',
                email: 'new@mail.com',
                save: jest.fn().mockResolvedValue(true),
            };
            // @ts-expect-error - mockFindById does not match the actual type signature, but this is intentional for testing
            mockFindById.mockReturnValue({
                select: jest.fn().mockReturnValue(adminDoc)
            });
            mockFindByIdAndUpdate.mockResolvedValue(adminDoc);

            const result = await updateAdmin({ id: '123', username: 'newUser', email: 'new@mail.com' });
            expect(result).toEqual(adminDoc);
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled(); // Solo se usa save
            expect(adminDoc.save).toHaveBeenCalled();
        });

        // Validation Error
        it('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
            mockValidateId.mockImplementation(() => { throw new ValidationError('ID inválido'); });
            await expect(updateAdmin({ id: 'bad-id' })).rejects.toThrow(ValidationError);
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        // Duplicity Error
        it('❌ Debe lanzar DuplicityError si ya existe admin con ese email o username', async () => {
            mockValidateId.mockReturnValue('valid-id');
            mockFindOne.mockResolvedValue({ _id: 'other-id', email: 'test@mail.com' });
            await expect(updateAdmin({ id: '123', email: 'test@mail.com' })).rejects.toThrow(DuplicityError);
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        // Not Found Error
        it('❌ Debe lanzar NotFoundError si no existe el admin', async () => {
            mockValidateId.mockReturnValue('valid-id');
            mockFindOne.mockResolvedValue(null);
            // @ts-expect-error - mockFindById does not match the actual type signature, but this is intentional for testing
            mockFindById.mockReturnValue({
                select: jest.fn().mockReturnValue(null)
            });
            await expect(updateAdmin({ id: '123', username: 'x' })).rejects.toThrow(NotFoundError);
        });

        // System Error
        it('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
            mockValidateId.mockReturnValue('valid-id');
            mockFindOne.mockResolvedValue(null);
            mockFindByIdAndUpdate.mockRejectedValue(new Error('DB fail'));
            await expect(updateAdmin({ id: '123', username: 'x' })).rejects.toThrow(SystemError);
        });

        // Edge Case: Actualización parcial (solo email)
        it('✅ Debe permitir actualizar solo el email del admin', async () => {
            mockValidateId.mockReturnValue('valid-id');
            mockFindOne.mockResolvedValue(null);
            const adminDoc = {
                _id: 'valid-id',
                email: 'nuevo@mail.com',
                save: jest.fn().mockResolvedValue(true),
            };
            // @ts-expect-error - mockFindById does not match the actual type signature, but this is intentional for testing
            mockFindById.mockReturnValue({
                select: jest.fn().mockReturnValue(adminDoc)
            });
            const result = await updateAdmin({ id: '123', email: 'nuevo@mail.com' });
            expect(result.email).toBe('nuevo@mail.com');
            expect(adminDoc.save).toHaveBeenCalled();
        });

        // Edge Case: Sin cambios (no se actualiza nada)
        it('✅ Debe retornar el admin original si no se envía ningún campo a actualizar', async () => {
            mockValidateId.mockReturnValue('valid-id');
            mockFindOne.mockResolvedValue(null);
            const adminDoc = {
                _id: 'valid-id',
                username: 'admin',
                email: 'admin@mail.com',
                save: jest.fn().mockResolvedValue(true),
            };
            // @ts-expect-error - mockFindById does not match the actual type signature, but this is intentional for testing
            mockFindById.mockReturnValue({
                select: jest.fn().mockReturnValue(adminDoc)
            });
            const result = await updateAdmin({ id: 'valid-id' });
            expect(result).toEqual(adminDoc);
            expect(adminDoc.save).toHaveBeenCalled();
        });
    });

    test('❌ ID inválido lanza ValidationError', async () => {
        mockValidateId.mockImplementation(() => {
            throw new ValidationError('ID inválido');
        });

        await expect(updateAdmin({ id: 'bad-id' })).rejects.toThrow(ValidationError);
        expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('❌ Email o username duplicado lanza DuplicityError', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindOne.mockResolvedValue({ _id: 'other-id' } as { _id: string });

        await expect(updateAdmin({ id: '123', email: 'test@mail.com' })).rejects.toThrow(DuplicityError);
        expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('❌ Admin no encontrado lanza NotFoundError', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindOne.mockResolvedValue(null);
        // @ts-expect-error - mockFindById does not match the actual type signature, but this is intentional for testing
        mockFindById.mockReturnValue({
            select: jest.fn().mockReturnValue(null)
        });
        mockFindByIdAndUpdate.mockResolvedValue(null);

        await expect(updateAdmin({ id: '123', username: 'x' })).rejects.toThrow(NotFoundError);
    });

    test('❌ Error inesperado lanza SystemError', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindOne.mockResolvedValue(null);
        mockFindByIdAndUpdate.mockRejectedValue(new Error('DB fail'));

        await expect(updateAdmin({ id: '123', username: 'x' })).rejects.toThrow(SystemError);
    });
});
