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

  const [codigoEditando, setCodigoEditando] = useState<string | null>(null);

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

  const obtenerClaseRol = (rol: string) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "administrador";

      case "JEFE_MAQUINAS":
        return "jefe";

      case "PERSONAL_ADJUNTO":
        return "personal";

      case "BOMBERO":
        return "bombero";

      default:
        return "general";
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
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div className="usuarios-header-copy">
          <span className="usuarios-kicker">
            SIGMA · ADMINISTRACIÓN DEL SISTEMA
          </span>

          <div className="usuarios-title-row">
            <div>
              <h1>Usuarios</h1>

              <p>
                Gestión de cuentas, roles y acceso operativo al sistema.
              </p>
            </div>

            <div className="usuarios-record-summary">
              <span>REGISTROS</span>
              <strong>{usuarios.length}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="usuarios-primary-button"
          onClick={abrirCrearUsuario}
        >
          <span className="usuarios-primary-icon">+</span>
          Nuevo usuario
        </button>
      </div>

      <div className="usuarios-status-bar">
        <div className="usuarios-status-item">
          <span className="usuarios-status-dot total" />
          <div>
            <small>Total</small>
            <strong>{usuarios.length}</strong>
          </div>
        </div>

        <div className="usuarios-status-item">
          <span className="usuarios-status-dot activo" />
          <div>
            <small>Activos</small>
            <strong>{usuariosActivos}</strong>
          </div>
        </div>

        <div className="usuarios-status-item">
          <span className="usuarios-status-dot inactivo" />
          <div>
            <small>Inactivos</small>
            <strong>{usuariosInactivos}</strong>
          </div>
        </div>

        <div className="usuarios-status-divider" />

        <div className="usuarios-status-caption">
          <span>CONTROL DE ACCESO</span>
          <strong>
            {usuariosActivos} cuentas habilitadas actualmente
          </strong>
        </div>
      </div>

      <section className="usuarios-panel">
        <div className="usuarios-panel-header">
          <div>
            <span className="usuarios-section-label">
              DIRECTORIO DE PERSONAL
            </span>

            <h2>Usuarios registrados</h2>

            <p>
              Consulta, modifica o administra el estado de las cuentas.
            </p>
          </div>

          <div className="usuarios-result-count">
            <strong>{usuariosFiltrados.length}</strong>
            <span>resultado{usuariosFiltrados.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="usuarios-toolbar">
          <div className="usuarios-search">
            <span className="usuarios-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Buscar por código, nombre o rol..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />

            {busqueda && (
              <button
                type="button"
                className="usuarios-search-clear"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <div className="usuarios-filter-tabs">
            <button
              type="button"
              className={
                filtroEstado === "TODOS"
                  ? "usuarios-filter-tab active"
                  : "usuarios-filter-tab"
              }
              onClick={() => setFiltroEstado("TODOS")}
            >
              Todos
            </button>

            <button
              type="button"
              className={
                filtroEstado === "ACTIVOS"
                  ? "usuarios-filter-tab active"
                  : "usuarios-filter-tab"
              }
              onClick={() => setFiltroEstado("ACTIVOS")}
            >
              Activos
            </button>

            <button
              type="button"
              className={
                filtroEstado === "INACTIVOS"
                  ? "usuarios-filter-tab active"
                  : "usuarios-filter-tab"
              }
              onClick={() => setFiltroEstado("INACTIVOS")}
            >
              Inactivos
            </button>
          </div>
        </div>

        {cargando && (
          <div className="usuarios-state">
            <div className="usuarios-state-line" />
            <p>Cargando directorio de usuarios...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="usuarios-state error">
            <strong>No fue posible cargar el directorio.</strong>
            <p>{error}</p>

            <button
              type="button"
              className="usuarios-retry-button"
              onClick={cargarUsuarios}
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando &&
          !error &&
          usuariosFiltrados.length === 0 && (
            <div className="usuarios-state">
              <strong>No se encontraron usuarios</strong>
              <p>
                Prueba con otro criterio de búsqueda o cambia el filtro
                de estado.
              </p>
            </div>
          )}

        {!cargando &&
          !error &&
          usuariosFiltrados.length > 0 && (
            <div className="usuarios-table-wrapper">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>IDENTIFICACIÓN</th>
                    <th>PERSONAL</th>
                    <th>ROL OPERATIVO</th>
                    <th>ESTADO</th>
                    <th className="usuarios-table-action-head">
                      ACCIONES
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.codigo}>
                      <td>
                        <div className="usuarios-code-cell">
                          <div>
                            <strong>{usuario.codigo}</strong>
                            <span>ID de acceso</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="usuarios-person-cell">
                          <strong>
                            {usuario.nombres} {usuario.apellidos}
                          </strong>

                          <span>Cuenta de usuario SIGMA</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`usuarios-role-badge ${obtenerClaseRol(
                            usuario.rol,
                          )}`}
                        >
                          {obtenerNombreRol(usuario.rol)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            usuario.activo
                              ? "usuarios-state-badge active"
                              : "usuarios-state-badge inactive"
                          }
                        >
                          <span className="usuarios-state-badge-dot" />

                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td>
                        <div className="usuarios-actions">
                          <button
                            type="button"
                            className="usuarios-action edit"
                            onClick={() => abrirEditarUsuario(usuario)}
                          >
                            Editar
                          </button>

                          <span className="usuarios-action-separator" />

                          {usuario.activo ? (
                            <button
                              type="button"
                              className="usuarios-action danger"
                              onClick={() => handleDesactivar(usuario)}
                              disabled={
                                procesandoEstado === usuario.codigo
                              }
                            >
                              {procesandoEstado === usuario.codigo
                                ? "Procesando..."
                                : "Desactivar"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="usuarios-action activate"
                              onClick={() => handleActivar(usuario)}
                              disabled={
                                procesandoEstado === usuario.codigo
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
      </section>

      {mostrarFormulario && (
        <div className="usuarios-drawer-overlay" onMouseDown={cerrarFormulario}>
          <aside
            className="usuarios-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="usuarios-drawer-header">
              <div>
                <span className="usuarios-section-label">
                  {modoEdicion
                    ? "EDICIÓN DE CUENTA"
                    : "NUEVO REGISTRO"}
                </span>

                <h2>
                  {modoEdicion ? "Editar usuario" : "Nuevo usuario"}
                </h2>

                <p>
                  {modoEdicion
                    ? "Actualiza los datos y permisos de la cuenta."
                    : "Registra una nueva cuenta dentro de SIGMA."}
                </p>
              </div>

              <button
                type="button"
                className="usuarios-drawer-close"
                onClick={cerrarFormulario}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>

            <div className="usuarios-drawer-body">
              <div className="usuarios-form-section">
                <span className="usuarios-form-section-title">
                  IDENTIFICACIÓN
                </span>

                {!modoEdicion && (
                  <div className="usuarios-form-field">
                    <label htmlFor="usuario-codigo">Código</label>

                    <input
                      id="usuario-codigo"
                      type="text"
                      value={formulario.codigo}
                      onChange={(event) =>
                        actualizarCampo(
                          "codigo",
                          event.target.value.toUpperCase(),
                        )
                      }
                      disabled={guardando}
                      maxLength={20}
                      placeholder="Ej. BOM002"
                    />

                    <small>
                      Código único utilizado para iniciar sesión.
                    </small>
                  </div>
                )}

                {modoEdicion && (
                  <div className="usuarios-code-preview">
                    <span>Código de acceso</span>
                    <strong>{formulario.codigo}</strong>
                  </div>
                )}
              </div>

              <div className="usuarios-form-section">
                <span className="usuarios-form-section-title">
                  DATOS DEL PERSONAL
                </span>

                <div className="usuarios-form-grid">
                  <div className="usuarios-form-field">
                    <label htmlFor="usuario-nombres">Nombres</label>

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
                  </div>

                  <div className="usuarios-form-field">
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
                  </div>
                </div>
              </div>

              <div className="usuarios-form-section">
                <span className="usuarios-form-section-title">
                  ACCESO Y PERMISOS
                </span>

                <div className="usuarios-form-field">
                  <label htmlFor="usuario-rol">Rol</label>

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
                    <option value="">Selecciona un rol</option>

                    {ROLES.map((rol) => (
                      <option
                        key={rol.id}
                        value={rol.id}
                      >
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="usuarios-form-field">
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

                  <small>
                    {modoEdicion
                      ? "Solo completa este campo si deseas cambiarla."
                      : "La contraseña debe contener al menos 8 caracteres."}
                  </small>
                </div>

                {modoEdicion && (
                  <div className="usuarios-form-field">
                    <label htmlFor="usuario-estado">Estado</label>

                    <select
                      id="usuario-estado"
                      value={
                        formulario.activo
                          ? "ACTIVO"
                          : "INACTIVO"
                      }
                      onChange={(event) =>
                        actualizarCampo(
                          "activo",
                          event.target.value === "ACTIVO",
                        )
                      }
                      disabled={guardando}
                    >
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>

              {errorFormulario && (
                <div className="usuarios-form-error">
                  <strong>No se pudo guardar la cuenta.</strong>
                  <span>{errorFormulario}</span>
                </div>
              )}
            </div>

            <div className="usuarios-drawer-footer">
              <button
                type="button"
                className="usuarios-secondary-button"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="usuarios-save-button"
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
          </aside>
        </div>
      )}
    </div>
  );
}