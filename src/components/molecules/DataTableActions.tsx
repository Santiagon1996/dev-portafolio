"use client";

import { ViewButton } from "@components/atoms/ViewButton";
import { EditButton } from "@components/atoms/EditButton";
import { DeleteButton } from "@components/atoms/DeleteButton";

type WithId = { id: string | number };

export function DataTableActions<T extends WithId>({
    item,
    onView,
    onEdit,
    onDelete,
}: {
    item: T;
    onView: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onDelete: (id: string | number) => void;
}) {
    return (
        <>
            <ViewButton onClick={() => onView(item.id)} />
            <EditButton onClick={() => onEdit(item.id)} />
            <DeleteButton onClick={() => onDelete(item.id)} />
        </>
    );
}
