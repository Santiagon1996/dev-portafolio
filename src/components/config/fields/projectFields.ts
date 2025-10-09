import { FieldConfig } from "@components/molecules/DynamicForm";

export const projectFields: FieldConfig[] = [
    { name: "name", label: "Nombre del proyecto", type: "text" },
    { name: "description", label: "Descripción", type: "textarea" },
    { name: "startDate", label: "Fecha de inicio", type: "date" },
    { name: "endDate", label: "Fecha de fin", type: "date" },
    { name: "status", label: "Estado", type: "text" },
];
