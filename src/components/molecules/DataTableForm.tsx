"use client";

import React, { useMemo } from "react";
import { DynamicForm, FieldConfig } from "@components/molecules/DynamicForm";

interface DataTableFormProps<T extends Record<string, unknown>> {
    currentItem: T | null;
    onSubmit: (data: Partial<T>) => void;
    fields: FieldConfig[];
}

export function DataTableForm<T extends Record<string, unknown>>({ currentItem, onSubmit, fields }: DataTableFormProps<T>) {
    // Memoiza las props para evitar nuevas referencias en cada render
    const memoizedFields = useMemo(() => fields, [fields]);
    const memoizedCurrentItem = useMemo(() => currentItem, [currentItem]);

    return (
        <DynamicForm<T>
            currentItem={memoizedCurrentItem}
            fields={memoizedFields}
            onSubmit={onSubmit}
        />
    );
}
