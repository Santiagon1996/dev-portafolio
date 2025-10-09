"use client";

import { Button } from "@components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export function CreateButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            onClick={onClick}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all duration-200 shadow-lg shadow-cyan-500/50"
        >
            <PlusCircledIcon className="mr-2 h-5 w-5" /> Crear Nuevo
        </Button>
    );
}
