import { useEffect, useState } from "react";

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

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">RESUMEN OPERATIVO</p>
          <h1>Dashboard</h1>
          <p>Estado actual de las unidades de la Compañía 120.</p>
        </div>
      </div>

      {cargando && <p>Cargando unidades...</p>}

      {error && <p>{error}</p>}

      {!cargando && !error && (
        <>
          <section className="dashboard-summary">
            <div className="summary-card">
              <span>Total de unidades</span>
              <strong>{unidades.length}</strong>
            </div>

            <div className="summary-card">
              <span>Operativas</span>
              <strong>{unidadesOperativas}</strong>
            </div>

            <div className="summary-card">
              <span>Fuera de servicio</span>
              <strong>{unidadesFueraServicio}</strong>
            </div>

            <div className="summary-card">
              <span>En mantenimiento</span>
              <strong>{unidadesMantenimiento}</strong>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2>Unidades</h2>
                <p>Estado actual de la flota registrada.</p>
              </div>
            </div>

            <div className="units-grid">
              {unidades.map((unidad) => (
                <article className="unit-card" key={unidad.id}>
                  <div className="unit-card-header">
                    <div>
                      <span className="unit-indicativo">
                        {unidad.indicativo}
                      </span>

                      <h3>{unidad.nombre}</h3>
                    </div>

                    <span
                      className={`unit-status unit-status-${unidad.estado.toLowerCase()}`}
                    >
                      {unidad.estado.replaceAll("_", " ")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;