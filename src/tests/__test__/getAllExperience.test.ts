import { getAllExperience } from "@app/api/_logic/experience/getAllExperience";
import { Experience } from "@lib/db/models/index";
import { errors } from "@shared";

const { SystemError, NotFoundError } = errors;

jest.mock("@lib/db/models/index", () => ({
    Experience: {
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

describe("getAllExperience", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("devuelve experiencias y metadatos correctamente (caso feliz)", async () => {
        const mockData = [{ _id: "1", role: "Dev" }, { _id: "2", role: "QA" }];
        (Experience.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Experience.countDocuments as jest.Mock).mockResolvedValue(2);
        const result = await getAllExperience();
        expect(result.experience).toEqual(mockData);
        expect(result.total).toBe(2);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(1);
    });

    it("devuelve array vacío y total=0 si no hay resultados", async () => {
        (Experience.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve([]) }) }) }),
        });
        (Experience.countDocuments as jest.Mock).mockResolvedValue(0);
        const result = await getAllExperience();
        expect(result.experience).toEqual([]);
        expect(result.total).toBe(0);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(0);
    });

    it("aplica filtros correctamente", async () => {
        const mockData = [{ _id: "1", role: "Dev" }];
        (Experience.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Experience.countDocuments as jest.Mock).mockResolvedValue(1);
        const result = await getAllExperience({ role: "Dev" });
        expect(result.experience).toEqual(mockData);
        expect(result.total).toBe(1);
    });

    it("aplica paginación correctamente", async () => {
        const mockData = [{ _id: "2", role: "QA" }];
        (Experience.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Experience.countDocuments as jest.Mock).mockResolvedValue(3);
        const result = await getAllExperience({ page: 2, limit: 1 });
        expect(result.page).toBe(2);
        expect(result.totalPages).toBe(3);
        expect(result.experience).toEqual(mockData);
    });

    it("lanza SystemError si ocurre un error de sistema", async () => {
        (Experience.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw new Error("DB error"); } }) }) }),
        });
        (Experience.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllExperience()).rejects.toThrow(SystemError);
    });

    it("relanza NotFoundError si ocurre", async () => {
        const notFound = new NotFoundError("No encontrado", {});
        (Experience.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw notFound; } }) }) }),
        });
        (Experience.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllExperience()).rejects.toThrow(NotFoundError);
    });
});
