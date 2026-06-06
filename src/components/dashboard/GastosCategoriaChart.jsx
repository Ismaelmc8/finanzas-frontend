import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function GastosCategoriaChart({ datos }) {
  if (!datos?.length) {
    return <p className="text-sm text-gray-400 text-center py-8">Sin gastos este mes</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={datos}
          dataKey="total"
          nameKey="categoria"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ categoria, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
          labelLine={false}
        >
          {datos.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, name) => [v.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €", name]}
        />
        <Legend
          formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
