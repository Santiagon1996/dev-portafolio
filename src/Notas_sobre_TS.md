# Notas sobre TS

## 📌 ¿Qué es TypeScript?

Es un superconjunto de JavaScript que añade tipos estáticos. Significa que el código es más predecible y menos propenso a errores.

```ts
let nombre: string = "Luis";
let edad: number = 25;
let activo: boolean = true;
let algo: any = "Lo que sea"; // evita usar `any` cuando puedas

// Arrays
let numeros: number[] = [1, 2, 3];
let palabras: string[] = ["hola", "mundo"];

// Objetos
let usuario: { nombre: string; edad: number } = {
  nombre: "Ana",
  edad: 28,
};
```

## 🔧 Funciones tipadas

```ts
function saludar(nombre: string): string {
  return `Hola, ${nombre}`;
}

const suma = (a: number, b: number): number => {
  return a + b;
};
```

## ❓ Diferencia entre `interface` y `type` en TypeScript

### 1️⃣ interface

```ts
interface Persona {
  nombre: string;
  edad: number;
}

const usuario: Persona = {
  nombre: "Carlos",
  edad: 30,
};
```

✅ Puede ser extendida con `extends`:

```ts
interface Empleado extends Persona {
  puesto: string;
}
```

✅ Puede ser declarada varias veces y se fusionan:

```ts
interface Persona {
  genero: string;
}
```

### 2️⃣ type

```ts
type Persona = {
  nombre: string;
  edad: number;
};

type ID = string | number;

type Coordenadas = [number, number];
```

✅ Puedes hacer uniones e intersecciones fácilmente:

```ts
type Empleado = Persona & {
  puesto: string;
};

type Estado = "activo" | "inactivo" | "pendiente";
```

❌ No se puede declarar dos veces el mismo `type`.

## 🧭 Cuándo usar `interface` o `type`

Usa `interface` para:

- Objetos simples
- Props
- Clases
- Extensiones comunes

Usa `type` si necesitas:

- Uniones (`|`)
- Tipar arrays, tuplas, funciones, primitivas
- Composición más avanzada

## 🧪 Ejemplo práctico

```ts
// Interface
interface Animal {
  nombre: string;
}

interface Perro extends Animal {
  raza: string;
}

// Type
type Gato = {
  nombre: string;
  raza: string;
};

type Mascota = Perro | Gato;
```

# 🧩 ¿Qué significa que TypeScript es un "compilador" y que al cliente llega solo JavaScript?

### 1️⃣ TypeScript no se ejecuta directamente en el navegador ni en Node.js

El navegador y Node.js solo entienden JavaScript.

TypeScript es un lenguaje que añade tipos y características extra, pero no es nativamente ejecutable.

### 2️⃣ Proceso de compilación (transpilación)

Cuando escribes código en `.ts` o `.tsx`, el compilador de TypeScript lo analiza y:

- Verifica que todo el código respete las reglas de tipos.
- Detecta errores en tiempo de compilación (antes de ejecutar el programa).
- Transforma (o transpila) el código TS en código JavaScript estándar que el navegador o Node puede entender.

### 3️⃣ Resultado final: solo JS

El archivo `.ts` o `.tsx` se convierte en un `.js` limpio.

Este JS no contiene información de tipos, porque los tipos solo sirven para la fase de compilación.

Por eso, en producción, solo se despliega JS.

### Ejemplo simple

````ts
// archivo.ts (TypeScript)
function saludar(nombre: string) {
  return `Hola, ${nombre.toUpperCase()}`;
}

# ❓ ¿Qué significa el `?` en TypeScript?

Es el operador de propiedad opcional (optional property).

Cuando ves algo así:

```ts
interface Persona {
  nombre: string;
  edad?: number;  // <-- la propiedad "edad" es opcional
}

---

## 🧩 ¿Cómo funciona?

- Si la propiedad no está marcada con `?`, es obligatoria.
- Si la propiedad tiene `?`, es opcional y puede no estar presente.
- Si no está presente, su valor es considerado `undefined`.

---

## Ejemplo práctico

```ts
interface Persona {
  nombre: string;
  edad?: number;
}

const p1: Persona = { nombre: "Ana", edad: 25 };  // válido
const p2: Persona = { nombre: "Luis" };           // también válido (edad no está)
const p3: Persona = { edad: 30 };                  // error: falta nombre obligatorio

## 🚀 Uso común en React: Props opcionales

