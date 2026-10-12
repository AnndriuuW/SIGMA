import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, CircleCheck, CirclePause, Timer } from "lucide-react";

import {
  listarInventarios,
  crearInventario,
} from "../services/inventarioService";
import { listarUnidades } from "../services/unidadService";

import type { Inventario as InventarioType } from "../types/inventario";
import type { Unidad } from "../types/unidad";

export default function Inventario() {
  const navigate = useNavigate();

  const [inventarios, setInventarios] = useState<InventarioType[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);

  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);

  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");

  const [error, setError] = useState("");
  const [errorCrear, setErrorCrear] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [inventariosData, unidadesData] = await Promise.all([
          listarInventarios(),
          listarUnidades(),
        ]);

        setInventarios(inventariosData);
        setUnidades(unidadesData);
      } catch {
        setError("No se pudieron cargar los datos.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const enProceso = inventarios.filter(
    (inventario) => inventario.estado === "EN_PROCESO",
  ).length;

  const pausados = inventarios.filter(
    (inventario) => inventario.estado === "PAUSADO",
  ).length;

  const finalizados = inventarios.filter(
    (inventario) => inventario.estado === "FINALIZADO",
  ).length;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case "EN_PROCESO":
        return "En proceso";
      case "PAUSADO":
        return "Pausado";
      case "FINALIZADO":
        return "Finalizado";
      default:
        return estado;
    }
  };

  const obtenerTextoResultado = (resultado: string | null) => {
    if (!resultado) return "Pendiente";

    return resultado.replaceAll("_", " ");
  };

  const abrirNuevoInventario = () => {
    setUnidadSeleccionada("");
    setErrorCrear("");
    setMostrarNuevo(true);
  };

  const cerrarNuevoInventario = () => {
    if (creando) return;

    setMostrarNuevo(false);
    setUnidadSeleccionada("");
    setErrorCrear("");
  };

  const handleCrearInventario = async () => {
    if (!unidadSeleccionada) {
      setErrorCrear("Selecciona una unidad.");
      return;
    }

    try {
      setCreando(true);
      setErrorCrear("");

      const inventarioCreado = await crearInventario(
        Number(unidadSeleccionada),
      );

      navigate(`/inventario/${inventarioCreado.id}`);
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudo crear el inventario.";

      setErrorCrear(mensaje);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="inventario-page">
      <header className="inventario-header">
        <div className="inventario-heading">
          <span className="inventario-kicker">
            SIGMA · CONTROL DE INVENTARIO
          </span>

          <h1>Inventario</h1>

          <p>
            Registro y seguimiento de los inventarios realizados por
            unidad.
          </p>
        </div>

        <button
          type="button"
          className="inventario-new-button"
          onClick={abrirNuevoInventario}
        >
          <span>+</span>
          Nuevo inventario
        </button>
      </header>

      <section className="inventario-overview">
        <div className="inventario-overview-item inventario-overview-total">
          <div className="inventario-overview-topline">
            <span className="inventario-overview-icon">
              <ClipboardList size={21} strokeWidth={2} />
            </span>
            <span>REGISTRO GENERAL</span>
          </div>
          <strong>{inventarios.length}</strong>
          <small>Inventarios registrados</small>
        </div>

        <div className="inventario-overview-item inventario-overview-progress">
          <span className="inventario-overview-icon">
            <Timer size={20} strokeWidth={2} />
          </span>
          <div className="inventario-overview-copy">
            <span>En proceso</span>
            <strong>{enProceso}</strong>
          </div>
        </div>

        <div className="inventario-overview-item inventario-overview-paused">
          <span className="inventario-overview-icon">
            <CirclePause size={20} strokeWidth={2} />
          </span>
          <div className="inventario-overview-copy">
            <span>Pausados</span>
            <strong>{pausados}</strong>
          </div>
        </div>

        <div className="inventario-overview-item inventario-overview-completed">
          <span className="inventario-overview-icon">
            <CircleCheck size={20} strokeWidth={2} />
          </span>
          <div className="inventario-overview-copy">
            <span>Finalizados</span>
            <strong>{finalizados}</strong>
          </div>
        </div>
      </section>

      <section className="inventario-panel">
        <div className="inventario-panel-header">
          <div>
            <span className="inventario-section-label">
              REGISTRO DE INVENTARIOS
            </span>

            <h2>Inventarios registrados</h2>

            <p>
              Consulta el estado y resultado de cada inventario.
            </p>
          </div>

        </div>

        {cargando && (
          <div className="inventario-state">
            <div className="inventario-state-line" />

            <strong>Cargando inventarios</strong>

            <span>
              Obteniendo información de los registros...
            </span>
          </div>
        )}

        {!cargando && error && (
          <div className="inventario-state inventario-state-error">
            <strong>No se pudo cargar la información</strong>
            <span>{error}</span>
          </div>
        )}

        {!cargando && !error && inventarios.length === 0 && (
          <div className="inventario-state">
            <strong>No hay inventarios registrados</strong>

            <span>
              Puedes iniciar un nuevo inventario utilizando el botón
              superior.
            </span>
          </div>
        )}

        {!cargando && !error && inventarios.length > 0 && (
          <div className="inventario-table-wrapper">
            <table className="inventario-table">
              <thead>
                <tr>
                  <th>UNIDAD</th>
                  <th>RESPONSABLE</th>
                  <th>INICIO</th>
                  <th>FIN</th>
                  <th>ESTADO</th>
                  <th>RESULTADO</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {inventarios.map((inventario) => (
                  <tr key={inventario.id}>
                    <td>
                      <div className="inventario-unit-cell">
                        <strong>
                          {inventario.nombreUnidad}
                        </strong>

                        <span>
                          Inventario #{inventario.id}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="inventario-responsable">
                        {inventario.nombreResponsable}
                      </span>
                    </td>

                    <td>
                      <span className="inventario-date">
                        {inventario.fechaInicio ? (
                          <>
                            <strong>{formatearFecha(inventario.fechaInicio)}</strong>
                            <small>{formatearHora(inventario.fechaInicio)}</small>
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="inventario-date">
                        {inventario.fechaFin ? (
                          <>
                            <strong>{formatearFecha(inventario.fechaFin)}</strong>
                            <small>{formatearHora(inventario.fechaFin)}</small>
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`inventario-status inventario-status-${inventario.estado.toLowerCase()}`}
                      >
                        <span className="inventario-status-dot" />
                        {obtenerTextoEstado(inventario.estado)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`inventario-result inventario-result-${inventario.resultadoGeneral ? "completed" : "pending"}`}
                      >
                        {obtenerTextoResultado(
                          inventario.resultadoGeneral,
                        )}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/inventario/${inventario.id}`}
                        className="inventario-view-link"
                      >
                        Ver detalle
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {mostrarNuevo && (
        <div className="inventario-modal-overlay">
          <div
            className="inventario-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nuevo-inventario-title"
          >
            <div className="inventario-modal-header">
              <div>
                <span className="inventario-modal-kicker">
                  NUEVO REGISTRO
                </span>

                <h2 id="nuevo-inventario-title">
                  Iniciar inventario
                </h2>

                <p>
                  Selecciona la unidad sobre la que se realizará el
                  inventario.
                </p>
              </div>

              <button
                type="button"
                className="inventario-modal-close"
                onClick={cerrarNuevoInventario}
                disabled={creando}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="inventario-modal-body">
              <label htmlFor="unidad-inventario">
                Unidad
              </label>

              <select
                id="unidad-inventario"
                value={unidadSeleccionada}
                onChange={(event) =>
                  setUnidadSeleccionada(event.target.value)
                }
                disabled={creando}
              >
                <option value="">
                  Selecciona una unidad
                </option>

                {unidades
                  .filter((unidad) => unidad.activo)
                  .map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre} — {unidad.indicativo}
                    </option>
                  ))}
              </select>

              {errorCrear && (
                <p className="inventario-form-error">
                  {errorCrear}
                </p>
              )}
            </div>

            <div className="inventario-modal-footer">
              <button
                type="button"
                className="inventario-secondary-button"
                onClick={cerrarNuevoInventario}
                disabled={creando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="inventario-primary-button"
                onClick={handleCrearInventario}
                disabled={creando}
              >
                {creando
                  ? "Iniciando..."
                  : "Iniciar inventario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
