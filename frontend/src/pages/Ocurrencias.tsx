import { useEffect, useMemo, useState } from "react";
import { listarOcurrencias } from "../services/ocurrenciaService";
import type { Ocurrencia } from "../types/ocurrencia";
import { Link } from "react-router-dom";

export default function Ocurrencias() {
  const [ocurrencias, setOcurrencias] = useState<Ocurrencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroLectura, setFiltroLectura] = useState("TODAS");

  useEffect(() => {
    const cargarOcurrencias = async () => {
      try {
        const data = await listarOcurrencias();
        setOcurrencias(data);
      } catch {
        setError("No se pudieron cargar las ocurrencias.");
      } finally {
        setCargando(false);
      }
    };

    cargarOcurrencias();
  }, []);

  const noLeidas = ocurrencias.filter(
    (ocurrencia) => !ocurrencia.leida,
  ).length;

  const deUnidad = ocurrencias.filter(
    (ocurrencia) => ocurrencia.tipo === "UNIDAD",
  ).length;

  const deRecurso = ocurrencias.filter(
    (ocurrencia) => ocurrencia.tipo === "RECURSO",
  ).length;

  const ocurrenciasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return ocurrencias.filter((ocurrencia) => {
      const coincideBusqueda =
        !texto ||
        ocurrencia.descripcion.toLowerCase().includes(texto) ||
        ocurrencia.nombreInformante.toLowerCase().includes(texto) ||
        ocurrencia.nombreDestinatario.toLowerCase().includes(texto) ||
        (ocurrencia.nombreUnidad ?? "")
          .toLowerCase()
          .includes(texto) ||
        (ocurrencia.codigoRecurso ?? "")
          .toLowerCase()
          .includes(texto);

      const coincideTipo =
        filtroTipo === "TODOS" ||
        ocurrencia.tipo === filtroTipo;

      const coincideLectura =
        filtroLectura === "TODAS" ||
        (filtroLectura === "NO_LEIDAS" && !ocurrencia.leida) ||
        (filtroLectura === "LEIDAS" && ocurrencia.leida);

      return coincideBusqueda && coincideTipo && coincideLectura;
    });
  }, [ocurrencias, busqueda, filtroTipo, filtroLectura]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "short",
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

  const obtenerRelacionado = (ocurrencia: Ocurrencia) => {
    if (ocurrencia.tipo === "UNIDAD") {
      return ocurrencia.nombreUnidad ?? "—";
    }

    if (ocurrencia.tipo === "RECURSO") {
      return ocurrencia.codigoRecurso ?? "—";
    }

    return "General";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">GESTIÓN DE INCIDENCIAS</p>

          <h1>Ocurrencias</h1>

          <p className="page-description">
            Registro y seguimiento de novedades del sistema.
          </p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total</span>
          <strong>{ocurrencias.length}</strong>
        </div>

        <div className="summary-card">
          <span>No leídas</span>
          <strong>{noLeidas}</strong>
        </div>

        <div className="summary-card">
          <span>De unidad</span>
          <strong>{deUnidad}</strong>
        </div>

        <div className="summary-card">
          <span>De recurso</span>
          <strong>{deRecurso}</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Registro de ocurrencias</h2>

            <p>
              Consulta las novedades registradas y su estado de lectura.
            </p>
          </div>
        </div>

        <div className="table-filters">
          <input
            type="text"
            placeholder="Buscar por descripción, responsable o recurso..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            className="table-search"
          />

          <select
            value={filtroTipo}
            onChange={(event) => setFiltroTipo(event.target.value)}
            className="table-filter-select"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="GENERAL">General</option>
            <option value="UNIDAD">Unidad</option>
            <option value="RECURSO">Recurso</option>
          </select>

          <select
            value={filtroLectura}
            onChange={(event) =>
              setFiltroLectura(event.target.value)
            }
            className="table-filter-select"
          >
            <option value="TODAS">Todas</option>
            <option value="NO_LEIDAS">No leídas</option>
            <option value="LEIDAS">Leídas</option>
          </select>
        </div>

        {cargando && (
          <div className="empty-state">
            <p>Cargando ocurrencias...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        )}

        {!cargando &&
          !error &&
          ocurrenciasFiltradas.length === 0 && (
            <div className="empty-state">
              <p>No se encontraron ocurrencias.</p>
            </div>
          )}

        {!cargando &&
          !error &&
          ocurrenciasFiltradas.length > 0 && (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Relacionado</th>
                    <th>Descripción</th>
                    <th>Informante</th>
                    <th>Destinatario</th>
                    <th>Lectura</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {ocurrenciasFiltradas.map((ocurrencia) => (
                    <tr key={ocurrencia.id}>
                      <td>{formatearFecha(ocurrencia.fechaHora)}</td>

                      <td>{obtenerTipoTexto(ocurrencia.tipo)}</td>

                      <td>
                        <strong>
                          {obtenerRelacionado(ocurrencia)}
                        </strong>
                      </td>

                      <td className="occurrence-description">
                        {ocurrencia.descripcion}
                      </td>

                      <td>{ocurrencia.nombreInformante}</td>

                      <td>{ocurrencia.nombreDestinatario}</td>

                      <td>
                        {ocurrencia.leida
                          ? "Leída"
                          : "No leída"}
                      </td>
                      <td>
                        <Link
                          to={`/ocurrencias/${ocurrencia.id}`}
                          className="table-action"
                        >
                          Ver detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}