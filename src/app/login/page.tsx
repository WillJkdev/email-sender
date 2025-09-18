import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/lib/auth/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Ingresa tus credenciales para acceder a tu cuenta",
};

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
