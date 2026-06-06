export default function KpiCard({ titulo, valor, diferencia, unidad = "€", invertir = false }) {
  const fmt = (n) => Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sinDif = diferencia === undefined || diferencia === null;
  const sube   = diferencia >= 0;
  // invertir=true para gastos: subir es malo (rojo), bajar es bueno (verde)
  const colorDif = sinDif ? "" : (invertir ? (sube ? "text-red-500" : "text-green-500") : (sube ? "text-green-500" : "text-red-500"));
  const flecha   = sube ? "↑" : "↓";

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{titulo}</p>
      <p className="text-2xl font-bold text-gray-900">
        {typeof valor === "number" ? fmt(valor) : valor} {unidad}
      </p>
      {!sinDif && (
        <p className={`text-xs mt-1.5 font-medium ${colorDif}`}>
          {flecha} {diferencia >= 0 ? "+" : ""}{fmt(diferencia)} {unidad} vs mes anterior
        </p>
      )}
    </div>
  );
}
