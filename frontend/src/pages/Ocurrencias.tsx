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

    return ocurrencias.filter((ocurrencia) => {
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
        filtroTipo === "TODOS" ||
        ocurrencia.tipo === filtroTipo;

      const coincideLectura =
        filtroLectura === "TODAS" ||
        (filtroLectura === "NO_LEIDAS" && !ocurrencia.leida) ||
        (filtroLectura === "LEIDAS" && ocurrencia.leida);

      return coincideBusqueda && coincideTipo && coincideLectura;
    });
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
          <span className="ocurrencias-kicker">
            SIGMA · BITÁCORA OPERATIVA
          </span>

          <h1>Ocurrencias</h1>

          <p>
            Registro y consulta de novedades comunicadas dentro del
            sistema.
          </p>
        </div>

        <div className="ocurrencias-header-meta">
          <span>REGISTROS DISPONIBLES</span>
          <strong>{ocurrencias.length}</strong>
          <small>
            {noLeidas}{" "}
            {noLeidas === 1 ? "sin leer" : "sin leer"}
          </small>
        </div>
      </header>

      <section className="ocurrencias-overview">
        <div className="ocurrencias-overview-item ocurrencias-overview-total">
          <span>Total de ocurrencias</span>
          <strong>{ocurrencias.length}</strong>
          <small>Registros disponibles</small>
        </div>

        <div className="ocurrencias-overview-item ocurrencias-overview-unread">
          <span>No leídas</span>
          <strong>{noLeidas}</strong>
          <small>Requieren revisión</small>
        </div>

        <div className="ocurrencias-overview-item">
          <span>De unidad</span>
          <strong>{deUnidad}</strong>
          <small>Novedades asociadas a unidades</small>
        </div>

        <div className="ocurrencias-overview-item">
          <span>De recurso</span>
          <strong>{deRecurso}</strong>
          <small>Novedades asociadas a recursos</small>
        </div>
      </section>

      <section className="ocurrencias-panel">
        <div className="ocurrencias-panel-header">
          <div>
            <span className="ocurrencias-section-label">
              REGISTRO DE NOVEDADES
            </span>

            <h2>Bitácora de ocurrencias</h2>

            <p>
              Consulta las novedades registradas y su estado de lectura.
            </p>
          </div>

          <div className="ocurrencias-result-count">
            <strong>{ocurrenciasFiltradas.length}</strong>
            <span>
              {ocurrenciasFiltradas.length === 1
                ? "resultado"
                : "resultados"}
            </span>
          </div>
        </div>

        <div className="ocurrencias-toolbar">
          <div className="ocurrencias-search-wrapper">
            <span className="ocurrencias-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Buscar por descripción, informante, destinatario o recurso..."
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
            <div className="ocurrencias-table-wrapper">
              <table className="ocurrencias-table">
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>TIPO</th>
                    <th>RELACIONADO</th>
                    <th>DESCRIPCIÓN</th>
                    <th>INFORMANTE</th>
                    <th>DESTINATARIO</th>
                    <th>LECTURA</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {ocurrenciasFiltradas.map((ocurrencia) => (
                    <tr
                      key={ocurrencia.id}
                      className={
                        ocurrencia.leida
                          ? ""
                          : "ocurrencia-row-unread"
                      }
                    >
                      <td>
                        <div className="ocurrencia-date-cell">
                          <strong>
                            {new Date(
                              ocurrencia.fechaHora,
                            ).toLocaleDateString("es-PE")}
                          </strong>

                          <span>
                            {new Date(
                              ocurrencia.fechaHora,
                            ).toLocaleTimeString("es-PE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`ocurrencia-type ocurrencia-type-${ocurrencia.tipo.toLowerCase()}`}
                        >
                          <span className="ocurrencia-type-dot" />
                          {obtenerTipoTexto(ocurrencia.tipo)}
                        </span>
                      </td>

                      <td>
                        <div className="ocurrencia-related-cell">
                          <strong>
                            {obtenerRelacionado(ocurrencia)}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <div className="ocurrencia-description-cell">
                          <span>
                            {ocurrencia.descripcion}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="ocurrencia-person">
                          {ocurrencia.nombreInformante}
                        </span>
                      </td>

                      <td>
                        <span className="ocurrencia-person">
                          {ocurrencia.nombreDestinatario}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ocurrencia-reading ${
                            ocurrencia.leida
                              ? "ocurrencia-reading-read"
                              : "ocurrencia-reading-unread"
                          }`}
                        >
                          <span />
                          {ocurrencia.leida
                            ? "Leída"
                            : "No leída"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/ocurrencias/${ocurrencia.id}`}
                          className="ocurrencia-view-link"
                        >
                          Ver
                          <span>→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </div>
  );
}