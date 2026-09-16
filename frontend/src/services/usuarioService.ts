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