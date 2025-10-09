import { FieldConfig } from "@components/molecules/DynamicForm";
/**
 * Define la estructura y el tipo de input para el formulario de gestión de Blogs.
 */
export const blogFields: FieldConfig[] = [
    { name: "title", label: "Título", type: "text" },
    { name: "content", label: "Contenido", type: "textarea" },
    { name: "tags", label: "Campos relacionados", type: "text" },
    { name: "author", label: "Autor", type: "text" },
    { name: "summary", label: "Resumen", type: "text" },
    { name: "viewCount", label: "Número de vistas", type: "number" },
];
