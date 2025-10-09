"use client";
import { Button } from "@components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

export function DeleteButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="text-red-400 hover:bg-red-900/50 hover:text-red-300"
            title="Eliminar"
        >
            <TrashIcon className="h-4 w-4" />
        </Button>
    );
}
