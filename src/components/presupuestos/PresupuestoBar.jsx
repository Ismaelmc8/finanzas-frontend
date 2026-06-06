export default function PresupuestoBar({ nombre, icono, color, gastado, limite, cuenta }) {
  const pct      = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0;
  const superado = gastado > limite;
  const aviso    = !superado && pct >= 80;

  const barColor = superado ? "bg-red-500" : aviso ? "bg-orange-400" : "bg-green-500";
  const textColor = superado ? "text-red-600" : aviso ? "text-orange-500" : "text-gray-600";

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ backgroundColor: (color || "#6366f1") + "33" }}
          >
            {icono}
          </span>
          <div>
            <span className="text-sm font-medium text-gray-800">{nombre}</span>
            {cuenta && <span className="ml-1.5 text-xs text-gray-400">· {cuenta}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-sm font-semibold ${textColor}`}>
            {gastado.toFixed(2)} €
          </span>
          <span className="text-xs text-gray-400"> / {limite.toFixed(2)} €</span>
        </div>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {superado && (
        <p className="text-xs text-red-500 mt-1 font-medium">
          Superado en {(gastado - limite).toFixed(2)} €
        </p>
      )}
    </div>
  );
}
