import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBancos, createBanco, deleteBanco } from "../services/bancosService";
import { createCuenta, getCuentas } from "../services/cuentasService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

const TIPOS = ["corriente", "ahorro", "inversion", "otro"];
const TIPO_LABEL = { corriente: "Corriente", ahorro: "Ahorro", inversion: "Inversión", otro: "Otro" };

export default function BancosPage() {
  const navigate = useNavigate();
  const [bancos,      setBancos]      = useState([]);
  const [compartidas, setCompartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalBanco, setModalBanco] = useState(false);
  const [modalCuenta, setModalCuenta] = useState(null); // bancoId
  const [formBanco, setFormBanco] = useState({ nombre: "", color: "#6366f1", icono: "🏦" });
  const [formCuenta, setFormCuenta] = useState({ nombre: "", tipo: "corriente", moneda: "EUR" });

  const cargar = async () => {
    try {
      const [bancosData, cuentasData] = await Promise.all([getBancos(), getCuentas()]);
      setBancos(bancosData);
      setCompartidas(cuentasData.compartidas || []);
    } catch {
      toast.error("Error cargando cuentas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleCrearBanco = async (e) => {
    e.preventDefault();
    try {
      await createBanco(formBanco);
      toast.success("Banco creado");
      setModalBanco(false);
      setFormBanco({ nombre: "", color: "#6366f1", icono: "🏦" });
      cargar();
    } catch {
      toast.error("Error al crear el banco");
    }
  };

  const handleCrearCuenta = async (e) => {
    e.preventDefault();
    try {
      await createCuenta({ ...formCuenta, bancoId: modalCuenta });
      toast.success("Cuenta creada");
      setModalCuenta(null);
      setFormCuenta({ nombre: "", tipo: "corriente", moneda: "EUR" });
      cargar();
    } catch {
      toast.error("Error al crear la cuenta");
    }
  };

  const handleEliminarBanco = async (id) => {
    if (!confirm("¿Eliminar este banco y todas sus cuentas?")) return;
    try {
      await deleteBanco(id);
      toast.success("Banco eliminado");
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mis cuentas</h1>
        <Button onClick={() => setModalBanco(true)}>+ Nuevo banco</Button>
      </div>

      {bancos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏦</p>
          <p className="font-medium">No tienes bancos todavía</p>
          <p className="text-sm mt-1">Crea un banco para empezar a organizar tus cuentas</p>
        </div>
      ) : (
        bancos.map((banco) => (
          <div key={banco.id}>
            {/* Cabecera del banco */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{banco.icono}</span>
                <h2 className="text-lg font-semibold text-gray-800">{banco.nombre}</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => setModalCuenta(banco.id)}
                >
                  + Cuenta
                </Button>
                <button
                  onClick={() => handleEliminarBanco(banco.id)}
                  className="text-red-400 hover:text-red-600 text-sm px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cuentas del banco */}
            {!banco.cuentas?.length ? (
              <p className="text-sm text-gray-400 ml-8 mb-4">Sin cuentas. Añade una.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {banco.cuentas.map((cuenta) => (
                  <Card
                    key={cuenta.id}
                    className="p-5 cursor-pointer hover:shadow-lg transition rounded-2xl border border-gray-200 bg-white"
                    onClick={() => navigate(`/cuentas/${cuenta.id}`)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold text-gray-900">{cuenta.nombre}</p>
                        <p className="text-xs text-gray-400">{TIPO_LABEL[cuenta.tipo]} · {cuenta.moneda}</p>
                      </div>
                      <span
                        className={`text-lg font-bold ${cuenta.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {cuenta.balance.toFixed(2)} {cuenta.moneda}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Cuentas compartidas conmigo */}
      {compartidas.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <span>👥</span> Compartidas conmigo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {compartidas.map((cuenta) => (
              <Card
                key={cuenta.id}
                className="p-5 cursor-pointer hover:shadow-lg transition rounded-2xl border border-gray-200 bg-white"
                onClick={() => navigate(`/cuentas/${cuenta.id}`)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-semibold text-gray-900">{cuenta.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {cuenta.banco?.nombre} · {cuenta.propietario?.nombre}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${cuenta.rol === "editor" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                      {cuenta.rol === "editor" ? "Editor" : "Lector"}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${cuenta.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {cuenta.balance?.toFixed(2)} {cuenta.moneda}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal nuevo banco */}
      {modalBanco && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Nuevo banco</h2>
            <form onSubmit={handleCrearBanco} className="space-y-3">
              <input
                className="w-full border rounded-lg p-2"
                placeholder="Nombre (ej. BBVA)"
                value={formBanco.nombre}
                onChange={(e) => setFormBanco({ ...formBanco, nombre: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-16 border rounded-lg p-2 text-center text-xl"
                  placeholder="🏦"
                  value={formBanco.icono}
                  onChange={(e) => setFormBanco({ ...formBanco, icono: e.target.value })}
                />
                <input
                  type="color"
                  className="flex-1 border rounded-lg p-1 h-10 cursor-pointer"
                  value={formBanco.color}
                  onChange={(e) => setFormBanco({ ...formBanco, color: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" className="bg-gray-200 text-gray-700" onClick={() => setModalBanco(false)}>Cancelar</Button>
                <Button type="submit">Crear</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nueva cuenta */}
      {modalCuenta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Nueva cuenta</h2>
            <form onSubmit={handleCrearCuenta} className="space-y-3">
              <input
                className="w-full border rounded-lg p-2"
                placeholder="Nombre (ej. Cuenta corriente)"
                value={formCuenta.nombre}
                onChange={(e) => setFormCuenta({ ...formCuenta, nombre: e.target.value })}
                required
              />
              <select
                className="w-full border rounded-lg p-2"
                value={formCuenta.tipo}
                onChange={(e) => setFormCuenta({ ...formCuenta, tipo: e.target.value })}
              >
                {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
              </select>
              <input
                className="w-full border rounded-lg p-2"
                placeholder="Moneda (EUR)"
                value={formCuenta.moneda}
                onChange={(e) => setFormCuenta({ ...formCuenta, moneda: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" className="bg-gray-200 text-gray-700" onClick={() => setModalCuenta(null)}>Cancelar</Button>
                <Button type="submit">Crear</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
