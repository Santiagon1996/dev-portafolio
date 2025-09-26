export const slugify = (text: { toString: () => string; }) => {
  return text
    .toString() // Asegura que sea una cadena
    .normalize("NFD") // Normaliza caracteres unicode (ej: 'é' a 'e')
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (acentos)
    .toLowerCase() // Convierte a minúsculas
    .trim() // Elimina espacios en blanco al principio y al final
    .replace(/\s+/g, "-") // Reemplaza espacios con guiones
    .replace(/[^\w-]+/g, "") // Elimina todos los caracteres no alfanuméricos excepto guiones
    .replace(/--+/g, "-"); // Reemplaza múltiples guiones con un solo guion
};
