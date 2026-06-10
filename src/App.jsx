import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { logout as apiLogout, getMe } from "./services/authService";
import { Toaster } from "react-hot-toast";
import { generarRecurrentes } from "./services/expensesService";
import toast from "react-hot-toast";
import Login from "./pages/Login_page";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateLayout from "./layouts/PrivateLayout";
import Movimientos from "./pages/Movimientos";
import Perfil from "./pages/Perfil";
import ConfigMovimiento from "./pages/ConfigMovimiento";
import BancosPage from "./pages/BancosPage";
import CuentaPage from "./pages/CuentaPage";
import InvitacionesPage from "./pages/InvitacionesPage";
import CuentaAccesosPage from "./pages/CuentaAccesosPage";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Al cargar con sesión activa, refrescamos los datos del usuario (nombre, email…)
  // desde el servidor. Esto corrige sesiones antiguas guardadas solo con { email }.
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    getMe()
      .then((me) => {
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    generarRecurrentes()
      .then(({ generadas }) => {
        if (generadas > 0)
          toast.success(`${generadas} transacción${generadas > 1 ? "es recurrentes generadas" : " recurrente generada"}`);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* rutas públicas */}
        <Route path="/login"    element={<Login onLogin={handleLogin} user={user} />} />
        <Route path="/register" element={<Register />} />

        {/* rutas privadas con sidebar */}
        <Route element={<PrivateLayout user={user} onLogout={handleLogout} />}>
          <Route path="/dashboard"                    element={<Dashboard />} />
          <Route path="/movimientos"                  element={<Movimientos />} />
          <Route path="/perfil"                       element={<Perfil onLogout={handleLogout} />} />
          <Route path="/configMovements"              element={<ConfigMovimiento />} />
          <Route path="/movements-groups/:groupId"    element={<Movimientos />} />
          <Route path="/bancos"                       element={<BancosPage />} />
          <Route path="/cuentas/:cuentaId"            element={<CuentaPage />} />
          <Route path="/cuentas/:cuentaId/accesos"    element={<CuentaAccesosPage />} />
          <Route path="/invitaciones"                 element={<InvitacionesPage />} />
        </Route>

        {/* redirect por defecto */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}
