import { useState, useEffect } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../services/categoriasService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

const TIPO_LABEL = { gasto: "Gasto", ingreso: "Ingreso", ambos: "Ambos" };
const TIPO_COLOR = { gasto: "bg-red-100 text-red-700", ingreso: "bg-green-100 text-green-700", ambos: "bg-indigo-100 text-indigo-700" };

const FORM_DEFAULT = { nombre: "", tipo: "gasto", color: "#6366f1", icono: "📦", parentId: null };

export default function ConfigMovimiento() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [open, setOpen]             = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_DEFAULT);
  const [error, setError]           = useState("");

  const cargar = async () => {
    try {
      setCategorias(await getCategorias());
    } catch {
      toast.error("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNueva = (parentId = null) => {
    setSelected(null);
    setForm({ ...FORM_DEFAULT, parentId });
    setError("");
    setOpen(true);
  };

  const abrirEditar = (cat) => {
    setSelected(cat);
    setForm({ nombre: cat.nombre, tipo: cat.tipo, color: cat.color, icono: cat.icono, parentId: cat.parentId });
    setError("");
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (selected) {
        await updateCategoria(selected.id, form);
        toast.success("Categoría actualizada");
      } else {
        await createCategoria(form);
        toast.success("Categoría creada");
      }
      setOpen(false);
      cargar();
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar");
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`¿Eliminar "${cat.nombre}"?`)) return;
    try {
      await deleteCategoria(cat.id);
      toast.success("Categoría eliminada");
      cargar();
    } catch (err) {
      toast.error(err?.response?.data?.error || "No se pudo eliminar");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <Button onClick={() => abrirNueva()}>+ Nueva categoría</Button>
      </div>

      {categorias.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium">No hay categorías</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categorias.map((cat) => (
            <Card key={cat.id} className="p-0 overflow-hidden">
              {/* Fila de categoría raíz */}
              <div className="flex items-center gap-3 p-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: cat.color + "33" }}
                >
                  {cat.icono}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{cat.nombre}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_COLOR[cat.tipo]}`}>
                      {TIPO_LABEL[cat.tipo]}
                    </span>
                  </div>
                  {cat.subcategorias?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{cat.subcategorias.length} subcategoría(s)</p>
                  )}
                </div>
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => abrirNueva(cat.id)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
                    title="Añadir subcategoría"
                  >
                    + Sub
                  </button>
                  <button onClick={() => abrirEditar(cat)} className="text-blue-500 hover:text-blue-700 px-1">✏️</button>
                  <button onClick={() => handleDelete(cat)} className="text-red-400 hover:text-red-600 px-1">🗑️</button>
                </div>
              </div>

              {/* Subcategorías */}
              {cat.subcategorias?.length > 0 && (
                <div className="border-t bg-gray-50">
                  {cat.subcategorias.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0">
                      <span className="w-1 h-4 rounded-full bg-gray-300 ml-4 shrink-0" />
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: sub.color + "33" }}
                      >
                        {sub.icono}
                      </span>
                      <span className="flex-1 text-sm text-gray-700">{sub.nombre}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${TIPO_COLOR[sub.tipo]}`}>
                        {TIPO_LABEL[sub.tipo]}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <button onClick={() => abrirEditar(sub)} className="text-blue-500 hover:text-blue-700 text-sm px-1">✏️</button>
                      <button onClick={() => handleDelete(sub)} className="text-red-400 hover:text-red-600 text-sm px-1">🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {selected ? "Editar categoría" : form.parentId ? "Nueva subcategoría" : "Nueva categoría"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-14 border rounded-lg p-2 text-center text-xl"
                  placeholder="📦"
                  value={form.icono}
                  onChange={(e) => setForm({ ...form, icono: e.target.value })}
                  maxLength={2}
                />
                <input
                  className="flex-1 border rounded-lg p-2"
                  placeholder="Nombre *"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
                  <select
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded-lg border p-1 cursor-pointer"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>
              </div>
              {!selected && form.parentId && (
                <p className="text-xs text-gray-400">
                  Subcategoría de: <strong>{categorias.find(c => c.id === form.parentId)?.nombre}</strong>
                </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" className="bg-gray-200 text-gray-700" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
