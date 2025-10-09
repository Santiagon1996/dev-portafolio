import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas protegidas
    const protectedRoutes = [
        "/dashboard",
        "/dashboard/settings",
        "/dashboard/admin",
        "/dashboard/profile",
        "/dashboard/service",
        "/dashboard/blogs",
        "/dashboard/projects",
        "/dashboard/skills",
        "/dashboard/messages",
        "/dashboard/education",
        "/dashboard/experience"
    ];

    // Ruta de login
    const loginUrl = "/login";

    // Verifica si la ruta es protegida
    if (protectedRoutes.includes(pathname)) {
        // Obtiene el token de las cookies
        const accessToken = request.cookies.get("accessToken")?.value;
        console.log(
            `Middleware for ${pathname}: accessToken found?`,
            !!accessToken
        );

        // Si no hay token, redirige al login
        if (!accessToken) {
            const redirectUrl = new URL(loginUrl, request.url);
            redirectUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    // Permite todas las demás rutas
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
