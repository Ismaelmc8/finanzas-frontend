export default function AlertasPresupuesto({ alertas }) {
  if (!alertas?.length) {
    return (
      <div className="text-center py-6 text-gray-400">
        <p className="text-2xl mb-1">✓</p>
        <p className="text-sm font-medium text-green-600">Todos los presupuestos bajo control</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alertas.map((p) => {
        const pct        = Math.min(p.porcentaje, 100);
        const superado   = p.estado === "superado";
        const barColor   = superado ? "bg-red-500" : "bg-orange-400";
        const fmt        = (n) => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return (
          <div key={p.id} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">
                {p.icono} {p.categoria}
              </span>
              <span className={`text-xs font-semibold ${superado ? "text-red-600" : "text-orange-500"}`}>
                {fmt(p.gastado)} / {fmt(p.limite)} €
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            {superado && (
              <p className="text-xs text-red-500">
                Superado en {fmt(p.gastado - p.limite)} €
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
