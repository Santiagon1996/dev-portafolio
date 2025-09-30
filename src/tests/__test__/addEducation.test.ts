/**
 * 🧪 ADD EDUCATION - TEST SUITE COMPLETO
 *
 * Casos cubiertos:
 * ✅ Happy Path - Crea la educación correctamente
 * ❌ ValidationError - Datos inválidos
 * ❌ DuplicityError - Educación duplicada
 * ❌ SystemError - Error inesperado
 * ❌ SystemError genérico - Error desconocido
 */

import { addEducation } from '@app/api/_logic/education/addEducation';
import { Education } from '@lib/db/models/index';
import { validators, errors } from '@shared';
import { slugify } from '@lib/utils/slugify';

const { ValidationError, DuplicityError, SystemError } = errors;

jest.mock('@lib/db/models/index');
jest.mock('@shared', () => ({
    validators: {
        validateEducation: jest.fn(),
    },
    errors: {
        ValidationError: class ValidationError extends Error {
            constructor(message?: string, public details?: Record<string, unknown>) {
                super(message);
                this.name = 'ValidationError';
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
jest.mock('@lib/utils/slugify');

describe('🧪 addEducation - Test Suite Completo', () => {
    const mockValidateEducation = validators.validateEducation as jest.MockedFunction<typeof validators.validateEducation>;
    const mockFindOne = Education.findOne as jest.MockedFunction<typeof Education.findOne>;
    const mockCreate = Education.create as jest.MockedFunction<typeof Education.create>;
    const mockSlugify = slugify as jest.MockedFunction<typeof slugify>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Debe crear la educación correctamente', async () => {
        const input = {
            degree: 'Ingeniería',
            institution: 'Universidad',
            field: 'Sistemas',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Descripción',
        };
        const validated = { ...input };
        // @ts-expect-error forzamos un error no estándar
        mockValidateEducation.mockReturnValue(validated);
        mockSlugify.mockReturnValue('ingenieria');
        mockFindOne.mockResolvedValue(null);
        const createdDoc = { ...validated, _id: 'id123', slug: 'ingenieria' };
        // @ts-expect-error forzamos un error no estándar
        mockCreate.mockResolvedValue(createdDoc);

        const result = await addEducation(input);
        expect(result).toEqual(createdDoc);
        expect(mockValidateEducation).toHaveBeenCalledWith(input);
        expect(mockSlugify).toHaveBeenCalledWith(validated.degree);
        expect(mockFindOne).toHaveBeenCalledWith({ $or: [{ degree: validated.degree }, { slug: 'ingenieria' }] });
        expect(mockCreate).toHaveBeenCalledWith(validated);
    });

    test('❌ Debe lanzar ValidationError si los datos son inválidos', async () => {
        mockValidateEducation.mockImplementation(() => { throw new ValidationError('Datos inválidos'); });
        await expect(addEducation({ degree: '', institution: '', field: '', startDate: new Date(), endDate: new Date(), description: '' })).rejects.toThrow(ValidationError);
        expect(mockFindOne).not.toHaveBeenCalled();
        expect(mockCreate).not.toHaveBeenCalled();
    });

    test('❌ Debe lanzar DuplicityError si ya existe educación con ese título o slug', async () => {
        const input = {
            degree: 'Ingeniería',
            institution: 'Universidad',
            field: 'Sistemas',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Descripción',
        };
        const validated = { ...input };
        // @ts-expect-error forzamos un error no estándar
        mockValidateEducation.mockReturnValue(validated);
        mockSlugify.mockReturnValue('ingenieria');
        const existingDoc = { _id: 'id456', degree: 'Ingeniería', slug: 'ingenieria' };
        mockFindOne.mockResolvedValue(existingDoc as unknown);

        await expect(addEducation(input)).rejects.toThrow(DuplicityError);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    test('❌ Debe lanzar SystemError si ocurre un error inesperado', async () => {
        const input = {
            degree: 'Ingeniería',
            institution: 'Universidad',
            field: 'Sistemas',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Descripción',
        };
        const validated = { ...input };
        // @ts-expect-error forzamos un error no estándar
        mockValidateEducation.mockReturnValue(validated);
        mockSlugify.mockReturnValue('ingenieria');
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockRejectedValue(new Error('DB fail'));

        await expect(addEducation(input)).rejects.toThrow(SystemError);
        await expect(addEducation(input)).rejects.toThrow('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.');
    });

    test('❌ Debe lanzar SystemError genérico si el error es desconocido', async () => {
        const input = {
            degree: 'Ingeniería',
            institution: 'Universidad',
            field: 'Sistemas',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Descripción',
        };
        const validated = { ...input };
        // @ts-expect-error forzamos un error no estándar
        mockValidateEducation.mockReturnValue(validated);
        mockSlugify.mockReturnValue('ingenieria');
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockImplementation(() => { throw 'Unknown error'; });

        await expect(addEducation(input)).rejects.toThrow(SystemError);
        await expect(addEducation(input)).rejects.toThrow('Error desconocido. Contacte a soporte.');
    });
});
