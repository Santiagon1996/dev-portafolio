"use client";

import React from "react";

type DataTableFilterType = {
    query?: string;
    // Add more filter fields here as needed
};

export function DataTableFilters({ filters, onFilterChange }: {
    filters: DataTableFilterType;
    onFilterChange: (filters: DataTableFilterType) => void;
}) {
    // Renderiza los filtros según la configuración
    return (
        <div className="flex gap-4 mb-4">
            {/* Ejemplo: filtro por texto */}
            <input
                type="text"
                placeholder="Buscar..."
                value={filters.query || ""}
                onChange={e => onFilterChange({ ...filters, query: e.target.value })}
                className="px-3 py-2 rounded bg-gray-800 text-gray-200"
            />
            {/* Puedes agregar más filtros aquí */}
        </div>
    );
}
