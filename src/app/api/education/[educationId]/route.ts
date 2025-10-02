import { connectToDatabase } from "@lib/db/connection";
import { withAuth } from "@lib/middleware/withAuth";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { updateEducation, deleteEducation, getEducationById } from "../../_logic/education/index";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ educationId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        (async () => {
            await connectToDatabase();

            const { educationId } = resolvedParams;

            // Obtener educación por ID
            const education = await getEducationById({ id: educationId });

            // Responder con la educación
            return NextResponse.json(education, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ educationId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async (req) => {
            await connectToDatabase();

            const { educationId } = resolvedParams;
            const updatesData = await req.json();

            // Combinar el ID con los datos a actualizar
            const educationDataToUpdate = {
                id: educationId,
                ...updatesData
            };

            // Actualizar educación
            const updatedEducation = await updateEducation(educationDataToUpdate);

            // Responder con la educación actualizada
            return NextResponse.json(updatedEducation, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ educationId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async () => {
            await connectToDatabase();

            const { educationId } = resolvedParams;

            // Eliminar educación
            const deletedEducation = await deleteEducation({ id: educationId });

            // Responder con la educación eliminada
            return NextResponse.json(deletedEducation, { status: 200 });
        })
    )(req, { params: resolvedParams });
}