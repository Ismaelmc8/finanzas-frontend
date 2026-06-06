import { useState, useEffect } from "react";
import { getCuentas } from "../services/cuentasService";
import { getExpenses } from "../services/expensesService";
import PresupuestosPanel from "../components/presupuestos/PresupuestosPanel";
import { Card } from "../components/ui/Card";

export default function Dashboard() {
  const [resumen, setResumen] = useState({ balance: 0, ingresos: 0, gastos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ahora   = new Date();
    const mes     = ahora.getMonth() + 1;
    const año     = ahora.getFullYear();

    Promise.all([getCuentas(), getExpenses()])
      .then(([cuentasData, txs]) => {
        const propias = cuentasData.propias || [];
        const balance = propias.reduce((s, c) => s + (c.balance || 0), 0);

        const delMes = txs.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() + 1 === mes && d.getFullYear() === año;
        });
        const ingresos = delMes.filter(t => t.type === "ingreso").reduce((s, t) => s + t.total, 0);
        const gastos   = delMes.filter(t => t.type === "gasto").reduce((s, t)   => s + t.total, 0);

        setResumen({ balance, ingresos, gastos });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n.toFixed(2) + " €";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Métricas del mes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Balance total</p>
          <p className={`text-2xl font-bold ${resumen.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {loading ? "—" : fmt(resumen.balance)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ingresos este mes</p>
          <p className="text-2xl font-bold text-green-600">
            {loading ? "—" : fmt(resumen.ingresos)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Gastos este mes</p>
          <p className="text-2xl font-bold text-red-500">
            {loading ? "—" : fmt(resumen.gastos)}
          </p>
        </Card>
      </div>

      {/* Presupuestos */}
      <Card className="p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Presupuestos del mes</h2>
        <PresupuestosPanel />
      </Card>
    </div>
  );
}
