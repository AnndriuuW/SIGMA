import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { obtenerOcurrencia } from "../services/ocurrenciaService";
import type { Ocurrencia } from "../types/ocurrencia";

export default function OcurrenciaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ocurrenciaId = Number(id);

  const [ocurrencia, setOcurrencia] = useState<Ocurrencia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ocurrenciaId || Number.isNaN(ocurrenciaId)) {
      setError("La ocurrencia indicada no es válida.");
      setCargando(false);
      return;
    }

    const cargarOcurrencia = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await obtenerOcurrencia(ocurrenciaId);

        setOcurrencia(data);
      } catch (error: any) {
        const mensaje =
          error?.response?.data?.message ||
          "No se pudo cargar la ocurrencia.";

        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarOcurrencia();
  }, [ocurrenciaId]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const obtenerTipoTexto = (tipo: string) => {
    switch (tipo) {
      case "GENERAL":
        return "General";
      case "UNIDAD":
        return "Unidad";
      case "RECURSO":
        return "Recurso";
      default:
        return tipo;
    }
  };

  if (cargando) {
    return (
      <div className="ocurrencia-detalle-page">
        <div className="ocurrencia-detalle-state">
          <div className="ocurrencia-detalle-loading-line" />

          <strong>Cargando ocurrencia</strong>

          <span>
            Obteniendo información de la bitácora...
          </span>
        </div>
      </div>
    );
  }

  if (error || !ocurrencia) {
    return (
      <div className="ocurrencia-detalle-page">
        <Link
          to="/ocurrencias"
          className="ocurrencia-detalle-back"
        >
          <span>←</span>
          Volver a ocurrencias
        </Link>

        <div className="ocurrencia-detalle-error">
          <strong>
            {error || "No se encontró la ocurrencia."}
          </strong>

          <button
            type="button"
            onClick={() => navigate("/ocurrencias")}
          >
            Volver al registro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ocurrencia-detalle-page">
      <Link
        to="/ocurrencias"
        className="ocurrencia-detalle-back"
      >
        <span>←</span>
        Volver a ocurrencias
      </Link>

      <header className="ocurrencia-detalle-header">
        <div className="ocurrencia-detalle-heading">
          <span className="ocurrencia-detalle-kicker">
            SIGMA · REGISTRO DE NOVEDAD
          </span>

          <h1>
            Ocurrencia #{ocurrencia.id}
          </h1>

          <p>
            Detalle de la novedad registrada en el sistema.
          </p>
        </div>

        <div
          className={`ocurrencia-detalle-reading ocurrencia-detalle-reading-${
            ocurrencia.leida ? "read" : "unread"
          }`}
        >
          <span className="ocurrencia-detalle-reading-dot" />

          <div>
            <small>ESTADO DE LECTURA</small>

            <strong>
              {ocurrencia.leida
                ? "Leída"
                : "No leída"}
            </strong>
          </div>
        </div>
      </header>

      <section className="ocurrencia-detalle-meta">
        <div className="ocurrencia-detalle-meta-item">
          <span>FECHA Y HORA</span>

          <strong>
            {formatearFecha(ocurrencia.fechaHora)}
          </strong>
        </div>

        <div className="ocurrencia-detalle-meta-item">
          <span>TIPO</span>

          <div>
            <span
              className={`ocurrencia-detalle-type ocurrencia-detalle-type-${ocurrencia.tipo.toLowerCase()}`}
            >
              <span />
              {obtenerTipoTexto(ocurrencia.tipo)}
            </span>
          </div>
        </div>

        <div className="ocurrencia-detalle-meta-item">
          <span>INFORMANTE</span>

          <strong>
            {ocurrencia.nombreInformante}
          </strong>

          <small>
            {ocurrencia.codigoInformante}
          </small>
        </div>

        <div className="ocurrencia-detalle-meta-item">
          <span>DESTINATARIO</span>

          <strong>
            {ocurrencia.nombreDestinatario}
          </strong>

          <small>
            {ocurrencia.codigoDestinatario}
          </small>
        </div>
      </section>

      <section className="ocurrencia-detalle-content">
        <div className="ocurrencia-detalle-section-header">
          <div>
            <span>CONTENIDO DEL REGISTRO</span>

            <h2>Descripción</h2>

            <p>
              Detalle de la ocurrencia registrada.
            </p>
          </div>
        </div>

        <div className="ocurrencia-detalle-description">
          {ocurrencia.descripcion}
        </div>
      </section>

      {(ocurrencia.tipo === "UNIDAD" ||
        ocurrencia.tipo === "RECURSO") && (
        <section className="ocurrencia-detalle-content">
          <div className="ocurrencia-detalle-section-header">
            <div>
              <span>REFERENCIA DEL REGISTRO</span>

              <h2>Relacionado</h2>

              <p>
                Elemento asociado a esta ocurrencia.
              </p>
            </div>
          </div>

          <div className="ocurrencia-detalle-related">
            {ocurrencia.tipo === "UNIDAD" && (
              <div className="ocurrencia-detalle-related-item">
                <span>UNIDAD</span>

                <strong>
                  {ocurrencia.nombreUnidad || "—"}
                </strong>
              </div>
            )}

            {ocurrencia.tipo === "RECURSO" && (
              <div className="ocurrencia-detalle-related-item">
                <span>RECURSO</span>

                <strong>
                  {ocurrencia.codigoRecurso || "—"}
                </strong>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="ocurrencia-detalle-footer">
        <div>
          <span>REGISTRO DE LECTURA</span>

          <strong>
            {ocurrencia.leida
              ? "Esta ocurrencia ha sido leída."
              : "Esta ocurrencia permanece sin leer."}
          </strong>
        </div>

        <Link
          to="/ocurrencias"
          className="ocurrencia-detalle-footer-button"
        >
          Volver al registro
        </Link>
      </footer>
    </div>
  );
}