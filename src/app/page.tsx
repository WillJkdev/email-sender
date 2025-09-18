import { MainContent } from "@/components/email/MainContent";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Bienvenida */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-balance">
              ¡Bienvenido, {session.user.name}!
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Has iniciado sesión exitosamente en tu aplicación
            </p>
          </div>

          {/* Información del usuario */}
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || ""}
                  />
                  <AvatarFallback className="text-lg">
                    {session.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{session.user.name}</CardTitle>
              <CardDescription>{session.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground">
                Cuenta verificada con Google
              </div>
            </CardContent>
          </Card>

          {/* Contenido adicional */}
          <MainContent />
        </div>
      </main>
    </div>
  );
}
