// middleware/withAuth.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../utils/tokenManagment';
import { errors } from '@shared/errors/errors';

const { AuthorizationError, CredentialsError } = errors;

type HandlerWithAuth = (
    req: NextRequest,
    context: { adminId: string }
) => Promise<NextResponse> | NextResponse;

export const withAuth = (handler: HandlerWithAuth) => {
    return async (req: NextRequest) => {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) throw new AuthorizationError('Falta el token de autenticación');
        const decoded = verifyToken(token);
        if (!decoded.id) throw new CredentialsError('Token inválido: falta el ID');
        return await handler(req, { adminId: decoded.id });
    };
};
