import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

export default function EvolucionChart({ datos }) {
  if (!datos?.length) return null;

  const balanceData = datos.map(d => ({
    mes:     d.mes,
    balance: Math.round((d.ingresos - d.gastos) * 100) / 100,
  }));

  const hasNegative = balanceData.some(d => d.balance < 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={balanceData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#0ea5a3" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#0ea5a3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 12, fill: "var(--muted)", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          width={52}
          axisLine={false}
          tickLine={false}
        />
        {hasNegative && (
          <ReferenceLine y={0} stroke="var(--line)" strokeDasharray="4 4" />
        )}
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,.10)",
          }}
          formatter={(v) => [
            (v >= 0 ? "+" : "") + v.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €",
            "Balance",
          ]}
        />
        <Area
          type="monotone"
          dataKey="balance"
          name="Balance"
          stroke="#0ea5a3"
          strokeWidth={2.5}
          fill="url(#gradBalance)"
          dot={{ r: 4, fill: "#0ea5a3", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
