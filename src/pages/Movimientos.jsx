import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses } from "../services/expensesService";
import { getCuentas } from "../services/cuentasService";
import { Card, CardContent } from "../components/ui/Card";
import Summary from "../components/expenses/Summary";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const YEARS  = [2026, 2025, 2024, 2023];

export default function Movimientos() {
  const navigate = useNavigate();

  const [rows,      setRows]      = useState([]);
  const [cuentaMap, setCuentaMap] = useState({});
  const [loading,   setLoading]   = useState(true);

  const [filterText,      setFilterText]      = useState("");
  const [filterCuenta,    setFilterCuenta]    = useState("todas");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterTipo,      setFilterTipo]      = useState("todos");
  const [filterMonth,     setFilterMonth]     = useState(new Date().getMonth() + 1);
  const [filterYear,      setFilterYear]      = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([getExpenses(), getCuentas()])
      .then(([txs, cuentasData]) => {
        setRows(txs.map(r => ({ ...r, date: new Date(r.date) })));

        const map = {};
        [...(cuentasData.propias || []), ...(cuentasData.compartidas || [])].forEach(c => {
          map[c.id] = { nombre: c.nombre, banco: c.banco?.nombre };
        });
        setCuentaMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Opciones de filtro derivadas de los datos
  const categorias = ["Todas", ...new Set(rows.filter(r => r.category).map(r => r.category))].sort((a, b) =>
    a === "Todas" ? -1 : b === "Todas" ? 1 : a.localeCompare(b)
  );

  const cuentasConTx = [
    { id: "todas", label: "Todas las cuentas" },
    ...Object.entries(cuentaMap)
      .filter(([id]) => rows.some(r => String(r.cuentaId) === id))
      .map(([id, info]) => ({
        id,
        label: [info.banco, info.nombre].filter(Boolean).join(" · "),
      })),
  ];

  const filtered = rows.filter(r => {
    const d = r.date;
    if (filterMonth && d.getMonth() + 1 !== filterMonth) return false;
    if (filterYear  && d.getFullYear()  !== filterYear)  return false;
    if (filterCuenta    !== "todas" && String(r.cuentaId) !== filterCuenta) return false;
    if (filterCategoria !== "Todas" && r.category !== filterCategoria)       return false;
    if (filterTipo      !== "todos" && r.type      !== filterTipo)           return false;
    if (filterText) {
      const q = filterText.toLowerCase();
      if (!(r.name || "").toLowerCase().includes(q) && !(r.notes || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const ingresos = filtered.filter(r => r.type === "ingreso").reduce((s, r) => s + r.total, 0);
  const gastos   = filtered.filter(r => r.type === "gasto").reduce((s, r)   => s + r.total, 0);

  const colorTotal = (r) =>
    r.type === "ingreso" ? "text-green-600" : r.type === "gasto" ? "text-red-600" : "text-gray-500";

  const labelTotal = (r) => {
    const sign = r.type === "ingreso" ? "+" : r.type === "gasto" ? "−" : "↔";
    return `${sign}${Math.abs(r.total).toFixed(2)} €`;
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando movimientos...</p>;

  return (
    <Card className="p-6 shadow-md rounded-2xl">
      {/* Cabecera */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Todos los movimientos</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {filtered.length} transacción{filtered.length !== 1 ? "es" : ""} · Para editar, entra en la cuenta
        </p>
      </div>

      <Summary ingresos={ingresos} gastos={gastos} />

      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 mb-5">
        <input
          type="text"
          placeholder="Buscar..."
          className="border rounded-lg p-2 text-sm col-span-2 md:col-span-1"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
        <select className="border rounded-lg p-2 text-sm" value={filterCuenta} onChange={e => setFilterCuenta(e.target.value)}>
          {cuentasConTx.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select className="border rounded-lg p-2 text-sm" value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)}>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="border rounded-lg p-2 text-sm" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
          <option value="traspaso">Traspasos</option>
        </select>
        <select className="border rounded-lg p-2 text-sm" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
          <option value="">Todos los meses</option>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select className="border rounded-lg p-2 text-sm" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
          <option value="">Todos los años</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b text-gray-500 uppercase text-xs">
              <th className="py-3 px-3">Nombre</th>
              <th className="py-3 px-3">Cuenta</th>
              <th className="py-3 px-3">Total</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-400">
                  Sin transacciones para los filtros seleccionados
                </td>
              </tr>
            ) : (
              filtered.map(r => {
                const cuenta = r.cuentaId ? cuentaMap[r.cuentaId] : null;
                return (
                  <tr
                    key={r.id}
                    className={`border-b last:border-0 hover:bg-gray-50 ${r.type === "traspaso" ? "opacity-60" : ""}`}
                  >
                    <td className="py-3 px-3 font-medium text-gray-800">
                      {r.name}
                      {r.recurrente    && <span title="Plantilla recurrente" className="ml-1.5 text-indigo-400 text-xs">🔁</span>}
                      {r.recurrenciaId && <span title="Generada automáticamente" className="ml-1.5 text-gray-400 text-xs">🔄</span>}
                    </td>
                    <td className="py-3 px-3">
                      {cuenta ? (
                        <button
                          className="text-left hover:underline"
                          onClick={() => navigate(`/cuentas/${r.cuentaId}`)}
                        >
                          {cuenta.banco && (
                            <span className="text-xs text-gray-400 mr-1">{cuenta.banco} ·</span>
                          )}
                          <span className="text-indigo-600">{cuenta.nombre}</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Sin cuenta</span>
                      )}
                    </td>
                    <td className={`py-3 px-3 font-semibold tabular-nums ${colorTotal(r)}`}>
                      {labelTotal(r)}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{r.category || "—"}</td>
                    <td className="py-3 px-3 text-gray-500">{r.date.toLocaleDateString("es-ES")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
