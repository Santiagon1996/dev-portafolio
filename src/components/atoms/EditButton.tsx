"use client";

import { Button } from "@components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";

export function EditButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="text-yellow-400 hover:bg-yellow-900/50 hover:text-yellow-300"
            title="Editar"
        >
            <Pencil1Icon className="h-4 w-4" />
        </Button>
    );
}
