import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function GastosMesChart({ datos, height = 170 }) {
  if (!datos?.length) return null;

  const data = datos.map(d => ({
    mes:    d.mes,
    gastos: Math.round((d.gastos || 0) * 100) / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 12, fill: "var(--muted)", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          width={48}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(14,165,163,.06)" }}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,.10)",
          }}
          formatter={(v) => [v.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €", "Gastos"]}
        />
        <Bar dataKey="gastos" fill="#0ea5a3" radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}
