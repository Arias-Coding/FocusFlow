import { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Sparkles, UserPlus } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch {
      const message = isSignUp
        ? "Error al crear la cuenta. El email podría estar en uso."
        : "Error al iniciar sesión. Verifica tus credenciales.";
      alert(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl rounded-[32px] animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">
            FocusFlow
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Tu espacio de enfoque personal
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl bg-muted/50 border-none h-12"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl bg-muted/50 border-none h-12"
              />
            </div>
            <Button
              className="w-full h-12 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoggingIn}
            >
              {isLoggingIn
                ? (isSignUp ? "Creando cuenta..." : "Entrando...")
                : (isSignUp ? "Crear Cuenta" : "Iniciar Sesión")
              }
              {isSignUp ? <UserPlus className="ml-2 h-4 w-4" /> : <LogIn className="ml-2 h-4 w-4" />}
            </Button>

            <div className="text-center mt-4">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-foreground"
                disabled={isLoggingIn}
              >
                {isSignUp
                  ? "¿Ya tienes cuenta? Inicia sesión"
                  : "¿No tienes cuenta? Regístrate"
                }
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-4">
              Protegido por Appwrite Cloud
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
