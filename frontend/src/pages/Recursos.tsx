import { useEffect, useMemo, useState } from "react";

import { listarRecursos } from "../services/recursoService";
import type { EstadoRecurso, Recurso } from "../types/recurso";

type FiltroEstado = "TODOS" | EstadoRecurso;

function Recursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("TODOS");

  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await listarRecursos();

        setRecursos(data);
      } catch {
        setError("No se pudieron cargar los recursos.");
      } finally {
        setCargando(false);
      }
    };

    cargarRecursos();
  }, []);

  const recursosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

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
        recurso.nombreUbicacion.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [recursos, busqueda, filtroEstado]);

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

      </header>

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

          <div className="recursos-result-count">
            <strong>{recursosFiltrados.length}</strong>
            <span>
              {recursosFiltrados.length === 1
                ? "resultado"
                : "resultados"}
            </span>
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
              <span className="recursos-filter-count">{recursos.length}</span>
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
              <span className="recursos-filter-count">{operativos}</span>
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
              <span className="recursos-filter-count">{danados}</span>
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
              <span className="recursos-filter-count">{mantenimiento}</span>
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
                    </tr>
                  ))}

                  {recursosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
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
    </div>
  );
}

export default Recursos;
