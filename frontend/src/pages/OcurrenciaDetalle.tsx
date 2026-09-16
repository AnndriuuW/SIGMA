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
      <div className="page-container">
        <div className="empty-state">
          <p>Cargando ocurrencia...</p>
        </div>
      </div>
    );
  }

  if (error || !ocurrencia) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>{error || "No se encontró la ocurrencia."}</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/ocurrencias")}
          >
            Volver a ocurrencias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="detail-back">
        <Link to="/ocurrencias">
          ← Volver a ocurrencias
        </Link>
      </div>

      <div className="page-header">
        <div>
          <p className="page-eyebrow">REGISTRO DE INCIDENCIAS</p>

          <h1>Ocurrencia #{ocurrencia.id}</h1>

          <p className="page-description">
            Detalle de la novedad registrada en el sistema.
          </p>
        </div>

        <span className="status-badge">
          {ocurrencia.leida ? "LEÍDA" : "NO LEÍDA"}
        </span>
      </div>

      <div className="occurrence-detail-grid">
        <div className="occurrence-detail-card">
          <span>Fecha y hora</span>
          <strong>
            {formatearFecha(ocurrencia.fechaHora)}
          </strong>
        </div>

        <div className="occurrence-detail-card">
          <span>Tipo</span>
          <strong>
            {obtenerTipoTexto(ocurrencia.tipo)}
          </strong>
        </div>

        <div className="occurrence-detail-card">
          <span>Informante</span>
          <strong>
            {ocurrencia.nombreInformante}
          </strong>
          <small>{ocurrencia.codigoInformante}</small>
        </div>

        <div className="occurrence-detail-card">
          <span>Destinatario</span>
          <strong>
            {ocurrencia.nombreDestinatario}
          </strong>
          <small>{ocurrencia.codigoDestinatario}</small>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Descripción</h2>
            <p>Detalle de la ocurrencia registrada.</p>
          </div>
        </div>

        <div className="occurrence-description-detail">
          {ocurrencia.descripcion}
        </div>
      </div>

      {(ocurrencia.tipo === "UNIDAD" ||
        ocurrencia.tipo === "RECURSO") && (
        <div className="content-card">
          <div className="content-card-header">
            <div>
              <h2>Relacionado</h2>
              <p>
                Recurso o unidad asociada a la ocurrencia.
              </p>
            </div>
          </div>

          <div className="occurrence-related-info">
            {ocurrencia.tipo === "UNIDAD" && (
              <div className="occurrence-related-item">
                <span>Unidad</span>
                <strong>
                  {ocurrencia.nombreUnidad || "—"}
                </strong>
              </div>
            )}

            {ocurrencia.tipo === "RECURSO" && (
              <div className="occurrence-related-item">
                <span>Recurso</span>
                <strong>
                  {ocurrencia.codigoRecurso || "—"}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="content-card occurrence-footer-card">
        <div>
          <span>Estado de lectura</span>

          <strong>
            {ocurrencia.leida
              ? "Ocurrencia leída"
              : "Ocurrencia no leída"}
          </strong>
        </div>

        <Link
          to="/ocurrencias"
          className="secondary-button"
        >
          Volver al registro
        </Link>
      </div>
    </div>
  );
}