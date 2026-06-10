import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCuenta } from "../services/cuentasService";
import { getAccesos, invitarUsuario, cambiarRol, revocarAcceso } from "../services/accesosService";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

const ROL_LABEL  = { editor: "Editor", lector: "Lector" };
const ROL_DESC   = { editor: "Puede añadir, editar y eliminar transacciones", lector: "Solo puede ver" };

export default function CuentaAccesosPage() {
  const { cuentaId } = useParams();
  const navigate = useNavigate();

  const [cuenta,  setCuenta]  = useState(null);
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ email: "", rol: "lector" });
  const [openInvitar, setOpenInvitar] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      const [c, a] = await Promise.all([getCuenta(cuentaId), getAccesos(cuentaId)]);
      setCuenta(c);
      setAccesos(a);
    } catch {
      toast.error("Error cargando los accesos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [cuentaId]);

  const handleInvitar = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await invitarUsuario(cuentaId, form);
      toast.success("Invitación enviada");
      setOpenInvitar(false);
      setForm({ email: "", rol: "lector" });
      cargar();
    } catch (err) {
      setError(err?.response?.data?.error || "Error al enviar la invitación");
    }
  };

  const handleCambiarRol = async (accesoId, nuevoRol) => {
    try {
      await cambiarRol(cuentaId, accesoId, nuevoRol);
      toast.success("Rol actualizado");
      cargar();
    } catch {
      toast.error("Error al cambiar el rol");
    }
  };

  const handleRevocar = async (accesoId) => {
    if (!confirm("¿Revocar el acceso de este usuario?")) return;
    try {
      await revocarAcceso(cuentaId, accesoId);
      toast.success("Acceso revocado");
      cargar();
    } catch {
      toast.error("Error al revocar el acceso");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate(`/cuentas/${cuentaId}`)} className="text-sm text-teal-500 hover:underline mb-1 block">
          ← Volver a {cuenta?.nombre}
        </button>
        <h1 className="text-xl font-bold text-gray-900">Accesos compartidos</h1>
        <p className="text-sm text-gray-400">{cuenta?.nombre}</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setOpenInvitar(true)}>+ Invitar persona</Button>
      </div>

      {accesos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Nadie más tiene acceso a esta cuenta.</p>
      ) : (
        <div className="space-y-3">
          {accesos.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">{a.invitado?.nombre}</p>
                <p className="text-sm text-gray-400">{a.invitado?.email}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                  a.estado === "aceptado" ? "bg-green-100 text-green-700" :
                  a.estado === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {a.estado}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded-lg p-1.5 text-sm"
                  value={a.rol}
                  onChange={(e) => handleCambiarRol(a.id, e.target.value)}
                >
                  <option value="editor">Editor</option>
                  <option value="lector">Lector</option>
                </select>
                <button onClick={() => handleRevocar(a.id)} className="text-red-400 hover:text-red-600 text-sm">
                  Revocar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openInvitar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Invitar persona</h2>
            <form onSubmit={handleInvitar} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email del usuario</label>
                <input
                  type="email"
                  className="w-full border rounded-lg p-2"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Rol</label>
                {["editor", "lector"].map((r) => (
                  <label key={r} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer mb-2 ${form.rol === r ? "border-teal-400 bg-teal-50" : "border-gray-200"}`}>
                    <input type="radio" name="rol" value={r} checked={form.rol === r} onChange={() => setForm({ ...form, rol: r })} className="mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{ROL_LABEL[r]}</p>
                      <p className="text-xs text-gray-400">{ROL_DESC[r]}</p>
                    </div>
                  </label>
                ))}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" className="bg-gray-200 text-gray-700" onClick={() => setOpenInvitar(false)}>Cancelar</Button>
                <Button type="submit">Enviar invitación</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
