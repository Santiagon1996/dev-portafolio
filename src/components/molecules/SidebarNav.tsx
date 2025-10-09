// Componente de navegación (Sidebar)
import { ScrollArea } from "@app/components/ui/scroll-area";
import { SheetClose } from "@app/components/ui/sheet";
import { cn } from "@lib/utils/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Iconos de Lucide React (instalados con shadcn/ui)
import { LayoutDashboard, FileText } from "lucide-react";

// 1. ITEMS DE NAVEGACIÓN SOLICITADOS
const navItems = [
    { name: "Visión General", href: "/dashboard", icon: LayoutDashboard },
    { name: "Blog", href: "/dashboard/blogs", icon: FileText },
    // Puedes añadir más elementos aquí:
    // { name: "Ajustes", href: "/dashboard/settings", icon: Settings },
];
export const SidebarNav = ({ isMobile = false, closeSheet }: { isMobile?: boolean; closeSheet?: () => void }) => {
    const pathname = usePathname();

    // ScrollArea envuelve la navegación para manejar muchos ítems
    return (
        <ScrollArea className={cn("h-full", isMobile ? "px-2 pt-4" : "mt-6")}>
            <nav className="flex flex-col">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.name !== "Visión General" && pathname.startsWith(item.href));
                        const IconComponent = item.icon;

                        return (
                            <li key={item.name}>
                                <SheetClose asChild={isMobile}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                                            "text-muted-foreground hover:text-primary", // Color por defecto
                                            isActive
                                                ? "bg-muted text-primary" // Fondo y color si está activo
                                                : "hover:bg-muted/50", // Hover si está inactivo
                                        )}
                                        onClick={closeSheet} // Cierra el sheet al hacer clic en móvil
                                    >
                                        <IconComponent className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                </SheetClose>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </ScrollArea>
    );
}