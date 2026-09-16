import { Navigate, Route, Routes } from "react-router-dom";

import App from "../App";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Vehiculos from "../pages/Vehiculos";
import VehiculoDetalle from "../pages/VehiculoDetalle";
import Recursos from "../pages/Recursos";
import Inventario from "../pages/Inventario";
import InventarioDetalle from "../pages/InventarioDetalle";
import Ocurrencias from "../pages/Ocurrencias";
import OcurrenciaDetalle from "../pages/OcurrenciaDetalle";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<App />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/vehiculos" element={<Vehiculos />} />

          <Route path="/vehiculos/:id" element={<VehiculoDetalle />} />

          <Route path="/recursos" element={<Recursos />} />

          <Route path="/inventario" element={<Inventario />} />

          <Route path="/inventario/:id" element={<InventarioDetalle />} />

          <Route path="/ocurrencias" element={<Ocurrencias />} />

          <Route path="/ocurrencias/:id" element={<OcurrenciaDetalle />} />

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