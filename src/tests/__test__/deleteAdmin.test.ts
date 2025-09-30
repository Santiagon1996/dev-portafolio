import { deleteAdmin } from "@app/api/_logic/admin/deleteAdmin";
import { Admin } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { ValidationError, NotFoundError, SystemError } = errors;

// Mock de @shared
jest.mock("@shared", () => ({
    validators: {
        validateId: jest.fn(),
    },
    errors: {
        ValidationError: class ValidationError extends Error {
            constructor(message?: string) {
                super(message);
                this.name = "ValidationError";
            }
        },
        DuplicityError: class DuplicityError extends Error {
            constructor(message?: string) {
                super(message);
                this.name = "DuplicityError";
            }
        },
        NotFoundError: class NotFoundError extends Error {
            constructor(message?: string) {
                super(message);
                this.name = "NotFoundError";
            }
        },
        SystemError: class SystemError extends Error {
            constructor(message?: string) {
                super(message);
                this.name = "SystemError";
            }
        },
    },
}));

// Mock de Admin
jest.mock("@lib/db/models/index", () => ({
    Admin: {
        findByIdAndDelete: jest.fn(),
    },
}));

describe("deleteAdmin", () => {
    const validId = "abc123";
    const mockDeletedAdmin = { _id: validId, username: "admin" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("debe eliminar un admin y retornar el documento eliminado", async () => {
        (validators.validateId as jest.Mock).mockReturnValue(validId);
        (Admin.findByIdAndDelete as jest.Mock).mockResolvedValue(mockDeletedAdmin);

        const result = await deleteAdmin({ id: validId });

        expect(result).toEqual(mockDeletedAdmin);
        expect(validators.validateId).toHaveBeenCalledWith(validId);
        expect(Admin.findByIdAndDelete).toHaveBeenCalledWith(validId);
    });

    it("debe lanzar NotFoundError si no encuentra el admin", async () => {
        (validators.validateId as jest.Mock).mockReturnValue(validId);
        (Admin.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

        await expect(deleteAdmin({ id: validId })).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar ValidationError si el ID es inválido", async () => {
        (validators.validateId as jest.Mock).mockImplementation(() => {
            throw new ValidationError("ID inválido");
        });

        await expect(deleteAdmin({ id: validId })).rejects.toThrow(ValidationError);
        expect(Admin.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("debe lanzar SystemError si ocurre un error inesperado", async () => {
        (validators.validateId as jest.Mock).mockReturnValue(validId);
        (Admin.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error("Fallo DB"));

        await expect(deleteAdmin({ id: validId })).rejects.toThrow(SystemError);
    });
});
