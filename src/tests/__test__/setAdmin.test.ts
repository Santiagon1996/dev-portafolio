import { setAdmin } from "@app/api/_logic/admin/setAdmin";
import { Admin } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import * as bcrypt from "bcryptjs";
import type { AdminInput } from "@app/api/_logic/admin/setAdmin";

const { ValidationError, CredentialsError, SystemError, NotFoundError } = errors;

// ✅ TYPE GUARDS PARA VALIDACIÓN SEGURA DE ERRORES
function isValidationError(error: unknown): error is InstanceType<typeof ValidationError> {
    return error instanceof ValidationError &&
        typeof error.message === 'string' &&
        typeof error.publicMessage === 'string' &&
        error.details !== undefined;
}

function isCredentialsError(error: unknown): error is InstanceType<typeof CredentialsError> {
    return error instanceof CredentialsError &&
        typeof error.message === 'string' &&
        typeof error.publicMessage === 'string' &&
        error.details !== undefined;
}

function isNotFoundError(error: unknown): error is InstanceType<typeof NotFoundError> {
    return error instanceof NotFoundError &&
        typeof error.message === 'string' &&
        typeof error.publicMessage === 'string' &&
        error.details !== undefined;
}

function isSystemError(error: unknown): error is InstanceType<typeof SystemError> {
    return error instanceof SystemError &&
        typeof error.message === 'string' &&
        typeof error.publicMessage === 'string' &&
        error.details !== undefined;
}

// Mocks para bcrypt
jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
}));

// Mantener las clases reales de errores, solo mockear el validador
jest.mock("@shared", () => {
    const originalModule = jest.requireActual("@shared");
    return {
        ...originalModule,
        validators: {
            validateUserLogin: jest.fn(),
        },
    };
});

// Mock para Admin (Mongoose)
jest.mock("@lib/db/models/index", () => ({
    Admin: {
        findOne: jest.fn(),
    },
}));

