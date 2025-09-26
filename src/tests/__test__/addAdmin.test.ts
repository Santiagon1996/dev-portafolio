import { addAdmin } from "@app/api/_logic/admin/addAdmin";
import { Admin } from "@lib/db/models/index";
import { errors, validators } from "@shared/index";

const { ValidationError, DuplicityError, SystemError } = errors;

// Mock de módulos para evitar dependencias reales
jest.mock("@lib/db/models/index", () => ({
    Admin: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock("@shared/index", () => ({
    validators: {
        validateUserRegister: jest.fn(),
    },
    errors: {
        // Clases que extienden BaseError con la estructura real
        DuplicityError: class DuplicityError extends Error {
            public readonly type = "DUPLICITY";
            public readonly publicMessage: string;
            public readonly details?: Record<string, unknown>;

            constructor(publicMessage: string, details?: Record<string, unknown>, internalMessage?: string) {
                super(internalMessage ?? publicMessage);
                this.name = 'DuplicityError';
                this.publicMessage = publicMessage;
                this.details = details;
            }

            toJSON() {
                return {
                    type: this.type,
                    name: this.name,
                    message: this.publicMessage,
                    details: this.details,
                };
            }
        },
        ValidationError: class ValidationError extends Error {
            public readonly type = "VALIDATION";
            public readonly publicMessage: string;
            public readonly details?: Record<string, unknown>;

            constructor(publicMessage: string, details?: Record<string, unknown>, internalMessage?: string) {
                super(internalMessage ?? publicMessage);
                this.name = 'ValidationError';
                this.publicMessage = publicMessage;
                this.details = details;
            }

            toJSON() {
                return {
                    type: this.type,
                    name: this.name,
                    message: this.publicMessage,
                    details: this.details,
                };
            }
        },
        SystemError: class SystemError extends Error {
            public readonly type = "SYSTEM";
            public readonly publicMessage: string;
            public readonly details?: Record<string, unknown>;

            constructor(publicMessage: string, details?: Record<string, unknown>, internalMessage?: string) {
                super(internalMessage ?? publicMessage);
                this.name = 'SystemError';
                this.publicMessage = publicMessage;
                this.details = details;
            }

            toJSON() {
                return {
                    type: this.type,
                    name: this.name,
                    message: this.publicMessage,
                    details: this.details,
                };
            }
        },
        NotFoundError: class NotFoundError extends Error {
            public readonly type = "NOT_FOUND";
            public readonly publicMessage: string;
            public readonly details?: Record<string, unknown>;

            constructor(publicMessage: string, details?: Record<string, unknown>, internalMessage?: string) {
                super(internalMessage ?? publicMessage);
                this.name = 'NotFoundError';
                this.publicMessage = publicMessage;
                this.details = details;
            }

            toJSON() {
                return {
                    type: this.type,
                    name: this.name,
                    message: this.publicMessage,
                    details: this.details,
                };
            }
        },
        CredentialsError: class CredentialsError extends Error {
            public readonly type = "CREDENTIALS";
            public readonly publicMessage: string;
            public readonly details?: Record<string, unknown>;

            constructor(publicMessage: string, details?: Record<string, unknown>, internalMessage?: string) {
                super(internalMessage ?? publicMessage);
                this.name = 'CredentialsError';
                this.publicMessage = publicMessage;
                this.details = details;
            }

            toJSON() {
                return {
                    type: this.type,
                    name: this.name,
                    message: this.publicMessage,
                    details: this.details,
                };
            }
        },
        OwnershipError: class OwnershipError extends Error {
            public readonly type = "OWNERSHIP";
            public readonly publicMessage: string;
            public readonly details?: Record<string, unknown>;

            constructor(publicMessage: string, details?: Record<string, unknown>, internalMessage?: string) {
                super(internalMessage ?? publicMessage);
                this.name = 'OwnershipError';
                this.publicMessage = publicMessage;
                this.details = details;
            }

            toJSON() {
                return {
                    type: this.type,
                    name: this.name,
                    message: this.publicMessage,
                    details: this.details,
                };
            }
        },
        AuthorizationError: class AuthorizationError extends Error {
            public readonly type = "AUTHORIZATION";
            public readonly publicMessage: string;
            public readonly details?: Record<string, unknown>;

            constructor(publicMessage: string, details?: Record<string, unknown>, internalMessage?: string) {
                super(internalMessage ?? publicMessage);
                this.name = 'AuthorizationError';
                this.publicMessage = publicMessage;
                this.details = details;
            }

            toJSON() {
                return {
                    type: this.type,
                    name: this.name,
                    message: this.publicMessage,
                    details: this.details,
                };
            }
        },
    },
}));

describe("addAdmin", () => {
    const validAdminInput = {
        username: "testuser",
        email: "test@example.com",
        password: "securepass123",
    };

    const validatedAdminData = {
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword123",
    };

    // Type guards para assertions type-safe
    const isValidationError = (error: unknown): error is InstanceType<typeof ValidationError> => {
        return error instanceof ValidationError;
    };

    const isDuplicityError = (error: unknown): error is InstanceType<typeof DuplicityError> => {
        return error instanceof DuplicityError;
    };

    const isSystemError = (error: unknown): error is InstanceType<typeof SystemError> => {
        return error instanceof SystemError;
    };


    beforeEach(() => {
        jest.clearAllMocks();
        // Silenciar console.error durante los tests
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ✅ CASOS EXITOSOS
    describe('✅ Casos exitosos', () => {
        it("✅ debería crear un admin exitosamente con datos válidos", async () => {
            (validators.validateUserRegister as jest.Mock).mockReturnValue(validatedAdminData);
            (Admin.findOne as jest.Mock).mockResolvedValue(null);
            (Admin.create as jest.Mock).mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                ...validatedAdminData,
                createdAt: new Date().toISOString()
            });

            const result = await addAdmin(validAdminInput);

            // Verificar que se llama a validateUserRegister con datos originales
            expect(validators.validateUserRegister).toHaveBeenCalledWith(validAdminInput);

            // Verificar que se verifica duplicidad con datos validados
            expect(Admin.findOne).toHaveBeenCalledWith({
                $or: [{ email: validatedAdminData.email }, { username: validatedAdminData.username }],
            });

            // Verificar que se crea con datos validados
            expect(Admin.create).toHaveBeenCalledWith(validatedAdminData);

            // Verificar el resultado
            expect(result).toHaveProperty('_id');
            expect(result).toMatchObject(validatedAdminData);
        });

        it("✅ debería manejar transformaciones de datos en validación", async () => {
            const inputWithSpaces = {
                username: "  TestUser  ",
                email: "  TEST@EXAMPLE.COM  ",
                password: "password123",
            };

            const cleanedData = {
                username: "testuser",
                email: "test@example.com",
                password: "hashedPassword123",
            };

            (validators.validateUserRegister as jest.Mock).mockReturnValue(cleanedData);
            (Admin.findOne as jest.Mock).mockResolvedValue(null);
            (Admin.create as jest.Mock).mockResolvedValue({ _id: "123", ...cleanedData });

            const result = await addAdmin(inputWithSpaces);

            expect(validators.validateUserRegister).toHaveBeenCalledWith(inputWithSpaces);
            expect(Admin.create).toHaveBeenCalledWith(cleanedData);
            expect(result.username).toBe("testuser"); // lowercase
            expect(result.email).toBe("test@example.com"); // lowercase and trimmed
        });
    });

    // ❌ ERRORES DE DUPLICIDAD
    describe('❌ Errores de duplicidad', () => {
        beforeEach(() => {
            (validators.validateUserRegister as jest.Mock).mockReturnValue(validatedAdminData);
        });

        it("❌ debería lanzar DuplicityError si existe admin con mismo email", async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue({
                _id: "existing-id",
                username: "different-user",
                email: validatedAdminData.email
            });

            await expect(addAdmin(validAdminInput)).rejects.toThrow(DuplicityError);

            expect(Admin.findOne).toHaveBeenCalledWith({
                $or: [{ email: validatedAdminData.email }, { username: validatedAdminData.username }],
            });
            expect(Admin.create).not.toHaveBeenCalled();
        });

        it("❌ debería lanzar DuplicityError si existe admin con mismo username", async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue({
                _id: "existing-id",
                username: validatedAdminData.username,
                email: "different@email.com"
            });

            await expect(addAdmin(validAdminInput)).rejects.toThrow(DuplicityError);

            try {
                await addAdmin(validAdminInput);
                fail("Should have thrown DuplicityError");
            } catch (error) {
                expect(isDuplicityError(error)).toBe(true);
                if (isDuplicityError(error)) {
                    // El message es el interno, publicMessage es para el frontend
                    expect(error.message).toContain("Admin duplicado");
                    expect(error.publicMessage).toContain("Ya existe un administrador");
                    expect(error.details).toEqual({
                        email: validatedAdminData.email,
                        username: validatedAdminData.username
                    });
                }
            }
        });

        it("❌ debería lanzar DuplicityError con detalles específicos", async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue({
                _id: "existing-id",
                username: validatedAdminData.username,
                email: validatedAdminData.email
            });

            try {
                await addAdmin(validAdminInput);
                fail("Should have thrown DuplicityError");
            } catch (error) {
                expect(isDuplicityError(error)).toBe(true);
                if (isDuplicityError(error)) {
                    // Verificar tanto message interno como publicMessage
                    expect(error.message).toBe("Admin duplicado (email o username)");
                    expect(error.publicMessage).toBe(
                        "Ya existe un administrador con ese correo o nombre de usuario"
                    );
                    expect(error.details).toEqual({
                        email: validatedAdminData.email,
                        username: validatedAdminData.username
                    });
                }
            }
        });
    });

    // ❌ ERRORES DE VALIDACIÓN
    describe('❌ Errores de validación', () => {
        it("❌ debería lanzar ValidationError si el email es inválido", async () => {
            const invalidEmailInput = { ...validAdminInput, email: "invalid-email" };

            (validators.validateUserRegister as jest.Mock).mockImplementation(() => {
                throw new ValidationError("Los datos ingresados no son válidos", {
                    email: "Invalid email format"
                });
            });

            // Pattern 1: await expect (más limpio)
            await expect(addAdmin(invalidEmailInput)).rejects.toThrow(ValidationError);

            // Verificar que no se ejecutan pasos posteriores
            expect(validators.validateUserRegister).toHaveBeenCalledWith(invalidEmailInput);
            expect(Admin.findOne).not.toHaveBeenCalled();
            expect(Admin.create).not.toHaveBeenCalled();
        });

        it("❌ debería lanzar ValidationError si el username es muy corto", async () => {
            const invalidUsernameInput = { ...validAdminInput, username: "ab" };

            (validators.validateUserRegister as jest.Mock).mockImplementation(() => {
                throw new ValidationError("Los datos ingresados no son válidos", {
                    username: "String must contain at least 3 character(s)"
                });
            });

            await expect(addAdmin(invalidUsernameInput)).rejects.toThrow(ValidationError);
            expect(validators.validateUserRegister).toHaveBeenCalledWith(invalidUsernameInput);
        });

        it("❌ debería lanzar ValidationError si la contraseña es débil", async () => {
            const weakPasswordInput = { ...validAdminInput, password: "123" };

            (validators.validateUserRegister as jest.Mock).mockImplementation(() => {
                throw new ValidationError("Los datos ingresados no son válidos", {
                    password: "String must contain at least 6 character(s)"
                });
            });

            await expect(addAdmin(weakPasswordInput)).rejects.toThrow(ValidationError);
            expect(validators.validateUserRegister).toHaveBeenCalledWith(weakPasswordInput);
        });

        it("❌ debería lanzar ValidationError con múltiples errores de campo", async () => {
            const invalidInput = {
                username: "ab",
                email: "invalid",
                password: "123",
            };

            (validators.validateUserRegister as jest.Mock).mockImplementation(() => {
                throw new ValidationError("Los datos ingresados no son válidos", {
                    username: "String must contain at least 3 character(s)",
                    email: "Invalid email format",
                    password: "String must contain at least 6 character(s)"
                });
            });

            await expect(addAdmin(invalidInput)).rejects.toThrow(ValidationError);

            try {
                await addAdmin(invalidInput);
                fail("Should have thrown ValidationError");
            } catch (error) {
                expect(isValidationError(error)).toBe(true);
                if (isValidationError(error)) {
                    expect(error.details).toEqual({
                        username: "String must contain at least 3 character(s)",
                        email: "Invalid email format",
                        password: "String must contain at least 6 character(s)"
                    });
                }
            }
        });

        it("❌ debería manejar campos faltantes", async () => {
            const incompleteInput = {
                username: "testuser",
                // email faltante
                password: "password123",
            } as Partial<typeof validAdminInput>;

            (validators.validateUserRegister as jest.Mock).mockImplementation(() => {
                throw new ValidationError("Los datos ingresados no son válidos", {
                    email: "Required"
                });
            });

            await expect(addAdmin(incompleteInput as Parameters<typeof addAdmin>[0])).rejects.toThrow(ValidationError);
        });

        it("❌ debería manejar tipos de datos incorrectos", async () => {
            const invalidTypeInput = {
                username: 123, // Debería ser string
                email: "test@example.com",
                password: "password123",
            } as unknown as Parameters<typeof addAdmin>[0];

            (validators.validateUserRegister as jest.Mock).mockImplementation(() => {
                throw new ValidationError("Los datos ingresados no son válidos", {
                    username: "Expected string, received number"
                });
            });

            await expect(addAdmin(invalidTypeInput)).rejects.toThrow(ValidationError);
        });
    });

    // ❌ ERRORES DEL SISTEMA
    describe('❌ Errores del sistema', () => {
        beforeEach(() => {
            (validators.validateUserRegister as jest.Mock).mockReturnValue(validatedAdminData);
        });

        it("❌ debería lanzar SystemError si falla la consulta de duplicidad", async () => {
            (Admin.findOne as jest.Mock).mockRejectedValue(new Error("Database connection failed"));

            await expect(addAdmin(validAdminInput)).rejects.toThrow(SystemError);

            try {
                await addAdmin(validAdminInput);
                fail("Should have thrown SystemError");
            } catch (error) {
                expect(isSystemError(error)).toBe(true);
                if (isSystemError(error)) {
                    expect(error.message).toContain("error inesperado");
                    expect(error.details).toEqual({
                        message: "Database connection failed"
                    });
                }
            }
        });

        it("❌ debería lanzar SystemError si falla Admin.create", async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue(null);
            (Admin.create as jest.Mock).mockRejectedValue(new Error("Insert failed"));

            await expect(addAdmin(validAdminInput)).rejects.toThrow(SystemError);
        });

        it("❌ debería manejar errores desconocidos (non-Error objects)", async () => {
            (Admin.findOne as jest.Mock).mockRejectedValue("Unknown error string");

            await expect(addAdmin(validAdminInput)).rejects.toThrow(SystemError);

            try {
                await addAdmin(validAdminInput);
                fail("Should have thrown SystemError");
            } catch (error) {
                expect(isSystemError(error)).toBe(true);
                if (isSystemError(error)) {
                    expect(error.message).toContain("Error desconocido");
                    expect(error.details).toEqual({
                        message: "Unknown error string"
                    });
                }
            }
        });

        it("❌ debería manejar null/undefined errors", async () => {
            (Admin.findOne as jest.Mock).mockRejectedValue(null);

            await expect(addAdmin(validAdminInput)).rejects.toThrow(SystemError);
        });
    });

    // 🔍 CASOS EDGE Y FLOW COMPLETO
    describe('🔍 Casos edge y validaciones avanzadas', () => {
        it("🔍 debería validar el flujo completo paso a paso", async () => {
            const stepByStepInput = {
                username: "newAdmin",
                email: "new@admin.com",
                password: "strongPass123",
            };

            const transformedData = {
                username: "newadmin", // lowercase por validación
                email: "new@admin.com",
                password: "hashedStrongPass123", // hasheado por validación
            };

            // Step 1: Validación exitosa
            (validators.validateUserRegister as jest.Mock).mockReturnValue(transformedData);

            // Step 2: No existe duplicado
            (Admin.findOne as jest.Mock).mockResolvedValue(null);

            // Step 3: Creación exitosa
            const createdAdmin = {
                _id: "507f1f77bcf86cd799439011",
                ...transformedData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            (Admin.create as jest.Mock).mockResolvedValue(createdAdmin);

            const result = await addAdmin(stepByStepInput);

            // Verificar orden de operaciones
            expect(validators.validateUserRegister).toHaveBeenCalledTimes(1);
            expect(validators.validateUserRegister).toHaveBeenCalledWith(stepByStepInput);

            expect(Admin.findOne).toHaveBeenCalledTimes(1);

            // Verificar el orden de las llamadas usando invocationCallOrder
            const validateCallOrder = (validators.validateUserRegister as jest.Mock).mock.invocationCallOrder[0];
            const findOneCallOrder = (Admin.findOne as jest.Mock).mock.invocationCallOrder[0];
            const createCallOrder = (Admin.create as jest.Mock).mock.invocationCallOrder[0];

            expect(findOneCallOrder).toBeGreaterThan(validateCallOrder);

            expect(Admin.create).toHaveBeenCalledTimes(1);
            expect(createCallOrder).toBeGreaterThan(findOneCallOrder);
            expect(Admin.create).toHaveBeenCalledWith(transformedData);

            expect(result).toEqual(createdAdmin);
        });

        it("🔍 debería manejar datos con caracteres especiales", async () => {
            const specialCharsInput = {
                username: "admin_user-123",
                email: "admin+test@example.co.uk",
                password: "P@ssw0rd!Complex",
            };

            (validators.validateUserRegister as jest.Mock).mockReturnValue(specialCharsInput);
            (Admin.findOne as jest.Mock).mockResolvedValue(null);
            (Admin.create as jest.Mock).mockResolvedValue({
                _id: "123",
                ...specialCharsInput
            });

            const result = await addAdmin(specialCharsInput);
            expect(result.username).toBe("admin_user-123");
            expect(result.email).toBe("admin+test@example.co.uk");
        });

        it("🔍 debería preservar el error original al relanzar ValidationError", async () => {
            const originalError = new ValidationError("Validation failed", {
                username: "Too short",
                email: "Invalid format"
            });

            (validators.validateUserRegister as jest.Mock).mockImplementation(() => {
                throw originalError;
            });

            try {
                await addAdmin(validAdminInput);
                fail("Should have thrown ValidationError");
            } catch (caughtError) {
                expect(caughtError).toBe(originalError); // Mismo objeto de error
                expect(isValidationError(caughtError)).toBe(true);
                if (isValidationError(caughtError)) {
                    expect(caughtError.message).toBe("Validation failed");
                    expect(caughtError.details).toEqual({
                        username: "Too short",
                        email: "Invalid format"
                    });
                }
            }
        });
    });
});
