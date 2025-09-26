import { cookies } from 'next/headers';

const COOKIE_NAME = 'accessToken';
const COOKIE_MAX_AGE = 60 * 60; // 1 hora (en segundos)

/**
 * Establece la cookie de autenticación con el token JWT.
 * @param token - JWT generado
 */
export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    });
}

/**
 * Elimina la cookie de autenticación.
 */
export async function removeAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
