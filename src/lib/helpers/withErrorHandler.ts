import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "./errorHandler";

/**
 * Middleware limpio para manejar errores en funciones de rutas (GET, POST, etc.)
 * 
 * - Centraliza todo el manejo de errores
 * - El errorHandler detecta automáticamente errores de JSON parsing
 * - Simple y elegante
 * 
 * @param callback - Función async que maneja la lógica del endpoint
 * @returns - Función envuelta con manejo de errores centralizado
 */
export const withErrorHandler = (
    callback: (req: NextRequest, params: { params: Record<string, string> }) => Promise<NextResponse>
) => {
    return async (
        req: NextRequest,
        params: { params: Record<string, string> }
    ): Promise<NextResponse> => {
        try {
            return await callback(req, params);
        } catch (error) {
            return errorHandler(error);
        }
    };
};
