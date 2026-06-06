import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ExpensesChart({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="mt-8 bg-white p-4 rounded-xl shadow text-center text-gray-500">
        No hay datos para mostrar en los gráficos
      </div>
    );
  }

  const categoryData = rows.reduce((acc, row) => {
    const total = row.units * row.price;
    acc[row.category] = (acc[row.category] || 0) + total;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryData).map((key) => ({
    name: key,
    value: categoryData[key],
  }));

  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const monthData = rows.reduce((acc, row) => {
    const month = row.date.getMonth();
    const total = row.units * row.price;
    acc[month] = (acc[month] || 0) + total;
    return acc;
  }, {});

  const monthChartData = Object.keys(monthData).map((key) => ({
    month: monthNames[key],
    total: monthData[key],
  }));

  const colors = ["#4ade80","#60a5fa","#f87171","#fbbf24","#a78bfa","#34d399","#f472b6"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Distribución por categoría</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {categoryChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Gastos por mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
