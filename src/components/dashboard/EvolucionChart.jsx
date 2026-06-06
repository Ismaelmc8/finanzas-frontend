import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export default function EvolucionChart({ datos }) {
  if (!datos?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={datos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} width={48} />
        <Tooltip
          formatter={(v) => v.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €"}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ingresos" name="Ingresos" fill="#4ade80" radius={[3, 3, 0, 0]} />
        <Bar dataKey="gastos"   name="Gastos"   fill="#f87171" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
