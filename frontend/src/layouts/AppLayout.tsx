import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Truck,
  Package,
  ClipboardList,
  CircleAlert,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

import logoB120 from "../assets/Logo_B120.jpg";

import "./AppLayout.css";

interface MenuItem {
  label: string;
  path: string;
  roles: string[];
  icon: LucideIcon;
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
    icon: LayoutDashboard,
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
    icon: Truck,
  },
  {
    label: "Recursos",
    path: "/recursos",
    roles: [
      "ADMINISTRADOR",
      "JEFE_MAQUINAS",
      "PERSONAL_ADJUNTO",
    ],
    icon: Package,
  },
  {
    label: "Inventario",
    path: "/inventario",
    roles: [
      "ADMINISTRADOR",
      "JEFE_MAQUINAS",
      "PERSONAL_ADJUNTO",
    ],
    icon: ClipboardList,
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
    icon: CircleAlert,
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    roles: ["ADMINISTRADOR", "JEFE_MAQUINAS"],
    icon: Users,
  },
];

export default function AppLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const rol = usuario?.rol ?? "";

  const menuVisible = menuItems.filter((item) =>
    item.roles.includes(rol),
  );

  const handleLogout = () => {
    setMenuAbierto(false);
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const cerrarEnEscritorio = () => {
      if (window.innerWidth > 760) setMenuAbierto(false);
    };

    window.addEventListener("resize", cerrarEnEscritorio);
    return () => window.removeEventListener("resize", cerrarEnEscritorio);
  }, []);

  useEffect(() => {
    if (!menuAbierto) return;
    const overflowAnterior = document.body.style.overflow;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuAbierto(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [menuAbierto]);

  return (
    <div className="app-layout">
      {menuAbierto && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside className={`sidebar ${menuAbierto ? "sidebar-open" : ""}`}>
        {/* CABECERA DEL SIDEBAR */}
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

        {/* MENÚ PRINCIPAL */}
        <nav id="main-navigation" className="sidebar-nav">
          <p className="sidebar-section-title">MENÚ PRINCIPAL</p>

          {menuVisible.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* PARTE INFERIOR */}
        <div className="sidebar-bottom">
          <NavLink
            to="/perfil"
            onClick={() => setMenuAbierto(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <UserCircle className="sidebar-link-icon" />
            <span>Mi perfil</span>
          </NavLink>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut className="sidebar-link-icon" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="app-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-leading">
            <button
              type="button"
              className="mobile-menu-button"
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-controls="main-navigation"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              {menuAbierto ? <X size={21} /> : <Menu size={21} />}
            </button>

            <div>
            <p className="topbar-system">SISTEMA INTERNO</p>
            <p className="topbar-company">
              Compañía de Bomberos 120
            </p>
            </div>
          </div>

          {/* USUARIO ACTUAL */}
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

        {/* CONTENIDO DE CADA PÁGINA */}
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
