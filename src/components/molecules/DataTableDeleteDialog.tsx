"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import React from "react";

export function DataTableDeleteDialog({ open, onOpenChange, onConfirm }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-400">Confirmar Eliminación</DialogTitle>
                </DialogHeader>
                <p className="text-gray-400 mb-4">¿Estás seguro de que quieres eliminar este ítem? Esta acción no se puede deshacer.</p>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300">Cancelar</Button>
                    <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
