import { getAllSkills } from "@app/api/_logic/skills/getAllSkills";
import { Skill } from "@lib/db/models/index";
import { errors } from "@shared";

const { SystemError, NotFoundError } = errors;

jest.mock("@lib/db/models/index", () => ({
    Skill: {
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

describe("getAllSkills", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("devuelve skills y metadatos correctamente (caso feliz)", async () => {
        const mockData = [{ _id: "1", name: "JS" }, { _id: "2", name: "TS" }];
        (Skill.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Skill.countDocuments as jest.Mock).mockResolvedValue(2);
        const result = await getAllSkills();
        expect(result.skills).toEqual(mockData);
        expect(result.total).toBe(2);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(1);
    });

    it("devuelve array vacío y total=0 si no hay resultados", async () => {
        (Skill.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve([]) }) }) }),
        });
        (Skill.countDocuments as jest.Mock).mockResolvedValue(0);
        const result = await getAllSkills();
        expect(result.skills).toEqual([]);
        expect(result.total).toBe(0);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(0);
    });

    it("aplica filtros correctamente", async () => {
        const mockData = [{ _id: "1", name: "JS" }];
        (Skill.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Skill.countDocuments as jest.Mock).mockResolvedValue(1);
        const result = await getAllSkills({ name: "JS" });
        expect(result.skills).toEqual(mockData);
        expect(result.total).toBe(1);
    });

    it("aplica paginación correctamente", async () => {
        const mockData = [{ _id: "2", name: "TS" }];
        (Skill.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Skill.countDocuments as jest.Mock).mockResolvedValue(3);
        const result = await getAllSkills({ page: 2, limit: 1 });
        expect(result.page).toBe(2);
        expect(result.totalPages).toBe(3);
        expect(result.skills).toEqual(mockData);
    });

    it("lanza SystemError si ocurre un error de sistema", async () => {
        (Skill.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw new Error("DB error"); } }) }) }),
        });
        (Skill.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllSkills()).rejects.toThrow(SystemError);
    });

    it("relanza NotFoundError si ocurre", async () => {
        const notFound = new NotFoundError("No encontrado", {});
        (Skill.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw notFound; } }) }) }),
        });
        (Skill.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllSkills()).rejects.toThrow(NotFoundError);
    });
});
