import { FieldConfig } from "@components/molecules/DynamicForm";

export const experienceFields: FieldConfig[] = [
    { name: "company", label: "Empresa", type: "text" },
    { name: "role", label: "Rol/Cargo", type: "text" },
    { name: "startDate", label: "Fecha de inicio", type: "date" },
    { name: "endDate", label: "Fecha de fin", type: "date" },
    { name: "description", label: "Descripción", type: "textarea" },
];
