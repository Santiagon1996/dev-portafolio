import { connectToDatabase } from "@lib/db/connection";
import { withAuth } from "@lib/middleware/withAuth";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { updateExperience, deleteExperience, getExperienceById } from "../../_logic/experience/index";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        (async () => {
            await connectToDatabase();

            const { experienceId } = resolvedParams;

            // Obtener experiencia por ID
            const experience = await getExperienceById({ id: experienceId });

            // Responder con la experiencia
            return NextResponse.json(experience, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async (req) => {
            await connectToDatabase();

            const { experienceId } = resolvedParams;
            const updatesData = await req.json();

            // Combinar el ID con los datos a actualizar
            const experienceDataToUpdate = {
                id: experienceId,
                ...updatesData
            };

            // Actualizar experiencia
            const updatedExperience = await updateExperience(experienceDataToUpdate);

            // Responder con la experiencia actualizada
            return NextResponse.json(updatedExperience, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async () => {
            await connectToDatabase();

            const { experienceId } = resolvedParams;

            // Eliminar experiencia
            const deletedExperience = await deleteExperience({ id: experienceId });

            // Responder con la experiencia eliminada
            return NextResponse.json(deletedExperience, { status: 200 });
        })
    )(req, { params: resolvedParams });
}