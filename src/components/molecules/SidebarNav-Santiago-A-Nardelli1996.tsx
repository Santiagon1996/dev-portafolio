"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@lib/utils/utils"; // Utilidad para combinar clases de Tailwind
import { Home, Briefcase, FileText } from "lucide-react"; // Importa los iconos que necesitas

// Definición de los elementos de navegación con sus íconos
const navItems = [
    { name: "Visión General", href: "/dashboard", icon: Home },
    { name: "Proyectos", href: "/dashboard/project", icon: Briefcase },
    { name: "Estudios", href: "/dashboard/education", icon: Briefcase },
    { name: "Habilidades", href: "/dashboard/skill", icon: Briefcase },
    { name: "Experiencia", href: "/dashboard/experience", icon: Briefcase },
    { name: "Blogs", href: "/dashboard/blogs", icon: FileText },
];

/**
 * Contenido de la navegación de la barra lateral.
 * @param {boolean} isMobile - Para estilos y comportamiento en móvil.
 * @param {function} closeSheet - Función para cerrar el Sheet móvil (si aplica).
 */
export const SidebarNav = ({
    isMobile = false,
    closeSheet,
}: {
    isMobile?: boolean;
    closeSheet?: () => void;
}) => {
    const pathname = usePathname();

    return (
        <nav className={cn("flex flex-col", isMobile ? "px-2 pt-4" : "mt-6")}>
            <ul className="space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                onClick={isMobile ? closeSheet : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 font-medium",

                                    // --- Estilos Base (Futurista/Minimalista Dark) ---
                                    // Texto gris suave, hover sutil en fondo oscuro
                                    "text-gray-400 hover:text-gray-50 hover:bg-gray-800/80",

                                    {
                                        // --- Estilo Activo (Neón/Glow) ---
                                        // Borde izquierdo de color neón (cyan), fondo sutilmente más claro, texto brillante
                                        "text-cyan-400 bg-cyan-900/30 border-l-4 border-cyan-400 shadow-lg shadow-cyan-900/50": isActive,
                                        // Hover para inactivos
                                        "hover:bg-gray-800": !isActive,
                                    }
                                )}
                            >
                                {/* Icono */}
                                <Icon className="h-5 w-5 shrink-0" />
                                {/* Nombre del ítem */}
                                <span className="truncate">{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};