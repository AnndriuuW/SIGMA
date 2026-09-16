import { useEffect, useState } from "react";
import {
  actualizarPerfil,
  obtenerPerfil,
  type Perfil as PerfilData,
} from "../services/perfilService";

export default function Perfil() {

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        const data = await obtenerPerfil();

        setPerfil(data);
        setNombres(data.nombres);
        setApellidos(data.apellidos);
      } catch {
        setError("No se pudo cargar la información del perfil.");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const guardarCambios = async (event: React.FormEvent) => {
    event.preventDefault();

    setMensaje("");
    setError("");

    if (!nombres.trim() || !apellidos.trim()) {
      setError("Nombres y apellidos son obligatorios.");
      return;
    }

    try {
      setGuardando(true);

      const data = await actualizarPerfil({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        ...(contrasena.trim()
          ? { contrasena: contrasena.trim() }
          : {}),
      });

      setPerfil(data);
      setNombres(data.nombres);
      setApellidos(data.apellidos);
      setContrasena("");

      setMensaje("Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el perfil.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div>Cargando perfil...</div>;
  }

  if (!perfil) {
    return <div>{error || "No se encontró el perfil."}</div>;
  }

  return (
    <div>
      <h1>Mi perfil</h1>
      <p>
        Información de tu cuenta y datos personales.
      </p>

      <form onSubmit={guardarCambios}>
        <div>
          <label>Código</label>
          <input
            type="text"
            value={perfil.codigo}
            disabled
          />
        </div>

        <div>
          <label>Nombres</label>
          <input
            type="text"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
          />
        </div>

        <div>
          <label>Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
          />
        </div>

        <div>
          <label>Rol</label>
          <input
            type="text"
            value={perfil.rol}
            disabled
          />
        </div>

        <div>
          <label>Nueva contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Dejar vacío para no cambiarla"
          />
        </div>

        {mensaje && <p>{mensaje}</p>}
        {error && <p>{error}</p>}

        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}