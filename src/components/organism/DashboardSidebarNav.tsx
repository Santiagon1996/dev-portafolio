"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
} from "@components/ui/sidebar";
import { SidebarNav } from "@components/molecules/SidebarNav";

export function DashboardSidebarNav() {
    return (
        // 1. Sidebar Component: Establece collapsible="icon" para colapsar a solo íconos.
        // 2. Estilo Futurista/Minimalista: Fondo negro profundo, borde de separación neón.
        <Sidebar
            collapsible="icon"
            side="left"
            className="dark bg-gray-950 text-gray-100 border-r border-cyan-900/50"
        >
            {/* SidebarHeader: Zona superior para un logo o título */}
            <SidebarHeader className="p-4 border-b border-cyan-900/50">
                <h1 className="text-xl font-bold text-cyan-400 truncate">
                    DASHBOARD <span className="text-gray-500 font-light">_UI</span>
                </h1>
            </SidebarHeader>

            {/* SidebarContent: El contenedor de contenido principal y desplazamiento */}
            <SidebarContent className="flex-1 overflow-auto p-2">
                {/* Aquí integramos el componente con la lógica de navegación */}
                <SidebarNav />
            </SidebarContent>

            {/* SidebarFooter: Zona inferior (Opcional) */}
            <SidebarFooter className="p-4 border-t border-cyan-900/50 text-xs text-gray-600">
                Sistema v1.0 S.N
            </SidebarFooter>
        </Sidebar>
    );
}