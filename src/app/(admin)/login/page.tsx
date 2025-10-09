import { LoginForm } from "@components/organism/LoginForm";


export const metadata = {
    title: "Login de Usuario | Portafolio Dev",
    description: "Login para acceder a funciones exclusivas.",
};

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <LoginForm />
        </main>
    );
}