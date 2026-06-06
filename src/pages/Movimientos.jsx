import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import ExpensesChart from "../components/expenses/ExpensesChart";
import ImportExpensesButton from "../components/expenses/ImportExpensesButton";
import Summary from "../components/expenses/Summary";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getExpenses, addExpense, updateExpense, deleteExpense } from "../services/expensesService";


export default function ExpensesPage() {
  const { groupId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const categories = ["Comida", "Transporte", "Ocio", "Salud", "Facturas", "Otros", "Salario", "Educación", "Ahorro"];
  const availableYears = [2025, 2024, 2023, 2022];  
  categories.sort();
  categories.unshift("Todas");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterText, setFilterText] = useState("");
  
 useEffect(() => {
    console.log("📌 Entraste al grupo con ID:", groupId);
  }, [groupId]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getExpenses();
        const parsedData = data.map(row => ({
        ...row,
        date: new Date(row.date)
      }));
        setRows(parsedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const handleSave = async (formData, selectedRow) => {
    try {
      if (!formData.name || !formData.units || !formData.price || !formData.date) {
        setError("Completa todos los campos obligatorios");
        return;
      }

      const payload = {
        ...formData,
        total: formData.units * formData.price,
        date: formData.date.toISOString(), // Convierte a string para backend
      };

      let response;
      if (selectedRow) {
        response = await updateExpense(selectedRow.id, payload);
        setRows(rows.map(r => r.id === selectedRow.id ? response : r));
      } else {
        response = await addExpense(payload);
        setRows([...rows, response]);
      }

      setOpen(false);
      setSelectedRow(null);
      setFormData({});
      setError("");
    } catch (err) {
      console.error("Error en la petición:", err);
      setError("Error al guardar la transacción");
    }
  };
  
  const handleDelete = (id) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const filteredRows = rows.filter((row) => {
    const month = new Date(row.date).getMonth() + 1;
    const year = new Date(row.date).getFullYear();
    const matchMonth = filterMonth ? month === filterMonth : true;
    const matchYear = filterYear ? year === filterYear : true;
    const matchCategory = filterCategory === "Todas" || row.category === filterCategory;
    const matchText =
      filterText === "" ||
      row.name.toLowerCase().includes(filterText.toLowerCase()) ||
      row.notes.toLowerCase().includes(filterText.toLowerCase());
    return matchMonth && matchYear && matchCategory && matchText;
  });

  const total = filteredRows.reduce((sum, r) => sum + r.units * r.price, 0);
  const ingresos = filteredRows.filter((m) => m.type === "ingreso").reduce((sum, m) => sum + m.units * m.price, 0);
  const gastos = filteredRows.filter((m) => m.type === "gasto").reduce((sum, m) => sum + m.units * m.price, 0);

  return (
    <Card className="p-6 shadow-md rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Gastos</h1>
         <ImportExpensesButton
            extraData={{ context: "finances_excel", contextUuid: groupId }}
            onImported={(newRows) => setRows((prev) => [...prev, ...newRows])}
          />

        <Button
          className="rounded-xl"
          onClick={() => {
            setSelectedRow(null);
            setFormData({ name: "", units: 1, price: 0, type: "gasto", category: categories[1], date: new Date(), notes: "" });
            setOpen(true);
          }}
        >
          Añadir Gasto
        </Button>
      </div>

      {/* Summary */}
      <Summary ingresos={ingresos} gastos={gastos} />

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o notas..."
          className="border rounded-lg p-2"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <select className="border rounded-lg p-2" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select className="border rounded-lg p-2" value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
          <option value="">Todos</option>
          <option value={1}>Enero</option>
          <option value={2}>Febrero</option>
          <option value={3}>Marzo</option>
          <option value={4}>Abril</option>
          <option value={5}>Mayo</option>
          <option value={6}>Junio</option>
          <option value={7}>Julio</option>
          <option value={8}>Agosto</option>
          <option value={9}>Septiembre</option>
          <option value={10}>Octubre</option>
          <option value={11}>Noviembre</option>
          <option value={12}>Diciembre</option>
        </select>
        <select className="border rounded-lg p-2" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
          <option value="">Todos</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Unidades</th>
              <th className="py-3 px-4">Precio/Ud</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                <td className="py-3 px-4">{row.units}</td>
                <td className="py-3 px-4">{row.price}€</td>
                <td className="py-3 px-4 font-semibold">{row.units * row.price}€</td>
                <td className="py-3 px-4">{row.category}</td>
                <td className="py-3 px-4 text-gray-700">{new Date(row.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedRow(row);
                      setFormData(row);
                      setOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td colSpan="3" className="py-3 px-4 font-semibold text-right">Total:</td>
              <td className="py-3 px-4 font-bold">{total}€</td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </CardContent>

      {/* Gráficos */}
      <ExpensesChart rows={filteredRows.filter(r => r.type === "gasto")} />

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">{selectedRow ? "Editar Gasto" : "Añadir Gasto"}</h2>
            <div className="space-y-3">
              <input className="w-full border rounded-lg p-2" placeholder="Nombre"
                value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input type="number" className="w-full border rounded-lg p-2" placeholder="Unidades"
                value={formData.units || ""} onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })} />
              <input type="number" className="w-full border rounded-lg p-2" placeholder="Precio (€)"
                value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
              <select className="w-full border rounded-lg p-2"
                value={formData.type || "gasto"} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
              <select className="w-full border rounded-lg p-2"
                value={formData.category || categories[1]} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {categories.filter((c) => c !== "Todas").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <DatePicker
                selected={formData.date} onChange={(date) => setFormData({ ...formData, date })}
                className="w-full border rounded-lg p-2" dateFormat="dd/MM/yyyy"
              />
              <textarea className="w-full border rounded-lg p-2" placeholder="Notas"
                value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button className="bg-gray-300 text-gray-800" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => handleSave(formData, selectedRow)}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
