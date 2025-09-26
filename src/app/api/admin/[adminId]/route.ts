import { connectToDatabase } from "@lib/db/connection";
import { withAuth } from "@lib/middleware/withAuth";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { updateAdmin, deleteAdmin, getAdminById } from "../../_logic/admin/index";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ adminId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async () => {
            await connectToDatabase();

            const { adminId } = resolvedParams;

            // Obtener admin por ID (sin password por seguridad)
            const admin = await getAdminById({ id: adminId });

            // Responder con el admin (password excluido en getAdminById)
            return NextResponse.json(admin, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ adminId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async (req) => {
            await connectToDatabase();

            const { adminId } = resolvedParams;
            const updatesData = await req.json();

            // Combinar el ID con los datos a actualizar
            const adminDataToUpdate = {
                id: adminId,
                ...updatesData
            };

            // Actualizar admin
            const updatedAdmin = await updateAdmin(adminDataToUpdate);

            // Responder con el admin actualizado
            return NextResponse.json(updatedAdmin, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ adminId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async () => {
            await connectToDatabase();

            const { adminId } = resolvedParams;

            // Eliminar admin
            const deletedAdmin = await deleteAdmin({ id: adminId });

            // Responder con el admin eliminado
            return NextResponse.json(deletedAdmin, { status: 200 });
        })
    )(req, { params: resolvedParams });
}