import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login_page";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateLayout from "./layouts/PrivateLayout";
import Movimientos from "./pages/Movimientos";
import Perfil from "./pages/Perfil";
import ConfigMovimiento from "./pages/ConfigMovimiento";
import AccountsListPage from "./pages/AccountsListPage";
import AccountCreatePage from "./pages/AccountCreatePage";
//import AccountDetailPage from "./pages/AccountDetailPage";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
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
              {/* 📘 Listado de cuentas */}
              <Route path="/accounts" element={<AccountsListPage />} />

              {/* ➕ Crear nueva cuenta */}
              <Route path="/accounts/new" element={<AccountCreatePage />} />

              {/* 📊 Detalle de una cuenta */}
              <Route path="/accounts/:accountId" element={<Movimientos />} />
              

            </Route>

            {/* redirect por defecto */}
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
