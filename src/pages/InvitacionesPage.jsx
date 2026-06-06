import { useEffect, useState } from "react";
import { getInvitaciones, responderInvitacion } from "../services/accesosService";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

const ROL_LABEL = { editor: "Editor", lector: "Lector" };

export default function InvitacionesPage() {
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setInvitaciones(await getInvitaciones());
    } catch {
      toast.error("Error cargando invitaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const responder = async (id, accion) => {
    try {
      const res = await responderInvitacion(id, accion);
      toast.success(res.mensaje);
      cargar();
    } catch {
      toast.error("Error al responder la invitación");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Invitaciones</h1>

      {invitaciones.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">No tienes invitaciones pendientes</p>
        </div>
      ) : (
        invitaciones.map((inv) => (
          <div key={inv.id} className="bg-white rounded-xl shadow p-5 flex justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-gray-800">{inv.cuenta?.nombre}</p>
              <p className="text-sm text-gray-500">
                <strong>{inv.propietarioAcceso?.nombre}</strong> te ha invitado como{" "}
                <span className={`font-semibold ${inv.rol === "editor" ? "text-indigo-600" : "text-gray-600"}`}>
                  {ROL_LABEL[inv.rol]}
                </span>
              </p>
              {inv.cuenta?.propietario && (
                <p className="text-xs text-gray-400 mt-1">Propietario: {inv.cuenta.propietario.nombre}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button onClick={() => responder(inv.id, "aceptar")}>Aceptar</Button>
              <Button
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => responder(inv.id, "rechazar")}
              >
                Rechazar
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
