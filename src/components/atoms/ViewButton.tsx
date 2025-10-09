"use client";

import { Button } from "@components/ui/button";
import { EyeOpenIcon } from "@radix-ui/react-icons";

export function ViewButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="text-blue-400 hover:bg-blue-900/50 hover:text-blue-300"
            title="Ver detalles"
        >
            <EyeOpenIcon className="h-4 w-4" />
        </Button>
    );
}
