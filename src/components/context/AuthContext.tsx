import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkUser } = useAuthStore();

  // Comprobar si hay una sesión activa al abrir la app
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return <>{children}</>;
}

export const useAuth = useAuthStore;
