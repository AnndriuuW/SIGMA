import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import {
  actualizarRecurso,
  crearRecurso,
  desactivarRecurso,
  listarRecursos,
  type RecursoPayload,
} from "../services/recursoService";
import { listarUbicaciones } from "../services/ubicacionService";
import { listarTiposRecurso } from "../services/tipoRecursoService";
import type { EstadoRecurso, Recurso } from "../types/recurso";
import type { Ubicacion } from "../types/ubicacion";
import type { TipoRecurso } from "../types/tipoRecurso";

type FiltroEstado = "TODOS" | EstadoRecurso;

interface FormularioRecurso {
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  longitud: string;
  estado: EstadoRecurso;
  idTipoRecurso: string;
  idUbicacion: string;
}

const formularioInicial: FormularioRecurso = {
  codigo: "",
  nombre: "",
  marca: "",
  modelo: "",
  numeroSerie: "",
  longitud: "",
  estado: "OPERATIVO",
  idTipoRecurso: "",
  idUbicacion: "",
};

const mensajeError = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const respuesta = error.response;
    if (
      typeof respuesta === "object" &&
      respuesta !== null &&
      "data" in respuesta
    ) {
      const datos = respuesta.data;
      if (
        typeof datos === "object" &&
        datos !== null &&
        "message" in datos &&
        typeof datos.message === "string"
      ) {
        return datos.message;
      }
    }
  }
  return fallback;
};

function Recursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [tiposRecurso, setTiposRecurso] = useState<TipoRecurso[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [recursoProcesando, setRecursoProcesando] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recursoEditando, setRecursoEditando] = useState<Recurso | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioRecurso>(formularioInicial);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("TODOS");

  const cargarRecursos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      const [recursosCargados, ubicacionesCargadas] = await Promise.all([
        listarRecursos(),
        listarUbicaciones().catch(() => [] as Ubicacion[]),
      ]);
      setRecursos(recursosCargados);
      setUbicaciones(ubicacionesCargadas);
    } catch (cargaError) {
      setError(mensajeError(cargaError, "No se pudieron cargar los recursos."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarRecursos();
  }, [cargarRecursos]);

  const abrirFormulario = async (recurso?: Recurso) => {
    setRecursoEditando(recurso ?? null);
    setFormulario(
      recurso
        ? {
            codigo: recurso.codigo,
            nombre: recurso.nombre,
            marca: recurso.marca,
            modelo: recurso.modelo ?? "",
            numeroSerie: recurso.numeroSerie ?? "",
            longitud: recurso.longitud ?? "",
            estado: recurso.estado,
            idTipoRecurso: String(recurso.idTipoRecurso),
            idUbicacion: String(recurso.idUbicacion),
          }
        : formularioInicial,
    );
    setErrorFormulario("");
    setMostrarFormulario(true);
    setCargandoCatalogos(true);
    setTiposRecurso([]);
    setUbicaciones([]);

    try {
      const [tipos, ubicacionesActivas] = await Promise.all([
        listarTiposRecurso(),
        listarUbicaciones(),
      ]);
      setTiposRecurso(tipos);
      setUbicaciones(ubicacionesActivas);
    } catch (catalogoError) {
      setErrorFormulario(
        mensajeError(catalogoError, "No se pudieron cargar tipos y ubicaciones."),
      );
    } finally {
      setCargandoCatalogos(false);
    }
  };

  const cerrarFormulario = () => {
    if (guardando) return;
    setMostrarFormulario(false);
    setRecursoEditando(null);
    setFormulario(formularioInicial);
    setErrorFormulario("");
  };

  const handleGuardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setErrorFormulario("");

    const payload: RecursoPayload = {
      codigo: formulario.codigo.trim(),
      nombre: formulario.nombre.trim(),
      marca: formulario.marca.trim(),
      modelo: formulario.modelo.trim() || null,
      numeroSerie: formulario.numeroSerie.trim() || null,
      longitud: formulario.longitud.trim() || null,
      estado: formulario.estado,
      idTipoRecurso: Number(formulario.idTipoRecurso),
      idUbicacion: Number(formulario.idUbicacion),
    };

    try {
      if (recursoEditando) {
        await actualizarRecurso(recursoEditando.id, payload);
      } else {
        await crearRecurso(payload);
      }
      await cargarRecursos();
      setMostrarFormulario(false);
      setRecursoEditando(null);
    } catch (guardadoError) {
      setErrorFormulario(
        mensajeError(guardadoError, "No se pudo guardar el recurso."),
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (recurso: Recurso) => {
    if (!window.confirm(`¿Deseas eliminar el recurso ${recurso.codigo}?`)) return;

    setRecursoProcesando(recurso.id);
    setError("");
    try {
      await desactivarRecurso(recurso.id);
      await cargarRecursos();
    } catch (eliminacionError) {
      setError(mensajeError(eliminacionError, "No se pudo eliminar el recurso."));
    } finally {
      setRecursoProcesando(null);
    }
  };

  const obtenerNombreUnidad = useCallback((idUbicacion: number) => {
    const ubicacion = ubicaciones.find((item) => item.id === idUbicacion);
    if (!ubicacion) return "Unidad no disponible";
    return ubicacion.nombreUnidad ?? "Compañía";
  }, [ubicaciones]);

  const recursosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const nombreUnidad = (recurso: Recurso) =>
      obtenerNombreUnidad(recurso.idUbicacion);

    return recursos.filter((recurso) => {
      const coincideEstado =
        filtroEstado === "TODOS" ||
        recurso.estado === filtroEstado;

      const coincideBusqueda =
        texto === "" ||
        recurso.codigo.toLowerCase().includes(texto) ||
        recurso.nombre.toLowerCase().includes(texto) ||
        recurso.marca.toLowerCase().includes(texto) ||
        recurso.nombreTipoRecurso.toLowerCase().includes(texto) ||
        recurso.nombreUbicacion.toLowerCase().includes(texto) ||
        nombreUnidad(recurso).toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [recursos, busqueda, filtroEstado, obtenerNombreUnidad]);

  const operativos = recursos.filter(
    (recurso) => recurso.estado === "OPERATIVO",
  ).length;

  const danados = recursos.filter(
    (recurso) => recurso.estado === "DANADO",
  ).length;

  const mantenimiento = recursos.filter(
    (recurso) => recurso.estado === "EN_MANTENIMIENTO",
  ).length;

  return (
    <div className="recursos-page">
      <header className="recursos-header">
        <div className="recursos-heading">
          <span className="recursos-kicker">INVENTARIO DE LA COMPAÑÍA</span>

          <h1>Recursos</h1>

          <p>
            Consulta y seguimiento del equipamiento registrado en las
            ubicaciones de la compañía.
          </p>
        </div>
        <button
          type="button"
          className="recursos-add-button"
          onClick={() => void abrirFormulario()}
        >
          <Plus size={18} />
          <span>Nuevo recurso</span>
        </button>
      </header>

      <section className="recursos-overview" aria-label="Resumen de recursos">
        <article className="recursos-overview-total">
          <span className="recursos-overview-icon">
            <Package size={21} strokeWidth={2} />
          </span>
          <div className="recursos-overview-total-content">
            <span className="recursos-overview-total-label">REGISTRO GENERAL</span>
            <strong>{recursos.length}</strong>
            <span className="recursos-overview-caption">Recursos registrados</span>
          </div>
        </article>

        <article className="recursos-overview-card recursos-overview-operativo">
          <span className="recursos-overview-icon">
            <CheckCircle2 size={20} strokeWidth={2} />
          </span>
          <div>
            <span>Operativos</span>
            <strong>{operativos}</strong>
          </div>
        </article>

        <article className="recursos-overview-card recursos-overview-mantenimiento">
          <span className="recursos-overview-icon">
            <Wrench size={20} strokeWidth={2} />
          </span>
          <div>
            <span>En mantenimiento</span>
            <strong>{mantenimiento}</strong>
          </div>
        </article>

        <article className="recursos-overview-card recursos-overview-danado">
          <span className="recursos-overview-icon">
            <AlertTriangle size={20} strokeWidth={2} />
          </span>
          <div>
            <span>Dañados</span>
            <strong>{danados}</strong>
          </div>
        </article>
      </section>

      <section className="recursos-panel">
        <div className="recursos-panel-header">
          <div>
            <span className="recursos-section-label">
              INVENTARIO DE RECURSOS
            </span>

            <h2>Equipamiento registrado</h2>

            <p>
              Consulta por código, nombre, tipo o ubicación.
            </p>
          </div>

        </div>

        <div className="recursos-toolbar">
          <div className="recursos-search-wrapper">
            <span className="recursos-search-icon">⌕</span>

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              aria-label="Buscar recursos"
              placeholder="Buscar recurso, código, tipo o ubicación..."
              className="recursos-search"
            />

            {busqueda && (
              <button
                type="button"
                className="recursos-search-clear"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <div className="recursos-filters" role="group" aria-label="Filtrar por estado">
            <button
              type="button"
              aria-pressed={filtroEstado === "TODOS"}
              className={
                filtroEstado === "TODOS"
                  ? "recursos-filter active"
                  : "recursos-filter"
              }
              onClick={() => setFiltroEstado("TODOS")}
            >
              Todos
            </button>

            <button
              type="button"
              aria-pressed={filtroEstado === "OPERATIVO"}
              className={
                filtroEstado === "OPERATIVO"
                  ? "recursos-filter active"
                  : "recursos-filter"
              }
              onClick={() => setFiltroEstado("OPERATIVO")}
            >
              Operativos
            </button>

            <button
              type="button"
              aria-pressed={filtroEstado === "DANADO"}
              className={
                filtroEstado === "DANADO"
                  ? "recursos-filter active"
                  : "recursos-filter"
              }
              onClick={() => setFiltroEstado("DANADO")}
            >
              Dañados
            </button>

            <button
              type="button"
              aria-pressed={filtroEstado === "EN_MANTENIMIENTO"}
              className={
                filtroEstado === "EN_MANTENIMIENTO"
                  ? "recursos-filter active"
                  : "recursos-filter"
              }
              onClick={() =>
                setFiltroEstado("EN_MANTENIMIENTO")
              }
            >
              En mantenimiento
            </button>
          </div>
        </div>

        {cargando && (
          <div className="recursos-state">
            <div className="recursos-state-line" />
            <strong>Cargando recursos</strong>
            <span>Obteniendo información del sistema...</span>
          </div>
        )}

        {error && (
          <div className="recursos-state recursos-state-error">
            <strong>No se pudo cargar la información</strong>
            <span>{error}</span>
          </div>
        )}

        {!cargando && !error && (
          <div className="recursos-table-container">
            <div className="resources-table-wrapper">
              <table className="resources-table">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>RECURSO</th>
                    <th>TIPO</th>
                    <th>UBICACIÓN</th>
                    <th>ESTADO</th>
                    <th className="recursos-actions-heading">ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {recursosFiltrados.map((recurso) => (
                    <tr key={recurso.id}>
                      <td>
                        <span className="recursos-code">
                          {recurso.codigo}
                        </span>
                      </td>

                      <td>
                        <div className="recursos-resource-cell">
                          <strong>{recurso.nombre}</strong>

                          <span>
                            {recurso.marca}
                            {recurso.modelo
                              ? ` · ${recurso.modelo}`
                              : ""}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="recursos-type">
                          {recurso.nombreTipoRecurso}
                        </span>
                      </td>

                      <td>
                        <div className="recursos-location-cell">
                          <strong>{recurso.nombreUbicacion}</strong>
                          <span>{obtenerNombreUnidad(recurso.idUbicacion)}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`recursos-status-chip recursos-status-${recurso.estado.toLowerCase()}`}
                        >
                          <span className="recursos-status-dot" />
                          {recurso.estado.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <div className="recursos-row-actions">
                          <button
                            type="button"
                            className="recursos-row-action"
                            aria-label={`Editar ${recurso.nombre}`}
                            title="Editar recurso"
                            disabled={recursoProcesando === recurso.id}
                            onClick={() => void abrirFormulario(recurso)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="recursos-row-action recursos-row-action-delete"
                            aria-label={`Eliminar ${recurso.nombre}`}
                            title="Eliminar recurso"
                            disabled={recursoProcesando === recurso.id}
                            onClick={() => void handleEliminar(recurso)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {recursosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="recursos-table-empty"
                      >
                        <strong>No se encontraron recursos</strong>
                        <span>
                          Prueba con otro término de búsqueda o cambia
                          el filtro de estado.
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {mostrarFormulario && (
        <div
          className="recursos-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarFormulario();
          }}
        >
          <section
            className="recursos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recursos-modal-title"
          >
            <header className="recursos-modal-header">
              <div>
                <span>{recursoEditando ? "ACTUALIZAR REGISTRO" : "NUEVO REGISTRO"}</span>
                <h2 id="recursos-modal-title">
                  {recursoEditando ? "Editar recurso" : "Agregar recurso"}
                </h2>
              </div>
              <button
                type="button"
                className="recursos-modal-close"
                aria-label="Cerrar formulario"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleGuardar}>
              <div className="recursos-modal-body">
                {cargandoCatalogos ? (
                  <div className="recursos-form-loading">Cargando tipos y ubicaciones...</div>
                ) : (
                  <div className="recursos-form-grid">
                    <label>
                      Código
                      <input
                        required
                        maxLength={30}
                        value={formulario.codigo}
                        onChange={(event) => setFormulario({ ...formulario, codigo: event.target.value })}
                        placeholder="Ej. H-001"
                      />
                    </label>
                    <label>
                      Nombre del recurso
                      <input
                        required
                        maxLength={100}
                        value={formulario.nombre}
                        onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })}
                        placeholder="Ej. Manguera contra incendio"
                      />
                    </label>
                    <label>
                      Marca
                      <input
                        required
                        maxLength={80}
                        value={formulario.marca}
                        onChange={(event) => setFormulario({ ...formulario, marca: event.target.value })}
                        placeholder="Marca"
                      />
                    </label>
                    <label>
                      Modelo
                      <input
                        maxLength={80}
                        value={formulario.modelo}
                        onChange={(event) => setFormulario({ ...formulario, modelo: event.target.value })}
                        placeholder="Opcional"
                      />
                    </label>
                    <label>
                      Número de serie
                      <input
                        maxLength={100}
                        value={formulario.numeroSerie}
                        onChange={(event) => setFormulario({ ...formulario, numeroSerie: event.target.value })}
                        placeholder="Opcional"
                      />
                    </label>
                    <label>
                      Longitud / medida
                      <input
                        maxLength={20}
                        value={formulario.longitud}
                        onChange={(event) => setFormulario({ ...formulario, longitud: event.target.value })}
                        placeholder="Ej. 30 m"
                      />
                    </label>
                    <label>
                      Tipo de recurso
                      <select
                        required
                        value={formulario.idTipoRecurso}
                        onChange={(event) => setFormulario({ ...formulario, idTipoRecurso: event.target.value })}
                        disabled={cargandoCatalogos || tiposRecurso.length === 0}
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposRecurso.map((tipo) => (
                          <option value={tipo.id} key={tipo.id}>{tipo.nombre}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Ubicación
                      <select
                        required
                        value={formulario.idUbicacion}
                        onChange={(event) => setFormulario({ ...formulario, idUbicacion: event.target.value })}
                        disabled={cargandoCatalogos || ubicaciones.length === 0}
                      >
                        <option value="">Seleccionar ubicación</option>
                        {ubicaciones.filter((ubicacion) => ubicacion.activo).map((ubicacion) => (
                          <option value={ubicacion.id} key={ubicacion.id}>
                            {ubicacion.nombre}{ubicacion.nombreUnidad ? ` · ${ubicacion.nombreUnidad}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Estado
                      <select
                        value={formulario.estado}
                        onChange={(event) => setFormulario({ ...formulario, estado: event.target.value as EstadoRecurso })}
                      >
                        <option value="OPERATIVO">Operativo</option>
                        <option value="EN_MANTENIMIENTO">En mantenimiento</option>
                        <option value="DANADO">Dañado</option>
                      </select>
                    </label>
                  </div>
                )}
                {errorFormulario && (
                  <div className="recursos-form-error" role="alert">{errorFormulario}</div>
                )}
                {!cargandoCatalogos && tiposRecurso.length === 0 && (
                  <div className="recursos-form-error" role="alert">
                    No hay tipos de recurso disponibles. Registra un tipo antes de continuar.
                  </div>
                )}
                {!cargandoCatalogos && ubicaciones.length === 0 && (
                  <div className="recursos-form-error" role="alert">
                    No hay ubicaciones activas disponibles para asignar el recurso.
                  </div>
                )}
              </div>
              <footer className="recursos-modal-footer">
                <button
                  type="button"
                  className="recursos-modal-cancel"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="recursos-modal-submit"
                  disabled={guardando || cargandoCatalogos || tiposRecurso.length === 0 || ubicaciones.length === 0}
                >
                  <Save size={16} />
                  {guardando ? "Guardando..." : "Guardar recurso"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Recursos;
