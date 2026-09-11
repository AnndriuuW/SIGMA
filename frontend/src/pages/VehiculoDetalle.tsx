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
    return <p>Cargando información de la unidad...</p>;
  }

  if (error || !unidad) {
    return (
      <div className="vehiculo-detalle">
        <Link to="/vehiculos" className="back-link">
          ← Volver a vehículos
        </Link>

        <div className="error-message">
          {error || "La unidad no fue encontrada."}
        </div>
      </div>
    );
  }

  const recursosPorUbicacion = (ubicacionId: number) =>
    recursos.filter((recurso) => recurso.idUbicacion === ubicacionId);

  return (
    <div className="vehiculo-detalle">
      <Link to="/vehiculos" className="back-link">
        ← Volver a vehículos
      </Link>

      <header className="detalle-header">
        <div>
          <p className="page-eyebrow">UNIDAD</p>

          <h1>{unidad.nombre}</h1>

          <p className="detalle-indicativo">
            Indicativo: {unidad.indicativo}
          </p>
        </div>

        <span
          className={`unit-status unit-status-${unidad.estado.toLowerCase()}`}
        >
          {unidad.estado.replaceAll("_", " ")}
        </span>
      </header>

      <section className="detalle-section">
        <div className="section-header">
          <div>
            <h2>Ubicaciones</h2>
            <p>Espacios registrados para esta unidad.</p>
          </div>
        </div>

        {ubicaciones.length === 0 ? (
          <div className="empty-state">
            No hay ubicaciones registradas para esta unidad.
          </div>
        ) : (
          <div className="ubicaciones-list">
            {ubicaciones.map((ubicacion) => {
              const recursosUbicacion = recursosPorUbicacion(ubicacion.id);

              return (
                <article className="ubicacion-card" key={ubicacion.id}>
                  <div className="ubicacion-header">
                    <div>
                      <span className="ubicacion-tipo">
                        {ubicacion.tipo.replaceAll("_", " ")}
                      </span>

                      <h3>{ubicacion.nombre}</h3>
                    </div>

                    <span className="ubicacion-count">
                      {recursosUbicacion.length}{" "}
                      {recursosUbicacion.length === 1
                        ? "recurso"
                        : "recursos"}
                    </span>
                  </div>

                  {recursosUbicacion.length === 0 ? (
                    <p className="ubicacion-empty">
                      No hay recursos registrados en esta ubicación.
                    </p>
                  ) : (
                    <div className="recursos-list">
                      {recursosUbicacion.map((recurso) => (
                        <div className="recurso-row" key={recurso.id}>
                          <div>
                            <strong>{recurso.nombre}</strong>

                            <span>
                              {recurso.codigo} ·{" "}
                              {recurso.nombreTipoRecurso}
                            </span>
                          </div>

                          <span
                            className={`recurso-status recurso-status-${recurso.estado.toLowerCase()}`}
                          >
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