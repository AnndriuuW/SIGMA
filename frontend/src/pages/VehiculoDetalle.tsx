import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { listarUnidades } from "../services/unidadService";
import { listarUbicaciones } from "../services/ubicacionService";
import { listarRecursos } from "../services/recursoService";

import type { Unidad } from "../types/unidad";
import type { Ubicacion } from "../types/ubicacion";
import type { Recurso } from "../types/recurso";

const formatearTexto = (valor: string) =>
  valor.replaceAll("_", " ");

function VehiculoDetalle() {
  const { id } = useParams<{ id: string }>();
  const unidadId = Number(id);

  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [ubicacionSeleccionada, setUbicacionSeleccionada] =
    useState<number | null>(null);

  const [mostrarAsignar, setMostrarAsignar] = useState(false);

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!id || Number.isNaN(unidadId)) {
        setError("La unidad indicada no es válida.");
        setCargando(false);
        return;
      }

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
          (item) => item.id === unidadId,
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

        const idsUbicaciones = new Set(
          ubicacionesDeUnidad.map((ubicacion) => ubicacion.id),
        );

        const recursosDeUnidad = recursosData.filter((recurso) =>
          idsUbicaciones.has(recurso.idUbicacion),
        );

        setUnidad(unidadEncontrada);
        setUbicaciones(ubicacionesDeUnidad);
        setRecursos(recursosDeUnidad);

        if (ubicacionesDeUnidad.length > 0) {
          setUbicacionSeleccionada(ubicacionesDeUnidad[0].id);
        }
      } catch {
        setError("No se pudo cargar la información de la unidad.");
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [id, unidadId]);

  /* =========================================================
     CARGA
     ========================================================= */

  if (cargando) {
    return (
      <div className="vehiculo-detalle-page">
        <div className="vehiculo-detalle-loading">
          <div className="vehiculo-detalle-loading-line" />

          <strong>Cargando unidad</strong>

          <span>
            Obteniendo información operativa...
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error || !unidad) {
    return (
      <div className="vehiculo-detalle-page">
        <Link
          to="/vehiculos"
          className="vehiculo-detalle-back"
        >
          <span>←</span>
          Vehículos
        </Link>

        <div className="vehiculo-detalle-error">
          <strong>
            {error || "La unidad no fue encontrada."}
          </strong>
        </div>
      </div>
    );
  }

  /* =========================================================
     RECURSOS POR UBICACIÓN
     ========================================================= */

  const recursosPorUbicacion = new Map<number, Recurso[]>();

  recursos.forEach((recurso) => {
    const actuales =
      recursosPorUbicacion.get(recurso.idUbicacion) ?? [];

    recursosPorUbicacion.set(recurso.idUbicacion, [
      ...actuales,
      recurso,
    ]);
  });


  /* =========================================================
     RECURSOS FILTRADOS POR UBICACIÓN
     ========================================================= */

  const obtenerRecursosUbicacion = (ubicacionId: number) => {
    const recursosUbicacion =
      recursosFiltrados.filter(
        (recurso) =>
          recurso.idUbicacion === ubicacionId,
      );

    return recursosUbicacion;
  };

  /* =========================================================
     ESTADÍSTICAS
     ========================================================= */

  const terminoBusqueda = busqueda.trim().toLowerCase();

const recursosFiltrados = !terminoBusqueda
  ? recursos
  : recursos.filter((recurso) => {
      const nombre = recurso.nombre?.toLowerCase() ?? "";
      const codigo = recurso.codigo?.toLowerCase() ?? "";
      const tipo =
        recurso.nombreTipoRecurso?.toLowerCase() ?? "";
      const marca = recurso.marca?.toLowerCase() ?? "";

      return (
        nombre.includes(terminoBusqueda) ||
        codigo.includes(terminoBusqueda) ||
        tipo.includes(terminoBusqueda) ||
        marca.includes(terminoBusqueda)
      );
    });

  /* =========================================================
     EXPORTAR REPORTE
     ========================================================= */

  const exportarReporte = () => {
    window.print();
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="vehiculo-detalle-page">

      {/* =====================================================
          NAVEGACIÓN
          ===================================================== */}

      <Link
        to="/vehiculos"
        className="vehiculo-detalle-back"
      >
        <span>←</span>
        Vehículos
      </Link>


      {/* =====================================================
          CABECERA DE UNIDAD
          ===================================================== */}

      <section className="vehiculo-detalle-header">

        <div className="vehiculo-detalle-header-main">

          <span className="vehiculo-detalle-eyebrow">
            SIGMA · DETALLE DE UNIDAD
          </span>

          <div className="vehiculo-detalle-title-row">

            <div>
              <h1>
                {unidad.nombre}
              </h1>

              <p>
                Información operativa y equipamiento asociado
                a la unidad.
              </p>
            </div>
          </div>
        </div>


        {/* ===================================================
            DATOS RÁPIDOS
            =================================================== */}

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
              <span>▧</span>
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


      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <section className="vehiculo-detalle-content">

        <header className="vehiculo-detalle-content-header">

          <div>

            <h2>
              Ubicaciones y recursos
            </h2>

            <p>
              Espacios registrados y equipamiento asociado
              a esta unidad.
            </p>

          </div>

          <div className="vehiculo-detalle-total">

            <strong>
              {recursos.length}
            </strong>

            <span>
              {recursos.length === 1
                ? "RECURSO"
                : "RECURSOS"}
            </span>

          </div>

        </header>


        <div className="vehiculo-detalle-workspace">

          {/* =================================================
              PANEL IZQUIERDO
              ================================================= */}

          <aside className="vehiculo-detalle-sidebar">

            <div className="vehiculo-detalle-search">

              <label>
                BUSCAR RECURSO
              </label>

              <input
                type="text"
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                placeholder="Nombre o código"
              />

            </div>


            <div className="vehiculo-detalle-location-list">

              <div className="vehiculo-detalle-location-list-header">

                <span>
                  UBICACIONES
                </span>

                <strong>
                  {ubicaciones.length}
                </strong>

              </div>


              <div className="vehiculo-detalle-location-items">

                {ubicaciones.map((ubicacion, index) => {

                  const cantidad =
                    recursosPorUbicacion.get(
                      ubicacion.id,
                    )?.length ?? 0;

                  const seleccionada =
                    ubicacionSeleccionada ===
                    ubicacion.id;

                  return (
                    <button
                      type="button"
                      key={ubicacion.id}
                      className={`vehiculo-detalle-location-item ${
                        seleccionada
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        setUbicacionSeleccionada(
                          ubicacion.id,
                        )
                      }
                    >

                      <span className="vehiculo-detalle-location-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="vehiculo-detalle-location-name">
                        {ubicacion.nombre}
                      </span>

                      <span
                        className={`vehiculo-detalle-location-amount ${
                          cantidad > 0
                            ? "has-resources"
                            : ""
                        }`}
                      >
                        {cantidad > 0
                          ? cantidad
                          : "—"}
                      </span>

                    </button>
                  );
                })}

              </div>

            </div>

          </aside>


          {/* =================================================
              PANEL DERECHO
              ================================================= */}

          <div className="vehiculo-detalle-inventory">

            <div className="vehiculo-detalle-inventory-head">

              <div className="vehiculo-detalle-inventory-columns">

                <span>
                  RECURSO
                </span>

                <span>
                  CÓDIGO
                </span>

                <span>
                  ESTADO
                </span>

              </div>

            </div>


            <div className="vehiculo-detalle-inventory-list">

              {ubicaciones.map((ubicacion, index) => {

                const recursosUbicacion =
                  obtenerRecursosUbicacion(
                    ubicacion.id,
                  );

                const estaSeleccionada =
                  ubicacionSeleccionada ===
                  ubicacion.id;

                /*
                 * Si existe una búsqueda activa,
                 * no ocultamos la ubicación.
                 * Simplemente mostramos solo sus
                 * recursos coincidentes.
                 */

                const mostrarUbicacion =
                  busqueda.trim().length === 0 ||
                  recursosUbicacion.length > 0;

                if (!mostrarUbicacion) {
                  return null;
                }

                return (
                  <article
                    key={ubicacion.id}
                    className={`vehiculo-detalle-location-block ${
                      estaSeleccionada
                        ? "is-active"
                        : ""
                    }`}
                  >

                    {/* CABECERA UBICACIÓN */}

                    <button
                      type="button"
                      className="vehiculo-detalle-location-block-header"
                      onClick={() =>
                        setUbicacionSeleccionada(
                          ubicacion.id,
                        )
                      }
                    >

                      <div className="vehiculo-detalle-location-block-title">

                        <span className="vehiculo-detalle-block-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>

                          <span>
                            {formatearTexto(
                              ubicacion.tipo,
                            )}
                          </span>

                          <strong>
                            {ubicacion.nombre}
                          </strong>

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

                    </button>


                    {/* RECURSOS */}

                    {recursosUbicacion.length > 0 && (

                      <div className="vehiculo-detalle-resource-list">

                        {recursosUbicacion.map(
                          (recurso) => (

                            <div
                              className="vehiculo-detalle-resource"
                              key={recurso.id}
                            >

                              <div className="vehiculo-detalle-resource-name">

                                <strong>
                                  {recurso.nombre}
                                </strong>

                                <span>
                                  {recurso.nombreTipoRecurso}

                                  {recurso.marca
                                    ? ` · ${recurso.marca}`
                                    : ""}
                                </span>

                              </div>


                              <span className="vehiculo-detalle-resource-code">
                                {recurso.codigo}
                              </span>


                              <span
                                className={`vehiculo-detalle-resource-status vehiculo-detalle-resource-${recurso.estado.toLowerCase()}`}
                              >
                                <span />

                                {formatearTexto(
                                  recurso.estado,
                                )}
                              </span>

                            </div>

                          ),
                        )}

                      </div>

                    )}

                  </article>
                );
              })}


              {/* SIN RESULTADOS */}

              {busqueda.trim() !== "" &&
                recursosFiltrados.length === 0 && (

                  <div className="vehiculo-detalle-no-results">

                    <strong>
                      No se encontraron recursos
                    </strong>

                    <span>
                      Intenta buscar por nombre o código.
                    </span>

                  </div>

                )}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MODAL ASIGNAR RECURSO
          ===================================================== */}

      {mostrarAsignar && (

        <div
          className="vehiculo-detalle-modal-overlay"
          onClick={() =>
            setMostrarAsignar(false)
          }
        >

          <div
            className="vehiculo-detalle-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="vehiculo-detalle-modal-header">

              <div>

                <span>
                  GESTIÓN DE EQUIPAMIENTO
                </span>

                <h2>
                  Asignar recurso
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setMostrarAsignar(false)
                }
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>


            <div className="vehiculo-detalle-modal-body">

              <p>
                La asignación de recursos se realizará
                seleccionando el recurso y la ubicación
                correspondiente.
              </p>

              <label>
                RECURSO
              </label>

              <select defaultValue="">
                <option value="" disabled>
                  Seleccionar recurso
                </option>

                {recursos.map((recurso) => (
                  <option
                    key={recurso.id}
                    value={recurso.id}
                  >
                    {recurso.nombre} · {recurso.codigo}
                  </option>
                ))}
              </select>


              <label>
                UBICACIÓN
              </label>

              <select defaultValue="">
                <option value="" disabled>
                  Seleccionar ubicación
                </option>

                {ubicaciones.map((ubicacion) => (
                  <option
                    key={ubicacion.id}
                    value={ubicacion.id}
                  >
                    {ubicacion.nombre}
                  </option>
                ))}
              </select>

            </div>


            <div className="vehiculo-detalle-modal-footer">

              <button
                type="button"
                className="vehiculo-detalle-modal-cancel"
                onClick={() =>
                  setMostrarAsignar(false)
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="vehiculo-detalle-modal-confirm"
                onClick={() =>
                  setMostrarAsignar(false)
                }
              >
                Asignar recurso
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default VehiculoDetalle;