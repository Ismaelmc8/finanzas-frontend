import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { logout as apiLogout } from "./services/authService";
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

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  useEffect(() => {
    if (!user) return;
    generarRecurrentes()
      .then(({ generadas }) => {
        if (generadas > 0) toast.success(`${generadas} transacción${generadas > 1 ? "es recurrentes generadas" : " recurrente generada"}`);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const PrivateRoute = ({ children }) => (user ? children : <Navigate to="/login" />);

  const Menu = () => (
    <div className="flex space-x-6">
      {!user ? (
        <>
          <Link to="/login" className="hover:text-indigo-400">Login</Link>
          <Link to="/register" className="hover:text-indigo-400">Registro</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
          <Link to="/login" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="hover:text-indigo-400 cursor-pointer">
            Logout
          </Link>
        </>
      )}
    </div>
  );

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full mx-auto">
        <Toaster position="top-right" />
        <nav className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="font-bold text-lg">FinanzasApp</Link>
              <Menu />
            </div>
          </div>
        </nav>

        <main className="flex-1 bg-gray-100 px-4 py-8">
          <Routes>
            {/* rutas públicas */}
            <Route path="/login" element={<Login onLogin={handleLogin} user={user} />} />
            <Route path="/register" element={<Register />} />

            {/* rutas privadas con Sidebar */}
            <Route element={<PrivateLayout user={user} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/movimientos" element={<Movimientos />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/configMovements" element={<ConfigMovimiento />} />
              <Route path="/movements-groups/:groupId" element={<Movimientos />} />
              <Route path="/bancos" element={<BancosPage />} />
              <Route path="/cuentas/:cuentaId" element={<CuentaPage />} />
              <Route path="/cuentas/:cuentaId/accesos" element={<CuentaAccesosPage />} />
              <Route path="/invitaciones" element={<InvitacionesPage />} />
            </Route>

            {/* redirect por defecto */}
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
