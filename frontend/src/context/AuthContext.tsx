import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { login as loginService } from "../services/authService";
import type { LoginRequest, LoginResponse } from "../types/auth";

interface AuthContextType {
  usuario: LoginResponse | null;
  estaAutenticado: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("sigma_token");
    const usuarioGuardado = localStorage.getItem("sigma_usuario");

    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await loginService(credentials);

    localStorage.setItem("sigma_token", response.token);
    localStorage.setItem("sigma_usuario", JSON.stringify(response));

    setUsuario(response);
  };

  const logout = () => {
    localStorage.removeItem("sigma_token");
    localStorage.removeItem("sigma_usuario");

    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: usuario !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
