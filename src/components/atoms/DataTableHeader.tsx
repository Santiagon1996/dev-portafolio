"use client";

import { TableHeader, TableRow, TableHead } from "@components/ui/table";

interface DataTableColumn {
    header: string;
    className?: string;
}

export function DataTableHeader({ columns }: { columns: DataTableColumn[] }) {
    return (
        <TableHeader className="bg-gray-800/80">
            <TableRow className="hover:bg-gray-800/80">
                {columns.map((col) => (
                    <TableHead key={col.header} className={col.className}>
                        <span className="text-cyan-400 uppercase tracking-wider">
                            {col.header}
                        </span>
                    </TableHead>
                ))}
                <TableHead className="text-right w-[150px]">
                    <span className="text-cyan-400 uppercase tracking-wider">
                        Acciones
                    </span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}
