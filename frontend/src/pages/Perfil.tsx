import { useEffect, useState, type FormEvent } from "react";
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

  const guardarCambios = async (event: FormEvent) => {
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
    return (
      <div className="perfil-state-page">
        <div className="perfil-loading-line" />
        <p>Cargando información del perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="perfil-state-page error">
        <strong>No fue posible cargar tu perfil.</strong>
        <p>{error || "No se encontró el perfil."}</p>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <header className="perfil-header">
        <div>
          <span className="perfil-kicker">
            SIGMA · CUENTA DE USUARIO
          </span>

          <h1>Mi perfil</h1>

          <p>
            Información de tu cuenta y datos personales.
          </p>
        </div>
      </header>

      <form
        className="perfil-content"
        onSubmit={guardarCambios}
      >
        <section className="perfil-identity-panel">
          <div className="perfil-identity-heading">
            <span className="perfil-section-label">
              IDENTIDAD
            </span>

            <span className="perfil-account-indicator">
              Cuenta
            </span>
          </div>

          <div className="perfil-identity-main">
            <div className="perfil-identity-code">
              {perfil.codigo}
            </div>

            <h2>
              {perfil.nombres} {perfil.apellidos}
            </h2>

            <span className="perfil-role">
              {perfil.rol}
            </span>
          </div>

          <div className="perfil-identity-info">
            <div>
              <span>CÓDIGO DE ACCESO</span>
              <strong>{perfil.codigo}</strong>
            </div>

            <div>
              <span>ROL ASIGNADO</span>
              <strong>{perfil.rol}</strong>
            </div>
          </div>
        </section>

        <section className="perfil-edit-panel">
          <div className="perfil-panel-heading">
            <div>
              <span className="perfil-section-label">
                DATOS PERSONALES
              </span>

              <h2>Información personal</h2>

              <p>
                Actualiza los datos que se muestran en tu cuenta.
              </p>
            </div>
          </div>

          <div className="perfil-form-grid">
            <div className="perfil-form-field">
              <label htmlFor="perfil-nombres">
                Nombres
              </label>

              <input
                id="perfil-nombres"
                type="text"
                value={nombres}
                onChange={(event) =>
                  setNombres(event.target.value)
                }
              />
            </div>

            <div className="perfil-form-field">
              <label htmlFor="perfil-apellidos">
                Apellidos
              </label>

              <input
                id="perfil-apellidos"
                type="text"
                value={apellidos}
                onChange={(event) =>
                  setApellidos(event.target.value)
                }
              />
            </div>
          </div>

          <div className="perfil-readonly-grid">
            <div className="perfil-readonly-field">
              <span>Código</span>
              <strong>{perfil.codigo}</strong>
            </div>

            <div className="perfil-readonly-field">
              <span>Rol</span>
              <strong>{perfil.rol}</strong>
            </div>
          </div>

          <div className="perfil-divider" />

          <div className="perfil-security-heading">
            <span className="perfil-section-label">
              SEGURIDAD
            </span>

            <p>
              Cambia tu contraseña solamente cuando sea necesario.
            </p>
          </div>

          <div className="perfil-password-field">
            <label htmlFor="perfil-contrasena">
              Nueva contraseña
            </label>

            <input
              id="perfil-contrasena"
              type="password"
              value={contrasena}
              onChange={(event) =>
                setContrasena(event.target.value)
              }
              placeholder="Dejar vacío para conservar la actual"
            />

            <small>
              El campo puede dejarse vacío para mantener tu
              contraseña actual.
            </small>
          </div>

          {(mensaje || error) && (
            <div
              className={
                mensaje
                  ? "perfil-feedback success"
                  : "perfil-feedback error"
              }
            >
              <strong>
                {mensaje
                  ? "Cambios guardados"
                  : "No se pudieron guardar los cambios"}
              </strong>

              <span>{mensaje || error}</span>
            </div>
          )}

          <div className="perfil-form-footer">
            <span>
              Los cambios se aplican a tu cuenta inmediatamente.
            </span>

            <button
              type="submit"
              className="perfil-save-button"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}