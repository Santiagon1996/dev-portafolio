import { connectToDatabase } from "@lib/db/connection";
import { withAuth } from "@lib/middleware/withAuth";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { updateSkill, deleteSkill, getSkillById } from "../../_logic/skills/index";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ skillId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        (async () => {
            await connectToDatabase();

            const { skillId } = resolvedParams;

            // Obtener habilidad por ID
            const skill = await getSkillById({ id: skillId });

            // Responder con la habilidad
            return NextResponse.json(skill, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ skillId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async (req) => {
            await connectToDatabase();

            const { skillId } = resolvedParams;
            const updatesData = await req.json();

            // Combinar el ID con los datos a actualizar
            const skillDataToUpdate = {
                id: skillId,
                ...updatesData
            };

            // Actualizar habilidad
            const updatedSkill = await updateSkill(skillDataToUpdate);

            // Responder con la habilidad actualizada
            return NextResponse.json(updatedSkill, { status: 200 });
        })
    )(req, { params: resolvedParams });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ skillId: string }> }) {
    const resolvedParams = await params;
    return await withErrorHandler(
        withAuth(async () => {
            await connectToDatabase();

            const { skillId } = resolvedParams;

            // Eliminar habilidad
            const deletedSkill = await deleteSkill({ id: skillId });

            // Responder con la habilidad eliminada
            return NextResponse.json(deletedSkill, { status: 200 });
        })
    )(req, { params: resolvedParams });
}