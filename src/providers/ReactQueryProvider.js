"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Exportamos un componente que contendrá el proveedor
export default function ReactQueryProvider({ children }) {
  // Inicializamos el QueryClient en el estado.
  // Esto asegura que el cliente no se recree en cada renderizado.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configuraciones globales útiles
            staleTime: 1000 * 60 * 5, // 5 minutos antes de que la consulta sea "stale" (caducada)
            refetchOnWindowFocus: false, // Evita refetching innecesario al cambiar de pestaña
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
