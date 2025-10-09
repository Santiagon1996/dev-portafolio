"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateAdmin } from "@hooks/useAdmin";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

export const RegisterForm = () => {
    const router = useRouter();
    const { mutate, error, isSuccess, isPending } = useCreateAdmin();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });





    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> { }

    interface MutateOptions {
        onSuccess: () => void;
    }

    const handleSubmit = (e: HandleSubmitEvent) => {
        e.preventDefault();
        mutate(formData, {
            onSuccess: () => {
                // Redirige o muestra mensaje de éxito
                router.push("/login");
            },
        } as MutateOptions);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
            />
            <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
            />
            <Input
                name="password"
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
            />
            <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Registrar"}
            </Button>
            {error && <p className="text-red-500">Error: {error.message}</p>}
            {isSuccess && <p className="text-green-500">¡Administrador creado!</p>}
        </form>
    );
};