import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  marcarOcurrenciaLeida,
  obtenerOcurrencia,
} from "../services/ocurrenciaService";
import type { Ocurrencia } from "../types/ocurrencia";

export default function OcurrenciaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const ocurrenciaId = Number(id);

  const [ocurrencia, setOcurrencia] = useState<Ocurrencia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [marcandoLeida, setMarcandoLeida] = useState(false);
  const [errorLectura, setErrorLectura] = useState("");

  const esDestinatario =
    Boolean(usuario?.codigo) &&
    usuario?.codigo === ocurrencia?.codigoDestinatario;
  const puedeMarcarLeida =
    esDestinatario || usuario?.rol === "ADMINISTRADOR";

  const marcarComoLeida = async () => {
    if (!ocurrencia || marcandoLeida) return;

    try {
      setMarcandoLeida(true);
      setErrorLectura("");
      setOcurrencia(await marcarOcurrenciaLeida(ocurrencia.id));
    } catch (error: any) {
      setErrorLectura(
        error?.response?.data?.message ||
          "No se pudo actualizar el estado de lectura.",
      );
    } finally {
      setMarcandoLeida(false);
    }
  };

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
    const valor = new Date(fecha);

    return {
      fecha: valor.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      hora: valor.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    };
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

  const fechaHora = formatearFecha(ocurrencia.fechaHora);

  return (
    <div className="ocurrencia-detalle-page">
      <div className="ocurrencia-detalle-topbar">
        <Link to="/ocurrencias" className="ocurrencia-detalle-back">
          <span>←</span>
          Volver a ocurrencias
        </Link>
        <span className="ocurrencia-detalle-breadcrumb">
          BITÁCORA <span>/</span> DETALLE
        </span>
      </div>

      <header className="ocurrencia-detalle-header">
        <div className="ocurrencia-detalle-heading">
          <span className="ocurrencia-detalle-kicker">
            SIGMA · BITÁCORA OPERATIVA
          </span>

          <div className="ocurrencia-detalle-title-row">
            <h1>Ocurrencia <span>#{ocurrencia.id}</span></h1>

            <div
              className={`ocurrencia-detalle-reading ocurrencia-detalle-reading-${
                ocurrencia.leida ? "read" : "unread"
              }`}
              role="status"
              aria-label={`Estado de lectura: ${ocurrencia.leida ? "Leída" : "No leída"}`}
            >
              <div className="ocurrencia-detalle-reading-status">
                <span className="ocurrencia-detalle-reading-dot" />
                <strong>{ocurrencia.leida ? "Leída" : "No leída"}</strong>
              </div>

              {puedeMarcarLeida && !ocurrencia.leida && (
                <button
                  type="button"
                  className="ocurrencia-detalle-mark-read"
                  onClick={marcarComoLeida}
                  disabled={marcandoLeida}
                >
                  {marcandoLeida ? "Guardando..." : "Marcar como leída"}
                </button>
              )}

              {errorLectura && (
                <p className="ocurrencia-detalle-reading-error" role="alert">
                  {errorLectura}
                </p>
              )}
            </div>
          </div>

          <p>
            Detalle de la novedad registrada en el sistema.
          </p>
        </div>
      </header>

      <section className="ocurrencia-detalle-meta">
        <div className="ocurrencia-detalle-meta-item ocurrencia-detalle-meta-date">
          <span>FECHA Y HORA</span>
          <strong>{fechaHora.fecha}</strong>
          <small>{fechaHora.hora}</small>
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
            <span>RELATO DE LA NOVEDAD</span>

            <h2>Descripción</h2>
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
              <span>ELEMENTO VINCULADO</span>

              <h2>Referencia</h2>
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

    </div>
  );
}
