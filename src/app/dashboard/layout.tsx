import { SidebarProvider, SidebarTrigger } from "@components/ui/sidebar";
import { DashboardSidebarNav } from "@components/organism/DashboardSidebarNav";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // 1. Leer las cookies en el servidor.
    const cookieStore = await cookies();
    // 2. Determinar el estado inicial a partir del valor de la cookie.
    //    Si el valor es "true", defaultOpen es true.
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    // TODO: En una próxima iteración, agregar protección de seguridad y autenticación aquí.
    // Ejemplo: Validar sesión, roles, permisos, etc.

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            {/* Sidebar con accesibilidad y animación */}
            <nav aria-label="Menú principal" role="navigation" className="h-full">
                <DashboardSidebarNav />
            </nav>

            <main className="flex-1 overflow-auto">
                {/* Header con trigger accesible y responsive */}
                <header className="sticky top-0 z-10 p-4 border-b border-cyan-900/50 bg-gray-950/80 backdrop-blur-sm flex items-center gap-4">
                    <SidebarTrigger
                        className="h-8 w-8 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                        aria-label="Abrir/cerrar menú lateral"
                        role="button"
                    />
                    <h2 className="text-2xl font-semibold text-gray-100">Dashboard</h2>
                </header>

                <div className="p-6">
                    {children} {/* Contenido de las páginas/tablas del dashboard */}
                </div>
            </main>
        </SidebarProvider>
    );
}