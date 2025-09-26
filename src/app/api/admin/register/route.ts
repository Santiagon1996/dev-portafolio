// app/api/admin/add/route.ts

import { connectToDatabase } from "@lib/db/connection";
import { withErrorHandler } from "@lib/helpers/withErrorHandler";
import { NextRequest, NextResponse } from "next/server";
import { addAdmin } from "@app/api/_logic/admin/addAdmin";

/**
 * Ruta POST para registrar un nuevo administrador
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
    //  Conexión a la base de datos
    await connectToDatabase();

    // Parseo del body
    const adminData = await req.json();

    //  Lógica de negocio delegada en capa de servicios
    const newAdmin = await addAdmin(adminData);

    //  Respuesta exitosa
    return NextResponse.json(
        { message: "Administrador creado correctamente", data: newAdmin },
        { status: 201 }
    );
});
