// updateAdmin.test.ts
import { updateAdmin } from '@app/api/_logic/admin/updateAdmin';
import { Admin } from '@lib/db/models';
import { validators, errors } from '@shared';

const { ValidationError, NotFoundError, DuplicityError, SystemError } = errors;

jest.mock('@lib/db/models', () => ({
    Admin: {
        findOne: jest.fn(),
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
    const mockFindByIdAndUpdate = Admin.findByIdAndUpdate as jest.MockedFunction<typeof Admin.findByIdAndUpdate>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Actualiza admin exitosamente', async () => {
        mockValidateId.mockReturnValue('valid-id');
        mockFindOne.mockResolvedValue(null);
        mockFindByIdAndUpdate.mockResolvedValue({ _id: 'valid-id', username: 'newUser' } as { _id: string; username: string });

        const result = await updateAdmin({ id: '123', username: 'newUser' });

        expect(result).toEqual({ _id: 'valid-id', username: 'newUser' });
        expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('valid-id', { username: 'newUser' }, { new: true });
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
