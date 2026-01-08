import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { type Models, ID } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Comprobar si hay una sesión activa al abrir la app
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    // En Appwrite Cloud moderno, esto crea una sesión de email/password
    await account.createEmailPasswordSession(email, pass);
    const session = await account.get();
    setUser(session);
  };

  const signup = async (email: string, pass: string) => {
    // Crear cuenta de usuario
    await account.create(ID.unique(), email, pass);
    // Crear sesión automáticamente después de crear la cuenta
    await account.createEmailPasswordSession(email, pass);
    const session = await account.get();
    setUser(session);
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
