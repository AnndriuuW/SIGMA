import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { listarUnidades } from "../services/unidadService";
import type { Unidad } from "../types/unidad";

function Dashboard() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        setCargando(true);

        const data = await listarUnidades();

        setUnidades(data);
      } catch {
        setError("No se pudieron cargar las unidades.");
      } finally {
        setCargando(false);
      }
    };

    cargarUnidades();
  }, []);

  const unidadesOperativas = unidades.filter(
    (unidad) => unidad.estado === "OPERATIVA",
  ).length;

  const unidadesFueraServicio = unidades.filter(
    (unidad) => unidad.estado === "FUERA_DE_SERVICIO",
  ).length;

  const unidadesMantenimiento = unidades.filter(
    (unidad) => unidad.estado === "MANTENIMIENTO",
  ).length;

  const porcentajeOperativas =
    unidades.length > 0
      ? Math.round((unidadesOperativas / unidades.length) * 100)
      : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">SIGMA · CONTROL OPERATIVO</p>

          <h1>Dashboard</h1>

          <p className="dashboard-description">
            Estado actual de la Sección de Máquinas de la Compañía 120.
          </p>
        </div>

        {!cargando && !error && (
          <div className="dashboard-system-status">
            <span className="system-status-dot" />
            <div>
              <strong>Sistema operativo</strong>
              <span>Información actualizada</span>
            </div>
          </div>
        )}
      </header>

      {cargando && (
        <div className="dashboard-message">
          <div className="dashboard-loader" />
          <span>Cargando información operativa...</span>
        </div>
      )}

      {error && (
        <div className="dashboard-message dashboard-message-error">
          <strong>No se pudo cargar la información</strong>
          <span>{error}</span>
        </div>
      )}

      {!cargando && !error && (
        <>
          <section className="dashboard-overview">
            <div className="dashboard-overview-item">
              <span>Total de unidades</span>
              <strong>{unidades.length}</strong>
              <small>registradas</small>
            </div>

            <div className="dashboard-overview-item">
              <span>Operativas</span>
              <strong>{unidadesOperativas}</strong>
              <small>disponibles actualmente</small>
            </div>

            <div className="dashboard-overview-item">
              <span>Fuera de servicio</span>
              <strong>{unidadesFueraServicio}</strong>
              <small>requieren atención</small>
            </div>

            <div className="dashboard-overview-item">
              <span>Mantenimiento</span>
              <strong>{unidadesMantenimiento}</strong>
              <small>en proceso</small>
            </div>

            <div className="dashboard-overview-availability">
              <span>Disponibilidad</span>
              <strong>{porcentajeOperativas}%</strong>
              <div className="availability-line">
                <span style={{ width: `${porcentajeOperativas}%` }} />
              </div>
            </div>
          </section>

          <section className="dashboard-main-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Estado de las unidades</h2>
              </div>

              <NavLink to="/vehiculos" className="dashboard-link">
                Ver vehículos
                <span>→</span>
              </NavLink>
            </div>

            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Indicativo</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                    <th>Situación</th>
                  </tr>
                </thead>

                <tbody>
                  {unidades.map((unidad) => (
                    <tr key={unidad.id}>
                      <td>
                        <span className="dashboard-unit-code">
                          {unidad.indicativo}
                        </span>
                      </td>

                      <td>
                        <strong>{unidad.nombre}</strong>
                      </td>

                      <td>
                        <span
                          className={`dashboard-status dashboard-status-${unidad.estado.toLowerCase()}`}
                        >
                          <span className="dashboard-status-indicator" />
                          {unidad.estado.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <span className="dashboard-unit-situation">
                          {unidad.estado === "OPERATIVA"
                            ? "Disponible"
                            : unidad.estado === "MANTENIMIENTO"
                              ? "En mantenimiento"
                              : "Fuera de servicio"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-bottom">
            <div className="dashboard-bottom-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Acciones rápidas</h2>
                </div>
              </div>

              <div className="dashboard-actions">
                <NavLink to="/vehiculos" className="dashboard-action">
                  <div>
                    <strong>Consultar vehículos</strong>
                    <span>Estado y detalle de las unidades</span>
                  </div>

                  <span className="dashboard-action-arrow">→</span>
                </NavLink>

                <NavLink to="/recursos" className="dashboard-action">
                  <div>
                    <strong>Consultar recursos</strong>
                    <span>Recursos registrados y su ubicación</span>
                  </div>

                  <span className="dashboard-action-arrow">→</span>
                </NavLink>

                <NavLink to="/ocurrencias" className="dashboard-action">
                  <div>
                    <strong>Consultar ocurrencias</strong>
                    <span>Registro histórico de novedades</span>
                  </div>

                  <span className="dashboard-action-arrow">→</span>
                </NavLink>
              </div>
            </div>

            <div className="dashboard-bottom-panel dashboard-info-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Resumen operativo</h2>
                </div>
              </div>

              <div className="dashboard-info-list">
                <div>
                  <span>Unidades registradas</span>
                  <strong>{unidades.length}</strong>
                </div>

                <div>
                  <span>Unidades operativas</span>
                  <strong>{unidadesOperativas}</strong>
                </div>

                <div>
                  <span>Disponibilidad actual</span>
                  <strong>{porcentajeOperativas}%</strong>
                </div>
              </div>

              <p className="dashboard-info-note">
                La información mostrada corresponde al estado actual registrado
                en SIGMA.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;