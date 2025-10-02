import { connectToDatabase } from "@lib/db/connection";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { addExperience, getAllExperience } from "../_logic/experience/index";
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@lib/middleware/withAuth";


// GET /api/experience - Obtener todas las experiencias con paginación
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

            const role = searchParams.get('role') || undefined;
            const technologies = searchParams.get('technologies') || undefined;

            const result = await getAllExperience({
                page,
                limit,
                technologies,
                role
            });

            return NextResponse.json(result, { status: 200 });
        }
    )(req, { params: {} });
}

// POST /api/experience - Crear nueva experiencia (requiere autenticación)
export async function POST(req: NextRequest) {
    return await withErrorHandler(
        withAuth(
            async (req) => {
                await connectToDatabase();
                const experienceData = await req.json();
                const newExperience = await addExperience(experienceData);
                return NextResponse.json(newExperience, { status: 201 });
            }
        )
    )(req, { params: {} });
}
