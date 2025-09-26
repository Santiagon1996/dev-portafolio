# Fullstack Portfolio

Este proyecto es un portafolio web fullstack desarrollado con **Next.js** y **TypeScript**, pensado para mostrar de manera profesional mis habilidades, proyectos y experiencia como desarrollador.

El objetivo principal es contar con una plataforma moderna, eficiente y escalable que permita:

- Presentar proyectos destacados con detalles técnicos y enlaces.
- Mostrar mi historial laboral y formación académica.
- Exhibir mis habilidades técnicas mediante un listado dinámico.
- Facilitar el contacto mediante un formulario funcional.
- Incorporar buenas prácticas de desarrollo web con tecnologías actuales como Tailwind CSS, Zustand para manejo de estado, y conexión a MongoDB con Mongoose.

El proyecto está estructurado para aprovechar el nuevo **App Router de Next.js**, implementando una arquitectura modular con carpetas para componentes, hooks, librerías y modelos de datos, facilitando el mantenimiento y la escalabilidad.

---

A lo largo del desarrollo, integro TypeScript para mejorar la calidad del código, detectar errores tempranamente y hacer el proyecto más profesional y confiable.

---

Si te interesa ver cómo están definidos los modelos de datos o cómo se conecta la aplicación con la base de datos, podés revisar la sección [Modelos de Datos y Uso de TypeScript](./#modelos-de-datos-y-uso-de-typescript-en-el-proyecto-fullstack-portfolio).

# Modelos de Datos y Uso de TypeScript en el Proyecto Fullstack Portfolio

Este documento explica cómo definimos los modelos (schemas) de la base de datos usando **Mongoose** junto con **TypeScript** para mejorar la robustez y calidad del código en nuestro proyecto Fullstack Portfolio.

---

## Definición de Schemas con Mongoose y TypeScript

En este proyecto usamos **Mongoose** para modelar nuestros datos y definir la estructura de cada colección en MongoDB. Cada modelo se define en un archivo separado bajo el directorio `/src/lib/models` o similar.

### ¿Qué es un Schema?

Un _Schema_ en Mongoose define la forma, tipos, validaciones y comportamiento de los documentos almacenados en una colección MongoDB. Por ejemplo, un esquema de "Blog" define qué campos tendrá cada blog post, qué campos son requeridos, y validaciones como longitud máxima o valores permitidos.

---

## Incorporación de TypeScript en los Schemas

Para aprovechar las ventajas de TypeScript, hicimos lo siguiente en cada modelo:

1. **Definir una interfaz (`IModel`)**:

   - Creamos una interfaz que extiende de `mongoose.Document` para definir claramente las propiedades y sus tipos.
   - Esto asegura que el esquema y el uso del modelo tengan tipos consistentes.

2. **Tipar el Schema con la interfaz**:

   - Usamos `new Schema<IModel>(...)` para indicar que el schema sigue la estructura definida en la interfaz.

3. **Tipar el Model**:
   - Al exportar el modelo, usamos `model<IModel>("ModelName", schema)` para que TypeScript conozca el tipo de datos que maneja el modelo.

---

## Ejemplo resumido:

```ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IExample extends Document {
  name: string;
  description?: string;
  createdAt?: Date;
}

const exampleSchema = new Schema<IExample>({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Example = models.Example || model<IExample>("Example", exampleSchema);

export { Example };
```
