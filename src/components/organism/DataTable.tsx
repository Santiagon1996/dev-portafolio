"use client";

import { useMemo } from "react";
import { Table, TableBody, TableCell, TableRow } from "@components/ui/table";
import { DataTableHeader } from "@components/atoms/DataTableHeader";
import { DataTableActions } from "@components/molecules/DataTableActions";
import { DataTableEmptyRow } from "@components/atoms/DataTableEmptyRow";
import { DataTableDialog } from "@components/molecules/DataTableDialog";
import { DataTableDeleteDialog } from "@components/molecules/DataTableDeleteDialog";
import { DataTablePagination } from "@components/molecules/DataTablePagination";
import { DataTableFilters } from "@components/molecules/DataTableFilters";
import { useDataTableState } from "@hooks/useDataTableState";
import { toast } from "sonner";
import { FieldConfig } from "@components/molecules/DynamicForm";
import { blogFields } from "@components/config/fields/blogFields";
import { projectFields } from "@components/config/fields/projectFields";
import { educationFields } from "@components/config/fields/educationFields";
import { experienceFields } from "@components/config/fields/experienceFields";
import { skillFields } from "@components/config/fields/skillFields";

// ====================================================================
// 1. DEFINICIÓN DE TIPOS GENÉRICOS
// ====================================================================

/**
 * Define la estructura de una columna visible en la tabla.
 * @template T El tipo de dato de la fila (e.g., Blog, Service).
 */
export interface ColumnConfig<T> {
    // El campo de T a mostrar (e.g., 'title', 'category')
    key: keyof T;
    // El encabezado de la columna (e.g., 'Título', 'Autor')
    header: string;
    // Opcional: Función para formatear o renderizar el contenido de la celda
    render?: (item: T) => React.ReactNode;
    // Opcional: Clases de Tailwind para la celda (e.g., 'text-right', 'w-[200px]')
    className?: string;
}

/**
 * Define la estructura de las funciones CRUD que se pasan al componente.
 * @template T El tipo de dato de la fila (e.g., Blog, Service).
 */
export interface CrudActions<T> {
    // Función para crear un nuevo ítem. Recibe los datos del formulario.
    createItem: (data: Partial<T>) => Promise<boolean>;
    // Función para actualizar un ítem. Recibe el ID y los datos a actualizar.
    updateItem: (id: string | number, data: Partial<T>) => Promise<boolean>;
    // Función para eliminar un ítem. Recibe el ID.
    deleteItem: (id: string | number) => Promise<boolean>;
}

// ====================================================================
// 2. PROPS DEL COMPONENTE REUTILIZABLE
// ====================================================================

export interface GenericDataTableProps<T extends { id: string | number }> {
    // Array de datos a mostrar (debe tener un campo 'id' para las acciones)
    data: T[];
    // Título principal de la gestión (e.g., "Gestión de Blogs")
    title: string;
    // Array de configuración de columnas
    columns: ColumnConfig<T>[];
    // Funciones CRUD para interactuar con la fuente de datos
    actions: CrudActions<T>;
    // Hook de gestión de estado (debe exponer el estado de carga y errores)
    hookState: {
        loading: boolean;
        error: string | null;
        // Función para recargar los datos
        fetchData: () => void;
    };

    // Componente que define y maneja el formulario de creación/edición
    FormContent: React.ComponentType<{
        // Si se está editando, recibe el objeto completo, si no, es null
        currentItem: T | null;
        // La función que el formulario debe llamar al hacer submit
        onSubmit: (data: Partial<T>) => void;
        // Errores de validación a mostrar
        //validationErrors: Record<string, string>;
        // Campos a mostrar en el formulario
        fields: FieldConfig[];
    }>;
    // Tipo de entidad para determinar qué campos cargar
    entityType: "blog" | "project" | "education" | "experience" | "skill";
}

// ====================================================================
// 3. COMPONENTE PRINCIPAL
// ====================================================================

