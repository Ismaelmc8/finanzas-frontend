import { useState, useEffect } from "react";
import { getDashboard } from "../services/dashboardService";
import { Card } from "../components/ui/Card";
import KpiCard             from "../components/dashboard/KpiCard";
import CuentasResumen      from "../components/dashboard/CuentasResumen";
import AlertasPresupuesto  from "../components/dashboard/AlertasPresupuesto";
import EvolucionChart      from "../components/dashboard/EvolucionChart";
import GastosCategoriaChart from "../components/dashboard/GastosCategoriaChart";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">Error cargando el dashboard</p>
      </div>
    );
  }

  const mesNombre = MESES[new Date().getMonth()];
  const fmt       = (n) => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Patrimonio total ─────────────────────────────────────────────── */}
      <Card className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-md">
        <p className="text-sm text-indigo-200 uppercase tracking-wide mb-1">Patrimonio neto total</p>
        <p className="text-4xl font-bold">{fmt(data.patrimonioTotal)} €</p>
        <p className="text-sm text-indigo-200 mt-1">{data.cuentas.length} cuenta{data.cuentas.length !== 1 ? "s" : ""} activa{data.cuentas.length !== 1 ? "s" : ""}</p>
      </Card>

      {/* ── KPIs del mes ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{mesNombre} — resumen del mes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            titulo="Ingresos"
            valor={data.mesActual.ingresos}
            diferencia={data.diferencias.ingresos}
            invertir={false}
          />
          <KpiCard
            titulo="Gastos"
            valor={data.mesActual.gastos}
            diferencia={data.diferencias.gastos}
            invertir={true}
          />
          <KpiCard
            titulo="Tasa de ahorro"
            valor={data.mesActual.tasaAhorro}
            diferencia={data.diferencias.tasaAhorro}
            unidad="%"
            invertir={false}
          />
        </div>
      </div>

      {/* ── Gráficas ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoría — {mesNombre}</h2>
          <GastosCategoriaChart datos={data.gastosPorCategoria} />
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Evolución últimos 6 meses</h2>
          <EvolucionChart datos={data.evolucionMensual} />
        </Card>
      </div>

      {/* ── Cuentas + Alertas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mis cuentas</h2>
          <CuentasResumen cuentas={data.cuentas} />
        </Card>

        {data.presupuestosAlerta.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Alertas de presupuesto
              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                {data.presupuestosAlerta.length}
              </span>
            </h2>
            <AlertasPresupuesto alertas={data.presupuestosAlerta} />
          </Card>
        )}
      </div>
    </div>
  );
}
