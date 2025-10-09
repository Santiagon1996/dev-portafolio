import { useState } from "react";

export function useDataTableState<T>() {
    const [currentDataItem, setCurrentDataItem] = useState<T | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState<string | number | null>(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Record<string, unknown>>({});

    return {
        currentDataItem,
        setCurrentDataItem,
        isDialogOpen,
        setIsDialogOpen,
        isConfirmingDelete,
        setIsConfirmingDelete,
        itemToDeleteId,
        setItemToDeleteId,
        page,
        setPage,
        filters,
        setFilters,
    };
}