export function GenericDataTable<T extends { id: string | number }>({
    data,
    title,
    columns,
    actions,
    hookState,
    FormContent,
    entityType,
}: GenericDataTableProps<T>) {
    const {
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
    } = useDataTableState<T>();

    /**
     * Mapeo dinámico de fields por entidad.
     * Memorizado para evitar nuevas referencias en cada render.
     */
    const fieldsByEntity = useMemo(() => ({
        blog: blogFields as FieldConfig[],
        project: projectFields as FieldConfig[],
        education: educationFields as FieldConfig[],
        experience: experienceFields as FieldConfig[],
        skill: skillFields as FieldConfig[],
    }), []);

    // Memoiza los campos y el ítem actual solo para el formulario del diálogo de edición
    const memoizedFields = useMemo(() => fieldsByEntity[entityType], [fieldsByEntity, entityType]);
    const memoizedCurrentItem = useMemo(() => currentDataItem, [currentDataItem]);


    // Handlers
    const handleViewClick = (id: string | number) => {
        const item = data.find((d) => d.id === id) || null;
        setCurrentDataItem(item);
        setIsDialogOpen(true);
    };

    const handleEditClick = (id: string | number) => {
        const item = data.find((d) => d.id === id) || null;
        setCurrentDataItem(item);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id: string | number) => {
        setItemToDeleteId(id);
        setIsConfirmingDelete(true);
    };

    // const handleCreateClick = () => {
    //     //TODO despligue de form formato modal
    // };

    const confirmDeleteItem = async () => {
        if (itemToDeleteId) {
            const success = await actions.deleteItem(itemToDeleteId);
            if (success) {
                toast.success(`${title} eliminado con éxito.`);
                hookState.fetchData();
            } else {
                toast.error(`Error al eliminar el ${title}.`);
            }
            setItemToDeleteId(null);
            setIsConfirmingDelete(false);
        }
    };

    const handleCreateSubmit = async (data: Partial<T>) => {
        const success = await actions.createItem(data);
        if (success) {
            toast.success(`${title} creado con éxito.`);
            setIsDialogOpen(false);
            hookState.fetchData();
        } else {
            toast.error(`Error al crear el ${title}.`);
        }
    };

    const handleEditSubmit = async (data: Partial<T>) => {
        if (!memoizedCurrentItem) return;
        const success = await actions.updateItem(memoizedCurrentItem.id, data);
        if (success) {
            toast.success(`${title} actualizado con éxito.`);
            setIsDialogOpen(false);
            hookState.fetchData();
        } else {
            toast.error(`Error al actualizar el ${title}.`);
        }
    };

    // Renderizado principal
    return (
        <div className="container mx-auto p-4 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-700">
                <h1 className="text-3xl font-extrabold text-cyan-400">{title}</h1>
                {/* Botón de creación */}
                <FormContent
                    currentItem={null}
                    onSubmit={handleCreateSubmit}
                    fields={fieldsByEntity[entityType]}
                />
            </div>

            {/* Filtros */}
            <DataTableFilters filters={filters} onFilterChange={setFilters} />

            {/* Tabla */}
            <Table>
                <DataTableHeader columns={columns} />
                <TableBody className="divide-y divide-gray-800">
                    {data.length === 0 ? (
                        <DataTableEmptyRow colSpan={columns.length + 1} />
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-800 transition-colors">
                                {columns.map((col, index) => (
                                    <TableCell key={index} className={col.className || "font-medium text-gray-200"}>
                                        {col.render ? col.render(item) : String((item as T)[col.key] ?? "")}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right flex space-x-2 justify-end">
                                    <DataTableActions
                                        item={item}
                                        onView={handleViewClick}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Paginación */}
            <DataTablePagination page={page} totalPages={10} onPageChange={setPage} />

            {/* Diálogo de edición */}
            <DataTableDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title={title}>
                <FormContent
                    currentItem={memoizedCurrentItem}
                    onSubmit={handleEditSubmit}
                    fields={memoizedFields}
                />
            </DataTableDialog>

            {/* Diálogo de eliminación */}
            <DataTableDeleteDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete} onConfirm={confirmDeleteItem} />
        </div>
    );
}