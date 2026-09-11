import { Navigate, Route, Routes } from "react-router-dom";

import App from "../App";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<App />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <div>
              <h1>Dashboard</h1>
              <p>Panel principal de SIGMA</p>
            </div>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}