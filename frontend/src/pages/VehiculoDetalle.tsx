import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  FileDown,
  History,
  Trash2,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import "../styles/vehiculo-detalle.css";
import { useAuth } from "../context/AuthContext";

import { listarUnidades } from "../services/unidadService";
import { listarUbicaciones } from "../services/ubicacionService";
import {
  cambiarUbicacionRecurso,
  listarRecursos,
  obtenerHistorialRecurso,
} from "../services/recursoService";

import type { Unidad } from "../types/unidad";
import type { Ubicacion } from "../types/ubicacion";
import type { Recurso } from "../types/recurso";
import type { MovimientoRecurso } from "../types/movimientoRecurso";
import VehiculoDetallePDF from "../components/VehiculoDetallePDF";

const formatearTexto = (valor: string) => valor.replaceAll("_", " ");

const obtenerMensajeApi = (error: unknown) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message
    : undefined;

function VehiculoDetalle() {
  const { usuario } = useAuth();
  const puedeVerHistorial = [
    "ADMINISTRADOR",
    "JEFE_MAQUINAS",
    "PERSONAL_ADJUNTO",
  ].includes(usuario?.rol ?? "");
  const { id } = useParams<{ id: string }>();
  const unidadId = Number(id);

  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [recursosDisponibles, setRecursosDisponibles] = useState<Recurso[]>([]);
  const [ubicacionSalaOperaciones, setUbicacionSalaOperaciones] =
    useState<Ubicacion | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [ubicacionSeleccionada, setUbicacionSeleccionada] =
    useState<number | null>(null);
  const [ubicacionesPlegadas, setUbicacionesPlegadas] = useState<Set<number>>(
    () => new Set(),
  );

  const seleccionarUbicacion = (ubicacionId: number) => {
    setUbicacionSeleccionada(ubicacionId);
    document
      .getElementById(`ubicacion-inventario-${ubicacionId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [mostrarAsignar, setMostrarAsignar] = useState(false);
  const [recursoAAsignarId, setRecursoAAsignarId] = useState<number | null>(null);
  const [ubicacionDestinoId, setUbicacionDestinoId] = useState<number | null>(null);

  const [mostrarMover, setMostrarMover] = useState(false);
  const [recursoAMover, setRecursoAMover] = useState<Recurso | null>(null);
  const [ubicacionMoverId, setUbicacionMoverId] = useState<number | null>(null);

  const [recursoARetirar, setRecursoARetirar] = useState<Recurso | null>(null);

  const [recursoHistorial, setRecursoHistorial] = useState<Recurso | null>(null);
  const [movimientosHistorial, setMovimientosHistorial] = useState<MovimientoRecurso[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargarDetalle = async () => {
      if (!id || !Number.isInteger(unidadId) || unidadId <= 0) {
        setError("La unidad indicada no es válida.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const [unidadesData, ubicacionesData, recursosData] = await Promise.all([
          listarUnidades(),
          listarUbicaciones(),
          listarRecursos(),
        ]);

        if (cancelado) return;

        const unidadEncontrada = unidadesData.find((item) => item.id === unidadId);

        if (!unidadEncontrada) {
          setError("La unidad no fue encontrada.");
          return;
        }

        const ubicacionesDeUnidad = ubicacionesData.filter(
          (ubicacion) =>
            ubicacion.idUnidad === unidadEncontrada.id && ubicacion.activo,
        );

        const salaOperaciones =
          ubicacionesData.find(
            (ubicacion) =>
              ubicacion.tipo === "SALA_DE_OPERACIONES" && ubicacion.activo,
          ) ?? null;

        const recursosDeSalaOperaciones = salaOperaciones
          ? recursosData.filter(
              (recurso) =>
                recurso.idUbicacion === salaOperaciones.id &&
                recurso.estado === "OPERATIVO",
            )
          : [];

        const idsUbicaciones = new Set(
          ubicacionesDeUnidad.map((ubicacion) => ubicacion.id),
        );

        const recursosDeUnidad = recursosData.filter((recurso) =>
          idsUbicaciones.has(recurso.idUbicacion),
        );

        setUnidad(unidadEncontrada);
        setUbicaciones(ubicacionesDeUnidad);
        setUbicacionSalaOperaciones(salaOperaciones);
        setRecursos(recursosDeUnidad);
        setRecursosDisponibles(recursosDeSalaOperaciones);

        setUbicacionSeleccionada((actual) => {
          if (actual !== null && idsUbicaciones.has(actual)) return actual;
          return ubicacionesDeUnidad[0]?.id ?? null;
        });
      } catch (errorCarga) {
        console.error("Error al cargar el detalle de la unidad:", errorCarga);
        if (!cancelado) {
          setError("No se pudo cargar la información de la unidad.");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    void cargarDetalle();

    return () => {
      cancelado = true;
    };
  }, [id, unidadId]);

  const terminoBusqueda = busqueda.trim().toLowerCase();

  const recursosFiltrados = !terminoBusqueda
    ? recursos
    : recursos.filter((recurso) => {
        const nombre = recurso.nombre?.toLowerCase() ?? "";
        const codigo = recurso.codigo?.toLowerCase() ?? "";
        const tipo = recurso.nombreTipoRecurso?.toLowerCase() ?? "";
        const marca = recurso.marca?.toLowerCase() ?? "";

        return (
          nombre.includes(terminoBusqueda) ||
          codigo.includes(terminoBusqueda) ||
          tipo.includes(terminoBusqueda) ||
          marca.includes(terminoBusqueda)
        );
      });

  const recursosPorUbicacion = new Map<number, Recurso[]>();

  recursos.forEach((recurso) => {
    const actuales = recursosPorUbicacion.get(recurso.idUbicacion) ?? [];
    recursosPorUbicacion.set(recurso.idUbicacion, [...actuales, recurso]);
  });

  const obtenerRecursosUbicacion = (ubicacionId: number) =>
    recursosFiltrados.filter((recurso) => recurso.idUbicacion === ubicacionId);

  const cerrarModalAsignar = () => {
    setMostrarAsignar(false);
    setRecursoAAsignarId(null);
    setUbicacionDestinoId(null);
  };

  const cerrarModalMover = () => {
    setMostrarMover(false);
    setRecursoAMover(null);
    setUbicacionMoverId(null);
  };

  const exportarReporte = async () => {
    if (!unidad) return;

    try {
      const blob = await pdf(
        <VehiculoDetallePDF
          unidad={unidad}
          ubicaciones={ubicaciones}
          recursos={recursos}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-${unidad.nombre
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (errorExportacion) {
      console.error("Error al exportar el reporte:", errorExportacion);
      window.alert("No se pudo exportar el reporte. Inténtalo nuevamente.");
    }
  };

  const confirmarRetiroRecurso = async () => {
    if (!recursoARetirar || !ubicacionSalaOperaciones) {
      window.alert(
        "No se encontró la Sala de Operaciones o el recurso seleccionado.",
      );
      return;
    }

    try {
      const recursoActualizado = await cambiarUbicacionRecurso(
        recursoARetirar.id,
        ubicacionSalaOperaciones.id,
      );

      setRecursos((actuales) =>
        actuales.filter((recurso) => recurso.id !== recursoActualizado.id),
      );

      setRecursosDisponibles((actuales) => [
        ...actuales.filter((recurso) => recurso.id !== recursoActualizado.id),
        ...(recursoActualizado.estado === "OPERATIVO" ? [recursoActualizado] : []),
      ]);

      setRecursoARetirar(null);
    } catch (errorRetiro) {
      console.error("Error al retirar el recurso:", errorRetiro);
      window.alert("No se pudo retirar el recurso. Inténtalo nuevamente.");
    }
  };

  const confirmarAsignacionRecurso = async () => {
    if (recursoAAsignarId === null || ubicacionDestinoId === null) {
      window.alert("Selecciona un recurso y una ubicación de destino.");
      return;
    }

    const ubicacionDestino = ubicaciones.find(
      (ubicacion) => ubicacion.id === ubicacionDestinoId,
    );

    if (!ubicacionDestino) {
      window.alert("La ubicación seleccionada no pertenece a esta unidad.");
      return;
    }

    try {
      const recursoActualizado = await cambiarUbicacionRecurso(
        recursoAAsignarId,
        ubicacionDestino.id,
      );

      setRecursos((actuales) => [
        ...actuales.filter((recurso) => recurso.id !== recursoActualizado.id),
        recursoActualizado,
      ]);

      setRecursosDisponibles((actuales) =>
        actuales.filter((recurso) => recurso.id !== recursoActualizado.id),
      );

      setUbicacionSeleccionada(ubicacionDestino.id);
      cerrarModalAsignar();
    } catch (errorAsignacion) {
      console.error("Error al asignar el recurso:", errorAsignacion);
      window.alert(
        obtenerMensajeApi(errorAsignacion) ??
          "No se pudo asignar el recurso. Inténtalo nuevamente.",
      );
    }
  };

  const confirmarMoverRecurso = async () => {
    if (!recursoAMover || ubicacionMoverId === null) {
      window.alert("Selecciona una ubicación de destino.");
      return;
    }

    const ubicacionDestino = ubicaciones.find(
      (ubicacion) => ubicacion.id === ubicacionMoverId,
    );

    if (!ubicacionDestino) {
      window.alert("La ubicación seleccionada no pertenece a esta unidad.");
      return;
    }

    if (ubicacionDestino.id === recursoAMover.idUbicacion) {
      window.alert("El recurso ya se encuentra en esa ubicación.");
      return;
    }

    try {
      const recursoActualizado = await cambiarUbicacionRecurso(
        recursoAMover.id,
        ubicacionDestino.id,
      );

      setRecursos((actuales) =>
        actuales.map((recurso) =>
          recurso.id === recursoActualizado.id ? recursoActualizado : recurso,
        ),
      );

      setUbicacionSeleccionada(recursoActualizado.idUbicacion);
      cerrarModalMover();
    } catch (errorMovimiento) {
      console.error("Error al mover el recurso:", errorMovimiento);
      window.alert(
        obtenerMensajeApi(errorMovimiento) ??
          "No se pudo mover el recurso. Inténtalo nuevamente.",
      );
    }
  };

  const abrirHistorialRecurso = async (recurso: Recurso) => {
    setRecursoHistorial(recurso);
    setMovimientosHistorial([]);
    setErrorHistorial("");
    setCargandoHistorial(true);

    try {
      const movimientos = await obtenerHistorialRecurso(recurso.id);
      setMovimientosHistorial(movimientos);
    } catch (errorHistorialCarga) {
      console.error("Error al cargar el historial:", errorHistorialCarga);
      setErrorHistorial(
        "No se pudo cargar el historial de movimientos. Inténtalo nuevamente.",
      );
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cerrarHistorialRecurso = () => {
    setRecursoHistorial(null);
    setMovimientosHistorial([]);
    setErrorHistorial("");
    setCargandoHistorial(false);
  };

  const formatearFechaHora = (fechaHora: string) => {
    const fecha = new Date(fechaHora);
    if (Number.isNaN(fecha.getTime())) return fechaHora.replace("T", " ");

    return new Intl.DateTimeFormat("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(fecha);
  };

  if (cargando) {
    return (
      <div className="vehiculo-detalle-page">
        <div className="vehiculo-detalle-loading">
          <div className="vehiculo-detalle-loading-line" />
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
          Vehículos
        </Link>
        <div className="vehiculo-detalle-error">
          <strong>{error || "La unidad no fue encontrada."}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="vehiculo-detalle-page">
      <Link to="/vehiculos" className="vehiculo-detalle-back">
        <span>←</span>
        Vehículos
      </Link>

      <section className="vehiculo-detalle-header">
        <div className="vehiculo-detalle-header-main">
          <span className="vehiculo-detalle-eyebrow">
            SIGMA · DETALLE DE UNIDAD
          </span>
          <div className="vehiculo-detalle-title-row">
            <div>
              <h1>{unidad.nombre}</h1>
              <p>
                Información operativa y equipamiento asociado a la unidad.
              </p>
            </div>
          </div>
        </div>

        <div className="vehiculo-detalle-header-actions">
          <div className="vehiculo-detalle-quick-info">
            <div>
              <span>INDICATIVO</span>
              <strong>{unidad.indicativo}</strong>
            </div>
            <div>
              <span>UBICACIONES</span>
              <strong>{ubicaciones.length}</strong>
            </div>
            <div>
              <span>RECURSOS</span>
              <strong>{recursos.length}</strong>
            </div>
          </div>

          <div className="vehiculo-detalle-actions">
            <button
              type="button"
              className="vehiculo-detalle-button vehiculo-detalle-button-secondary"
              onClick={exportarReporte}
            >
              <FileDown size={17} strokeWidth={2.2} />
              Exportar reporte
            </button>
            <button
              type="button"
              className="vehiculo-detalle-button vehiculo-detalle-button-primary"
              onClick={() => setMostrarAsignar(true)}
            >
              <span>+</span>
              Asignar recurso
            </button>
          </div>
        </div>
      </section>

      <section className="vehiculo-detalle-content">
        <header className="vehiculo-detalle-content-header">
          <div>
            <h2>Ubicaciones y recursos</h2>
            <p>Espacios registrados y equipamiento asociado a esta unidad.</p>
          </div>
          <div className="vehiculo-detalle-total">
            <strong>{recursos.length}</strong>
            <span>{recursos.length === 1 ? "RECURSO" : "RECURSOS"}</span>
          </div>
        </header>

        <div className="vehiculo-detalle-workspace">
          <aside className="vehiculo-detalle-sidebar">
            <div className="vehiculo-detalle-search">
              <label htmlFor="buscar-recurso">BUSCAR RECURSO</label>
              <input
                id="buscar-recurso"
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Nombre o código"
              />
            </div>

            <div className="vehiculo-detalle-location-list">
              <div className="vehiculo-detalle-location-list-header">
                <span>UBICACIONES</span>
                <strong>{ubicaciones.length}</strong>
              </div>

              <div className="vehiculo-detalle-location-items">
                {ubicaciones.map((ubicacion, index) => {
                  const cantidad =
                    recursosPorUbicacion.get(ubicacion.id)?.length ?? 0;
                  const seleccionada = ubicacionSeleccionada === ubicacion.id;

                  return (
                    <button
                      type="button"
                      key={ubicacion.id}
                      className={`vehiculo-detalle-location-item ${
                        seleccionada ? "is-selected" : ""
                      }`}
                      onClick={() => {
                        seleccionarUbicacion(ubicacion.id);
                        setUbicacionesPlegadas((actuales) => {
                          if (!actuales.has(ubicacion.id)) return actuales;
                          const siguientes = new Set(actuales);
                          siguientes.delete(ubicacion.id);
                          return siguientes;
                        });
                      }}
                    >
                      <span className="vehiculo-detalle-location-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="vehiculo-detalle-location-name">
                        {ubicacion.nombre}
                      </span>
                      <span
                        className={`vehiculo-detalle-location-amount ${
                          cantidad > 0 ? "has-resources" : ""
                        }`}
                      >
                        {cantidad > 0 ? cantidad : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="vehiculo-detalle-inventory">
            <div className="vehiculo-detalle-inventory-head">
              <div className="vehiculo-detalle-inventory-columns">
                <span>RECURSO</span>
              </div>
            </div>

            <div className="vehiculo-detalle-inventory-list">
              {ubicaciones.map((ubicacion, index) => {
                const recursosUbicacion = obtenerRecursosUbicacion(ubicacion.id);
                const estaSeleccionada = ubicacionSeleccionada === ubicacion.id;
                const estaPlegada = ubicacionesPlegadas.has(ubicacion.id);
                const mostrarUbicacion =
                  terminoBusqueda.length === 0 || recursosUbicacion.length > 0;

                if (!mostrarUbicacion) return null;

                return (
                  <article
                    key={ubicacion.id}
                    id={`ubicacion-inventario-${ubicacion.id}`}
                    className={`vehiculo-detalle-location-block ${
                      estaSeleccionada ? "is-active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={`vehiculo-detalle-location-block-header ${
                        estaSeleccionada ? "is-active" : ""
                      }`}
                      onClick={() => {
                        seleccionarUbicacion(ubicacion.id);
                        if (recursosUbicacion.length > 0) {
                          setUbicacionesPlegadas((actuales) => {
                            const siguientes = new Set(actuales);
                            if (siguientes.has(ubicacion.id)) {
                              siguientes.delete(ubicacion.id);
                            } else {
                              siguientes.add(ubicacion.id);
                            }
                            return siguientes;
                          });
                        }
                      }}
                      aria-expanded={
                        recursosUbicacion.length > 0 ? !estaPlegada : undefined
                      }
                      aria-label={
                        recursosUbicacion.length === 0
                          ? `${ubicacion.nombre}, sin recursos`
                          : `${estaPlegada ? "Mostrar" : "Ocultar"} recursos de ${ubicacion.nombre}`
                      }
                    >
                      <div className="vehiculo-detalle-location-block-title">
                        <span className="vehiculo-detalle-block-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span>{formatearTexto(ubicacion.tipo)}</span>
                          <strong>{ubicacion.nombre}</strong>
                        </div>
                      </div>
                      <span className="vehiculo-detalle-block-count">
                        {recursosUbicacion.length > 0
                          ? `${recursosUbicacion.length} ${
                              recursosUbicacion.length === 1
                                ? "recurso"
                                : "recursos"
                            }`
                          : "Sin recursos"}
                      </span>
                      {recursosUbicacion.length > 0 && (
                        estaPlegada ? (
                          <ChevronRight
                            className="vehiculo-detalle-location-toggle"
                            size={20}
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            className="vehiculo-detalle-location-toggle"
                            size={20}
                            aria-hidden="true"
                          />
                        )
                      )}
                    </button>

                    {recursosUbicacion.length > 0 && !estaPlegada && (
                      <div className="vehiculo-detalle-resource-list">
                        {recursosUbicacion.map((recurso) => (
                          <div
                            className="vehiculo-detalle-resource"
                            key={recurso.id}
                          >
                            <div className="vehiculo-detalle-resource-name">
                              <strong>{recurso.nombre}</strong>
                              <span>
                                {recurso.nombreTipoRecurso}
                                {recurso.marca ? ` · ${recurso.marca}` : ""}
                              </span>
                            </div>

                            <span className="vehiculo-detalle-resource-code">
                              {recurso.codigo}
                            </span>

                            <div className="vehiculo-detalle-resource-actions">
                              {puedeVerHistorial && (
                                <button
                                  type="button"
                                  className="vehiculo-detalle-resource-history"
                                  onClick={() => void abrirHistorialRecurso(recurso)}
                                  aria-label={`Ver historial de ${recurso.nombre}`}
                                  title="Historial de movimientos"
                                >
                                  <History size={20} strokeWidth={2} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="vehiculo-detalle-resource-move"
                                onClick={() => {
                                  setRecursoAMover(recurso);
                                  setUbicacionMoverId(null);
                                  setMostrarMover(true);
                                }}
                                aria-label={`Mover ${recurso.nombre}`}
                                title="Mover recurso"
                              >
                                <ArrowLeftRight size={20} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                className="vehiculo-detalle-resource-remove"
                                onClick={() => setRecursoARetirar(recurso)}
                                aria-label={`Retirar ${recurso.nombre}`}
                                title="Retirar recurso"
                              >
                                <Trash2 size={20} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}

              {terminoBusqueda !== "" && recursosFiltrados.length === 0 && (
                <div className="vehiculo-detalle-no-results">
                  <strong>No se encontraron recursos</strong>
                  <span>Intenta buscar por nombre o código.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL MOVER RECURSO */}
      {mostrarMover && recursoAMover && (
        <div className="vehiculo-detalle-modal-overlay" onClick={cerrarModalMover}>
          <div
            className="vehiculo-detalle-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vehiculo-detalle-modal-header">
              <div>
                <span>GESTIÓN DE EQUIPAMIENTO</span>
                <h2>Mover recurso</h2>
              </div>
              <button
                type="button"
                onClick={cerrarModalMover}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="vehiculo-detalle-modal-body">
              <p>
                Selecciona la nueva ubicación de este recurso dentro de la misma
                unidad.
              </p>

              <div className="vehiculo-detalle-modal-resource">
                <strong>{recursoAMover.nombre}</strong>
                <span>{recursoAMover.codigo}</span>
              </div>

              <label>UBICACIÓN ACTUAL</label>
              <p>
                <strong>
                  {ubicaciones.find(
                    (ubicacion) => ubicacion.id === recursoAMover.idUbicacion,
                  )?.nombre ?? "Ubicación actual"}
                </strong>
              </p>

              <label htmlFor="ubicacion-mover-recurso">NUEVA UBICACIÓN</label>
              <select
                id="ubicacion-mover-recurso"
                value={ubicacionMoverId ?? ""}
                onChange={(event) =>
                  setUbicacionMoverId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              >
                <option value="" disabled>
                  {ubicaciones.some(
                    (ubicacion) => ubicacion.id !== recursoAMover.idUbicacion,
                  )
                    ? "Seleccionar ubicación de destino"
                    : "No hay otras ubicaciones disponibles"}
                </option>
                {ubicaciones
                  .filter((ubicacion) => ubicacion.id !== recursoAMover.idUbicacion)
                  .map((ubicacion) => (
                    <option key={ubicacion.id} value={ubicacion.id}>
                      {ubicacion.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div className="vehiculo-detalle-modal-footer">
              <button
                type="button"
                className="vehiculo-detalle-modal-cancel"
                onClick={cerrarModalMover}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="vehiculo-detalle-modal-confirm"
                onClick={confirmarMoverRecurso}
                disabled={
                  ubicacionMoverId === null ||
                  ubicacionMoverId === recursoAMover.idUbicacion
                }
              >
                Confirmar movimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR RECURSO */}
      {mostrarAsignar && (
        <div
          className="vehiculo-detalle-modal-overlay"
          onClick={cerrarModalAsignar}
        >
          <div
            className="vehiculo-detalle-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vehiculo-detalle-modal-header">
              <div>
                <span>GESTIÓN DE EQUIPAMIENTO</span>
                <h2>Asignar recurso</h2>
              </div>
              <button
                type="button"
                onClick={cerrarModalAsignar}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="vehiculo-detalle-modal-body">
              <p>
                Selecciona un recurso disponible en la Sala de Operaciones y la
                ubicación de esta unidad donde se asignará.
              </p>

              <label htmlFor="recurso-a-asignar">RECURSO</label>
              <select
                id="recurso-a-asignar"
                value={recursoAAsignarId ?? ""}
                onChange={(event) =>
                  setRecursoAAsignarId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              >
                <option value="" disabled>
                  {recursosDisponibles.length > 0
                    ? "Seleccionar recurso operativo"
                    : "No hay recursos operativos disponibles"}
                </option>
                {recursosDisponibles.map((recurso) => (
                  <option key={recurso.id} value={recurso.id}>
                    {recurso.nombre} · {recurso.codigo}
                  </option>
                ))}
              </select>

              <label htmlFor="ubicacion-asignacion">UBICACIÓN DE DESTINO</label>
              <select
                id="ubicacion-asignacion"
                value={ubicacionDestinoId ?? ""}
                onChange={(event) =>
                  setUbicacionDestinoId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              >
                <option value="" disabled>
                  Seleccionar ubicación
                </option>
                {ubicaciones.map((ubicacion) => (
                  <option key={ubicacion.id} value={ubicacion.id}>
                    {ubicacion.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="vehiculo-detalle-modal-footer">
              <button
                type="button"
                className="vehiculo-detalle-modal-cancel"
                onClick={cerrarModalAsignar}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="vehiculo-detalle-modal-confirm"
                onClick={confirmarAsignacionRecurso}
                disabled={
                  recursoAAsignarId === null || ubicacionDestinoId === null
                }
              >
                Asignar recurso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RETIRAR RECURSO */}
      {recursoARetirar && (
        <div
          className="vehiculo-detalle-modal-overlay"
          onClick={() => setRecursoARetirar(null)}
        >
          <div
            className="vehiculo-detalle-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vehiculo-detalle-modal-header">
              <div>
                <span>GESTIÓN DE EQUIPAMIENTO</span>
                <h2>Retirar recurso</h2>
              </div>
              <button
                type="button"
                onClick={() => setRecursoARetirar(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="vehiculo-detalle-modal-body">
              <p>
                ¿Deseas retirar este recurso de{" "}
                <strong>
                  {ubicaciones.find(
                    (ubicacion) => ubicacion.id === recursoARetirar.idUbicacion,
                  )?.nombre ?? "su ubicación actual"}
                </strong>{" "}
                y trasladarlo a{" "}
                <strong>
                  {ubicacionSalaOperaciones?.nombre ?? "Sala de Operaciones"}
                </strong>
                ?
              </p>

              <div className="vehiculo-detalle-modal-resource">
                <strong>{recursoARetirar.nombre}</strong>
                <span>{recursoARetirar.codigo}</span>
              </div>

              <p>
                El recurso seguirá registrado en SIGMA y conservará su estado
                actual. Solo cambiará su ubicación.
              </p>
            </div>

            <div className="vehiculo-detalle-modal-footer">
              <button
                type="button"
                className="vehiculo-detalle-modal-cancel"
                onClick={() => setRecursoARetirar(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="vehiculo-detalle-modal-confirm"
                onClick={confirmarRetiroRecurso}
              >
                Retirar recurso
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL HISTORIAL DE MOVIMIENTOS */}
      {recursoHistorial && (
        <div
          className="vehiculo-detalle-modal-overlay"
          onClick={cerrarHistorialRecurso}
        >
          <div
            className="vehiculo-detalle-modal vehiculo-detalle-modal-history"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehiculo-detalle-historial-title"
          >
            <div className="vehiculo-detalle-modal-header">
              <div>
                <span>TRAZABILIDAD DE EQUIPAMIENTO</span>
                <h2 id="vehiculo-detalle-historial-title">Historial de movimientos</h2>
              </div>
              <button
                type="button"
                onClick={cerrarHistorialRecurso}
                aria-label="Cerrar historial"
              >
                ×
              </button>
            </div>

            <div className="vehiculo-detalle-modal-body vehiculo-detalle-history-body">
              <div className="vehiculo-detalle-modal-resource">
                <strong>{recursoHistorial.nombre}</strong>
                <span>{recursoHistorial.codigo}</span>
              </div>

              {cargandoHistorial && (
                <div className="vehiculo-detalle-history-message" role="status">
                  <div className="vehiculo-detalle-loading-line" />
                  <span>Cargando movimientos...</span>
                </div>
              )}

              {!cargandoHistorial && errorHistorial && (
                <div className="vehiculo-detalle-history-error" role="alert">
                  <span>{errorHistorial}</span>
                  <button
                    type="button"
                    className="vehiculo-detalle-modal-cancel"
                    onClick={() => void abrirHistorialRecurso(recursoHistorial)}
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!cargandoHistorial && !errorHistorial && movimientosHistorial.length === 0 && (
                <div className="vehiculo-detalle-history-message">
                  <History size={24} strokeWidth={1.8} />
                  <strong>Sin movimientos registrados</strong>
                  <span>Este recurso todavía no tiene movimientos en el historial.</span>
                </div>
              )}

              {!cargandoHistorial && !errorHistorial && movimientosHistorial.length > 0 && (
                <div className="vehiculo-detalle-history-list">
                  {movimientosHistorial.map((movimiento) => (
                    <article className="vehiculo-detalle-history-item" key={movimiento.id}>
                      <div className="vehiculo-detalle-history-route">
                        <div className="vehiculo-detalle-history-location">
                          <span>ORIGEN</span>
                          <strong>{movimiento.nombreUbicacionAnterior ?? "Sin ubicación anterior"}</strong>
                          {movimiento.nombreUnidadAnterior && (
                            <small>{movimiento.nombreUnidadAnterior}</small>
                          )}
                        </div>
                        <ArrowLeftRight size={20} strokeWidth={2} aria-hidden="true" />
                        <div className="vehiculo-detalle-history-location">
                          <span>DESTINO</span>
                          <strong>{movimiento.nombreUbicacionNueva}</strong>
                          {movimiento.nombreUnidadNueva && (
                            <small>{movimiento.nombreUnidadNueva}</small>
                          )}
                        </div>
                      </div>
                      <div className="vehiculo-detalle-history-metadata">
                        <span>
                          <strong>Responsable:</strong> {movimiento.nombreUsuario || "Usuario no disponible"}
                          {movimiento.codigoUsuario ? ` · ${movimiento.codigoUsuario}` : ""}
                        </span>
                        <time dateTime={movimiento.fechaHora}>
                          {formatearFechaHora(movimiento.fechaHora)}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="vehiculo-detalle-modal-footer">
              <button
                type="button"
                className="vehiculo-detalle-modal-cancel"
                onClick={cerrarHistorialRecurso}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehiculoDetalle;
