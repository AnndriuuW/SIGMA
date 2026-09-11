import { useState } from "react";
import { useNavigate } from "react-router-dom";

import fondoMaquinas from "./assets/fondo_maquinas.jpg";
import logoB120 from "./assets/Logo_B120.jpg";
import { useAuth } from "./context/AuthContext";

import "./App.css";

function App() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [codigo, setCodigo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!codigo.trim() || !contrasena) {
      setError("Ingrese su código y contraseña.");
      return;
    }

    try {
      setCargando(true);

      await login({
        codigo: codigo.trim(),
        contrasena,
      });

      navigate("/dashboard");
    } catch {
      setError("Código o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">
      <section
        className="login-background"
        style={{ backgroundImage: `url(${fondoMaquinas})` }}
      >
        <div className="login-overlay" />

        <div className="login-brand">
          <img
            src={logoB120}
            alt="Bomberos 120"
            className="login-logo-mobile"
          />

          <div className="brand-content">
            <p className="brand-company">BOMBEROS 120</p>
            <h1>SIGMA</h1>
            <p className="brand-description">
              Sistema de Gestión de Máquinas
            </p>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-container">
          <div className="login-header">
            <img
              src={logoB120}
              alt="Logo Bomberos 120"
              className="login-logo"
            />

            <p className="login-welcome">Bienvenido</p>

            <h2>Iniciar sesión</h2>

            <p className="login-subtitle">
              Ingresa tus credenciales para acceder a SIGMA.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="codigo">Código de bombero</label>

              <input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="Ej. ADMIN001"
                autoComplete="username"
                disabled={cargando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contrasena">Contraseña</label>

              <div className="password-wrapper">
                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  disabled={cargando}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setMostrarContrasena((mostrar) => !mostrar)
                  }
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarContrasena ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-button"
              disabled={cargando}
            >
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="login-footer">
            Sistema interno · Compañía de Bomberos 120
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;