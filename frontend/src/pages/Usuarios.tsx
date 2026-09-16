import { useEffect, useMemo, useState } from "react";

import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  ROLES,
} from "../services/usuarioService";

import type { Usuario } from "../types/usuario";

interface FormularioUsuario {
  codigo: string;
  nombres: string;
  apellidos: string;
  contrasena: string;
  rolId: number | "";
  activo: boolean;
}

const formularioInicial: FormularioUsuario = {
  codigo: "",
  nombres: "",
  apellidos: "",
  contrasena: "",
  rolId: "",
  activo: true,
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [procesandoEstado, setProcesandoEstado] = useState<string | null>(
    null,
  );

  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [codigoEditando, setCodigoEditando] = useState<string | null>(
    null,
  );

  const [formulario, setFormulario] =
    useState<FormularioUsuario>(formularioInicial);

  const [errorFormulario, setErrorFormulario] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudieron cargar los usuarios.";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const usuariosActivos = usuarios.filter(
    (usuario) => usuario.activo,
  ).length;

  const usuariosInactivos = usuarios.filter(
    (usuario) => !usuario.activo,
  ).length;

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const coincideBusqueda =
        !texto ||
        usuario.codigo.toLowerCase().includes(texto) ||
        usuario.nombres.toLowerCase().includes(texto) ||
        usuario.apellidos.toLowerCase().includes(texto) ||
        usuario.rol.toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === "TODOS" ||
        (filtroEstado === "ACTIVOS" && usuario.activo) ||
        (filtroEstado === "INACTIVOS" && !usuario.activo);

      return coincideBusqueda && coincideEstado;
    });
  }, [usuarios, busqueda, filtroEstado]);

  const obtenerNombreRol = (rol: string) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "Administrador";

      case "JEFE_MAQUINAS":
        return "Jefe de Máquinas";

      case "PERSONAL_ADJUNTO":
        return "Personal Adjunto";

      case "BOMBERO":
        return "Bombero";

      default:
        return rol;
    }
  };

  const obtenerRolId = (rol: string) => {
    return (
      ROLES.find(
        (item) => item.nombre === obtenerNombreRol(rol),
      )?.id ?? ""
    );
  };

  const abrirCrearUsuario = () => {
    setModoEdicion(false);
    setCodigoEditando(null);
    setFormulario(formularioInicial);
    setErrorFormulario("");
    setMostrarFormulario(true);
  };

  const abrirEditarUsuario = (usuario: Usuario) => {
    setModoEdicion(true);
    setCodigoEditando(usuario.codigo);

    setFormulario({
      codigo: usuario.codigo,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      contrasena: "",
      rolId: obtenerRolId(usuario.rol),
      activo: usuario.activo,
    });

    setErrorFormulario("");
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    if (guardando) return;

    setMostrarFormulario(false);
    setModoEdicion(false);
    setCodigoEditando(null);
    setFormulario(formularioInicial);
    setErrorFormulario("");
  };

  const actualizarCampo = (
    campo: keyof FormularioUsuario,
    valor: string | number | boolean,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardarUsuario = async () => {
    if (!formulario.nombres.trim()) {
      setErrorFormulario("Los nombres son obligatorios.");
      return;
    }

    if (!formulario.apellidos.trim()) {
      setErrorFormulario("Los apellidos son obligatorios.");
      return;
    }

    if (!modoEdicion && !formulario.codigo.trim()) {
      setErrorFormulario("El código es obligatorio.");
      return;
    }

    if (!modoEdicion && !formulario.contrasena.trim()) {
      setErrorFormulario("La contraseña es obligatoria.");
      return;
    }

    if (!modoEdicion && formulario.contrasena.length < 8) {
      setErrorFormulario(
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (
      modoEdicion &&
      formulario.contrasena &&
      formulario.contrasena.length < 8
    ) {
      setErrorFormulario(
        "La nueva contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (formulario.rolId === "") {
      setErrorFormulario("Selecciona un rol.");
      return;
    }

    try {
      setGuardando(true);
      setErrorFormulario("");
      setError("");

      if (modoEdicion && codigoEditando) {
        await actualizarUsuario(codigoEditando, {
          nombres: formulario.nombres.trim(),
          apellidos: formulario.apellidos.trim(),
          contrasena: formulario.contrasena.trim() || undefined,
          rolId: formulario.rolId,
          activo: formulario.activo,
        });
      } else {
        await crearUsuario({
          codigo: formulario.codigo.trim(),
          nombres: formulario.nombres.trim(),
          apellidos: formulario.apellidos.trim(),
          contrasena: formulario.contrasena,
          rolId: formulario.rolId,
        });
      }

      await cargarUsuarios();
      cerrarFormulario();
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudo guardar el usuario.";

      setErrorFormulario(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async (usuario: Usuario) => {
    const confirmar = window.confirm(
      `¿Deseas desactivar al usuario ${usuario.codigo}?`,
    );

    if (!confirmar) return;

    try {
      setProcesandoEstado(usuario.codigo);
      setError("");

      await desactivarUsuario(usuario.codigo);

      await cargarUsuarios();
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudo desactivar el usuario.";

      setError(mensaje);
    } finally {
      setProcesandoEstado(null);
    }
  };

  const handleActivar = async (usuario: Usuario) => {
    const confirmar = window.confirm(
      `¿Deseas activar al usuario ${usuario.codigo}?`,
    );

    if (!confirmar) return;

    try {
      setProcesandoEstado(usuario.codigo);
      setError("");

      await actualizarUsuario(usuario.codigo, {
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rolId: obtenerRolId(usuario.rol) as number,
        activo: true,
      });

      await cargarUsuarios();
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudo activar el usuario.";

      setError(mensaje);
    } finally {
      setProcesandoEstado(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">GESTIÓN DEL SISTEMA</p>

          <h1>Usuarios</h1>

          <p className="page-description">
            Administración de usuarios y sus roles dentro de SIGMA.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={abrirCrearUsuario}
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total</span>
          <strong>{usuarios.length}</strong>
        </div>

        <div className="summary-card">
          <span>Activos</span>
          <strong>{usuariosActivos}</strong>
        </div>

        <div className="summary-card">
          <span>Inactivos</span>
          <strong>{usuariosInactivos}</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Registro de usuarios</h2>

            <p>
              Consulta y administra los usuarios registrados en
              el sistema.
            </p>
          </div>
        </div>

        <div className="table-filters">
          <input
            type="text"
            placeholder="Buscar por código, nombre o rol..."
            value={busqueda}
            onChange={(event) =>
              setBusqueda(event.target.value)
            }
            className="table-search"
          />

          <select
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(event.target.value)
            }
            className="table-filter-select"
          >
            <option value="TODOS">Todos</option>
            <option value="ACTIVOS">Activos</option>
            <option value="INACTIVOS">Inactivos</option>
          </select>
        </div>

        {cargando && (
          <div className="empty-state">
            <p>Cargando usuarios...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        )}

        {!cargando &&
          !error &&
          usuariosFiltrados.length === 0 && (
            <div className="empty-state">
              <p>No se encontraron usuarios.</p>
            </div>
          )}

        {!cargando &&
          !error &&
          usuariosFiltrados.length > 0 && (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.codigo}>
                      <td>
                        <strong>{usuario.codigo}</strong>
                      </td>

                      <td>
                        {usuario.nombres}{" "}
                        {usuario.apellidos}
                      </td>

                      <td>
                        {obtenerNombreRol(usuario.rol)}
                      </td>

                      <td>
                        {usuario.activo
                          ? "Activo"
                          : "Inactivo"}
                      </td>

                      <td>
                        <div className="user-table-actions">
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() =>
                              abrirEditarUsuario(usuario)
                            }
                          >
                            Editar
                          </button>

                          {usuario.activo ? (
                            <button
                              type="button"
                              className="table-action-button danger"
                              onClick={() =>
                                handleDesactivar(usuario)
                              }
                              disabled={
                                procesandoEstado ===
                                usuario.codigo
                              }
                            >
                              {procesandoEstado === usuario.codigo
                                ? "Procesando..."
                                : "Desactivar"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="table-action-button"
                              onClick={() =>
                                handleActivar(usuario)
                              }
                              disabled={
                                procesandoEstado ===
                                usuario.codigo
                              }
                            >
                              {procesandoEstado === usuario.codigo
                                ? "Procesando..."
                                : "Activar"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="page-eyebrow">
                  {modoEdicion
                    ? "EDICIÓN DE USUARIO"
                    : "NUEVO REGISTRO"}
                </p>

                <h2>
                  {modoEdicion
                    ? "Editar usuario"
                    : "Nuevo usuario"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {!modoEdicion && (
                <>
                  <label htmlFor="usuario-codigo">
                    Código
                  </label>

                  <input
                    id="usuario-codigo"
                    type="text"
                    value={formulario.codigo}
                    onChange={(event) =>
                      actualizarCampo(
                        "codigo",
                        event.target.value,
                      )
                    }
                    disabled={guardando}
                    maxLength={20}
                    placeholder="Ej. BOM002"
                  />
                </>
              )}

              <label htmlFor="usuario-nombres">
                Nombres
              </label>

              <input
                id="usuario-nombres"
                type="text"
                value={formulario.nombres}
                onChange={(event) =>
                  actualizarCampo(
                    "nombres",
                    event.target.value,
                  )
                }
                disabled={guardando}
                maxLength={100}
                placeholder="Nombres"
              />

              <label htmlFor="usuario-apellidos">
                Apellidos
              </label>

              <input
                id="usuario-apellidos"
                type="text"
                value={formulario.apellidos}
                onChange={(event) =>
                  actualizarCampo(
                    "apellidos",
                    event.target.value,
                  )
                }
                disabled={guardando}
                maxLength={100}
                placeholder="Apellidos"
              />

              <label htmlFor="usuario-contrasena">
                {modoEdicion
                  ? "Nueva contraseña"
                  : "Contraseña"}
              </label>

              <input
                id="usuario-contrasena"
                type="password"
                value={formulario.contrasena}
                onChange={(event) =>
                  actualizarCampo(
                    "contrasena",
                    event.target.value,
                  )
                }
                disabled={guardando}
                minLength={8}
                maxLength={255}
                placeholder={
                  modoEdicion
                    ? "Dejar vacío para mantener la actual"
                    : "Mínimo 8 caracteres"
                }
              />

              <label htmlFor="usuario-rol">
                Rol
              </label>

              <select
                id="usuario-rol"
                value={formulario.rolId}
                onChange={(event) =>
                  actualizarCampo(
                    "rolId",
                    event.target.value
                      ? Number(event.target.value)
                      : "",
                  )
                }
                disabled={guardando}
              >
                <option value="">
                  Selecciona un rol
                </option>

                {ROLES.map((rol) => (
                  <option
                    key={rol.id}
                    value={rol.id}
                  >
                    {rol.nombre}
                  </option>
                ))}
              </select>

              {modoEdicion && (
                <>
                  <label htmlFor="usuario-estado">
                    Estado
                  </label>

                  <select
                    id="usuario-estado"
                    value={formulario.activo ? "ACTIVO" : "INACTIVO"}
                    onChange={(event) =>
                      actualizarCampo(
                        "activo",
                        event.target.value === "ACTIVO",
                      )
                    }
                    disabled={guardando}
                  >
                    <option value="ACTIVO">
                      Activo
                    </option>

                    <option value="INACTIVO">
                      Inactivo
                    </option>
                  </select>
                </>
              )}

              {errorFormulario && (
                <p className="form-error">
                  {errorFormulario}
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                className="primary-button"
                onClick={guardarUsuario}
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : modoEdicion
                    ? "Guardar cambios"
                    : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}