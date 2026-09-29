import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listarUnidades } from "../services/unidadService";
import type { Unidad } from "../types/unidad";

function Vehiculos() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        setCargando(true);
        setError("");

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

  const resumen = useMemo(() => {
    return {
      total: unidades.length,
      operativas: unidades.filter((unidad) =>
        unidad.estado.toUpperCase().includes("OPER")
      ).length,
      mantenimiento: unidades.filter((unidad) =>
        unidad.estado.toUpperCase().includes("MANT")
      ).length,
      fueraServicio: unidades.filter((unidad) =>
        unidad.estado.toUpperCase().includes("FUERA")
      ).length,
    };
  }, [unidades]);

  return (
    <div className="vehiculos-page">
      <header className="vehiculos-header">
        <div className="vehiculos-heading">
          <span className="vehiculos-kicker">
            SIGMA · CONTROL DE FLOTA
          </span>

          <h1>Vehículos</h1>

          <p>
            Consulta de las unidades registradas y su condición
            operativa actual.
          </p>
        </div>

        <div className="vehiculos-header-meta">
          <span>UNIDADES REGISTRADAS</span>
          <strong>{resumen.total}</strong>
        </div>
      </header>

      <section className="vehiculos-overview">
        <div className="vehiculos-overview-item vehiculos-overview-total">
          <span>Total de unidades</span>
          <strong>{resumen.total}</strong>
          <small>Flota registrada</small>
        </div>

        <div className="vehiculos-overview-item">
          <span>Operativas</span>
          <strong>{resumen.operativas}</strong>
          <small>Disponibles actualmente</small>
        </div>

        <div className="vehiculos-overview-item">
          <span>En mantenimiento</span>
          <strong>{resumen.mantenimiento}</strong>
          <small>Unidades en revisión</small>
        </div>

        <div className="vehiculos-overview-item">
          <span>Fuera de servicio</span>
          <strong>{resumen.fueraServicio}</strong>
          <small>No disponibles</small>
        </div>
      </section>

      <section className="vehiculos-section">
        <div className="vehiculos-section-header">
          <div>
            <span className="vehiculos-section-label">
              FLOTA DE LA COMPAÑÍA
            </span>

            <h2>Unidades registradas</h2>

            <p>
              Selecciona una unidad para consultar su información
              detallada.
            </p>
          </div>

          <span className="vehiculos-section-count">
            {unidades.length}{" "}
            {unidades.length === 1 ? "unidad" : "unidades"}
          </span>
        </div>

        {cargando && (
          <div className="vehiculos-state">
            <div className="vehiculos-state-line" />
            <strong>Cargando unidades</strong>
            <span>Obteniendo información de la flota...</span>
          </div>
        )}

        {error && (
          <div className="vehiculos-state vehiculos-state-error">
            <strong>No se pudo cargar la flota</strong>
            <span>{error}</span>
          </div>
        )}

        {!cargando && !error && unidades.length === 0 && (
          <div className="vehiculos-state">
            <strong>No hay unidades registradas</strong>
            <span>
              No existen vehículos disponibles para mostrar.
            </span>
          </div>
        )}

        {!cargando && !error && unidades.length > 0 && (
          <div className="vehiculos-list">
            {unidades.map((unidad) => (
              <Link
                to={`/vehiculos/${unidad.id}`}
                className="vehiculo-operativo-card"
                key={unidad.id}
              >
                <div className="vehiculo-operativo-top">
                  <span className="vehiculo-operativo-label">
                    UNIDAD
                  </span>

                  <span
                    className={`vehiculo-operativo-status vehiculo-operativo-status-${unidad.estado.toLowerCase()}`}
                  >
                    <span className="vehiculo-operativo-dot" />
                    {unidad.estado.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="vehiculo-operativo-main">
                  <span className="vehiculo-operativo-indicativo">
                    {unidad.indicativo}
                  </span>

                  <div className="vehiculo-operativo-arrow">
                    <span />
                  </div>
                </div>

                <h3>{unidad.nombre}</h3>

                <div className="vehiculo-operativo-info">
                  <div>
                    <span>Indicativo</span>
                    <strong>{unidad.indicativo}</strong>
                  </div>

                  <div>
                    <span>Estado actual</span>
                    <strong>
                      {unidad.estado.replaceAll("_", " ")}
                    </strong>
                  </div>
                </div>

                <div className="vehiculo-operativo-footer">
                  <span>Consultar detalle</span>
                  <span className="vehiculo-operativo-footer-arrow">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Vehiculos;