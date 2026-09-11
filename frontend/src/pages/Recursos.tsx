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
      <div className="page-header recursos-header">
        <div>
          <p className="page-eyebrow">EQUIPAMIENTO</p>
          <h1>Recursos</h1>
          <p>
            Recursos registrados y asignados a las ubicaciones de la
            compañía.
          </p>
        </div>
      </div>

      <section className="recursos-summary">
        <div className="resource-summary-card">
          <span>Total</span>
          <strong>{recursos.length}</strong>
        </div>

        <div className="resource-summary-card">
          <span>Operativos</span>
          <strong>{operativos}</strong>
        </div>

        <div className="resource-summary-card">
          <span>Dañados</span>
          <strong>{danados}</strong>
        </div>

        <div className="resource-summary-card">
          <span>Mantenimiento</span>
          <strong>{mantenimiento}</strong>
        </div>
      </section>

      <section className="recursos-panel">
        <div className="recursos-toolbar">
          <input
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por código, nombre, tipo o ubicación..."
            className="recursos-search"
          />

          <div className="recursos-filters">
            <button
              type="button"
              className={filtroEstado === "TODOS" ? "active" : ""}
              onClick={() => setFiltroEstado("TODOS")}
            >
              Todos
            </button>

            <button
              type="button"
              className={
                filtroEstado === "OPERATIVO" ? "active" : ""
              }
              onClick={() => setFiltroEstado("OPERATIVO")}
            >
              Operativos
            </button>

            <button
              type="button"
              className={filtroEstado === "DANADO" ? "active" : ""}
              onClick={() => setFiltroEstado("DANADO")}
            >
              Dañados
            </button>

            <button
              type="button"
              className={
                filtroEstado === "EN_MANTENIMIENTO" ? "active" : ""
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
          <div className="resource-message">
            Cargando recursos...
          </div>
        )}

        {error && (
          <div className="resource-message resource-error">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <div className="resources-table-wrapper">
            <table className="resources-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Recurso</th>
                  <th>Tipo</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {recursosFiltrados.map((recurso) => (
                  <tr key={recurso.id}>
                    <td>
                      <span className="resource-code">
                        {recurso.codigo}
                      </span>
                    </td>

                    <td>
                      <div className="resource-name">
                        <strong>{recurso.nombre}</strong>

                        <span>
                          {recurso.marca}
                          {recurso.modelo
                            ? ` · ${recurso.modelo}`
                            : ""}
                        </span>
                      </div>
                    </td>

                    <td>{recurso.nombreTipoRecurso}</td>

                    <td>{recurso.nombreUbicacion}</td>

                    <td>
                      <span
                        className={`recurso-status recurso-status-${recurso.estado.toLowerCase()}`}
                      >
                        {recurso.estado.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}

                {recursosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="table-empty"
                    >
                      No se encontraron recursos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Recursos;