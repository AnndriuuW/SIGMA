import api from "./api";
import type { Usuario } from "../types/usuario";

export const listarUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get<Usuario[]>("/usuarios");
  return response.data;
};

export const obtenerUsuario = async (
  codigo: string,
): Promise<Usuario> => {
  const response = await api.get<Usuario>(
    `/usuarios/${codigo}`,
  );

  return response.data;
};

export interface CrearUsuarioRequest {
  codigo: string;
  nombres: string;
  apellidos: string;
  contrasena: string;
  rolId: number;
}

export interface ActualizarUsuarioRequest {
  nombres: string;
  apellidos: string;
  contrasena?: string;
  rolId?: number;
  activo?: boolean;
}

export const crearUsuario = async (
  request: CrearUsuarioRequest,
): Promise<Usuario> => {
  const response = await api.post<Usuario>(
    "/usuarios",
    request,
  );

  return response.data;
};

export const actualizarUsuario = async (
  codigo: string,
  request: ActualizarUsuarioRequest,
): Promise<Usuario> => {
  const response = await api.put<Usuario>(
    `/usuarios/${codigo}`,
    request,
  );

  return response.data;
};

export const desactivarUsuario = async (
  codigo: string,
): Promise<void> => {
  await api.delete(`/usuarios/${codigo}`);
};

export const ROLES = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Jefe de Máquinas" },
  { id: 3, nombre: "Personal Adjunto" },
  { id: 4, nombre: "Bombero" },
] as const;