"use client";

import { TableRow, TableCell } from "@components/ui/table";

export function DataTableEmptyRow({ colSpan }: { colSpan: number }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="text-center py-8 text-gray-500">
                No hay datos disponibles.
            </TableCell>
        </TableRow>
    );
}
