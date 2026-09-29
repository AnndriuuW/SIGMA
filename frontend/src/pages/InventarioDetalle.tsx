import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  obtenerInventario,
  actualizarInventario,
} from "../services/inventarioService";

import {
  listarDetallesInventario,
  crearDetalleInventario,
  actualizarDetalleInventario,
} from "../services/detalleInventarioService";

import { listarUbicaciones } from "../services/ubicacionService";
import { listarRecursos } from "../services/recursoService";

import type {
  Inventario,
  ResultadoInventario,
} from "../types/inventario";

import type { DetalleInventario } from "../types/detalleInventario";
import type { Ubicacion } from "../types/ubicacion";
import type { Recurso } from "../types/recurso";

interface EstadoVerificacion {
  verificado: boolean;
  observacion: string;
}

export default function InventarioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const inventarioId = Number(id);

  const [inventario, setInventario] = useState<Inventario | null>(null);
  const [detalles, setDetalles] = useState<DetalleInventario[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);

  const [verificaciones, setVerificaciones] = useState<
    Record<number, EstadoVerificacion>
  >({});

  const [cargando, setCargando] = useState(true);
  const [guardandoRecurso, setGuardandoRecurso] = useState<number | null>(
    null,
  );

  const [procesandoInventario, setProcesandoInventario] =
    useState(false);

  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);

  const [resultadoFinal, setResultadoFinal] =
    useState<ResultadoInventario | "">("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!inventarioId || Number.isNaN(inventarioId)) {
      setError("El inventario indicado no es válido.");
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [inventarioData, detallesData] = await Promise.all([
          obtenerInventario(inventarioId),
          listarDetallesInventario(),
        ]);

        const [ubicacionesData, recursosData] = await Promise.all([
          listarUbicaciones(),
          listarRecursos(),
        ]);

        setInventario(inventarioData);

        setDetalles(
          detallesData.filter(
            (detalle) => detalle.idInventario === inventarioId,
          ),
        );

        setUbicaciones(ubicacionesData);
        setRecursos(recursosData);
      } catch (error: any) {
        const mensaje =
          error?.response?.data?.message ||
          "No se pudo cargar el inventario.";

        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [inventarioId]);

  const ubicacionesDeLaUnidad = useMemo(() => {
    if (!inventario) return [];

    return ubicaciones.filter(
      (ubicacion) =>
        ubicacion.activo &&
        ubicacion.idUnidad === inventario.idUnidad,
    );
  }, [ubicaciones, inventario]);

  const recursosDeLaUnidad = useMemo(() => {
    const idsUbicaciones = new Set(
      ubicacionesDeLaUnidad.map((ubicacion) => ubicacion.id),
    );

    return recursos.filter(
      (recurso) =>
        recurso.activo &&
        idsUbicaciones.has(recurso.idUbicacion),
    );
  }, [recursos, ubicacionesDeLaUnidad]);

  const detallePorRecurso = useMemo(() => {
    const mapa = new Map<number, DetalleInventario>();

    detalles.forEach((detalle) => {
      mapa.set(detalle.idRecurso, detalle);
    });

    return mapa;
  }, [detalles]);

  const totalRecursos = recursosDeLaUnidad.length;

  const recursosVerificados = recursosDeLaUnidad.filter((recurso) =>
    detallePorRecurso.has(recurso.id),
  ).length;

  const recursosNoEncontrados = recursosDeLaUnidad.filter((recurso) => {
    const detalle = detallePorRecurso.get(recurso.id);
    return detalle?.verificado === false;
  }).length;

  const pendientes = Math.max(
    totalRecursos - recursosVerificados,
    0,
  );

  const porcentaje =
    totalRecursos === 0
      ? 0
      : Math.round((recursosVerificados / totalRecursos) * 100);

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
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

  const obtenerTextoResultado = (
    resultado: string | null,
  ) => {
    if (!resultado) return "—";

    return resultado.replaceAll("_", " ");
  };

  const actualizarVerificacion = (
    idRecurso: number,
    campo: keyof EstadoVerificacion,
    valor: boolean | string,
  ) => {
    setVerificaciones((actuales) => ({
      ...actuales,
      [idRecurso]: {
        verificado:
          actuales[idRecurso]?.verificado ?? true,
        observacion:
          actuales[idRecurso]?.observacion ?? "",
        [campo]: valor,
      },
    }));
  };

  const obtenerEstadoVerificacion = (
    recurso: Recurso,
  ): EstadoVerificacion => {
    const estadoLocal = verificaciones[recurso.id];

    if (estadoLocal) {
      return estadoLocal;
    }

    const detalle = detallePorRecurso.get(recurso.id);

    return {
      verificado: detalle?.verificado ?? true,
      observacion: detalle?.observacion ?? "",
    };
  };

  const guardarVerificacion = async (recurso: Recurso) => {
    if (!inventario) return;

    try {
      setGuardandoRecurso(recurso.id);
      setError("");

      const estado = obtenerEstadoVerificacion(recurso);
      const detalleExistente = detallePorRecurso.get(recurso.id);

      if (detalleExistente) {
        const actualizado = await actualizarDetalleInventario(
          detalleExistente.id,
          {
            verificado: estado.verificado,
            observacion: estado.observacion || undefined,
          },
        );

        setDetalles((actuales) =>
          actuales.map((detalle) =>
            detalle.id === actualizado.id
              ? actualizado
              : detalle,
          ),
        );
      } else {
        const creado = await crearDetalleInventario({
          idInventario: inventario.id,
          idRecurso: recurso.id,
          verificado: estado.verificado,
          observacion: estado.observacion || undefined,
        });

        setDetalles((actuales) => [...actuales, creado]);
      }

      setVerificaciones((actuales) => {
        const copia = { ...actuales };
        delete copia[recurso.id];
        return copia;
      });
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudo guardar la verificación.";

      setError(mensaje);
    } finally {
      setGuardandoRecurso(null);
    }
  };

  const cambiarEstadoInventario = async (
    nuevoEstado: "EN_PROCESO" | "PAUSADO",
  ) => {
    if (!inventario) return;

    try {
      setProcesandoInventario(true);
      setError("");

      const actualizado = await actualizarInventario(
        inventario.id,
        nuevoEstado,
      );

      setInventario(actualizado);
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudo actualizar el estado del inventario.";

      setError(mensaje);
    } finally {
      setProcesandoInventario(false);
    }
  };

  const abrirFinalizarInventario = () => {
    setResultadoFinal("");
    setError("");
    setMostrarFinalizar(true);
  };

  const cerrarFinalizarInventario = () => {
    if (procesandoInventario) return;

    setMostrarFinalizar(false);
    setResultadoFinal("");
  };

  const finalizarInventario = async () => {
    if (!inventario) return;

    if (!resultadoFinal) {
      setError(
        "Selecciona un resultado para finalizar el inventario.",
      );
      return;
    }

    try {
      setProcesandoInventario(true);
      setError("");

      const actualizado = await actualizarInventario(
        inventario.id,
        "FINALIZADO",
        resultadoFinal,
      );

      setInventario(actualizado);
      setMostrarFinalizar(false);
      setResultadoFinal("");

      navigate("/inventario");
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "No se pudo finalizar el inventario.";

      setError(mensaje);
    } finally {
      setProcesandoInventario(false);
    }
  };

  if (cargando) {
    return (
      <div className="inventario-detalle-page">
        <div className="inventario-detalle-state">
          <div className="inventario-detalle-loading-line" />
          <strong>Cargando inventario</strong>
          <span>
            Obteniendo información y recursos de la unidad...
          </span>
        </div>
      </div>
    );
  }

  if (error && !inventario) {
    return (
      <div className="inventario-detalle-page">
        <Link
          to="/inventario"
          className="inventario-detalle-back"
        >
          <span>←</span>
          Volver a inventarios
        </Link>

        <div className="inventario-detalle-error">
          <strong>{error}</strong>
        </div>
      </div>
    );
  }

  if (!inventario) {
    return null;
  }

  return (
    <div className="inventario-detalle-page">
      <Link
        to="/inventario"
        className="inventario-detalle-back"
      >
        <span>←</span>
        Volver a inventarios
      </Link>

      <header className="inventario-detalle-header">
        <div>
          <span className="inventario-detalle-kicker">
            SIGMA · EJECUCIÓN DE INVENTARIO
          </span>

          <div className="inventario-detalle-title-row">
            <div>
              <h1>
                Inventario #{inventario.id}
              </h1>

              <p>
                Verificación de recursos de la unidad.
              </p>
            </div>

            <span
              className={`inventario-detalle-status inventario-detalle-status-${inventario.estado.toLowerCase()}`}
            >
              <span />
              {obtenerTextoEstado(inventario.estado)}
            </span>
          </div>
        </div>

        <div className="inventario-detalle-unit">
          <span>UNIDAD</span>
          <strong>{inventario.nombreUnidad}</strong>
        </div>
      </header>

      <div className="inventario-detalle-actions">
        <div className="inventario-detalle-responsable">
          <span>RESPONSABLE</span>
          <strong>{inventario.nombreResponsable}</strong>
        </div>

        <div className="inventario-detalle-action-group">
          {inventario.estado === "EN_PROCESO" && (
            <>
              <button
                type="button"
                className="inventario-detail-secondary-button"
                onClick={() =>
                  cambiarEstadoInventario("PAUSADO")
                }
                disabled={procesandoInventario}
              >
                {procesandoInventario
                  ? "Procesando..."
                  : "Pausar inventario"}
              </button>

              <button
                type="button"
                className="inventario-detail-primary-button"
                onClick={abrirFinalizarInventario}
                disabled={procesandoInventario}
              >
                Finalizar inventario
              </button>
            </>
          )}

          {inventario.estado === "PAUSADO" && (
            <>
              <button
                type="button"
                className="inventario-detail-primary-button"
                onClick={() =>
                  cambiarEstadoInventario("EN_PROCESO")
                }
                disabled={procesandoInventario}
              >
                {procesandoInventario
                  ? "Procesando..."
                  : "Reanudar inventario"}
              </button>

              <button
                type="button"
                className="inventario-detail-primary-button"
                onClick={abrirFinalizarInventario}
                disabled={procesandoInventario}
              >
                Finalizar inventario
              </button>
            </>
          )}

          {inventario.estado === "FINALIZADO" && (
            <span className="inventario-finalizado-label">
              Inventario cerrado
            </span>
          )}
        </div>
      </div>

      <section className="inventario-detalle-summary">
        <div className="inventario-detalle-summary-item">
          <span>RECURSOS</span>
          <strong>{totalRecursos}</strong>
          <small>Registrados en la unidad</small>
        </div>

        <div className="inventario-detalle-summary-item">
          <span>VERIFICADOS</span>
          <strong>{recursosVerificados}</strong>
          <small>Revisados durante el inventario</small>
        </div>

        <div className="inventario-detalle-summary-item">
          <span>PENDIENTES</span>
          <strong>{pendientes}</strong>
          <small>Recursos aún sin registrar</small>
        </div>

        <div className="inventario-detalle-summary-item">
          <span>NO ENCONTRADOS</span>
          <strong>{recursosNoEncontrados}</strong>
          <small>Marcados durante la revisión</small>
        </div>
      </section>

      <section className="inventario-detalle-progress">
        <div className="inventario-detalle-progress-head">
          <div>
            <span className="inventario-detalle-section-label">
              AVANCE DEL INVENTARIO
            </span>

            <h2>Progreso de verificación</h2>

            <p>
              {recursosVerificados} de {totalRecursos} recursos
              registrados.
            </p>
          </div>

          <strong>{porcentaje}%</strong>
        </div>

        <div className="inventario-detalle-progress-track">
          <div
            className="inventario-detalle-progress-fill"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <div className="inventario-detalle-progress-meta">
          <span>
            Inicio: {formatearFecha(inventario.fechaInicio)}
          </span>

          <span>
            Fin: {formatearFecha(inventario.fechaFin)}
          </span>

          {inventario.resultadoGeneral && (
            <span>
              Resultado:{" "}
              {obtenerTextoResultado(
                inventario.resultadoGeneral,
              )}
            </span>
          )}
        </div>
      </section>

      {error && (
        <div className="inventario-detalle-inline-error">
          {error}
        </div>
      )}

      <section className="inventario-detalle-workspace">
        <div className="inventario-detalle-workspace-header">
          <div>
            <span className="inventario-detalle-section-label">
              VERIFICACIÓN DE EQUIPAMIENTO
            </span>

            <h2>Recursos de la unidad</h2>

            <p>
              Registra la presencia de cada recurso y añade una
              observación cuando sea necesario.
            </p>
          </div>

          <span className="inventario-detalle-resource-count">
            {totalRecursos}{" "}
            {totalRecursos === 1
              ? "recurso"
              : "recursos"}
          </span>
        </div>

        {recursosDeLaUnidad.length === 0 ? (
          <div className="inventario-detalle-empty">
            <strong>Esta unidad no tiene recursos registrados</strong>
            <span>
              No existen recursos activos disponibles para verificar.
            </span>
          </div>
        ) : (
          <div className="inventario-detalle-resource-list">
            {recursosDeLaUnidad.map((recurso, index) => {
              const detalle = detallePorRecurso.get(
                recurso.id,
              );

              const estado =
                obtenerEstadoVerificacion(recurso);

              const tieneCambios = Boolean(
                verificaciones[recurso.id],
              );

              return (
                <article
                  className="inventario-detalle-resource"
                  key={recurso.id}
                >
                  <div className="inventario-detalle-resource-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="inventario-detalle-resource-main">
                    <div className="inventario-detalle-resource-heading">
                      <div>
                        <span className="inventario-detalle-resource-code">
                          {recurso.codigo}
                        </span>

                        <h3>{recurso.nombre}</h3>

                        <p>
                          {recurso.nombreTipoRecurso}
                          {recurso.marca
                            ? ` · ${recurso.marca}`
                            : ""}
                          {recurso.modelo
                            ? ` · ${recurso.modelo}`
                            : ""}
                        </p>
                      </div>

                      {detalle && !tieneCambios && (
                        <span
                          className={`inventario-verification-state ${
                            detalle.verificado
                              ? "inventario-verification-found"
                              : "inventario-verification-missing"
                          }`}
                        >
                          <span />
                          {detalle.verificado
                            ? "Encontrado"
                            : "No encontrado"}
                        </span>
                      )}
                    </div>

                    <div className="inventario-detalle-controls">
                      <div className="inventario-radio-group">
                        <label
                          className={`inventario-radio-option ${
                            estado.verificado
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`verificacion-${recurso.id}`}
                            checked={estado.verificado}
                            onChange={() =>
                              actualizarVerificacion(
                                recurso.id,
                                "verificado",
                                true,
                              )
                            }
                            disabled={
                              inventario.estado ===
                                "FINALIZADO" ||
                              guardandoRecurso === recurso.id
                            }
                          />

                          <span className="inventario-radio-mark" />

                          Encontrado
                        </label>

                        <label
                          className={`inventario-radio-option ${
                            !estado.verificado
                              ? "selected missing"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`verificacion-${recurso.id}`}
                            checked={!estado.verificado}
                            onChange={() =>
                              actualizarVerificacion(
                                recurso.id,
                                "verificado",
                                false,
                              )
                            }
                            disabled={
                              inventario.estado ===
                                "FINALIZADO" ||
                              guardandoRecurso === recurso.id
                            }
                          />

                          <span className="inventario-radio-mark" />

                          No encontrado
                        </label>
                      </div>

                      <div className="inventario-observation-wrapper">
                        <input
                          type="text"
                          className="inventario-observation"
                          placeholder="Observación opcional..."
                          value={estado.observacion}
                          onChange={(event) =>
                            actualizarVerificacion(
                              recurso.id,
                              "observacion",
                              event.target.value,
                            )
                          }
                          disabled={
                            inventario.estado ===
                              "FINALIZADO" ||
                            guardandoRecurso === recurso.id
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="inventario-save-button"
                        onClick={() =>
                          guardarVerificacion(recurso)
                        }
                        disabled={
                          inventario.estado ===
                            "FINALIZADO" ||
                          guardandoRecurso === recurso.id ||
                          (!detalle && !tieneCambios)
                        }
                      >
                        {guardandoRecurso === recurso.id
                          ? "Guardando..."
                          : detalle
                            ? "Actualizar"
                            : "Guardar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {mostrarFinalizar && (
        <div className="inventario-finalizar-overlay">
          <div
            className="inventario-finalizar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="finalizar-inventario-title"
          >
            <div className="inventario-finalizar-header">
              <div>
                <span>CIERRE DE INVENTARIO</span>

                <h2 id="finalizar-inventario-title">
                  Finalizar inventario
                </h2>

                <p>
                  El inventario pasará a estado FINALIZADO y ya no
                  podrá modificarse.
                </p>
              </div>

              <button
                type="button"
                className="inventario-finalizar-close"
                onClick={cerrarFinalizarInventario}
                disabled={procesandoInventario}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="inventario-finalizar-body">
              <div className="inventario-finalizar-warning">
                <strong>Antes de cerrar el registro</strong>

                <span>
                  Verificados: {recursosVerificados} de{" "}
                  {totalRecursos} recursos.
                </span>
              </div>

              <label htmlFor="resultado-inventario">
                Resultado general
              </label>

              <select
                id="resultado-inventario"
                value={resultadoFinal}
                onChange={(event) =>
                  setResultadoFinal(
                    event.target.value as
                      | ResultadoInventario
                      | "",
                  )
                }
                disabled={procesandoInventario}
              >
                <option value="">
                  Selecciona un resultado
                </option>

                <option value="CONFORME">
                  Conforme
                </option>

                <option value="CON_OBSERVACIONES">
                  Con observaciones
                </option>

                <option value="NO_CONFORME">
                  No conforme
                </option>
              </select>

              {error && (
                <p className="inventario-finalizar-error">
                  {error}
                </p>
              )}
            </div>

            <div className="inventario-finalizar-footer">
              <button
                type="button"
                className="inventario-finalizar-secondary"
                onClick={cerrarFinalizarInventario}
                disabled={procesandoInventario}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="inventario-finalizar-primary"
                onClick={finalizarInventario}
                disabled={procesandoInventario}
              >
                {procesandoInventario
                  ? "Finalizando..."
                  : "Confirmar finalización"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}