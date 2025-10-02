import { getAllProjects } from "@app/api/_logic/project/getAllProjects";
import { Project } from "@lib/db/models/index";
import { errors } from "@shared";

const { SystemError, NotFoundError } = errors;

jest.mock("@lib/db/models/index", () => ({
    Project: {
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

describe("getAllProjects", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("devuelve proyectos y metadatos correctamente (caso feliz)", async () => {
        const mockData = [{ _id: "1", title: "P1" }, { _id: "2", title: "P2" }];
        (Project.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Project.countDocuments as jest.Mock).mockResolvedValue(2);
        const result = await getAllProjects();
        expect(result.projects).toEqual(mockData);
        expect(result.total).toBe(2);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(1);
    });

    it("devuelve array vacío y total=0 si no hay resultados", async () => {
        (Project.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve([]) }) }) }),
        });
        (Project.countDocuments as jest.Mock).mockResolvedValue(0);
        const result = await getAllProjects();
        expect(result.projects).toEqual([]);
        expect(result.total).toBe(0);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(0);
    });

    it("aplica filtros correctamente", async () => {
        const mockData = [{ _id: "1", title: "P1" }];
        (Project.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Project.countDocuments as jest.Mock).mockResolvedValue(1);
        const result = await getAllProjects({ title: "P1" });
        expect(result.projects).toEqual(mockData);
        expect(result.total).toBe(1);
    });

    it("aplica paginación correctamente", async () => {
        const mockData = [{ _id: "2", title: "P2" }];
        (Project.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => Promise.resolve(mockData) }) }) }),
        });
        (Project.countDocuments as jest.Mock).mockResolvedValue(3);
        const result = await getAllProjects({ page: 2, limit: 1 });
        expect(result.page).toBe(2);
        expect(result.totalPages).toBe(3);
        expect(result.projects).toEqual(mockData);
    });

    it("lanza SystemError si ocurre un error de sistema", async () => {
        (Project.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw new Error("DB error"); } }) }) }),
        });
        (Project.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllProjects()).rejects.toThrow(SystemError);
    });

    it("relanza NotFoundError si ocurre", async () => {
        const notFound = new NotFoundError("No encontrado", {});
        (Project.find as jest.Mock).mockReturnValue({
            sort: () => ({ skip: () => ({ limit: () => ({ exec: () => { throw notFound; } }) }) }),
        });
        (Project.countDocuments as jest.Mock).mockResolvedValue(0);
        await expect(getAllProjects()).rejects.toThrow(NotFoundError);
    });
});