describe("setAdmin", () => {
    const validAdminData = { username: "admin", password: "password123" };
    const mockAdminFromDb = {
        _id: "abc123",
        username: "admin",
        password: "hashedpassword",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ CASOS EXITOSOS
    describe('✅ Casos exitosos', () => {
        it("✅ debe retornar id y username si las credenciales son correctas", async () => {
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockAdminFromDb),
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await setAdmin(validAdminData);

            expect(result).toEqual({
                id: mockAdminFromDb._id,
                username: mockAdminFromDb.username,
            });

            expect(validators.validateUserLogin).toHaveBeenCalledWith(validAdminData);
            expect(Admin.findOne).toHaveBeenCalledWith({ username: validAdminData.username });
            expect(bcrypt.compare).toHaveBeenCalledWith(validAdminData.password, mockAdminFromDb.password);
        });

        it("✅ debería manejar transformaciones de datos en validación", async () => {
            const inputWithSpaces = {
                username: "  AdminUser  ",
                password: "password123",
            };

            const cleanedData = {
                username: "adminuser",
                password: "password123",
            };

            (validators.validateUserLogin as jest.Mock).mockReturnValue(cleanedData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockAdminFromDb),
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await setAdmin(inputWithSpaces);

            expect(result).toEqual({
                id: mockAdminFromDb._id,
                username: mockAdminFromDb.username,
            });

            expect(validators.validateUserLogin).toHaveBeenCalledWith(inputWithSpaces);
            expect(Admin.findOne).toHaveBeenCalledWith({ username: cleanedData.username });
        });
    });

    // ❌ ERRORES DE AUTENTICACIÓN
    describe('❌ Errores de autenticación', () => {
        it("❌ debería lanzar NotFoundError si el admin no existe", async () => {
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isNotFoundError(error)).toBe(true);
                if (isNotFoundError(error)) {
                    expect(error.message).toBe("Admin not found"); // internalMessage
                    expect(error.publicMessage).toBe("Administrador no encontrado"); // publicMessage
                    expect(error.details).toEqual({
                        username: validAdminData.username
                    });
                }
            }
        });

        it("❌ debería lanzar CredentialsError si la contraseña es incorrecta", async () => {
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockAdminFromDb),
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isCredentialsError(error)).toBe(true);
                if (isCredentialsError(error)) {
                    expect(error.message).toBe("Invalid admin credentials"); // internalMessage
                    expect(error.publicMessage).toBe("Las credenciales proporcionadas son incorrectas"); // publicMessage
                    expect(error.details).toEqual({});
                }
            }
        });

        it("❌ debería manejar bcrypt.compare que lanza error", async () => {
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockAdminFromDb),
                }),
            });

            (bcrypt.compare as jest.Mock).mockRejectedValue(new Error("Bcrypt error"));

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isSystemError(error)).toBe(true);
                if (isSystemError(error)) {
                    expect(error.message).toBe("Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.");
                    expect(error.details).toEqual({
                        message: "Bcrypt error"
                    });
                }
            }
        });
    });

    // ❌ ERRORES DEL SISTEMA
    describe('❌ Errores del sistema', () => {
        it("❌ debería lanzar SystemError si falla la base de datos", async () => {
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockRejectedValue(new Error("DB fallo")),
                }),
            });

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isSystemError(error)).toBe(true);
                if (isSystemError(error)) {
                    expect(error.message).toBe("Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.");
                    expect(error.details).toEqual({
                        message: "DB fallo"
                    });
                }
            }
        });

        it("❌ debería manejar errores desconocidos (non-Error objects)", async () => {
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockRejectedValue("String error"),
                }),
            });

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isSystemError(error)).toBe(true);
                if (isSystemError(error)) {
                    expect(error.message).toBe("Error desconocido. Contacte a soporte.");
                    expect(error.details).toEqual({
                        message: "String error"
                    });
                }
            }
        });

        it("❌ debería manejar null/undefined errors", async () => {
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockRejectedValue(null),
                }),
            });

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isSystemError(error)).toBe(true);
                if (isSystemError(error)) {
                    expect(error.message).toBe("Error desconocido. Contacte a soporte.");
                    expect(error.details).toEqual({
                        message: "null"
                    });
                }
            }
        });
    });

    // ❌ ERRORES DE VALIDACIÓN
    describe('❌ Errores de validación', () => {
        it("❌ debería lanzar ValidationError si la validación falla", async () => {
            const mockValidationError = new ValidationError(
                "Los datos de acceso son inválidos", // publicMessage
                { username: ["Username is required"], password: ["Password too short"] }, // details
                "Invalid login data" // internalMessage
            );

            (validators.validateUserLogin as jest.Mock).mockImplementation(() => {
                throw mockValidationError;
            });

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isValidationError(error)).toBe(true);
                if (isValidationError(error)) {
                    expect(error.message).toBe("Invalid login data"); // internalMessage
                    expect(error.publicMessage).toBe("Los datos de acceso son inválidos"); // publicMessage
                    expect(error.details).toEqual({
                        username: ["Username is required"],
                        password: ["Password too short"]
                    });
                }
            }
        });

        it("❌ debería manejar campos faltantes en validación", async () => {
            const incompleteInput = { username: "admin" }; // Sin password

            const mockValidationError = new ValidationError(
                "Faltan campos obligatorios", // publicMessage
                { password: ["Password is required"] }, // details
                "Missing required fields" // internalMessage
            );

            (validators.validateUserLogin as jest.Mock).mockImplementation(() => {
                throw mockValidationError;
            });

            try {
                await setAdmin(incompleteInput as AdminInput);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isValidationError(error)).toBe(true);
                if (isValidationError(error) && error.details) {
                    expect(error.details).toHaveProperty("password");
                    expect(Array.isArray((error.details as Record<string, unknown[]>).password)).toBe(true);
                }
            }
        });

        it("❌ debería manejar tipos de datos incorrectos en validación", async () => {
            const invalidInput = { username: 123, password: true }; // Tipos incorrectos

            const mockValidationError = new ValidationError(
                "Invalid data types",
                {
                    username: ["Username must be a string"],
                    password: ["Password must be a string"]
                },
                "Los tipos de datos son incorrectos"
            );

            (validators.validateUserLogin as jest.Mock).mockImplementation(() => {
                throw mockValidationError;
            });

            try {
                await setAdmin(invalidInput as unknown as AdminInput);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                expect(isValidationError(error)).toBe(true);
                if (isValidationError(error)) {
                    expect(error.details).toHaveProperty("username");
                    expect(error.details).toHaveProperty("password");
                }
            }
        });
    });

    // 🔍 CASOS EDGE Y VALIDACIONES AVANZADAS
    describe('🔍 Casos edge y validaciones avanzadas', () => {
        it("🔍 debería validar el flujo completo paso a paso", async () => {
            const inputData = { username: "testadmin", password: "testpass123" };
            const validatedData = { username: "testadmin", password: "testpass123" };
            const foundAdmin = {
                _id: "test123",
                username: "testadmin",
                password: "hashedtestpass",
            };

            // Configurar todos los mocks paso a paso
            (validators.validateUserLogin as jest.Mock).mockReturnValue(validatedData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(foundAdmin),
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await setAdmin(inputData);

            // Verificar resultado
            expect(result).toEqual({
                id: foundAdmin._id,
                username: foundAdmin.username,
            });

            // Verificar que se llamaron todas las funciones en orden
            expect(validators.validateUserLogin).toHaveBeenCalledWith(inputData);
            expect(Admin.findOne).toHaveBeenCalledWith({ username: validatedData.username });
            expect(bcrypt.compare).toHaveBeenCalledWith(validatedData.password, foundAdmin.password);
        });

        it("🔍 debería manejar datos con caracteres especiales", async () => {
            const specialCharsData = {
                username: "admin@#$",
                password: "p@$$w0rd!@#"
            };

            const validatedSpecialData = {
                username: "admin@#$",
                password: "p@$$w0rd!@#"
            };

            const specialAdmin = {
                _id: "special123",
                username: "admin@#$",
                password: "hashedSpecialPass",
            };

            (validators.validateUserLogin as jest.Mock).mockReturnValue(validatedSpecialData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(specialAdmin),
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await setAdmin(specialCharsData);

            expect(result).toEqual({
                id: specialAdmin._id,
                username: specialAdmin.username,
            });
        });

        it("🔍 debería preservar el error original al relanzar errores específicos", async () => {
            const originalValidationError = new ValidationError(
                "Original public message", // publicMessage
                { field: "original details" }, // details
                "Original validation message" // internalMessage
            );

            (validators.validateUserLogin as jest.Mock).mockImplementation(() => {
                throw originalValidationError;
            });

            try {
                await setAdmin(validAdminData);
                fail("Se esperaba que setAdmin lanzara un error");
            } catch (error) {
                // El error debe ser exactamente el mismo objeto
                expect(error).toBe(originalValidationError);
                expect(isValidationError(error)).toBe(true);
                if (isValidationError(error)) {
                    expect(error.message).toBe("Original validation message");
                    expect(error.publicMessage).toBe("Original public message");
                    expect(error.details).toEqual({ field: "original details" });
                }
            }
        });

        it("🔍 debería manejar admin con _id como ObjectId string", async () => {
            const objectIdAdmin = {
                _id: { toString: () => "507f1f77bcf86cd799439011" }, // Simular ObjectId
                username: "admin",
                password: "hashedpass",
            };

            (validators.validateUserLogin as jest.Mock).mockReturnValue(validAdminData);

            (Admin.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(objectIdAdmin),
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await setAdmin(validAdminData);

            expect(result).toEqual({
                id: "507f1f77bcf86cd799439011",
                username: "admin",
            });
        });
    });
});
