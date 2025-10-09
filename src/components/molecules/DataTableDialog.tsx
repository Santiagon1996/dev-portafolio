"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import React from "react";

export function DataTableDialog({ open, onOpenChange, title, children }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
