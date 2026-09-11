import { useEffect, useState } from "react";

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

  return (
    <div className="vehiculos-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">FLOTA</p>
          <h1>Vehículos</h1>
          <p>Unidades registradas de la Compañía de Bomberos 120.</p>
        </div>
      </div>

      {cargando && <p>Cargando unidades...</p>}

      {error && <p>{error}</p>}

      {!cargando && !error && (
        <section className="vehiculos-grid">
          {unidades.map((unidad) => (
            <article className="vehiculo-card" key={unidad.id}>
              <div className="vehiculo-card-top">
                <span className="vehiculo-indicativo">
                  {unidad.indicativo}
                </span>

                <span
                  className={`unit-status unit-status-${unidad.estado.toLowerCase()}`}
                >
                  {unidad.estado.replaceAll("_", " ")}
                </span>
              </div>

              <h2>{unidad.nombre}</h2>

              <div className="vehiculo-info">
                <span>Indicativo</span>
                <strong>{unidad.indicativo}</strong>
              </div>

              <div className="vehiculo-info">
                <span>Estado</span>
                <strong>{unidad.estado.replaceAll("_", " ")}</strong>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Vehiculos;