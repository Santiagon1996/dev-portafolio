"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import { DialogFooter } from "@components/ui/dialog";

export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "number" | "email" | "date" | "textarea" | "checkbox"; // Añadido 'checkbox' para booleano
    // Puedes añadir 'options' para select, etc.
}


interface DynamicFormProps<T extends Record<string, unknown>> {
    // Ítem actual para precargar el formulario (null si es creación)
    currentItem: T | null;
    // Configuración de los campos a renderizar
    fields: FieldConfig[];
    // Función de callback al enviar el formulario
    onSubmit: (data: Partial<T>) => void;
}

export function DynamicForm<T extends Record<string, unknown>>({
    currentItem,
    fields,
    onSubmit
}: DynamicFormProps<T>) {

    const [formData, setFormData] = useState<Partial<T>>({});

    // Sincroniza el estado local del formulario cuando currentItem cambie (edición/creación)
    useEffect(() => {
        // Inicializa el estado del formulario con los valores del ítem o vacío
        const initialFormState = fields.reduce((acc, field) => {
            const key = field.name;
            // Si hay un ítem actual, usa su valor, sino, usa un valor por defecto
            acc[key] = currentItem?.[key as keyof T] ?? (field.type === 'checkbox' ? false : "");
            return acc;
        }, {} as Record<string, unknown>) as Partial<T>;


        setFormData(initialFormState);
    }, [currentItem, fields]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let finalValue: unknown = value;

        if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            const parsed = parseFloat(value);
            finalValue = isNaN(parsed) ? "" : parsed; // Si no es número, usa string vacío
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Llama a la función de guardado con los datos del estado
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* //TODO: Mapear errores de validación de base de datos a los campos del formulario aquí, usando la respuesta del backend */}
            {fields.map((field) => (
                <div key={field.name} className="space-y-1">
                    <label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-300"
                    >
                        {field.label}
                    </label>

                    {/* Mapeo de tipos de campo a componentes de Shadcn */}
                    {field.type === "textarea" ? (
                        <Textarea
                            id={field.name}
                            name={field.name}
                            value={String(formData[field.name as keyof T] ?? "")}
                            onChange={handleChange}
                            className="bg-gray-800 border-gray-700 text-gray-200"
                            rows={4}
                        />
                    ) : field.type === "checkbox" ? (
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                id={field.name}
                                type="checkbox"
                                name={field.name}
                                checked={!!formData[field.name as keyof T]}
                                onChange={handleChange}
                                className="h-4 w-4 text-cyan-600 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor={field.name} className="text-sm text-gray-400">
                                {field.label}
                            </label>
                        </div>
                    ) : (
                        <Input
                            id={field.name}
                            type={field.type}
                            name={field.name}
                            value={String(formData[field.name as keyof T] ?? "")}
                            onChange={handleChange}
                            className="bg-gray-800 border-gray-700 text-gray-200"
                        />
                    )}

                    {/* Mensaje de error de validación */}
                    {/* {validationErrors[field.name] && (
                        <p className="text-xs text-red-500">{validationErrors[field.name]}</p>
                    )}  */}
                </div>
            ))}

            {/* Pie de diálogo con el botón de guardar */}
            <DialogFooter className="pt-4">
                <Button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                >
                    Guardar
                </Button>
            </DialogFooter>
        </form>
    );
}
