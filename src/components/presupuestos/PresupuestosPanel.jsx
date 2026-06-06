import { useState, useEffect } from "react";
import { getPresupuestos } from "../../services/presupuestosService";
import PresupuestoBar from "./PresupuestoBar";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function PresupuestosPanel() {
  const ahora = new Date();
  const [mes,  setMes]  = useState(ahora.getMonth() + 1);
  const [año,  setAño]  = useState(ahora.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPresupuestos({ mes, año })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mes, año]);

  if (loading) return <p className="text-sm text-gray-400 py-4 text-center">Cargando presupuestos...</p>;

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">🎯</p>
        <p className="text-sm font-medium">Sin presupuestos definidos</p>
        <p className="text-xs mt-1">Configúralos en Ajustes → Presupuestos</p>
      </div>
    );
  }

  const superados = data.filter(p => p.estado === "superado").length;
  const avisos    = data.filter(p => p.estado === "aviso").length;

  return (
    <div>
      {/* Selector de mes */}
      <div className="flex items-center gap-2 mb-4">
        <select
          className="border rounded-lg px-2 py-1 text-sm"
          value={mes}
          onChange={e => setMes(Number(e.target.value))}
        >
          {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select
          className="border rounded-lg px-2 py-1 text-sm"
          value={año}
          onChange={e => setAño(Number(e.target.value))}
        >
          {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {(superados > 0 || avisos > 0) && (
          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
            superados > 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
          }`}>
            {superados > 0 ? `${superados} superado(s)` : `${avisos} en aviso`}
          </span>
        )}
      </div>

      <div className="divide-y">
        {data.map(p => (
          <PresupuestoBar
            key={p.id}
            nombre={p.categoria?.nombre}
            icono={p.categoria?.icono}
            color={p.categoria?.color}
            gastado={p.gastado}
            limite={p.importe}
            cuenta={p.cuenta?.nombre}
          />
        ))}
      </div>
    </div>
  );
}
