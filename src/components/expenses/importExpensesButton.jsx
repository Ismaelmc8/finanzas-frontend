import { useRef, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function ImportExpensesButton({ extraData = {}, onImported }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      toast.error("Solo se aceptan archivos Excel (.xlsx o .xls)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 10 MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));

    try {
      setLoading(true);
      const res = await api.post("/expenses/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { totalImportadas, duplicadas, categorizadas } = res.data;
      const partes = [`${totalImportadas} transacción${totalImportadas !== 1 ? "es" : ""} importada${totalImportadas !== 1 ? "s" : ""}`];
      if (categorizadas > 0) partes.push(`${categorizadas} categorizadas`);
      if (duplicadas > 0)    partes.push(`${duplicadas} duplicada${duplicadas !== 1 ? "s" : ""} omitida${duplicadas !== 1 ? "s" : ""}`);
      toast.success(partes.join(" · "));
      onImported?.();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.mensaje || "Error al importar el archivo";
      toast.error(msg);
    } finally {
      setLoading(false);
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={e => handleFile(e.target.files[0])}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current.click()}
        className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
      >
        {loading ? "Importando..." : "⬆ Importar Excel"}
      </button>
    </>
  );
}
