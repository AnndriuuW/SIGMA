import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listarOcurrencias } from "../services/ocurrenciaService";
import type { Ocurrencia } from "../types/ocurrencia";

export default function Ocurrencias() {
  const [ocurrencias, setOcurrencias] = useState<Ocurrencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroLectura, setFiltroLectura] = useState("TODAS");

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
    </div>
  );
}
