"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLogin } from "@hooks/useAdmin";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { AlertErrors } from "@components/molecules/AlertErrors";

export const LoginForm = () => {
    const router = useRouter();
    const { mutate, error, isSuccess, isPending } = useAdminLogin();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate(formData, {
            onSuccess: () => {
                router.push("/dashboard");
            },
        });
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
                name="password"
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
            />
            <Button type="submit" disabled={isPending}>
                {isPending ? "Ingresando..." : "Ingresar"}
            </Button>
            <AlertErrors error={error} />
            {isSuccess && <p className="text-green-500">¡Bienvenido!</p>}
        </form>
    );
};