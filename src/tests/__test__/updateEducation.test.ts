// import { updateEducation } from '@app/api/_logic/education/updateEducation';
// import { Education, IEducation } from '@lib/db/models/index';
// import { validators } from '@shared/validate/index';
// import { ValidationError, NotFoundError, DuplicityError, SystemError } from '@shared/errors/errors';
// const { validateId, validateUpdateEducation } = validators
// jest.mock('@lib/db/models/index');
// jest.mock('@shared/validate/index');

// const mockEducation = Education as jest.Mocked<typeof Education>;
// const mockValidateId = validateId as jest.MockedFunction<typeof validateId>;
// const mockValidateUpdateEducation = validateUpdateEducation as jest.MockedFunction<typeof validateUpdateEducation>;

// interface EducationUpdateInputTest {
//     id: string;
//     degree?: string;
//     institution?: string;
//     field?: string;
//     startDate?: Date | string;
//     endDate?: Date | string;
//     description?: string;
// }

// const validEducationId = '507f1f77bcf86cd799439011';
// const validUpdateInput: EducationUpdateInputTest = {
//     id: validEducationId,
//     degree: 'Licenciatura en Matemática',
//     institution: 'Universidad Nacional',
//     field: 'Matemática',
//     startDate: '2021-01-01',
//     endDate: '2025-12-01',
//     description: 'Actualización de carrera.'
// };

// const updatedEducationMock: IEducation = {
//     _id: validEducationId,
//     degree: 'Licenciatura en Matemática',
//     institution: 'Universidad Nacional',
//     field: 'Matemática',
//     startDate: '2021-01-01',
//     endDate: '2025-12-01',
//     description: 'Actualización de carrera.'
// } as unknown as IEducation;

// const validatedUpdateMock = {
//     degree: 'Licenciatura en Matemática',
//     institution: 'Universidad Nacional',
//     field: 'Matemática',
//     startDate: '2021-01-01',
//     endDate: '2025-12-01',
//     description: 'Actualización de carrera.'
// };

// describe('🧪 updateEducation - Test Suite Completo', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//         jest.spyOn(console, 'error').mockImplementation(() => { });
//     });
//     afterEach(() => {
//         jest.restoreAllMocks();
//     });

//     // 🎯 HAPPY PATH TESTS
//     describe('✅ Happy Path - Casos Exitosos', () => {
//         test('✅ Debe actualizar una educación exitosamente', async () => {
//             // Arrange
//             mockValidateId.mockReturnValue(validEducationId);
//             mockValidateUpdateEducation.mockReturnValue({
//                 degree: 'Licenciatura en Matemática',
//                 institution: 'Universidad Nacional',
//                 field: 'Matemática',
//                 startDate: '2021-01-01',
//                 endDate: '2025-12-01',
//                 description: 'Actualización de carrera.'
//             });
//             mockEducation.findOne.mockResolvedValue(null); // No hay duplicidad
//             mockEducation.findByIdAndUpdate.mockResolvedValue(updatedEducationMock);

//             // Act
//             const result = await updateEducation(validUpdateInput);

//             // Assert
//             expect(mockValidateId).toHaveBeenCalledWith(validEducationId);
//             expect(mockValidateUpdateEducation).toHaveBeenCalledWith({
//                 degree: 'Licenciatura en Matemática',
//                 institution: 'Universidad Nacional',
//                 field: 'Matemática',
//                 startDate: '2021-01-01',
//                 endDate: '2025-12-01',
//                 description: 'Actualización de carrera.'
//             });
//             expect(mockEducation.findOne).toHaveBeenCalledWith({
//                 $and: [
//                     { _id: { $ne: validEducationId } },
//                     {
//                         $or: [
//                             { degree: 'Licenciatura en Matemática' },
//                             { slug: expect.any(String) }
//                         ]
//                     }
//                 ]
//             });
//             expect(mockEducation.findByIdAndUpdate).toHaveBeenCalledWith(
//                 validEducationId,
//                 {
//                     degree: 'Licenciatura en Matemática',
//                     institution: 'Universidad Nacional',
//                     field: 'Matemática',
//                     startDate: '2021-01-01',
//                     endDate: '2025-12-01',
//                     description: 'Actualización de carrera.'
//                 },
//                 { new: true, runValidators: true }
//             );
//             expect(result).toEqual(updatedEducationMock);
//         });
//     });

