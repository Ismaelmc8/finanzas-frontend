import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import api from "../services/api";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", {
        nombre,
        email,
        password,
      });
      console.log("Usuario registrado ✅", data);
      setMessage("Registro exitoso 🎉");
    } catch (err) {
      console.error("Error ❌", err.response?.data || err.message);
      setMessage("Error en el registro ❌");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-md">
        <div className="text-center">
          <UserPlusIcon className="mx-auto h-12 w-12 text-teal-600" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">Es rápido y fácil 🚀</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          {/* Nombre */}
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full rounded-xl bg-teal-600 py-3 text-white font-semibold shadow-md hover:bg-teal-700 transition"
          >
            Registrarse
          </button>
        </form>

        {/* Mensaje */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-teal-600 hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
