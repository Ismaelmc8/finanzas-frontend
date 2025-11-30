import { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Comida", type: "gasto", color: "#34D399" },
    { id: 2, name: "Salario", type: "ingreso", color: "#3B82F6" },
  ]);

  const [formData, setFormData] = useState({ name: "", type: "gasto", color: "#34D399" });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (!formData.name) return;

    if (selectedCategory) {
      // Editar categoría existente
      setCategories(categories.map(cat =>
        cat.id === selectedCategory.id ? { ...formData, id: selectedCategory.id } : cat
      ));
    } else {
      // Agregar nueva categoría
      const newId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      setCategories([...categories, { ...formData, id: newId }]);
    }

    setOpen(false);
    setSelectedCategory(null);
    setFormData({ name: "", type: "gasto", color: "#34D399" });
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <Card className="expenses-card">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Configuración de Categorías</h1>
        <Button
          className="rounded-xl"
          onClick={() => {
            setSelectedCategory(null);
            setFormData({ name: "", type: "gasto", color: "#34D399" });
            setOpen(true);
          }}
        >
          Nueva Categoría
        </Button>
      </div>

      {/* Tabla de categorías */}
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Color</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4">{cat.name}</td>
                <td className="py-3 px-4">{cat.type}</td>
                <td className="py-3 px-4">
                  <span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: cat.color }}></span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setFormData(cat);
                      setOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(cat.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      {/* Modal para agregar/editar categoría */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
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
                <label className="block text-sm font-medium text-gray-600">Tipo</label>
                <select
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Color</label>
                <input
                  type="color"
                  className="w-full h-10 p-1 mt-1"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
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