//     // 💥 VALIDATION ERROR TESTS
//     describe('❌ Validation Errors - Errores por Campo', () => {
//         test('❌ Debe fallar cuando degree es muy corto', async () => {
//             const invalidInput = { ...validUpdateInput, degree: 'A' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'degree', message: 'String must contain at least 2 character(s)' }
//             ]);
//             mockValidateUpdateEducation.mockImplementation(() => { throw validationError; });
//             await expect(updateEducation(invalidInput as unknown)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando institution es muy larga', async () => {
//             const longInstitution = 'A'.repeat(101);
//             const invalidInput = { ...validUpdateInput, institution: longInstitution };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'institution', message: 'String must contain at most 100 character(s)' }
//             ]);
//             mockValidateUpdateEducation.mockImplementation(() => { throw validationError; });
//             await expect(updateEducation(invalidInput as unknown)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar cuando startDate es inválida', async () => {
//             const invalidInput = { ...validUpdateInput, startDate: 'abc' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'startDate', message: 'Invalid date format' }
//             ]);
//             mockValidateUpdateEducation.mockImplementation(() => { throw validationError; });
//             await expect(updateEducation(invalidInput as unknown)).rejects.toThrow(ValidationError);
//         });
//         test('❌ Debe fallar con múltiples errores de validación', async () => {
//             const invalidInput = { id: '507f1f77bcf86cd799439011', degree: '', institution: '', startDate: 'abc' };
//             const validationError = new ValidationError('Validation failed for education', [
//                 { field: 'degree', message: 'Required' },
//                 { field: 'institution', message: 'Required' },
//                 { field: 'startDate', message: 'Invalid date format' }
//             ]);
//             mockValidateUpdateEducation.mockImplementation(() => { throw validationError; });
//             await expect(updateEducation(invalidInput as unknown)).rejects.toThrow(ValidationError);
//         });
//     });

//     // 🔄 DUPLICITY ERROR TESTS
//     describe('❌ Duplicity Errors - Errores de Duplicidad', () => {
//         test('❌ Debe fallar cuando existe educación con el mismo degree', async () => {
//             mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
//             mockEducation.findOne = jest.fn().mockResolvedValue(updatedEducationMock);
//             await expect(updateEducation(validUpdateInput as unknown)).rejects.toThrow(DuplicityError);
//         });
//     });

//     // ❌ NOT FOUND ERROR TESTS
//     describe('❌ NotFound Errors - Errores de No Encontrado', () => {
//         test('❌ Debe fallar si no existe la educación a actualizar', async () => {
//             mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
//             mockEducation.findOne = jest.fn().mockResolvedValue(null); // No hay duplicidad
//             mockEducation.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
//             await expect(updateEducation(validUpdateInput as unknown)).rejects.toThrow(NotFoundError);
//         });
//     });

//     // 💥 SYSTEM ERROR TESTS
//     describe('❌ System Errors - Errores del Sistema', () => {
//         test('❌ Debe manejar errores de base de datos', async () => {
//             mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
//             mockEducation.findOne = jest.fn().mockResolvedValue(null); // No hay duplicidad
//             mockEducation.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('DB Error'));
//             await expect(updateEducation(validUpdateInput as unknown)).rejects.toThrow(SystemError);
//         });
//         test('❌ Debe manejar errores no-Error (unknown types)', async () => {
//             mockValidateUpdateEducation.mockReturnValue(validatedUpdateMock);
//             mockEducation.findOne = jest.fn().mockResolvedValue(null); // No hay duplicidad
//             mockEducation.findByIdAndUpdate = jest.fn().mockRejectedValue('String error');
//             await expect(updateEducation(validUpdateInput as unknown)).rejects.toThrow(SystemError);
//         });
//     });
// });
