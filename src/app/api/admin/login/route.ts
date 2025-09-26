// /app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { setAdmin } from '@app/api/_logic/admin/setAdmin';
import { createToken } from '@lib/utils/tokenManagment';
import { setAuthCookie } from '@lib/utils/tokenCookieManager';
import { withErrorHandler } from '@lib/helpers/withErrorHandler';

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();


    // 1. Validar credenciales y obtener info del admin
    const admin = await setAdmin(body);

    // 2. Crear token JWT
    const token = createToken(admin.id);

    // 3. Guardar el token en la cookie
    await setAuthCookie(token);

    const { id, username } = admin
    // 4. Devolver respuesta con info pública del admin y el token
    return NextResponse.json({
        message: 'Inicio de sesión exitoso',
        admin: { id, username },
        token // Incluir el token para testing/desarrollo
    });
});
