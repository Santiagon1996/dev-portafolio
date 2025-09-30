import { connectToDatabase } from "@lib/db/connection";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { addBlog, getAllBlogs } from "../_logic/blog/index";
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@lib/middleware/withAuth";


// GET /api/blog - Obtener todos los blogs con paginación
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

            const isPublished = searchParams.get('isPublished') === 'true';
            const tags = searchParams.get('tags')?.split(',').filter(Boolean);
            const author = searchParams.get('author') || undefined;

            const result = await getAllBlogs({
                page,
                limit,
                isPublished,
                tags,
                author
            });

            return NextResponse.json(result, { status: 200 });
        }
    )(req, { params: {} });
}

// POST /api/blog - Crear nuevo blog (requiere autenticación)
export async function POST(req: NextRequest) {
    return await withErrorHandler(
        withAuth(
            async (req) => {
                await connectToDatabase();
                const blogData = await req.json();
                const newBlog = await addBlog(blogData);
                return NextResponse.json(newBlog, { status: 201 });
            }
        )
    )(req, { params: {} });
}