```tsx
type ButtonProps = {
  label: string;
  disabled?: boolean;  // Opcional, puede venir o no
};

const Button = ({ label, disabled }: ButtonProps) => (
  <button disabled={disabled}>{label}</button>
);

## 🔧 También en funciones: parámetros opcionales

```ts
function saludar(nombre: string, saludo?: string) {
  console.log(`${saludo ?? "Hola"}, ${nombre}`);
}

saludar("Ana");                // "Hola, Ana"
saludar("Ana", "Buenos días"); // "Buenos días, Ana"

## ⚠️ Nota importante sobre tipos con `?`

La propiedad con `?` es equivalente a que pueda ser el tipo o `undefined`.

```ts
interface Persona {
  edad?: number;
}
// Es equivalente a:
interface Persona {
  edad: number | undefined;
}
````

# ❓ ¿Qué es `unknown`?

`unknown` es el tipo más seguro que acepta cualquier valor, pero no te permite usarlo directamente sin antes verificar su tipo.

Es como decir: “No sé qué tipo tiene esta variable, puede ser cualquier cosa, y quiero que seas cuidadoso antes de usarla.”

---

## 🆚 Diferencia entre `any` y `unknown`

| Característica         | `any`                             | `unknown`                                |
| ---------------------- | --------------------------------- | ---------------------------------------- |
| Acepta cualquier valor | Sí                                | Sí                                       |
| Permite acceso directo | Sí, sin restricciones             | No, debes hacer chequeos antes de usarlo |
| Seguridad de tipos     | Ninguna, pierde toda la seguridad | Alta, obliga a validar antes de usar     |

---

## Ejemplo con `any`

````ts
let valor: any;

valor = 5;
valor.toUpperCase();  // No da error en TS, pero falla en runtime porque 5 no tiene toUpperCase

## Ejemplo con `unknown`

```ts
let valor: unknown;

valor = 5;
valor.toUpperCase();  // Error de compilación: Object is of type 'unknown'

if (typeof valor === "string") {
  console.log(valor.toUpperCase()); // Seguro, porque confirmamos que es string
}
````

## 🧠 ¿Cuándo usar `unknown`?

- Cuando recibes datos de fuentes externas (APIs, inputs, etc.) y no sabes el tipo exacto.
- Cuando quieres que el código sea más seguro y evitar errores en tiempo de ejecución.
- Es una mejor práctica frente a usar `any`, porque obliga a validar.

---

## Resumen rápido

```ts
let x: unknown = 10;
x = "hola"; // válido
x = true; // válido

// Pero para usarlo:
if (typeof x === "string") {
  console.log(x.toUpperCase());
}
```

## 🧩 Arrays en TypeScript

En TypeScript, puedes declarar arrays con tipos específicos para los elementos que contienen, por ejemplo:

```ts
let numeros: number[] = [1, 2, 3];
let palabras: string[] = ["hola", "mundo"];
```

## ⚙️ Uso de métodos comunes en arrays tipados

Los métodos estándar de JavaScript (`push`, `map`, `filter`, etc.) funcionan igual, pero TypeScript te protege con tipos.

### 1. push

Añade un elemento al final del array.

```ts
let numeros: number[] = [1, 2, 3];
numeros.push(4); // Válido
numeros.push("5"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

### 2. map

Transforma cada elemento y crea un nuevo array con el resultado.

```ts
let palabras: string[] = ["hola", "mundo"];

const mayusculas = palabras.map((palabra) => palabra.toUpperCase());
// TypeScript infiere que 'mayusculas' es string[]
```

### 3. filter

Filtra elementos que cumplan una condición.

```ts
let numeros: number[] = [1, 2, 3, 4, 5];

const pares = numeros.filter((num) => num % 2 === 0);
// 'pares' es number[]
```

### 👀 Inferencia de tipos en callbacks

TypeScript sabe que dentro de los callbacks (como en map, filter, etc.) el tipo es el de los elementos del array:

```ts
numeros.map((num: number) => num * 2);
```

Pero no necesitas poner explícitamente el tipo si el array ya está tipado, TypeScript lo infiere.

🧪 Ejemplo completo

```ts
type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

let productos: Producto[] = [
  { id: 1, nombre: "Camisa", precio: 20 },
  { id: 2, nombre: "Pantalón", precio: 30 },
];

// push con objeto válido
productos.push({ id: 3, nombre: "Zapatos", precio: 50 });

