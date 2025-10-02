import { connectToDatabase } from "@lib/db/connection";
import { withAuth } from "@lib/middleware/withAuth";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { updateProject, deleteProject, getProjectById } from "../../_logic/project/index";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        (async () => {
            await connectToDatabase();

            const { projectId } = resolvedParams;

            // Obtener proyecto por ID
            const project = await getProjectById({ id: projectId });

            // Responder con el proyecto
            return NextResponse.json(project, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async (req) => {
            await connectToDatabase();

            const { projectId } = resolvedParams;
            const updatesData = await req.json();

            // Combinar el ID con los datos a actualizar
            const projectDataToUpdate = {
                id: projectId,
                ...updatesData
            };

            // Actualizar proyecto
            const updatedProject = await updateProject(projectDataToUpdate);

            // Responder con el proyecto actualizado
            return NextResponse.json(updatedProject, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async () => {
            await connectToDatabase();

            const { projectId } = resolvedParams;

            // Eliminar proyecto
            const deletedProject = await deleteProject({ id: projectId });

            // Responder con el proyecto eliminado
            return NextResponse.json(deletedProject, { status: 200 });
        })
    )(req, { params: resolvedParams });
}