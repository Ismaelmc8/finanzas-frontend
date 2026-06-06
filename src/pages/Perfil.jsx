import { useState, useEffect } from "react";
import { getMe, getSessions, revokeSession, revokeAllSessions } from "../services/authService";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

function parseUA(ua) {
  if (!ua) return "Dispositivo desconocido";
  if (/iPhone|iPad/i.test(ua)) return "iPhone / iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return ua.slice(0, 50);
}

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      const [me, sess] = await Promise.all([getMe(), getSessions()]);
      setUser(me);
      setSessions(sess);
    } catch {
      toast.error("Error cargando el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleRevoke = async (id) => {
    try {
      await revokeSession(id);
      toast.success("Sesión cerrada");
      cargar();
    } catch {
      toast.error("Error al cerrar la sesión");
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("¿Cerrar todas las demás sesiones activas?")) return;
    try {
      const res = await revokeAllSessions();
      toast.success(res.mensaje);
      cargar();
    } catch {
      toast.error("Error");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Perfil</h1>

      {/* Datos del usuario */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</p>
          <p className="text-lg text-gray-800">{user?.nombre}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</p>
          <p className="text-lg text-gray-800">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Miembro desde</p>
          <p className="text-lg text-gray-800">
            {user?.creado_en ? new Date(user.creado_en).toLocaleDateString("es-ES") : "—"}
          </p>
        </div>
      </div>

      {/* Sesiones activas */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-800">Sesiones activas</h2>
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAll}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Cerrar todas las demás
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400">No hay sesiones activas.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className={`flex justify-between items-center p-3 rounded-lg border ${
                  s.current ? "border-indigo-300 bg-indigo-50" : "border-gray-200"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    {parseUA(s.userAgent)}
                    {s.current && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        Esta sesión
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.ip || "IP desconocida"} · Última actividad:{" "}
                    {s.lastUsedAt
                      ? new Date(s.lastUsedAt).toLocaleString("es-ES")
                      : "—"}
                  </p>
                </div>
                {!s.current && (
                  <button
                    onClick={() => handleRevoke(s.id)}
                    className="text-sm text-red-400 hover:text-red-600 ml-4"
                  >
                    Cerrar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
