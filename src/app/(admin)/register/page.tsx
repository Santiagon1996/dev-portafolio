import { RegisterForm } from "@components/organism/RegisterForm";

export const metadata = {
    title: "Registro de Usuario | Portafolio Dev",
    description: "Regístrate para acceder a funciones exclusivas.",
};

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <RegisterForm />
        </main>
    );
}