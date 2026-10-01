import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Truck } from "lucide-react";

import { listarUnidades } from "../services/unidadService";
import type { Unidad } from "../types/unidad";

function Vehiculos() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  const cargarUnidades = useCallback(async (esActualizacion = false) => {
    try {
      if (esActualizacion) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const data = await listarUnidades();

      setUnidades(data);
      setUltimaActualizacion(new Date());
    } catch {
      setError("No se pudieron cargar las unidades.");
    } finally {
      if (esActualizacion) {
        setActualizando(false);
      } else {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    cargarUnidades();
  }, [cargarUnidades]);


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
          <span>ACTUALIZADO</span>

          <div className="vehiculos-header-meta-row">
            <strong>
              {ultimaActualizacion.toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              {" · "}
              {ultimaActualizacion.toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </strong>

            <button
              type="button"
              className={`vehiculos-refresh-button ${
                actualizando ? "is-refreshing" : ""
              }`}
              aria-label="Actualizar unidades"
              title="Actualizar"
              onClick={() => cargarUnidades(true)}
              disabled={actualizando}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>


      <section className="vehiculos-section">
        <div className="vehiculos-section-header">
          <div className="vehiculos-section-heading">
            <h2>Unidades registradas</h2>

            <p>
              Selecciona una unidad para consultar su información detallada.
            </p>
          </div>

          <div className="vehiculos-legend" aria-label="Estados de las unidades">
            <span className="vehiculos-legend-item">
              <span className="vehiculos-legend-dot vehiculos-legend-dot-operativa" />
              Operativa
            </span>

            <span className="vehiculos-legend-item">
              <span className="vehiculos-legend-dot vehiculos-legend-dot-mantenimiento" />
              En mantenimiento
            </span>

            <span className="vehiculos-legend-item">
              <span className="vehiculos-legend-dot vehiculos-legend-dot-fuera" />
              Fuera de servicio
            </span>
          </div>
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
            {unidades.map((unidad) => {
              const estadoNormalizado = unidad.estado
                .toLowerCase()
                .replaceAll("_", "-");

              const estadoTexto = unidad.estado.replaceAll("_", " ");

              return (
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
                      className={`vehiculo-operativo-status vehiculo-operativo-status-${estadoNormalizado}`}
                    >
                      <span className="vehiculo-operativo-dot" />
                      {estadoTexto}
                    </span>
                  </div>

                  <div className="vehiculo-operativo-visual">
                    <Truck className="vehiculo-operativo-icon" />

                    <span className="vehiculo-operativo-visual-code">
                      {unidad.indicativo}
                    </span>
                  </div>

                  <div className="vehiculo-operativo-content">
                    <h3>{unidad.nombre}</h3>

                    <span className="vehiculo-operativo-state">
                      {estadoTexto}
                    </span>
                  </div>

                  <div className="vehiculo-operativo-footer">
                    <span>Consultar detalle</span>

                    <span className="vehiculo-operativo-footer-arrow">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Vehiculos;