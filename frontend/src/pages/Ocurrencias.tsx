import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import {
  crearOcurrencia,
  listarOcurrencias,
  type CrearOcurrenciaRequest,
} from "../services/ocurrenciaService";
import {
  listarDestinatariosOcurrencia,
  listarUsuarios,
} from "../services/usuarioService";
import { listarUnidades } from "../services/unidadService";
import { listarRecursos } from "../services/recursoService";
import type { Ocurrencia, TipoOcurrencia } from "../types/ocurrencia";
import type { Usuario } from "../types/usuario";
import type { Unidad } from "../types/unidad";
import type { Recurso } from "../types/recurso";

interface FormularioOcurrencia {
  tipo: TipoOcurrencia;
  descripcion: string;
  codigoDestinatario: string;
  idUnidad: string;
  idRecurso: string;
}

const formularioInicial: FormularioOcurrencia = {
  tipo: "GENERAL",
  descripcion: "",
  codigoDestinatario: "",
  idUnidad: "",
  idRecurso: "",
};

export default function Ocurrencias() {
  const [ocurrencias, setOcurrencias] = useState<Ocurrencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroLectura, setFiltroLectura] = useState("TODAS");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [destinatarios, setDestinatarios] = useState<Usuario[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(false);
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const cargarOcurrencias = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await listarOcurrencias();

        setOcurrencias(data);
      } catch {
        setError("No se pudieron cargar las ocurrencias.");
      } finally {
        setCargando(false);
      }
    };

    cargarOcurrencias();
  }, []);

  useEffect(() => {
    if (!modalAbierto) return;

    let vigente = true;

    const cargarOpciones = async () => {
      try {
        setCargandoOpciones(true);
        const cargarDestinatarios = async () => {
          try {
            const destinatariosData = await listarDestinatariosOcurrencia();
            if (destinatariosData.some((usuario) => usuario.activo)) {
              return destinatariosData;
            }
          } catch {
            // Compatibilidad con sesiones autorizadas para consultar usuarios.
          }

          return listarUsuarios();
        };

        const [usuariosData, unidadesData, recursosData] = await Promise.all([
          cargarDestinatarios(),
          listarUnidades(),
          listarRecursos(),
        ]);

        if (!vigente) return;

        const usuariosActivos = usuariosData
          .filter(
            (usuario) =>
              usuario.activo &&
              ["ADMINISTRADOR", "JEFE_MAQUINAS"].includes(usuario.rol),
          )
          .sort((a, b) => {
            if (a.rol === "JEFE_MAQUINAS") return -1;
            if (b.rol === "JEFE_MAQUINAS") return 1;
            return `${a.nombres} ${a.apellidos}`.localeCompare(
              `${b.nombres} ${b.apellidos}`,
              "es",
            );
          });
        setDestinatarios(usuariosActivos);
        setUnidades(unidadesData.filter((unidad) => unidad.activo));
        setRecursos(recursosData.filter((recurso) => recurso.activo));

        const jefeMaquinas = usuariosActivos.find(
          (usuario) => usuario.rol === "JEFE_MAQUINAS",
        );
        setFormulario((actual) => ({
          ...actual,
          codigoDestinatario:
            actual.codigoDestinatario ||
            jefeMaquinas?.codigo ||
            usuariosActivos[0]?.codigo ||
            "",
        }));
      } catch {
        if (vigente) {
          setErrorCrear("No se pudieron cargar las opciones del formulario.");
        }
      } finally {
        if (vigente) setCargandoOpciones(false);
      }
    };

    void cargarOpciones();
    return () => {
      vigente = false;
    };
  }, [modalAbierto]);

  const abrirFormulario = () => {
    setFormulario(formularioInicial);
    setErrorCrear("");
    setMensajeExito("");
    setModalAbierto(true);
  };

  const cerrarFormulario = () => {
    if (creando) return;
    setModalAbierto(false);
    setErrorCrear("");
  };

  const handleCrearOcurrencia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorCrear("");

    const request: CrearOcurrenciaRequest = {
      tipo: formulario.tipo,
      descripcion: formulario.descripcion.trim(),
      codigoDestinatario: formulario.codigoDestinatario,
    };

    if (formulario.tipo === "UNIDAD") {
      if (!formulario.idUnidad) {
        setErrorCrear("Selecciona la unidad relacionada.");
        return;
      }
      request.idUnidad = Number(formulario.idUnidad);
    }

    if (formulario.tipo === "RECURSO") {
      if (!formulario.idRecurso) {
        setErrorCrear("Selecciona el recurso relacionado.");
        return;
      }
      request.idRecurso = Number(formulario.idRecurso);
    }

    if (!request.descripcion || !request.codigoDestinatario) {
      setErrorCrear("Completa la descripción y el destinatario.");
      return;
    }

    try {
      setCreando(true);
      const creada = await crearOcurrencia(request);
      setOcurrencias((actuales) => [creada, ...actuales]);
      setMensajeExito("La ocurrencia se registró correctamente.");
      limpiarFiltros();
      setModalAbierto(false);
      setFormulario(formularioInicial);
    } catch (error) {
      const respuesta = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      setErrorCrear(
        respuesta.response?.data?.message ??
          respuesta.response?.data?.error ??
          "No se pudo registrar la ocurrencia. Intenta nuevamente.",
      );
    } finally {
      setCreando(false);
    }
  };

  const noLeidas = ocurrencias.filter(
    (ocurrencia) => !ocurrencia.leida,
  ).length;

  const deUnidad = ocurrencias.filter(
    (ocurrencia) => ocurrencia.tipo === "UNIDAD",
  ).length;

  const deRecurso = ocurrencias.filter(
    (ocurrencia) => ocurrencia.tipo === "RECURSO",
  ).length;

  const ocurrenciasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return ocurrencias
      .filter((ocurrencia) => {
        const coincideBusqueda =
          !texto ||
          ocurrencia.descripcion.toLowerCase().includes(texto) ||
          ocurrencia.nombreInformante.toLowerCase().includes(texto) ||
          ocurrencia.nombreDestinatario.toLowerCase().includes(texto) ||
          (ocurrencia.nombreUnidad ?? "")
            .toLowerCase()
            .includes(texto) ||
          (ocurrencia.codigoRecurso ?? "")
            .toLowerCase()
            .includes(texto);

        const coincideTipo =
          filtroTipo === "TODOS" || ocurrencia.tipo === filtroTipo;

        const coincideLectura =
          filtroLectura === "TODAS" ||
          (filtroLectura === "NO_LEIDAS" && !ocurrencia.leida) ||
          (filtroLectura === "LEIDAS" && ocurrencia.leida);

        return coincideBusqueda && coincideTipo && coincideLectura;
      })
      .sort(
        (a, b) =>
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
      );
  }, [ocurrencias, busqueda, filtroTipo, filtroLectura]);

  const obtenerTipoTexto = (tipo: string) => {
    switch (tipo) {
      case "GENERAL":
        return "General";
      case "UNIDAD":
        return "Unidad";
      case "RECURSO":
        return "Recurso";
      default:
        return tipo;
    }
  };

  const obtenerRolTexto = (rol: string) => {
    if (rol === "JEFE_MAQUINAS") return "Jefe de Máquinas";
    if (rol === "PERSONAL_ADJUNTO") return "Personal Adjunto";
    if (rol === "ADMINISTRADOR") return "Administrador";
    if (rol === "BOMBERO") return "Bombero";
    return rol.replace(/_/g, " ");
  };

  const obtenerRelacionado = (ocurrencia: Ocurrencia) => {
    if (ocurrencia.tipo === "UNIDAD") {
      return ocurrencia.nombreUnidad ?? "—";
    }

    if (ocurrencia.tipo === "RECURSO") {
      return ocurrencia.codigoRecurso ?? "—";
    }

    return "General";
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroTipo("TODOS");
    setFiltroLectura("TODAS");
  };

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    filtroTipo !== "TODOS" ||
    filtroLectura !== "TODAS";

  return (
    <div className="ocurrencias-page">
      <header className="ocurrencias-header">
        <div className="ocurrencias-heading">
          <span className="ocurrencias-kicker">BITÁCORA OPERATIVA</span>

          <h1>Ocurrencias</h1>

          <p>
            Registro y consulta de novedades comunicadas dentro del
            sistema.
          </p>
        </div>
      </header>

      <section className="ocurrencias-overview">
        <div className="ocurrencias-overview-item">
          <span>Total</span>
          <strong>{ocurrencias.length}</strong>
          <small>Registros</small>
        </div>

        <div className="ocurrencias-overview-item ocurrencias-overview-unread">
          <span>No leídas</span>
          <strong>{noLeidas}</strong>
          <small>Por revisar</small>
        </div>

        <div className="ocurrencias-overview-item">
          <span>De unidad</span>
          <strong>{deUnidad}</strong>
          <small>Asociadas a unidades</small>
        </div>

        <div className="ocurrencias-overview-item">
          <span>De recurso</span>
          <strong>{deRecurso}</strong>
          <small>Asociadas a recursos</small>
        </div>
      </section>

      <section className="ocurrencias-panel">
        <div className="ocurrencias-panel-header">
          <div>
            <span className="ocurrencias-section-label">
              REGISTRO CRONOLÓGICO
            </span>

            <h2>Novedades comunicadas</h2>

            <p>
              Consulta las novedades registradas y su estado de lectura.
            </p>
          </div>

          <button
            type="button"
            className="ocurrencias-new-button"
            onClick={abrirFormulario}
          >
            <Plus size={18} aria-hidden="true" />
            Nueva ocurrencia
          </button>
        </div>

        <div className="ocurrencias-toolbar">
          <div className="ocurrencias-search-wrapper">
            <span className="ocurrencias-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Buscar por descripción, informante, destinatario o recurso..."
              aria-label="Buscar ocurrencias"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              className="ocurrencias-search"
            />

            {busqueda && (
              <button
                type="button"
                className="ocurrencias-search-clear"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <div className="ocurrencias-filter-group">
            <select
              value={filtroTipo}
              onChange={(event) =>
                setFiltroTipo(event.target.value)
              }
              className="ocurrencias-filter"
              aria-label="Filtrar por tipo"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="GENERAL">General</option>
              <option value="UNIDAD">Unidad</option>
              <option value="RECURSO">Recurso</option>
            </select>

            <select
              value={filtroLectura}
              onChange={(event) =>
                setFiltroLectura(event.target.value)
              }
              className="ocurrencias-filter"
              aria-label="Filtrar por lectura"
            >
              <option value="TODAS">Todas</option>
              <option value="NO_LEIDAS">No leídas</option>
              <option value="LEIDAS">Leídas</option>
            </select>

            {hayFiltrosActivos && (
              <button
                type="button"
                className="ocurrencias-clear-filters"
                onClick={limpiarFiltros}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {mensajeExito && (
          <div className="ocurrencias-success" role="status">
            {mensajeExito}
          </div>
        )}

        {cargando && (
          <div className="ocurrencias-state">
            <div className="ocurrencias-state-line" />

            <strong>Cargando ocurrencias</strong>

            <span>
              Obteniendo información de la bitácora...
            </span>
          </div>
        )}

        {!cargando && error && (
          <div className="ocurrencias-state ocurrencias-state-error">
            <strong>No se pudo cargar la información</strong>
            <span>{error}</span>
          </div>
        )}

        {!cargando &&
          !error &&
          ocurrenciasFiltradas.length === 0 && (
            <div className="ocurrencias-state ocurrencias-empty">
              <strong>
                {hayFiltrosActivos
                  ? "No se encontraron coincidencias"
                  : "No hay ocurrencias registradas"}
              </strong>

              <span>
                {hayFiltrosActivos
                  ? "Prueba con otros términos o filtros."
                  : "No existen novedades disponibles para mostrar."}
              </span>

              {hayFiltrosActivos && (
                <button
                  type="button"
                  className="ocurrencias-empty-button"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

        {!cargando &&
          !error &&
          ocurrenciasFiltradas.length > 0 && (
            <div className="ocurrencias-list">
              {ocurrenciasFiltradas.map((ocurrencia) => {
                const fecha = new Date(ocurrencia.fechaHora);

                return (
                  <article
                    key={ocurrencia.id}
                    className={`ocurrencia-entry ${
                      ocurrencia.leida ? "is-read" : "is-unread"
                    }`}
                  >
                    <div className="ocurrencia-entry-date">
                      <strong>
                        {fecha.toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                      <span>
                        {fecha.toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hourCycle: "h23",
                        })}
                      </span>
                    </div>

                    <div className="ocurrencia-entry-content">
                      <div className="ocurrencia-entry-heading">
                        <div className="ocurrencia-entry-tags">
                          <span
                            className={`ocurrencia-type ocurrencia-type-${ocurrencia.tipo.toLowerCase()}`}
                          >
                            <span className="ocurrencia-type-dot" />
                            {obtenerTipoTexto(ocurrencia.tipo)}
                          </span>
                          <span
                            className={`ocurrencia-reading ${
                              ocurrencia.leida
                                ? "ocurrencia-reading-read"
                                : "ocurrencia-reading-unread"
                            }`}
                          >
                            <span />
                            {ocurrencia.leida ? "Leída" : "No leída"}
                          </span>
                        </div>

                        <Link
                          to={`/ocurrencias/${ocurrencia.id}`}
                          className="ocurrencia-view-link"
                        >
                          <span className="ocurrencia-view-link-label">
                            Ver detalle
                          </span>
                          <span className="ocurrencia-view-link-arrow" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </div>

                      <p className="ocurrencia-entry-description">
                        {ocurrencia.descripcion}
                      </p>

                      <div className="ocurrencia-entry-details">
                        <div>
                          <span>RELACIONADO</span>
                          <strong>{obtenerRelacionado(ocurrencia)}</strong>
                        </div>
                        <div>
                          <span>INFORMANTE</span>
                          <strong>{ocurrencia.nombreInformante}</strong>
                        </div>
                        <div>
                          <span>DESTINATARIO</span>
                          <strong>{ocurrencia.nombreDestinatario}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>

      {modalAbierto && (
        <div
          className="ocurrencia-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarFormulario();
          }}
        >
          <form
            className="ocurrencia-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ocurrencia-modal-title"
            onSubmit={handleCrearOcurrencia}
          >
            <header className="ocurrencia-modal-header">
              <div>
                <span>REGISTRO MANUAL</span>
                <h2 id="ocurrencia-modal-title">Nueva ocurrencia</h2>
                <p>Comunica una novedad para que el destinatario pueda revisarla.</p>
              </div>
              <button
                type="button"
                className="ocurrencia-modal-close"
                onClick={cerrarFormulario}
                disabled={creando}
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </header>

            <div className="ocurrencia-modal-body">
              {cargandoOpciones ? (
                <div className="ocurrencia-form-loading" role="status">
                  Cargando destinatarios y elementos disponibles…
                </div>
              ) : (
                <>
                  <label htmlFor="ocurrencia-tipo">Tipo de ocurrencia</label>
                  <select
                    id="ocurrencia-tipo"
                    value={formulario.tipo}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        tipo: event.target.value as TipoOcurrencia,
                        idUnidad: "",
                        idRecurso: "",
                      }))
                    }
                    disabled={creando}
                  >
                    <option value="GENERAL">General</option>
                    <option value="UNIDAD">Relacionada con una unidad</option>
                    <option value="RECURSO">Relacionada con un recurso</option>
                  </select>

                  {formulario.tipo === "UNIDAD" && (
                    <>
                      <label htmlFor="ocurrencia-unidad">Unidad relacionada</label>
                      <select
                        id="ocurrencia-unidad"
                        value={formulario.idUnidad}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            idUnidad: event.target.value,
                          }))
                        }
                        disabled={creando}
                      >
                        <option value="">Selecciona una unidad</option>
                        {unidades.map((unidad) => (
                          <option key={unidad.id} value={unidad.id}>
                            {unidad.nombre} · {unidad.indicativo}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {formulario.tipo === "RECURSO" && (
                    <>
                      <label htmlFor="ocurrencia-recurso">Recurso relacionado</label>
                      <select
                        id="ocurrencia-recurso"
                        value={formulario.idRecurso}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            idRecurso: event.target.value,
                          }))
                        }
                        disabled={creando}
                      >
                        <option value="">Selecciona un recurso</option>
                        {recursos.map((recurso) => (
                          <option key={recurso.id} value={recurso.id}>
                            {recurso.codigo} · {recurso.nombre}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  <label htmlFor="ocurrencia-destinatario">Destinatario</label>
                  <select
                    id="ocurrencia-destinatario"
                    value={formulario.codigoDestinatario}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        codigoDestinatario: event.target.value,
                      }))
                    }
                    disabled={creando || destinatarios.length === 0}
                  >
                    <option value="">Selecciona quién recibirá la ocurrencia</option>
                    {destinatarios.map((destinatario) => (
                      <option key={destinatario.codigo} value={destinatario.codigo}>
                        {destinatario.nombres} {destinatario.apellidos} ·{" "}
                        {obtenerRolTexto(destinatario.rol)}
                      </option>
                    ))}
                  </select>
                  {destinatarios.length === 0 && (
                    <p className="ocurrencia-form-hint">
                      No hay destinatarios activos disponibles.
                    </p>
                  )}

                  <label htmlFor="ocurrencia-descripcion">Descripción</label>
                  <textarea
                    id="ocurrencia-descripcion"
                    value={formulario.descripcion}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        descripcion: event.target.value,
                      }))
                    }
                    placeholder="Describe brevemente la novedad…"
                    maxLength={2000}
                    rows={5}
                    disabled={creando}
                  />
                  <span className="ocurrencia-description-count">
                    {formulario.descripcion.length}/2000 caracteres
                  </span>
                </>
              )}

              {errorCrear && (
                <p className="ocurrencia-form-error" role="alert">
                  {errorCrear}
                </p>
              )}
            </div>

            <footer className="ocurrencia-modal-footer">
              <button
                type="button"
                className="ocurrencia-modal-cancel"
                onClick={cerrarFormulario}
                disabled={creando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ocurrencia-modal-submit"
                disabled={creando || cargandoOpciones}
              >
                {creando ? "Registrando…" : "Registrar ocurrencia"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
