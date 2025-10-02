import { connectToDatabase } from "@lib/db/connection";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { addProject, getAllProjects } from "../_logic/project/index";
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@lib/middleware/withAuth";


// GET /api/project - Obtener todos los proyectos con paginación
export async function GET(req: NextRequest) {
    return await withErrorHandler(
        async (req) => {
            await connectToDatabase();

            const { searchParams } = new URL(req.url);

            // 🔒 VALIDACIÓN: Asegurar valores positivos para paginación
            let page = parseInt(searchParams.get('page') || '1');
            let limit = parseInt(searchParams.get('limit') || '10');

            // Corregir valores inválidos
            page = page > 0 ? page : 1;        // Si page <= 0, usar 1
            limit = limit > 0 ? limit : 10;    // Si limit <= 0, usar 10

            const title = searchParams.get('title') || undefined;
            const repoUrl = searchParams.get('repoUrl') || undefined;

            const result = await getAllProjects({
                page,
                limit,
                repoUrl,
                title
            });

            return NextResponse.json(result, { status: 200 });
        }
    )(req, { params: {} });
}

// POST /api/project - Crear nuevo proyecto (requiere autenticación)
export async function POST(req: NextRequest) {
    return await withErrorHandler(
        withAuth(
            async (req) => {
                await connectToDatabase();
                const projectData = await req.json();
                const newProject = await addProject(projectData);
                return NextResponse.json(newProject, { status: 201 });
            }
        )
    )(req, { params: {} });
}
