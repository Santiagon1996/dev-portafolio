import { connectToDatabase } from "@lib/db/connection";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { addSkill, getAllSkills } from "../_logic/skills/index";
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@lib/middleware/withAuth";


// GET /api/skill - Obtener todos los skills con paginación
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

            const name = searchParams.get('name') || undefined;
            const level = searchParams.get('level') || undefined;

            const result = await getAllSkills({
                page,
                limit,
                level,
                name
            });

            return NextResponse.json(result, { status: 200 });
        }
    )(req, { params: {} });
}

// POST /api/skill - Crear nuevo skill (requiere autenticación)
export async function POST(req: NextRequest) {
    return await withErrorHandler(
        withAuth(
            async (req) => {
                await connectToDatabase();
                const skillData = await req.json();
                const newSkill = await addSkill(skillData);
                return NextResponse.json(newSkill, { status: 201 });
            }
        )
    )(req, { params: {} });
}
