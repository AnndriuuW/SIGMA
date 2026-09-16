import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listarInventarios, crearInventario } from "../services/inventarioService";
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

  const obtenerTextoResultado = (resultado: string | null) => {
    if (!resultado) return "—";

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
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">CONTROL DE RECURSOS</p>
          <h1>Inventario</h1>
          <p className="page-description">
            Registro y seguimiento de inventarios realizados por unidad.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={abrirNuevoInventario}
        >
          + Nuevo inventario
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total</span>
          <strong>{inventarios.length}</strong>
        </div>

        <div className="summary-card">
          <span>En proceso</span>
          <strong>{enProceso}</strong>
        </div>

        <div className="summary-card">
          <span>Pausados</span>
          <strong>{pausados}</strong>
        </div>

        <div className="summary-card">
          <span>Finalizados</span>
          <strong>{finalizados}</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Historial de inventarios</h2>
            <p>Consulta los inventarios registrados por la sección.</p>
          </div>
        </div>

        {cargando && (
          <div className="empty-state">
            <p>Cargando inventarios...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        )}

        {!cargando && !error && inventarios.length === 0 && (
          <div className="empty-state">
            <p>No hay inventarios registrados.</p>
          </div>
        )}

        {!cargando && !error && inventarios.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Responsable</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                  <th>Resultado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {inventarios.map((inventario) => (
                  <tr key={inventario.id}>
                    <td>
                      <strong>{inventario.nombreUnidad}</strong>
                    </td>

                    <td>{inventario.nombreResponsable}</td>

                    <td>{formatearFecha(inventario.fechaInicio)}</td>

                    <td>{formatearFecha(inventario.fechaFin)}</td>

                    <td>
                      <span
                        className={`status-badge status-${inventario.estado.toLowerCase()}`}
                      >
                        {obtenerTextoEstado(inventario.estado)}
                      </span>
                    </td>

                    <td>
                      {obtenerTextoResultado(
                        inventario.resultadoGeneral,
                      )}
                    </td>

                    <td>
                      <Link
                        to={`/inventario/${inventario.id}`}
                        className="table-action"
                      >
                        Ver inventario →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarNuevo && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="page-eyebrow">NUEVO REGISTRO</p>
                <h2>Iniciar inventario</h2>
              </div>

              <button
                className="modal-close"
                onClick={cerrarNuevoInventario}
                disabled={creando}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
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
                <p className="form-error">{errorCrear}</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={cerrarNuevoInventario}
                disabled={creando}
              >
                Cancelar
              </button>

              <button
                className="primary-button"
                onClick={handleCrearInventario}
                disabled={creando}
              >
                {creando ? "Iniciando..." : "Iniciar inventario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}