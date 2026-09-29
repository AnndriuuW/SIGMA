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

  const porcentajeOperativo =
    recursos.length > 0
      ? Math.round((operativos / recursos.length) * 100)
      : 0;

  return (
    <div className="recursos-page">
      <header className="recursos-header">
        <div className="recursos-heading">
          <span className="recursos-kicker">
            SIGMA · CONTROL DE EQUIPAMIENTO
          </span>

          <h1>Recursos</h1>

          <p>
            Consulta y seguimiento del equipamiento registrado en las
            ubicaciones de la compañía.
          </p>
        </div>

        <div className="recursos-status-box">
          <span className="recursos-status-label">
            REGISTRO ACTUAL
          </span>

          <strong>{recursos.length}</strong>

          <span>
            {recursos.length === 1 ? "recurso registrado" : "recursos registrados"}
          </span>
        </div>
      </header>

      <section className="recursos-overview">
        <div className="recursos-overview-item recursos-overview-total">
          <div>
            <span>Total de recursos</span>
            <strong>{recursos.length}</strong>
          </div>

          <small>Equipamiento registrado</small>
        </div>

        <div className="recursos-overview-item">
          <div>
            <span>Operativos</span>
            <strong>{operativos}</strong>
          </div>

          <small>
            {porcentajeOperativo}% del total
          </small>
        </div>

        <div className="recursos-overview-item">
          <div>
            <span>En mantenimiento</span>
            <strong>{mantenimiento}</strong>
          </div>

          <small>Requieren seguimiento</small>
        </div>

        <div className="recursos-overview-item">
          <div>
            <span>Dañados</span>
            <strong>{danados}</strong>
          </div>

          <small>Fuera de condición operativa</small>
        </div>
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

          <div className="recursos-filters">
            <button
              type="button"
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
              className={
                filtroEstado === "EN_MANTENIMIENTO"
                  ? "recursos-filter active"
                  : "recursos-filter"
              }
              onClick={() =>
                setFiltroEstado("EN_MANTENIMIENTO")
              }
            >
              Mantenimiento
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