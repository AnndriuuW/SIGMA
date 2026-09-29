import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { listarUnidades } from "../services/unidadService";
import { listarUbicaciones } from "../services/ubicacionService";
import { listarRecursos } from "../services/recursoService";

import type { Unidad } from "../types/unidad";
import type { Ubicacion } from "../types/ubicacion";
import type { Recurso } from "../types/recurso";

function VehiculoDetalle() {
  const { id } = useParams();

  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setCargando(true);
        setError("");

        const [unidadesData, ubicacionesData, recursosData] =
          await Promise.all([
            listarUnidades(),
            listarUbicaciones(),
            listarRecursos(),
          ]);

        const unidadEncontrada = unidadesData.find(
          (item) => item.id === Number(id),
        );

        if (!unidadEncontrada) {
          setError("La unidad no fue encontrada.");
          return;
        }

        const ubicacionesDeUnidad = ubicacionesData.filter(
          (ubicacion) =>
            ubicacion.idUnidad === unidadEncontrada.id &&
            ubicacion.activo,
        );

        const recursosDeUnidad = recursosData.filter((recurso) =>
          ubicacionesDeUnidad.some(
            (ubicacion) => ubicacion.id === recurso.idUbicacion,
          ),
        );

        setUnidad(unidadEncontrada);
        setUbicaciones(ubicacionesDeUnidad);
        setRecursos(recursosDeUnidad);
      } catch {
        setError("No se pudo cargar la información de la unidad.");
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <div className="vehiculo-detalle-page">
        <div className="vehiculo-detalle-state">
          <div className="vehiculo-detalle-state-line" />
          <strong>Cargando unidad</strong>
          <span>Obteniendo información operativa...</span>
        </div>
      </div>
    );
  }

  if (error || !unidad) {
    return (
      <div className="vehiculo-detalle-page">
        <Link to="/vehiculos" className="vehiculo-detalle-back">
          <span>←</span>
          Volver a vehículos
        </Link>

        <div className="vehiculo-detalle-error">
          <strong>
            {error || "La unidad no fue encontrada."}
          </strong>
        </div>
      </div>
    );
  }

  const recursosPorUbicacion = (ubicacionId: number) =>
    recursos.filter((recurso) => recurso.idUbicacion === ubicacionId);

  const recursosOperativos = recursos.filter(
    (recurso) => recurso.estado === "OPERATIVO",
  ).length;

  return (
    <div className="vehiculo-detalle-page">
      <Link to="/vehiculos" className="vehiculo-detalle-back">
        <span>←</span>
        Volver a vehículos
      </Link>

      <header className="vehiculo-detalle-header">
        <div className="vehiculo-detalle-title">
          <span className="vehiculo-detalle-kicker">
            SIGMA · UNIDAD OPERATIVA
          </span>

          <div className="vehiculo-detalle-title-row">
            <div>
              <h1>{unidad.nombre}</h1>

              <p>
                Información operativa y recursos asociados a la unidad.
              </p>
            </div>

            <span
              className={`vehiculo-detalle-status vehiculo-detalle-status-${unidad.estado.toLowerCase()}`}
            >
              <span className="vehiculo-detalle-status-dot" />
              {unidad.estado.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <div className="vehiculo-detalle-identity">
          <span>INDICATIVO</span>
          <strong>{unidad.indicativo}</strong>
        </div>
      </header>

      <section className="vehiculo-detalle-overview">
        <div className="vehiculo-detalle-overview-item">
          <span>Ubicaciones</span>
          <strong>{ubicaciones.length}</strong>
          <small>Espacios activos</small>
        </div>

        <div className="vehiculo-detalle-overview-item">
          <span>Recursos asignados</span>
          <strong>{recursos.length}</strong>
          <small>Equipamiento asociado</small>
        </div>

        <div className="vehiculo-detalle-overview-item">
          <span>Recursos operativos</span>
          <strong>{recursosOperativos}</strong>
          <small>En condición operativa</small>
        </div>

        <div className="vehiculo-detalle-overview-item detalle-overview-highlight">
          <span>Estado de unidad</span>
          <strong>
            {unidad.estado.replaceAll("_", " ")}
          </strong>
          <small>Condición actual registrada</small>
        </div>
      </section>

      <section className="vehiculo-detalle-section">
        <div className="vehiculo-detalle-section-header">
          <div>
            <span className="vehiculo-detalle-section-label">
              DISTRIBUCIÓN DEL EQUIPAMIENTO
            </span>

            <h2>Ubicaciones y recursos</h2>

            <p>
              Espacios registrados y equipamiento asociado a esta unidad.
            </p>
          </div>

          <span className="vehiculo-detalle-section-count">
            {ubicaciones.length}{" "}
            {ubicaciones.length === 1 ? "ubicación" : "ubicaciones"}
          </span>
        </div>

        {ubicaciones.length === 0 ? (
          <div className="vehiculo-detalle-empty">
            <strong>No hay ubicaciones registradas</strong>
            <span>
              Esta unidad no tiene espacios activos asociados.
            </span>
          </div>
        ) : (
          <div className="vehiculo-detalle-ubicaciones">
            {ubicaciones.map((ubicacion) => {
              const recursosUbicacion = recursosPorUbicacion(ubicacion.id);

              return (
                <article
                  className="vehiculo-detalle-ubicacion"
                  key={ubicacion.id}
                >
                  <div className="vehiculo-detalle-ubicacion-header">
                    <div>
                      <span className="vehiculo-detalle-ubicacion-type">
                        {ubicacion.tipo.replaceAll("_", " ")}
                      </span>

                      <h3>{ubicacion.nombre}</h3>
                    </div>

                    <span className="vehiculo-detalle-ubicacion-count">
                      {recursosUbicacion.length}
                      <small>
                        {recursosUbicacion.length === 1
                          ? "recurso"
                          : "recursos"}
                      </small>
                    </span>
                  </div>

                  {recursosUbicacion.length === 0 ? (
                    <div className="vehiculo-detalle-ubicacion-empty">
                      No hay recursos registrados en esta ubicación.
                    </div>
                  ) : (
                    <div className="vehiculo-detalle-recursos">
                      {recursosUbicacion.map((recurso) => (
                        <div
                          className="vehiculo-detalle-recurso"
                          key={recurso.id}
                        >
                          <div className="vehiculo-detalle-recurso-info">
                            <strong>{recurso.nombre}</strong>

                            <span>
                              {recurso.codigo} ·{" "}
                              {recurso.nombreTipoRecurso}
                              {recurso.marca
                                ? ` · ${recurso.marca}`
                                : ""}
                            </span>
                          </div>

                          <span
                            className={`vehiculo-detalle-recurso-status vehiculo-detalle-recurso-${recurso.estado.toLowerCase()}`}
                          >
                            <span />
                            {recurso.estado.replaceAll("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default VehiculoDetalle;