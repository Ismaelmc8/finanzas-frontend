import { useState, useEffect } from "react";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Login({ onLogin, user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

    // Redirigir automáticamente si ya hay usuario
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token } = res.data; // Extraemos el token
      // Guardamos token y "usuario" (el email) en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email }));

      toast.success("Login exitoso 🎉");
      onLogin?.({ email }); // Actualiza el estado en App
      //navigate("/test"); // Redirige a la página de prueba
      navigate("/dashboard"); // Redirige inmediatamente
    } catch (err) {
      toast.error("Error en login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Inicia sesión</h2>
          <p className="mt-2 text-sm text-gray-600">Bienvenido de nuevo 👋</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
