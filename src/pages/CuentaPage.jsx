import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCuenta } from "../services/cuentasService";
import { getExpenses, addExpense, updateExpense, deleteExpense } from "../services/expensesService";
import { deleteTraspaso } from "../services/traspasosService";
import { getCategorias } from "../services/categoriasService";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import ExpensesChart from "../components/expenses/ExpensesChart";
import Summary from "../components/expenses/Summary";
import ImportExpensesButton from "../components/expenses/importExpensesButton";
import TraspasoForm from "../components/expenses/TraspasoForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TIPO_LABEL = { corriente: "Corriente", ahorro: "Ahorro", inversion: "Inversión", otro: "Otro" };

export default function CuentaPage() {
  const { cuentaId } = useParams();
  const navigate = useNavigate();

  const [cuenta,     setCuenta]     = useState(null);
  const [rows,       setRows]       = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [open, setOpen] = useState(false);
  const [openTraspaso, setOpenTraspaso] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");

  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterText, setFilterText] = useState("");

  // Aplanar categorías (raíz + subcategorías) para filtros y formulario
  const allCategoryNames = categorias.flatMap(c => [
    c.nombre,
    ...(c.subcategorias || []).map(s => s.nombre),
  ]);
  const categoriesFilter = ["Todas", ...allCategoryNames];

  // Mapa nombre → color para las gráficas
  const categoryColors = Object.fromEntries(
    categorias.flatMap(c => [
      [c.nombre, c.color],
      ...(c.subcategorias || []).map(s => [s.nombre, s.color]),
    ])
  );

  const cargar = async () => {
    try {
      const [cuentaData, expensesData, categoriasData] = await Promise.all([
        getCuenta(cuentaId),
        getExpenses(cuentaId),
        getCategorias(),
      ]);
      setCuenta(cuentaData);
      setRows(expensesData.map(r => ({ ...r, date: new Date(r.date) })));
      setCategorias(categoriasData);
    } catch {
      toast.error("Error cargando los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [cuentaId]);

  const handleSave = async () => {
    if (!formData.name || !formData.units || !formData.price || !formData.date) {
      setFormError("Completa todos los campos obligatorios");
      return;
    }
    try {
      const payload = {
        ...formData,
        total: formData.units * formData.price,
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
        cuentaId: Number(cuentaId),
      };
      if (selectedRow) {
        await updateExpense(selectedRow.id, payload);
        toast.success("Transacción actualizada");
      } else {
        await addExpense(payload);
        toast.success("Transacción añadida");
      }
      setOpen(false);
      setSelectedRow(null);
      setFormData({});
      setFormError("");
      cargar();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (row) => {
    if (!confirm("¿Eliminar esta transacción?")) return;
    try {
      if (row.type === "traspaso") {
        await deleteTraspaso(row.id);
        toast.success("Traspaso eliminado (se han revertido ambas cuentas)");
      } else {
        await deleteExpense(row.id);
        toast.success("Eliminada");
      }
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const filtered = rows.filter((row) => {
    const d = new Date(row.date);
    const matchMonth = filterMonth ? d.getMonth() + 1 === filterMonth : true;
    const matchYear  = filterYear  ? d.getFullYear() === filterYear   : true;
    const matchCat   = filterCategory === "Todas" || row.category === filterCategory;
    const matchText  = filterText === "" ||
      (row.name || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (row.notes || "").toLowerCase().includes(filterText.toLowerCase());
    return matchMonth && matchYear && matchCat && matchText;
  });

  // Los traspasos no cuentan en el resumen de ingresos/gastos
  const ingresos = filtered.filter(r => r.type === "ingreso").reduce((s, r) => s + r.total, 0);
  const gastos   = filtered.filter(r => r.type === "gasto").reduce((s, r)   => s + r.total, 0);

  const totalColor = (row) => {
    if (row.type === "traspaso") return "text-gray-500";
    return row.type === "ingreso" ? "text-green-600" : "text-red-600";
  };

  const totalLabel = (row) => {
    if (row.type === "traspaso") return `↔ ${Math.abs(row.total).toFixed(2)}`;
    return `${row.type === "ingreso" ? "+" : "-"}${Math.abs(row.total).toFixed(2)}`;
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;
  if (!cuenta) return <p className="text-center mt-10 text-red-500">Cuenta no encontrada</p>;

  const esLector = cuenta.rol === "lector";
  const esOwner  = cuenta.rol === "owner";

  return (
    <Card className="p-6 shadow-md rounded-2xl">
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button onClick={() => navigate("/bancos")} className="text-sm text-indigo-500 hover:underline mb-1 block">
            ← Volver a cuentas
          </button>
          <h1 className="text-xl font-bold text-gray-900">{cuenta.nombre}</h1>
          <p className="text-sm text-gray-400">
            {cuenta.banco?.nombre} · {TIPO_LABEL[cuenta.tipo]} · {cuenta.moneda}
            {cuenta.rol && cuenta.rol !== "owner" && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${esLector ? "bg-gray-100 text-gray-600" : "bg-indigo-100 text-indigo-700"}`}>
                {cuenta.rol === "editor" ? "Editor" : "Lector"}
              </span>
            )}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Balance</p>
            <p className={`text-2xl font-bold ${cuenta.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {cuenta.balance.toFixed(2)} {cuenta.moneda}
            </p>
          </div>
          {esOwner && (
            <button
              onClick={() => navigate(`/cuentas/${cuentaId}/accesos`)}
              className="text-xs text-indigo-500 hover:underline"
            >
              ⚙ Gestionar accesos
            </button>
          )}
        </div>
      </div>

      <Summary ingresos={ingresos} gastos={gastos} />

      {/* Acciones */}
      <div className="flex justify-end gap-2 mb-4">
        {!esLector && <ImportExpensesButton extraData={{ cuentaId }} onImported={() => cargar()} />}
        {!esLector && (
          <Button
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={() => setOpenTraspaso(true)}
          >
            ↔ Traspaso
          </Button>
        )}
        {!esLector && (
          <Button
            onClick={() => {
              setSelectedRow(null);
              setFormData({ name: "", units: 1, price: 0, type: "gasto", category: allCategoryNames[0] || "", date: new Date(), notes: "" });
              setOpen(true);
            }}
          >
            + Añadir
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar..."
          className="border rounded-lg p-2 text-sm"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <select className="border rounded-lg p-2 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {categoriesFilter.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="border rounded-lg p-2 text-sm" value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
          <option value="">Todos los meses</option>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select className="border rounded-lg p-2 text-sm" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
          {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b text-gray-500 uppercase text-xs">
              <th className="py-3 px-3">Nombre</th>
              <th className="py-3 px-3">Total</th>
              <th className="py-3 px-3">Tipo</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Fecha</th>
              <th className="py-3 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400">Sin transacciones para los filtros seleccionados</td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b last:border-0 hover:bg-gray-50 ${row.type === "traspaso" ? "opacity-70" : ""}`}
                >
                  <td className="py-3 px-3 font-medium">{row.name}</td>
                  <td className={`py-3 px-3 font-semibold ${totalColor(row)}`}>
                    {totalLabel(row)} {cuenta.moneda}
                  </td>
                  <td className="py-3 px-3 capitalize">{row.type}</td>
                  <td className="py-3 px-3">{row.category || "—"}</td>
                  <td className="py-3 px-3 text-gray-500">{new Date(row.date).toLocaleDateString("es-ES")}</td>
                  <td className="py-3 px-3 flex gap-2">
                    {row.type !== "traspaso" && !esLector && (
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => { setSelectedRow(row); setFormData({ ...row, date: new Date(row.date) }); setOpen(true); }}
                      >
                        ✏️
                      </button>
                    )}
                    {!esLector && (
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(row)}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>

      <ExpensesChart rows={filtered.filter(r => r.type === "gasto")} categoryColors={categoryColors} />

      {/* Modal nueva/editar transacción */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">{selectedRow ? "Editar" : "Nueva transacción"}</h2>
            <div className="space-y-3">
              <input className="w-full border rounded-lg p-2" placeholder="Nombre *"
                value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className="border rounded-lg p-2" placeholder="Unidades"
                  value={formData.units || ""} onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })} />
                <input type="number" className="border rounded-lg p-2" placeholder="Precio (€)"
                  value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
              <select className="w-full border rounded-lg p-2"
                value={formData.type || "gasto"} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
              <select className="w-full border rounded-lg p-2"
                value={formData.category || allCategoryNames[0] || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {categorias.map(cat => (
                  <optgroup key={cat.id} label={`${cat.icono} ${cat.nombre}`}>
                    <option value={cat.nombre}>{cat.nombre}</option>
                    {(cat.subcategorias || []).map(sub => (
                      <option key={sub.id} value={sub.nombre}>↳ {sub.nombre}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <DatePicker
                selected={formData.date} onChange={(date) => setFormData({ ...formData, date })}
                className="w-full border rounded-lg p-2" dateFormat="dd/MM/yyyy"
              />
              <textarea className="w-full border rounded-lg p-2" placeholder="Notas (opcional)"
                value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button className="bg-gray-200 text-gray-700" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal traspaso */}
      {openTraspaso && (
        <TraspasoForm
          cuentaOrigenId={cuentaId}
          onCreated={() => cargar()}
          onClose={() => setOpenTraspaso(false)}
        />
      )}
    </Card>
  );
}
