import { updateSkill } from "@app/api/_logic/skills/updateSkill";
import { Skill } from "@lib/db/models/skill";
import { ValidationError, DuplicityError, NotFoundError, SystemError } from "@shared/errors/errors";
import { validators } from "@shared/validate/index";
import { slugify } from "@lib/utils/slugify";

const { validateId, validateUpdateSkill } = validators
jest.mock("@lib/db/models/skill");
jest.mock("@shared/validate");
jest.mock("@lib/utils/slugify");

const mockSkill = {
    _id: "507f1f77bcf86cd799439011",
    name: "JavaScript",
    level: "Expert",
    category: "Frontend",
    slug: "javascript",
};

describe("🧪 updateSkill - Test Suite Completo", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Happy Path
    it("✅ Debe actualizar una skill exitosamente", async () => {
        (validateId as jest.Mock).mockReturnValue(mockSkill._id);
        (validateUpdateSkill as jest.Mock).mockReturnValue({ name: "TypeScript", level: "Expert", category: "Frontend" });
        (Skill.findOne as jest.Mock).mockResolvedValue(null);
        (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockSkill, name: "TypeScript" });

        const result = await updateSkill({ id: mockSkill._id, name: "TypeScript", level: "Expert", category: "Frontend" });
        expect(result.name).toBe("TypeScript");
        expect(Skill.findByIdAndUpdate).toHaveBeenCalledWith(
            mockSkill._id,
            { name: "TypeScript", level: "Expert", category: "Frontend" },
            { new: true, runValidators: true }
        );
    });

    // Validation Error
    it("❌ Debe lanzar ValidationError si los datos son inválidos", async () => {
        (validateId as jest.Mock).mockReturnValue(mockSkill._id);
        (validateUpdateSkill as jest.Mock).mockImplementation(() => { throw new ValidationError("Datos inválidos", [{ field: "name", message: "Requerido" }]); });

        await expect(updateSkill({ id: mockSkill._id, name: "" })).rejects.toThrow(ValidationError);
    });

    // Duplicity Error
    it("❌ Debe lanzar DuplicityError si ya existe skill con ese nombre o slug", async () => {
        (validateId as jest.Mock).mockReturnValue(mockSkill._id);
        (validateUpdateSkill as jest.Mock).mockReturnValue({ name: "JavaScript" });
        (slugify as jest.Mock).mockReturnValue("javascript");
        (Skill.findOne as jest.Mock).mockResolvedValue(mockSkill);

        await expect(updateSkill({ id: mockSkill._id, name: "JavaScript" })).rejects.toThrow(DuplicityError);
    });

    // Not Found Error
    it("❌ Debe lanzar NotFoundError si no existe la skill", async () => {
        (validateId as jest.Mock).mockReturnValue(mockSkill._id);
        (validateUpdateSkill as jest.Mock).mockReturnValue({ name: "TypeScript" });
        (Skill.findOne as jest.Mock).mockResolvedValue(null);
        (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        await expect(updateSkill({ id: mockSkill._id, name: "TypeScript" })).rejects.toThrow(NotFoundError);
    });

    // System Error
    it("❌ Debe lanzar SystemError si ocurre un error inesperado", async () => {
        (validateId as jest.Mock).mockReturnValue(mockSkill._id);
        (validateUpdateSkill as jest.Mock).mockReturnValue({ name: "TypeScript" });
        (Skill.findOne as jest.Mock).mockResolvedValue(null);
        (Skill.findByIdAndUpdate as jest.Mock).mockImplementation(() => { throw new Error("DB Error"); });

        await expect(updateSkill({ id: mockSkill._id, name: "TypeScript" })).rejects.toThrow(SystemError);
    });

    // Edge Case: Actualización parcial (solo un campo)
    it("✅ Debe permitir actualizar solo el nivel de la skill", async () => {
        (validateId as jest.Mock).mockReturnValue(mockSkill._id);
        (validateUpdateSkill as jest.Mock).mockReturnValue({ level: "Advanced" });
        (Skill.findOne as jest.Mock).mockResolvedValue(null);
        (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockSkill, level: "Advanced" });

        const result = await updateSkill({ id: mockSkill._id, level: "Advanced" });
        expect(result.level).toBe("Advanced");
    });

    // Edge Case: Sin cambios (no se actualiza nada)
    it("✅ Debe retornar la skill original si no se envía ningún campo a actualizar", async () => {
        (validateId as jest.Mock).mockReturnValue(mockSkill._id);
        (validateUpdateSkill as jest.Mock).mockReturnValue({});
        (Skill.findOne as jest.Mock).mockResolvedValue(null);
        (Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockSkill);

        const result = await updateSkill({ id: mockSkill._id });
        expect(result).toEqual(mockSkill);
    });
});
