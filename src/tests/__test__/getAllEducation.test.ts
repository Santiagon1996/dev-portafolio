import { getAllEducations } from "@app/api/_logic/education/getAllEducations";
import { Education } from "@lib/db/models/index";
import { errors } from "@shared";

const { SystemError, NotFoundError } = errors;

jest.mock("@lib/db/models/index", () => ({
    Education: {
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

describe("getAllEducations", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("devuelve educaciones y metadatos correctamente (caso feliz)", async () => {
        const mockData = [{ _id: "1", institution: "MIT" }, { _id: "2", institution: "Harvard" }];
        (Education.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Education.countDocuments as jest.Mock).mockResolvedValue(2);
        const result = await getAllEducations();
        expect(result.education).toEqual(mockData);
        expect(result.total).toBe(2);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(1);
    });

    it("devuelve array vacío y total=0 si no hay resultados", async () => {
        (Education.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve([]) }) }) }),
        });
        (Education.countDocuments as jest.Mock).mockResolvedValue(0);
        const result = await getAllEducations();
        expect(result.education).toEqual([]);
        expect(result.total).toBe(0);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(0);
    });

    it("aplica filtros correctamente", async () => {
        const mockData = [{ _id: "1", institution: "MIT" }];
        (Education.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Education.countDocuments as jest.Mock).mockResolvedValue(1);
        const result = await getAllEducations({ institution: "MIT" });
        expect(result.education).toEqual(mockData);
        expect(result.total).toBe(1);
    });

    it("aplica paginación correctamente", async () => {
        const mockData = [{ _id: "2", institution: "Harvard" }];
        (Education.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Education.countDocuments as jest.Mock).mockResolvedValue(3);
        const result = await getAllEducations({ page: 2, limit: 1 });
        expect(result.page).toBe(2);
        expect(result.totalPages).toBe(3);
        expect(result.education).toEqual(mockData);
    });

    it("lanza SystemError si ocurre un error de sistema", async () => {
        (Education.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw new Error("DB error"); } }) }) }),
        });
        (Education.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllEducations()).rejects.toThrow(SystemError);
    });

    it("relanza NotFoundError si ocurre", async () => {
        const notFound = new NotFoundError("No encontrado", {});
        (Education.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw notFound; } }) }) }),
        });
        (Education.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllEducations()).rejects.toThrow(NotFoundError);
    });
});
