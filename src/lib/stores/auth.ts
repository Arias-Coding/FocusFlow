import { create } from "zustand";
import { account } from "@/lib/appwrite";
import { type Models, ID } from "appwrite";

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  checkUser: async () => {
    try {
      const session = await account.get();
      set({ user: session });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, pass: string) => {
    // En Appwrite Cloud moderno, esto crea una sesión de email/password
    await account.createEmailPasswordSession(email, pass);
    const session = await account.get();
    set({ user: session });
  },

  signup: async (email: string, pass: string) => {
    // Crear cuenta de usuario
    await account.create(ID.unique(), email, pass);
    // Crear sesión automáticamente después de crear la cuenta
    await account.createEmailPasswordSession(email, pass);
    const session = await account.get();
    set({ user: session });
  },

  logout: async () => {
    await account.deleteSession("current");
    set({ user: null });
  },
}));