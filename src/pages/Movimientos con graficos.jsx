import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExpensesChart from "../components/ExpensesChart";

export default function ExpensesPage() {
  const [rows, setRows] = useState([
    { id: 1, name: "Supermercado", units: 3, price: 12, category: "Comida", status: "Pagado", date: new Date("2025-08-01") },
    { id: 2, name: "Autobús", units: 10, price: 1.5, category: "Transporte", status: "Pendiente", date: new Date("2025-08-10") },
    { id: 3, name: "Netflix", units: 1, price: 12.99, category: "Ocio", status: "Pagado", date: new Date("2025-08-15") },
    { id: 4, name: "Farmacia", units: 2, price: 8.5, category: "Salud", status: "Fallido", date: new Date("2025-08-22") },
  ]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const categories = ["Comida", "Transporte", "Ocio", "Salud", "Otros"];
  const statuses = ["Pagado", "Pendiente", "Fallido"];

  const handleSave = () => {
    if (!formData.date || isNaN(formData.date.getTime())) {
      setError("Por favor selecciona una fecha válida");
      return;
    }
    setError("");

    if (selectedRow) {
      // editar existente
      setRows(rows.map((r) => (r.id === selectedRow.id ? { ...formData, id: selectedRow.id } : r)));
    } else {
      // añadir nuevo
      const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows([...rows, { ...formData, id: newId }]);
    }

    setOpen(false);
    setSelectedRow(null);
    setFormData({});
  };

  // 🔎 Aquí podrías añadir lógica de filtros si lo necesitas
  const filteredRows = rows; // de momento mostramos todo

  return (
    <Card className="p-6 shadow-md rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">Gastos</h1>
          <p className="text-sm text-gray-500">
            Lista de todos tus gastos con nombre, unidades, precio, categoría, estado y fecha.
          </p>
        </div>
        <Button
          className="rounded-xl"
          onClick={() => {
            setSelectedRow(null);
            setFormData({ name: "", units: 1, price: 0, category: categories[0], status: statuses[0], date: new Date() });
            setOpen(true);
          }}
        >
          + Añadir gasto
        </Button>
      </div>

      {/* Tabla */}
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Unidades</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Precio unidad</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Categoría</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Fecha</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                <td className="py-3 px-4">{row.units}</td>
                <td className="py-3 px-4">{row.price.toFixed(2)} €</td>
                <td className="py-3 px-4 font-semibold">{(row.units * row.price).toFixed(2)} €</td>
                <td className="py-3 px-4">{row.category}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {row.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {row.date.toLocaleDateString()}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedRow(row);
                      setFormData(row);
                      setOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => setRows(rows.filter((r) => r.id !== row.id))}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      {/* Gráficos */}
      <ExpensesChart rows={filteredRows} />

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {selectedRow ? "Editar gasto" : "Añadir gasto"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nombre</label>
                <input
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Unidades</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Precio por unidad</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Categoría</label>
                <select
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Estado</label>
                <select
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Fecha</label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  className="w-full border rounded-lg p-2 mt-1"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button className="bg-gray-300 text-gray-800" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
