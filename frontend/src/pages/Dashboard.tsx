import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CircleCheck,
  Gauge,
  Package,
  TriangleAlert,
  Truck,
  Wrench,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { listarUnidades } from "../services/unidadService";
import type { Unidad } from "../types/unidad";

function Dashboard() {
  const { usuario } = useAuth();
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

  const puedeConsultarRecursos = [
    "ADMINISTRADOR",
    "JEFE_MAQUINAS",
    "PERSONAL_ADJUNTO",
  ].includes(usuario?.rol ?? "");

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">SIGMA · CONTROL OPERATIVO</p>

          <h1>Dashboard</h1>

          <p className="dashboard-description">
            Estado actual de la Sección de Máquinas de la Compañía De Bomberos N°120.
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
            <article className="dashboard-metric-card">
              <span className="dashboard-metric-icon"><Truck size={20} /></span>
              <div className="dashboard-metric-copy">
                <span>Total de unidades</span>
                <strong>{unidades.length}</strong>
                <small>registradas</small>
              </div>
            </article>

            <article className="dashboard-metric-card dashboard-metric-operational">
              <span className="dashboard-metric-icon"><CircleCheck size={20} /></span>
              <div className="dashboard-metric-copy">
                <span>Operativas</span>
                <strong>{unidadesOperativas}</strong>
                <small>disponibles actualmente</small>
              </div>
            </article>

            <article className="dashboard-metric-card dashboard-metric-service">
              <span className="dashboard-metric-icon"><TriangleAlert size={20} /></span>
              <div className="dashboard-metric-copy">
                <span>Fuera de servicio</span>
                <strong>{unidadesFueraServicio}</strong>
                <small>requieren atención</small>
              </div>
            </article>

            <article className="dashboard-metric-card dashboard-metric-maintenance">
              <span className="dashboard-metric-icon"><Wrench size={20} /></span>
              <div className="dashboard-metric-copy">
                <span>Mantenimiento</span>
                <strong>{unidadesMantenimiento}</strong>
                <small>en proceso</small>
              </div>
            </article>

            <article className="dashboard-metric-card dashboard-metric-availability">
              <span className="dashboard-metric-icon"><Gauge size={20} /></span>
              <div className="dashboard-metric-copy">
                <span>Disponibilidad</span>
                <strong>{porcentajeOperativas}%</strong>
                <div className="availability-line">
                  <span style={{ width: `${porcentajeOperativas}%` }} />
                </div>
              </div>
            </article>
          </section>

          <section className="dashboard-main-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Estado de las unidades</h2>
              </div>

              <NavLink
                to="/vehiculos"
                className="dashboard-link"
                aria-label="Ver vehículos"
              >
                <span className="dashboard-link-label">Ver vehículos</span>
                <span className="dashboard-link-arrow" aria-hidden="true">
                  →
                </span>
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
            <div className="dashboard-bottom-panel dashboard-quick-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Acciones rápidas</h2>
                  <p>Accede directamente a la información que necesitas.</p>
                </div>
              </div>

              <div className="dashboard-actions">
                <NavLink to="/vehiculos" className="dashboard-action">
                  <span className="dashboard-action-icon"><Truck size={21} /></span>
                  <span className="dashboard-action-copy">
                    <strong>Consultar vehículos</strong>
                    <span>Estado y detalle de las unidades</span>
                  </span>
                  <ArrowRight className="dashboard-action-arrow" size={20} />
                </NavLink>

                {puedeConsultarRecursos && (
                  <NavLink to="/recursos" className="dashboard-action">
                    <span className="dashboard-action-icon"><Package size={21} /></span>
                    <span className="dashboard-action-copy">
                      <strong>Consultar recursos</strong>
                      <span>Recursos registrados y su ubicación</span>
                    </span>
                    <ArrowRight className="dashboard-action-arrow" size={20} />
                  </NavLink>
                )}

                <NavLink to="/ocurrencias" className="dashboard-action">
                  <span className="dashboard-action-icon"><AlertCircle size={21} /></span>
                  <span className="dashboard-action-copy">
                    <strong>Consultar ocurrencias</strong>
                    <span>Registro histórico de novedades</span>
                  </span>
                  <ArrowRight className="dashboard-action-arrow" size={20} />
                </NavLink>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
