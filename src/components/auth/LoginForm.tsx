"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
        <CardDescription className="text-muted-foreground">
          Inicia sesión con tu cuenta de Google para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-12 text-base font-medium bg-transparent hover:bg-transparent hover:cursor-pointer"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Redirigiendo...
            </>
          ) : (
            <>
              <FcGoogle className="mr-2 h-5 w-5" />
              Continuar con Google
            </>
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Al continuar, aceptas nuestros términos de servicio y política de
          privacidad
        </div>
      </CardContent>
    </Card>
  );
}
