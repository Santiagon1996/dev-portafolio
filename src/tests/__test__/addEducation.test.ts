// import { addEducation } from '@app/api/_logic/education/addEducation';
// import { Education, IEducation } from '@lib/db/models/index';
// import { ValidationError, DuplicityError, SystemError } from '@shared/errors/errors';
// import { validateEducation } from '@shared/validate/validate';

// // 🧪 MOCKS - Simulamos las dependencias
// jest.mock('@lib/db/models/index');
// jest.mock('@shared/validate/validate');

// const mockEducation = Education as jest.Mocked<typeof Education>;
// const mockValidateEducation = validateEducation as jest.MockedFunction<typeof validateEducation>;

// interface EducationInputTest {
//     degree: string;
//     institution: string;
//     field: string;
//     startDate: string;
//     endDate: string;
//     description: string;
// }

// describe('🧪 addEducation - Test Suite Completo', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//         jest.spyOn(console, 'error').mockImplementation(() => { });
//     });
//     afterEach(() => {
//         jest.restoreAllMocks();
//     });

//     const validEducationInput: EducationInputTest = {
//         degree: 'Ingeniería en Sistemas',
//         institution: 'Universidad Nacional',
//         field: 'Informática',
//         startDate: '2020-03-01',
//         endDate: '2025-12-01',
//         description: 'Carrera universitaria completa en sistemas e informática.'
//     };

//     const validatedDataMock = {
//         degree: 'Ingeniería en Sistemas',
//         institution: 'Universidad Nacional',
//         field: 'Informática',
//         startDate: '2020-03-01',
//         endDate: '2025-12-01',
//         description: 'Carrera universitaria completa en sistemas e informática.'
//     };

//     const createdEducationMock: IEducation = {
//         _id: '507f1f77bcf86cd799439011',
//         ...validatedDataMock
//     } as unknown as IEducation;

//     // 🎯 HAPPY PATH TESTS
//     describe('✅ Happy Path - Casos Exitosos', () => {
//         test('✅ Debe crear una educación exitosamente con todos los campos', async () => {
//             mockValidateEducation.mockReturnValue(validatedDataMock);
//             mockEducation.findOne = jest.fn().mockResolvedValue(null);
//             mockEducation.create.mockResolvedValue(createdEducationMock as never);

//             const result = await addEducation(validEducationInput);
//             expect(mockValidateEducation).toHaveBeenCalledWith(validEducationInput);
//             expect(mockEducation.findOne).toHaveBeenCalledWith({
//                 $or: [
//                     { degree: validEducationInput.degree },
//                     { slug: expect.any(String) }
//                 ]
//             });
//             expect(mockEducation.create).toHaveBeenCalledWith(validatedDataMock);
//             expect(result).toEqual(createdEducationMock);
//         });
//     });

//     // 💥 VALIDATION ERROR TESTS
//     describe('❌ Validation Errors - Errores por Campo', () => {
//         test('❌ Debe fallar cuando degree es muy corto', async () => {
//             const invalidInput = { ...validEducationInput, degree: 'A' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'degree', message: 'String must contain at least 2 character(s)' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput)).rejects.toThrow(ValidationError);
//             expect(mockValidateEducation).toHaveBeenCalledWith(invalidInput);
//         });
//         test('❌ Debe fallar cuando degree es muy largo', async () => {
//             const longDegree = 'A'.repeat(101);
//             const invalidInput = { ...validEducationInput, degree: longDegree };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'degree', message: 'String must contain at most 100 character(s)' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando falta institution', async () => {
//             const invalidInput = { ...validEducationInput };
//             delete invalidInput.institution;
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'institution', message: 'Required' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput as EducationInputTest)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando institution es muy corta', async () => {
//             const invalidInput = { ...validEducationInput, institution: 'A' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'institution', message: 'String must contain at least 2 character(s)' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando institution es muy larga', async () => {
//             const longInstitution = 'A'.repeat(101);
//             const invalidInput = { ...validEducationInput, institution: longInstitution };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'institution', message: 'String must contain at most 100 character(s)' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando startDate es inválida', async () => {
//             const invalidInput: unknown = { ...validEducationInput, startDate: 'abc' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'startDate', message: 'Invalid date format' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput as EducationInputTest)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando endDate es inválida', async () => {
//             const invalidInput: unknown = { ...validEducationInput, endDate: 'xyz' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'endDate', message: 'Invalid date format' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput as EducationInputTest)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando description es muy larga', async () => {
//             const longDescription = 'A'.repeat(501);
//             const invalidInput = { ...validEducationInput, description: longDescription };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'description', message: 'String must contain at most 500 character(s)' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar con múltiples errores de validación', async () => {
//             const invalidInput: unknown = { degree: '', institution: '', field: '', startDate: '', endDate: '', description: '' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'degree', message: 'Required' },
//                 { field: 'institution', message: 'Required' },
//                 { field: 'startDate', message: 'Invalid date format' }
//             ]);
//             mockValidateEducation.mockImplementation(() => { throw validationError; });
//             await expect(addEducation(invalidInput as EducationInputTest)).rejects.toThrow(ValidationError);
//         });
//     });

//     // 🔄 DUPLICITY ERROR TESTS
//     describe('❌ Duplicity Errors - Errores de Duplicidad', () => {
//         test('❌ Debe fallar cuando existe educación con el mismo degree', async () => {
//             mockValidateEducation.mockReturnValue(validatedDataMock);
//             mockEducation.findOne = jest.fn().mockResolvedValue(createdEducationMock);
//             await expect(addEducation(validEducationInput)).rejects.toThrow(DuplicityError);
//         });
//     });

//     // 💥 SYSTEM ERROR TESTS
//     describe('❌ System Errors - Errores del Sistema', () => {
//         test('❌ Debe manejar errores de base de datos', async () => {
//             mockValidateEducation.mockReturnValue(validatedDataMock);
//             mockEducation.findOne = jest.fn().mockRejectedValue(new Error('DB Error'));
//             await expect(addEducation(validEducationInput)).rejects.toThrow(SystemError);
//         });
//         test('❌ Debe manejar error en Education.create()', async () => {
//             mockValidateEducation.mockReturnValue(validatedDataMock);
//             mockEducation.findOne = jest.fn().mockResolvedValue(null);
//             mockEducation.create.mockRejectedValue(new Error('Create Error'));
//             await expect(addEducation(validEducationInput)).rejects.toThrow(SystemError);
//         });
//         test('❌ Debe manejar errores no-Error (unknown types)', async () => {
//             mockValidateEducation.mockReturnValue(validatedDataMock);
//             mockEducation.findOne = jest.fn().mockRejectedValue('String error');
//             await expect(addEducation(validEducationInput)).rejects.toThrow(SystemError);
//         });
//     });
// });
