import { FieldConfig } from "@components/molecules/DynamicForm";

export const educationFields: FieldConfig[] = [
    { name: "institution", label: "Institución", type: "text" },
    { name: "degree", label: "Título/Grado", type: "text" },
    { name: "field", label: "Campo de estudio", type: "text" },
    { name: "startDate", label: "Fecha de inicio", type: "date" },
    { name: "endDate", label: "Fecha de fin", type: "date" },
    { name: "description", label: "Descripción", type: "textarea" },
];
