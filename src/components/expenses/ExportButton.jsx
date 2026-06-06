import { useState, useRef, useEffect } from "react";
import { exportarCuenta } from "../../services/cuentasService";
import toast from "react-hot-toast";

export default function ExportButton({ cuentaId, filterMonth, filterYear, filterCategory }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Cierra el desplegable al hacer click fuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const descargar = async (format) => {
    setOpen(false);
    setLoading(true);

    const params = { format };

    if (filterMonth && filterYear) {
      const lastDay = new Date(filterYear, filterMonth, 0).getDate();
      params.from = `${filterYear}-${String(filterMonth).padStart(2, "0")}-01`;
      params.to   = `${filterYear}-${String(filterMonth).padStart(2, "0")}-${lastDay}`;
    }

    if (filterCategory && filterCategory !== "Todas") {
      params.categoria = filterCategory;
    }

    try {
      const res = await exportarCuenta(cuentaId, params);
      const ext  = format === "xlsx" ? "xlsx" : "csv";
      const mime = format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";

      const blob = new Blob([res.data], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");

      // Intenta leer el nombre del header Content-Disposition
      const cd   = res.headers["content-disposition"] || "";
      const match = cd.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : `movimientos.${ext}`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Archivo descargado");
    } catch {
      toast.error("Error al exportar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
      >
        {loading ? "Exportando..." : "⬇ Exportar"}
        <span className="text-xs text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
          <button
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition"
            onClick={() => descargar("csv")}
          >
            📄 Exportar CSV
          </button>
          <button
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition border-t border-gray-100"
            onClick={() => descargar("xlsx")}
          >
            📊 Exportar Excel
          </button>
        </div>
      )}
    </div>
  );
}
