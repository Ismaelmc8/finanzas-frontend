import { useNavigate } from "react-router-dom";

export default function CuentasResumen({ cuentas }) {
  const navigate = useNavigate();
  const fmt = (n) => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!cuentas?.length) {
    return <p className="text-sm text-gray-400 text-center py-4">No hay cuentas activas</p>;
  }

  return (
    <div className="space-y-2">
      {cuentas.map((c) => (
        <button
          key={c.id}
          onClick={() => navigate(`/cuentas/${c.id}`)}
          className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100 text-left"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
            {c.banco && <p className="text-xs text-gray-400">{c.banco}</p>}
          </div>
          <p className={`text-sm font-semibold tabular-nums ${c.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
            {fmt(c.balance)} {c.moneda || "€"}
          </p>
        </button>
      ))}
    </div>
  );
}
