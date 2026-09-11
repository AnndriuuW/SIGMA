import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import logoB120 from "../assets/Logo_B120.jpg";

import "./AppLayout.css";

interface MenuItem {
  label: string;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: [
      "ADMINISTRADOR",
      "JEFE_MAQUINAS",
      "PERSONAL_ADJUNTO",
      "BOMBERO",
    ],
  },
  {
    label: "Vehículos",
    path: "/vehiculos",
    roles: [
      "ADMINISTRADOR",
      "JEFE_MAQUINAS",
      "PERSONAL_ADJUNTO",
      "BOMBERO",
    ],
  },
  {
    label: "Recursos",
    path: "/recursos",
    roles: [
      "ADMINISTRADOR",
      "JEFE_MAQUINAS",
      "PERSONAL_ADJUNTO",
      "BOMBERO",
    ],
  },
  {
    label: "Inventario",
    path: "/inventario",
    roles: [
      "ADMINISTRADOR",
      "JEFE_MAQUINAS",
      "PERSONAL_ADJUNTO",
      "BOMBERO",
    ],
  },
  {
    label: "Ocurrencias",
    path: "/ocurrencias",
    roles: [
      "ADMINISTRADOR",
      "JEFE_MAQUINAS",
      "PERSONAL_ADJUNTO",
      "BOMBERO",
    ],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    roles: ["ADMINISTRADOR", "JEFE_MAQUINAS"],
  },
];

export default function AppLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const rol = usuario?.rol ?? "";

  const menuVisible = menuItems.filter((item) =>
    item.roles.includes(rol),
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img
            src={logoB120}
            alt="Bomberos 120"
            className="sidebar-logo"
          />

          <div>
            <h1>SIGMA</h1>
            <span>Gestión de Máquinas</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">MENÚ PRINCIPAL</p>

          {menuVisible.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-link-indicator" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-indicator" />
            <span>Mi perfil</span>
          </NavLink>

          <button className="logout-button" onClick={handleLogout}>
            <span>↪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="app-content">
        <header className="topbar">
          <div>
            <p className="topbar-system">SISTEMA INTERNO</p>
            <p className="topbar-company">Compañía de Bomberos 120</p>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">
              {usuario?.nombres?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>
                {usuario?.nombres} {usuario?.apellidos}
              </strong>
              <span>{usuario?.rol}</span>
            </div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}