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

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  useEffect(() => {
    if (!inventarioId || Number.isNaN(inventarioId)) {
      setError("El inventario indicado no es válido.");
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
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

  // =========================================================
  // UBICACIONES DE LA UNIDAD
  // =========================================================

  const ubicacionesDeLaUnidad = useMemo(() => {
    if (!inventario) return [];

    return ubicaciones.filter(
      (ubicacion) =>
        ubicacion.activo &&
        ubicacion.idUnidad === inventario.idUnidad,
    );
  }, [ubicaciones, inventario]);

  // =========================================================
  // RECURSOS DE LA UNIDAD
  // =========================================================

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

  // =========================================================
  // DETALLES POR RECURSO
  // =========================================================

  const detallePorRecurso = useMemo(() => {
    const mapa = new Map<number, DetalleInventario>();

    detalles.forEach((detalle) => {
      mapa.set(detalle.idRecurso, detalle);
    });

    return mapa;
  }, [detalles]);

  // =========================================================
  // PROGRESO
  // =========================================================

  const totalRecursos = recursosDeLaUnidad.length;

  const recursosVerificados = recursosDeLaUnidad.filter((recurso) =>
    detallePorRecurso.has(recurso.id),
  ).length;

  const porcentaje =
    totalRecursos === 0
      ? 0
      : Math.round((recursosVerificados / totalRecursos) * 100);

  // =========================================================
  // VERIFICACIONES
  // =========================================================

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

  // =========================================================
  // GUARDAR VERIFICACIÓN
  // =========================================================

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

  // =========================================================
  // PAUSAR / REANUDAR
  // =========================================================

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

  // =========================================================
  // FINALIZAR
  // =========================================================

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

  // =========================================================
  // CARGANDO
  // =========================================================

  if (cargando) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !inventario) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/inventario")}
          >
            Volver a inventarios
          </button>
        </div>
      </div>
    );
  }

  if (!inventario) {
    return null;
  }

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="page-container">
      <div className="detail-back">
        <Link to="/inventario">
          ← Volver a inventarios
        </Link>
      </div>

      {/* ENCABEZADO */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            CONTROL DE RECURSOS
          </p>

          <h1>Inventario #{inventario.id}</h1>

          <p className="page-description">
            Verificación de recursos de la unidad.
          </p>
        </div>

        <div className="inventory-header-actions">
          <span
            className={`status-badge status-${inventario.estado.toLowerCase()}`}
          >
            {inventario.estado.replaceAll("_", " ")}
          </span>

          {inventario.estado === "EN_PROCESO" && (
            <>
              <button
                className="secondary-button"
                onClick={() =>
                  cambiarEstadoInventario("PAUSADO")
                }
                disabled={procesandoInventario}
              >
                {procesandoInventario
                  ? "Procesando..."
                  : "Pausar"}
              </button>

              <button
                className="primary-button"
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
                className="primary-button"
                onClick={() =>
                  cambiarEstadoInventario("EN_PROCESO")
                }
                disabled={procesandoInventario}
              >
                {procesandoInventario
                  ? "Procesando..."
                  : "Reanudar"}
              </button>

              <button
                className="primary-button"
                onClick={abrirFinalizarInventario}
                disabled={procesandoInventario}
              >
                Finalizar inventario
              </button>
            </>
          )}
        </div>
      </div>

      {/* INFORMACIÓN */}

      <div className="inventory-info-grid">
        <div className="inventory-info-card">
          <span>Unidad</span>
          <strong>{inventario.nombreUnidad}</strong>
        </div>

        <div className="inventory-info-card">
          <span>Responsable</span>
          <strong>{inventario.nombreResponsable}</strong>
        </div>

        <div className="inventory-info-card">
          <span>Inicio</span>
          <strong>
            {new Date(
              inventario.fechaInicio,
            ).toLocaleString("es-PE", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </strong>
        </div>

        <div className="inventory-info-card">
          <span>Fin</span>
          <strong>
            {inventario.fechaFin
              ? new Date(
                  inventario.fechaFin,
                ).toLocaleString("es-PE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "En proceso"}
          </strong>
        </div>
      </div>

      {/* PROGRESO */}

      <div className="inventory-progress-card">
        <div className="inventory-progress-header">
          <div>
            <h2>Progreso</h2>

            <p>
              {recursosVerificados} de {totalRecursos}{" "}
              recursos verificados
            </p>
          </div>

          <strong>{porcentaje}%</strong>
        </div>

        <div className="inventory-progress-track">
          <div
            className="inventory-progress-fill"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="form-error inventory-error">
          {error}
        </div>
      )}

      {/* RECURSOS */}

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Recursos de la unidad</h2>

            <p>
              Marca cada recurso según su presencia durante
              la verificación.
            </p>
          </div>
        </div>

        {recursosDeLaUnidad.length === 0 ? (
          <div className="empty-state">
            <p>
              Esta unidad no tiene recursos registrados.
            </p>
          </div>
        ) : (
          <div className="inventory-resource-list">
            {recursosDeLaUnidad.map((recurso) => {
              const detalle = detallePorRecurso.get(
                recurso.id,
              );

              const estado =
                obtenerEstadoVerificacion(recurso);

              const tieneCambios = Boolean(
                verificaciones[recurso.id],
              );

              return (
                <div
                  className="inventory-resource-item"
                  key={recurso.id}
                >
                  <div className="inventory-resource-main">
                    <div>
                      <span className="resource-code">
                        {recurso.codigo}
                      </span>

                      <h3>{recurso.nombre}</h3>

                      <p>
                        {recurso.marca}
                        {recurso.modelo
                          ? ` · ${recurso.modelo}`
                          : ""}
                      </p>
                    </div>

                    {detalle && !tieneCambios && (
                      <span
                        className={`verification-badge ${
                          detalle.verificado
                            ? "verification-ok"
                            : "verification-missing"
                        }`}
                      >
                        {detalle.verificado
                          ? "Encontrado"
                          : "No encontrado"}
                      </span>
                    )}
                  </div>

                  <div className="inventory-resource-controls">
                    <label className="verification-option">
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
                          inventario.estado === "FINALIZADO" ||
                          guardandoRecurso === recurso.id
                        }
                      />

                      Encontrado
                    </label>

                    <label className="verification-option">
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
                          inventario.estado === "FINALIZADO" ||
                          guardandoRecurso === recurso.id
                        }
                      />

                      No encontrado
                    </label>

                    <input
                      type="text"
                      className="verification-observation"
                      placeholder="Observación (opcional)"
                      value={estado.observacion}
                      onChange={(event) =>
                        actualizarVerificacion(
                          recurso.id,
                          "observacion",
                          event.target.value,
                        )
                      }
                      disabled={
                        inventario.estado === "FINALIZADO" ||
                        guardandoRecurso === recurso.id
                      }
                    />

                    <button
                      className="secondary-button"
                      onClick={() =>
                        guardarVerificacion(recurso)
                      }
                      disabled={
                        inventario.estado === "FINALIZADO" ||
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
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL FINALIZAR */}

      {mostrarFinalizar && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="page-eyebrow">
                  CIERRE DE INVENTARIO
                </p>

                <h2>Finalizar inventario</h2>
              </div>

              <button
                className="modal-close"
                onClick={cerrarFinalizarInventario}
                disabled={procesandoInventario}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>
                El inventario pasará a estado FINALIZADO y
                ya no podrá modificarse.
              </p>

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
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={cerrarFinalizarInventario}
                disabled={procesandoInventario}
              >
                Cancelar
              </button>

              <button
                className="primary-button"
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