import { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Sparkles } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(email, password);
    } catch (error) {
      alert("Error al iniciar sesión. Verifica tus credenciales.");
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
              {isLoggingIn ? "Entrando..." : "Iniciar Sesión"}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-4">
              Protegido por Appwrite Cloud
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
