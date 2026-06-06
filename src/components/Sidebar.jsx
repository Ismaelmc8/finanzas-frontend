import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { getInvitaciones } from "../services/accesosService";

export default function LayoutDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendientes, setPendientes] = useState(0);
  const location = useLocation();

  useEffect(() => {
    getInvitaciones()
      .then((inv) => setPendientes(inv.length))
      .catch(() => {});
  }, [location.pathname]);

  const routes = [
    { path: "/dashboard",     label: "Dashboard" },
    { path: "/movimientos",   label: "Movimientos" },
    { path: "/bancos",        label: "Cuentas" },
    { path: "/invitaciones",  label: "Invitaciones", badge: pendientes },
    { path: "/configMovements", label: "Configuración" },
    { path: "/perfil",        label: "Perfil" },
  ];

  // 🔹 Obtenemos el título de la página actual
  const currentPage =
    routes.find((r) => r.path === location.pathname)?.label || "Finanzas";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform bg-white shadow-lg w-64 transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:w-64`}
      >
        <div className="p-6 font-bold text-indigo-600 text-xl">{currentPage}</div>
        <nav className="mt-6 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-indigo-100 rounded-lg"
            >
              <span>{route.label}</span>
              {route.badge > 0 && (
                <span className="bg-indigo-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {route.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-md lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>
          <span className="font-bold text-indigo-600">{currentPage}</span>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
