"use client";

import React from "react";

export function DataTablePagination({ page, totalPages, onPageChange }: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    return (
        <div className="flex justify-center items-center gap-2 py-4">
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1 rounded bg-gray-800 text-gray-200 disabled:opacity-50"
            >
                Anterior
            </button>
            <span className="px-2">Página {page} de {totalPages}</span>
            <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1 rounded bg-gray-800 text-gray-200 disabled:opacity-50"
            >
                Siguiente
            </button>
        </div>
    );
}
