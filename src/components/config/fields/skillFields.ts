import { FieldConfig } from "@components/molecules/DynamicForm";

export const skillFields: FieldConfig[] = [
    { name: "name", label: "Nombre de la habilidad", type: "text" },
    { name: "level", label: "Nivel", type: "text" },
    { name: "description", label: "Descripción", type: "textarea" },
];
