import { Navigate, Route, Routes } from "react-router-dom";

import App from "../App";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Vehiculos from "../pages/Vehiculos";
import VehiculoDetalle from "../pages/VehiculoDetalle";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<App />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/vehiculos" element={<Vehiculos />} />

          <Route path="/vehiculos/:id" element={<VehiculoDetalle />} />

          <Route
            path="/recursos"
            element={
              <div>
                <h1>Recursos</h1>
                <p>Gestión de recursos y equipamiento.</p>
              </div>
            }
          />

          <Route
            path="/inventario"
            element={
              <div>
                <h1>Inventario</h1>
                <p>Control y verificación del inventario.</p>
              </div>
            }
          />

          <Route
            path="/ocurrencias"
            element={
              <div>
                <h1>Ocurrencias</h1>
                <p>Registro de ocurrencias.</p>
              </div>
            }
          />

          <Route
            path="/usuarios"
            element={
              <div>
                <h1>Usuarios</h1>
                <p>Gestión de usuarios del sistema.</p>
              </div>
            }
          />

          <Route
            path="/perfil"
            element={
              <div>
                <h1>Mi perfil</h1>
                <p>Información de tu cuenta.</p>
              </div>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}