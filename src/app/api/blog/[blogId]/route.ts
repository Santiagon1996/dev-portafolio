import { connectToDatabase } from "@lib/db/connection";
import { withAuth } from "@lib/middleware/withAuth";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { updateBlog, deleteBlog, getBlogById } from "../../_logic/blog/index";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ blogId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        async () => {
            await connectToDatabase();

            const { blogId } = resolvedParams;

            // Obtener blog por ID 
            const blog = await getBlogById({ id: blogId });

            // Responder con el blog 
            return NextResponse.json(blog, { status: 200 });
        }
    )(req, { params: resolvedParams });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ blogId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async (req) => {
            await connectToDatabase();

            const { blogId } = resolvedParams;
            const updatesData = await req.json();

            // Combinar el ID con los datos a actualizar
            const blogDataToUpdate = {
                id: blogId,
                ...updatesData
            };

            // Actualizar blog
            const updatedBlog = await updateBlog(blogDataToUpdate);

            // Responder con el blog actualizado
            return NextResponse.json(updatedBlog, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ blogId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async () => {
            await connectToDatabase();

            const { blogId } = resolvedParams;

            // Eliminar blog
            const deletedBlog = await deleteBlog({ id: blogId });

            // Responder con el blog eliminado
            return NextResponse.json(deletedBlog, { status: 200 });
        })
    )(req, { params: resolvedParams });
}