// map para obtener nombres
const nombres = productos.map((p) => p.nombre); // string[]

// filter para precios mayores a 25
const caros = productos.filter((p) => p.precio > 25); // Producto[]
```

## 🔤 ¿Qué significa la palabra clave Record en TypeScript?

Record es un tipo utilitario (utility type) integrado en TypeScript que te permite construir objetos con claves y valores tipados de forma genérica.

### 📦 Sintaxis general:

```ts
Record<Clave, Valor>;
```

Traducción práctica:

“Un objeto donde las claves son del tipo Clave, y los valores son del tipo Valor.”

### 🔍 Ejemplo básico

```ts
type Usuario = Record<string, number>;
```

Significa:
🗂️ Un objeto donde cada propiedad es un string, y su valor es un number.

```ts
const edades: Usuario = {
  ana: 28,
  juan: 30,
  carlos: 35,
};
```

### ✅ Ejemplo más claro con claves específicas

```ts
type Rol = "admin" | "editor" | "viewer";

const permisos: Record<Rol, boolean> = {
  admin: true,
  editor: true,
  viewer: false,
};
```

Aquí Record asegura que:

El objeto tiene exactamente esas claves

Los valores deben ser boolean

### 🧩 Comparación equivalente (sin Record)

```ts
type Permisos = {
  admin: boolean;
  editor: boolean;
  viewer: boolean;
};
```

Record es simplemente una forma genérica y reutilizable de hacer eso mismo.

## 🛠️ ¿Por qué usar Record?

Te ahorra escribir estructuras manuales.

Es muy útil cuando quieres mapear un conjunto conocido de claves a un tipo de valor.

Se combina muy bien con enums, strings literales, o tipos de unión.

### 🔁 Ejemplo dinámico

```ts
const contadores: Record<string, number> = {};

contadores["clics"] = 1;
contadores["likes"] = 5;
contadores[123] = 10; // ❌ Error, clave debe ser string
```

## 🎯 Record en construcción dinámica de objetos

`Record<string, unknown>` es especialmente útil cuando necesitas construir un objeto dinámicamente donde:

- Las **claves** pueden ser cualquier string
- Los **valores** pueden ser de cualquier tipo

### ⚙️ Ejemplo práctico - Filtros para MongoDB

```ts
// Construcción dinámica de filtros
const filter: Record<string, unknown> = {};

// Se van agregando propiedades condicionalmente:
if (isPublished !== undefined) filter.isPublished = isPublished; // boolean
if (tags && tags.length > 0) filter.tags = { $in: tags }; // objeto MongoDB
if (author) filter.author = author; // string

// Resultado final puede ser:
// {} (objeto vacío)
// { isPublished: true }
// { tags: { $in: ["javascript", "react"] }, author: "Juan" }
// { isPublished: true, tags: { $in: ["tech"] }, author: "Ana" }
```

### 🆚 Comparación de alternativas

```ts
// ❌ Con any (peligroso, sin verificación de tipos)
const filter: any = {};
filter.cualquierCosa = "sin control"; // TypeScript no se queja

// ❌ Con unknown (muy restrictivo)
const filter: unknown = {};
filter.isPublished = true; // ❌ Error! unknown no permite agregar propiedades

// ✅ Con Record<string, unknown> (perfecto balance)
const filter: Record<string, unknown> = {};
filter.isPublished = true; // ✅ OK - clave string, valor any
filter.tags = { $in: ["tech"] }; // ✅ OK - clave string, valor objeto
filter[123] = "error"; // ❌ Error! 123 no es string
```

### 💡 ¿Por qué `unknown` como valor?

- `unknown` es más seguro que `any`
- Permite cualquier tipo de valor (boolean, string, object, array, etc.)
- Te obliga a verificar el tipo antes de usar el valor (si es necesario)
- Perfecto para casos donde los valores pueden ser variados (como filtros de MongoDB)

### 🚀 Casos de uso comunes

```ts
// Configuración dinámica
const config: Record<string, unknown> = {};
config.debug = true; // boolean
config.port = 3000; // number
config.database = { host: "localhost" }; // object

// Respuesta de API flexible
const apiResponse: Record<string, unknown> = {
  status: "success", // string
  data: [1, 2, 3], // array
  metadata: { total: 100 }, // object
};

// Formulario dinámico
const formData: Record<string, unknown> = {};
formData.email = "user@email.com"; // string
formData.age = 25; // number
formData.preferences = ["tech", "js"]; // array
```
