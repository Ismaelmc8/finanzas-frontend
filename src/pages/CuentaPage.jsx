import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCuenta, updateCuenta, exportarCuenta } from "../services/cuentasService";
import { getExpenses, addExpense, updateExpense, deleteExpense } from "../services/expensesService";
import { deleteTraspaso } from "../services/traspasosService";
import { getCategorias } from "../services/categoriasService";
import api from "../services/api";
import CategoriasSelect from "../components/ui/CategoriasSelect";
import GastosCategoriaChart from "../components/dashboard/GastosCategoriaChart";
import TraspasoForm from "../components/expenses/TraspasoForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import {
  ChevronLeft, Plus, Search, Coins,
  Users, Pencil, Trash2, X, ArrowDownLeft, ArrowUpRight,
  ArrowLeftRight, MoreHorizontal, Upload, Download,
} from "lucide-react";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TIPO_LABEL = { corriente: "Corriente", ahorro: "Ahorro", inversion: "Inversión", otro: "Otro" };

function hexA(hex, a) {
  const h = (hex || "#0ea5a3").replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function fmt(n, { sign = false } = {}) {
  const val = typeof n === "number" ? Math.abs(n) : 0;
  const s = val.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (sign && n > 0) return `+${s}`;
  return s;
}

function groupByDate(rows) {
  const groups = {};
  rows.forEach(r => {
    const key = r.date instanceof Date
      ? r.date.toISOString().slice(0, 10)
      : String(r.date).slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function dateLabel(dateStr) {
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today)     return "Hoy";
  if (dateStr === yesterday) return "Ayer";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

/* ── Segment tabs ────────────────────────────────────────── */
function SegTabs({ value, onChange }) {
  const tabs = [
    { key: "mov",   label: "Movimientos" },
    { key: "stats", label: "Estadísticas" },
  ];
  return (
    <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 14, padding: 4, gap: 4 }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1, border: "none", cursor: "pointer", fontFamily: "inherit",
            textAlign: "center", padding: "9px 4px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 700,
            color: value === t.key ? "var(--ink)" : "var(--muted)",
            background: value === t.key ? "var(--surface)" : "transparent",
            boxShadow: value === t.key ? "0 1px 4px rgba(20,20,40,.08)" : "none",
            transition: "all .18s",
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}

/* ── Menu bottom sheet ───────────────────────────────────── */
function MenuSheet({ open, onClose, items }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,14,25,.48)", backdropFilter: "blur(3px)" }} />
      <div className="animate-popIn" style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: "var(--surface)", borderRadius: "24px 24px 0 0",
        padding: "20px 16px 40px", boxShadow: "0 -20px 60px rgba(0,0,0,.2)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line)", margin: "0 auto 20px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item, i) => item === "divider" ? (
            <div key={i} style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
          ) : (
            <button
              key={i}
              onClick={() => { onClose(); item.onClick(); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 12px", borderRadius: 14, border: "none",
                background: "none", cursor: "pointer", fontFamily: "inherit",
                color: item.danger ? "var(--red)" : "var(--ink)",
                fontSize: 15, fontWeight: 700, textAlign: "left",
                transition: "background .12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                background: item.danger ? "var(--red-tint)" : "var(--surface-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: item.danger ? "var(--red)" : "var(--muted)",
              }}>
                <item.icon size={18} strokeWidth={2.1} />
              </div>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Pill ────────────────────────────────────────────────── */
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px", borderRadius: 99, flexShrink: 0,
        border: `1.5px solid ${active ? "var(--primary)" : "var(--line)"}`,
        background: active ? "var(--primary)" : "var(--surface)",
        color: active ? "#fff" : "var(--ink-2)",
        fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
        fontFamily: "inherit", transition: "all .15s",
      }}
    >{label}</button>
  );
}

/* ── Modal ───────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, width = 460 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,14,25,.5)", backdropFilter: "blur(3px)" }} />
      <div className="animate-popIn" style={{
        position: "relative", width, maxWidth: "100%", maxHeight: "90vh",
        overflowY: "auto", background: "var(--surface)", borderRadius: 22,
        padding: "20px 22px 24px", boxShadow: "0 30px 70px rgba(0,0,0,.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: -.4 }}>{title}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 99, background: "var(--surface-2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", border: "1.5px solid var(--line)", borderRadius: 12,
  padding: "10px 13px", fontSize: 14, fontWeight: 600, background: "var(--surface)",
  color: "var(--ink)", outline: "none", fontFamily: "inherit", transition: "border-color .15s",
};

function StyledInput(props) {
  return (
    <input {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
    />
  );
}

function StyledSelect({ children, ...props }) {
  return <select {...props} style={{ ...inputStyle, appearance: "none" }}>{children}</select>;
}

function PrimaryBtn({ children, onClick, icon: Icon, type = "button" }) {
  return (
    <button type={type} onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
      color: "#fff", border: "none", borderRadius: 14, padding: "11px 18px",
      fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      boxShadow: "0 6px 16px rgba(14,165,163,.32)", whiteSpace: "nowrap",
    }}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function SoftBtn({ children, onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick} style={{
      border: "1.5px solid var(--line)", background: "var(--surface-2)", borderRadius: 12,
      padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer",
      color: "var(--ink-2)", fontFamily: "inherit",
    }}>
      {children}
    </button>
  );
}

/* ── Transaction row (used within a Card — no card shell here) ── */
function TxnRow({ row, moneda, catMeta, esLector, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  const isIngreso  = row.type === "ingreso";
  const isTraspaso = row.type === "traspaso";
  const meta     = catMeta(row.category);
  const amtColor = isTraspaso ? "var(--muted)" : isIngreso ? "var(--green)" : "var(--ink)";
  const sign     = isTraspaso ? "↔" : isIngreso ? "+" : "−";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "13px 10px",
        borderRadius: 12, background: hover ? "var(--surface-2)" : "transparent",
        transition: "background .12s",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: hexA(meta.color, .13),
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>
        {meta.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: -.2 }}>
          {row.name}
          {row.recurrente    && <span style={{ marginLeft: 6, fontSize: 12 }}>🔁</span>}
          {row.recurrenciaId && !row.recurrente && <span style={{ marginLeft: 6, fontSize: 12 }}>🔄</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
          {row.category || "Sin categoría"}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: amtColor, letterSpacing: -.3, fontVariantNumeric: "tabular-nums" }}>
          {sign} {fmt(Math.abs(row.total))} {moneda}
        </div>
      </div>
      {!esLector && hover && (
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {row.type !== "traspaso" && (
            <button
              onClick={() => onEdit(row)}
              style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--primary-tint)", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(row)}
            style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--red-tint)", color: "var(--red)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ label, value, moneda, color, icon: Icon, tint }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 18, padding: 16, boxShadow: "var(--shadow)", border: "1px solid var(--line)", flex: 1 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: tint, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        <Icon size={16} strokeWidth={2.3} />
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 10 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: -.4, fontVariantNumeric: "tabular-nums" }}>
        {fmt(value)} {moneda}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function CuentaPage() {
  const { cuentaId } = useParams();
  const navigate     = useNavigate();

  const [cuenta,     setCuenta]     = useState(null);
  const [rows,       setRows]       = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [tab, setTab] = useState("mov");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  /* modals */
  const [open,         setOpen]         = useState(false);
  const [openTraspaso, setOpenTraspaso] = useState(false);
  const [selectedRow,  setSelectedRow]  = useState(null);
  const [formData,     setFormData]     = useState({});
  const [formError,    setFormError]    = useState("");
  const [deleteModal,  setDeleteModal]  = useState(null);
  const [saldoModal,   setSaldoModal]   = useState(false);
  const [saldoInput,   setSaldoInput]   = useState("");

  /* filters */
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterMonth,    setFilterMonth]    = useState(new Date().getMonth() + 1);
  const [filterYear,     setFilterYear]     = useState(new Date().getFullYear());
  const [filterTipo,     setFilterTipo]     = useState("todos");
  const [filterText,     setFilterText]     = useState("");

  /* viewport */
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const mobile = vw < 768;

  const allCategoryNames = categorias.flatMap(c => [
    c.nombre, ...(c.subcategorias || []).map(s => s.nombre),
  ]);

  const catMeta = (name) => {
    for (const c of categorias) {
      if (c.nombre === name) return { color: c.color || "#0ea5a3", emoji: c.icono || "💳" };
      for (const s of (c.subcategorias || [])) {
        if (s.nombre === name) return { color: s.color || c.color || "#0ea5a3", emoji: s.icono || c.icono || "💳" };
      }
    }
    return { color: "#0ea5a3", emoji: "💳" };
  };

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
        recurrente:       formData.recurrente || false,
        frecuenciaValor:  formData.recurrente ? (formData.frecuenciaValor || 1) : null,
        frecuenciaUnidad: formData.recurrente ? (formData.frecuenciaUnidad || "mes") : null,
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

  const openAdd = () => {
    setSelectedRow(null);
    setFormData({ name: "", units: 1, price: 0, type: "gasto", category: allCategoryNames[0] || "", date: new Date(), notes: "", recurrente: false, frecuenciaValor: 1, frecuenciaUnidad: "mes" });
    setOpen(true);
  };

  const handleDelete = (row) => {
    if (row.recurrente || row.recurrenciaId) {
      setDeleteModal(row);
    } else if (confirm("¿Eliminar esta transacción?")) {
      ejecutarDelete(row, null);
    }
  };

  const handleImport = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) { toast.error("Solo se aceptan archivos Excel (.xlsx o .xls)"); return; }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("cuentaId", cuentaId);
    try {
      const res = await api.post("/expenses/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const { totalImportadas, duplicadas, categorizadas } = res.data;
      const partes = [`${totalImportadas} importada${totalImportadas !== 1 ? "s" : ""}`];
      if (categorizadas > 0) partes.push(`${categorizadas} categorizadas`);
      if (duplicadas > 0)    partes.push(`${duplicadas} duplicadas omitidas`);
      toast.success(partes.join(" · "));
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al importar");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExport = async (format) => {
    const params = { format };
    if (filterMonth && filterYear) {
      const lastDay = new Date(filterYear, filterMonth, 0).getDate();
      params.from = `${filterYear}-${String(filterMonth).padStart(2, "0")}-01`;
      params.to   = `${filterYear}-${String(filterMonth).padStart(2, "0")}-${lastDay}`;
    }
    if (filterCategory && filterCategory !== "Todas") params.categoria = filterCategory;
    try {
      const res = await exportarCuenta(cuentaId, params);
      const ext  = format === "xlsx" ? "xlsx" : "csv";
      const mime = format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";
      const blob = new Blob([res.data], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const cd   = res.headers["content-disposition"] || "";
      const match = cd.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : `movimientos.${ext}`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Archivo descargado");
    } catch {
      toast.error("Error al exportar");
    }
  };

  const ejecutarDelete = async (row, modo) => {
    setDeleteModal(null);
    try {
      if (row.type === "traspaso") {
        await deleteTraspaso(row.id);
        toast.success("Traspaso eliminado");
      } else {
        await deleteExpense(row.id, modo);
        toast.success(modo === "cancelar" ? "Recurrencia cancelada" : "Eliminada");
      }
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const filtered = rows.filter(row => {
    const d = row.date;
    if (filterMonth && d.getMonth() + 1 !== filterMonth) return false;
    if (filterYear  && d.getFullYear()  !== filterYear)  return false;
    if (filterCategory !== "Todas" && row.category !== filterCategory) return false;
    if (filterTipo !== "todos" && row.type !== filterTipo) return false;
    if (filterText && !(row.name || "").toLowerCase().includes(filterText.toLowerCase()) &&
                      !(row.notes || "").toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const ingresos = filtered.filter(r => r.type === "ingreso").reduce((s, r) => s + r.total, 0);
  const gastos   = filtered.filter(r => r.type === "gasto").reduce((s, r) => s + r.total, 0);

  const gastosPorCat = (() => {
    const map = {};
    filtered.filter(r => r.type === "gasto").forEach(r => {
      const meta = catMeta(r.category);
      if (!map[r.category]) map[r.category] = { categoria: r.category, total: 0, color: meta.color };
      map[r.category].total += r.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  })();

  const monthLabel = `${MONTHS[filterMonth - 1]} ${filterYear}`;
  const isCurrentMonth = filterMonth === new Date().getMonth() + 1 && filterYear === new Date().getFullYear();

  const grupos = groupByDate(filtered);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "var(--muted)", fontSize: 15 }}>
      Cargando…
    </div>
  );
  if (!cuenta) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "var(--red)", fontSize: 15 }}>
      Cuenta no encontrada
    </div>
  );

  const esLector = cuenta.rol === "lector";
  const esOwner  = cuenta.rol === "owner";
  const bancoColor = cuenta.banco?.color || "#0ea5a3";

  const menuItems = [
    ...(esOwner ? [
      { icon: Coins,  label: "Establecer saldo inicial", onClick: () => { setSaldoInput(cuenta.saldoInicial ?? "0"); setSaldoModal(true); } },
      { icon: Users,  label: "Gestionar accesos",        onClick: () => navigate(`/cuentas/${cuentaId}/accesos`) },
      "divider",
    ] : []),
    ...(!esLector ? [
      { icon: Upload,   label: "Importar Excel",       onClick: () => fileInputRef.current?.click() },
    ] : []),
    { icon: Download, label: "Exportar CSV",           onClick: () => handleExport("csv") },
    { icon: Download, label: "Exportar Excel",         onClick: () => handleExport("xlsx") },
    ...(!esLector ? [
      "divider",
      { icon: ArrowLeftRight, label: "Hacer traspaso", onClick: () => setOpenTraspaso(true) },
    ] : []),
  ];

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ── Back ── */}
      <button
        onClick={() => navigate("/bancos")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          color: "var(--primary)", fontWeight: 700, fontSize: 14,
          border: "none", background: "none", cursor: "pointer",
          marginBottom: 12, padding: 0,
        }}
      >
        <ChevronLeft size={18} /> Cuentas
      </button>

      {/* ── Gradient header card ── */}
      <div style={{
        position: "relative", borderRadius: 24, padding: 20, overflow: "hidden",
        background: `linear-gradient(135deg, ${bancoColor}, ${hexA(bancoColor, .72)})`,
        boxShadow: `0 14px 30px ${hexA(bancoColor, .34)}`,
        marginBottom: 16,
      }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{cuenta.banco?.icono || "🏦"}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.82)" }}>
                {cuenta.banco?.nombre} · {TIPO_LABEL[cuenta.tipo] || cuenta.tipo} · {cuenta.moneda}
              </span>
              {cuenta.rol && cuenta.rol !== "owner" && (
                <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(255,255,255,.2)", borderRadius: 99, padding: "2px 8px", color: "#fff" }}>
                  {cuenta.rol === "editor" ? "Editor" : "Lector"}
                </span>
              )}
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                background: "rgba(255,255,255,.18)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", cursor: "pointer",
              }}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.7)", marginTop: 14 }}>
            {cuenta.nombre}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: -1, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
            {fmt(cuenta.balance)} {cuenta.moneda}
          </div>
        </div>
      </div>

      {/* ── Seg tabs ── */}
      <div style={{ marginBottom: 16 }}>
        <SegTabs value={tab} onChange={setTab} />
      </div>

      {/* ══ Movimientos tab ══ */}
      {tab === "mov" && (
        <div>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            background: "var(--surface)", border: "1.5px solid var(--line)",
            borderRadius: 14, padding: "10px 14px", marginBottom: 12,
          }}>
            <Search size={17} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Buscar movimiento…"
              style={{ border: "none", outline: "none", background: "none", fontSize: 14, fontWeight: 600, color: "var(--ink)", flex: 1, fontFamily: "inherit" }}
            />
            {filterText && (
              <button onClick={() => setFilterText("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted)", display: "flex", padding: 0 }}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
            <Pill
              label={monthLabel}
              active={true}
              onClick={() => {
                if (!isCurrentMonth) {
                  setFilterMonth(new Date().getMonth() + 1);
                  setFilterYear(new Date().getFullYear());
                }
              }}
            />
            <Pill
              label={filterCategory === "Todas" ? "Todas las categorías" : filterCategory}
              active={filterCategory !== "Todas"}
              onClick={() => setFilterCategory("Todas")}
            />
            <Pill
              label={filterTipo === "todos" ? "Todos los tipos" : filterTipo === "gasto" ? "Solo gastos" : "Solo ingresos"}
              active={filterTipo !== "todos"}
              onClick={() => setFilterTipo(t => t === "todos" ? "gasto" : t === "gasto" ? "ingreso" : "todos")}
            />
          </div>

          {/* Grouped transactions */}
          {grupos.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <Search size={32} style={{ color: "var(--primary)", marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Sin resultados</div>
              <div style={{ fontSize: 13 }}>No hay movimientos con los filtros actuales</div>
            </div>
          ) : grupos.map(([date, items]) => (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", letterSpacing: .2, textTransform: "capitalize", marginBottom: 6, paddingLeft: 2 }}>
                {dateLabel(date)}
              </div>
              <div style={{ background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)", boxShadow: "var(--shadow)", padding: "4px 6px" }}>
                {items.map((row, i) => (
                  <div key={row.id}>
                    <TxnRow
                      row={row}
                      moneda={cuenta.moneda}
                      catMeta={catMeta}
                      esLector={esLector}
                      onEdit={r => { setSelectedRow(r); setFormData({ ...r, date: new Date(r.date) }); setOpen(true); }}
                      onDelete={handleDelete}
                    />
                    {i < items.length - 1 && <div style={{ height: 1, background: "var(--line)", margin: "0 4px" }} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ Estadísticas tab ══ */}
      {tab === "stats" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <StatCard label="Ingresos" value={ingresos} moneda={cuenta.moneda} color="var(--green)" icon={ArrowDownLeft} tint="var(--green-tint)" />
            <StatCard label="Gastos"   value={gastos}   moneda={cuenta.moneda} color="var(--red)"   icon={ArrowUpRight}  tint="var(--red-tint)" />
          </div>
          <div style={{ background: "var(--surface)", borderRadius: 22, padding: 20, boxShadow: "var(--shadow)", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 14, letterSpacing: -.3 }}>Distribución por categoría</div>
            {gastosPorCat.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "28px 0" }}>Sin gastos en el período</p>
            ) : (
              <GastosCategoriaChart datos={gastosPorCat} />
            )}
          </div>

          {/* Category legend */}
          {gastosPorCat.length > 0 && (
            <div style={{ background: "var(--surface)", borderRadius: 22, padding: 18, boxShadow: "var(--shadow)", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginBottom: 14, letterSpacing: -.3 }}>Por categoría</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {gastosPorCat.slice(0, 8).map(d => (
                  <div key={d.categoria} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.categoria}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                      {d.total.toFixed(2)} {cuenta.moneda}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAB (add transaction) ── */}
      {!esLector && (
        <button
          onClick={openAdd}
          style={{
            position: "fixed", bottom: mobile ? 80 : 32, right: mobile ? 20 : 32, zIndex: 200,
            width: mobile ? 56 : "auto", height: mobile ? 56 : "auto",
            borderRadius: mobile ? 18 : 16, padding: mobile ? 0 : "13px 22px",
            background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
            color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: mobile ? 0 : 8, fontSize: 14.5, fontWeight: 800, fontFamily: "inherit",
            boxShadow: "0 8px 24px rgba(14,165,163,.40)",
          }}
        >
          <Plus size={mobile ? 28 : 18} strokeWidth={2.5} />
          {!mobile && "Añadir movimiento"}
        </button>
      )}

      {/* ── Hidden file input for import ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={e => handleImport(e.target.files[0])}
      />

      {/* ── Menu sheet ── */}
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />

      {/* ── Modal: nueva / editar transacción ── */}
      <Modal open={open} onClose={() => setOpen(false)} title={selectedRow ? "Editar transacción" : "Nueva transacción"}>
        <Field label="Nombre">
          <StyledInput placeholder="Nombre *" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} autoFocus />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Unidades</label>
            <StyledInput type="number" placeholder="1" value={formData.units || ""} onChange={e => setFormData({ ...formData, units: Number(e.target.value) })} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Precio (€)</label>
            <StyledInput type="number" step="0.01" placeholder="0,00" value={formData.price || ""} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
          </div>
        </div>
        <Field label="Tipo">
          <StyledSelect value={formData.type || "gasto"} onChange={e => setFormData({ ...formData, type: e.target.value })}>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </StyledSelect>
        </Field>
        <Field label="Categoría">
          <CategoriasSelect
            categorias={categorias}
            value={formData.category || allCategoryNames[0] || ""}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            valueKey="nombre"
            style={{ ...inputStyle }}
          />
        </Field>
        <Field label="Fecha">
          <DatePicker
            selected={formData.date}
            onChange={date => setFormData({ ...formData, date })}
            dateFormat="dd/MM/yyyy"
            wrapperClassName="w-full"
            customInput={<StyledInput />}
          />
        </Field>
        <Field label="Notas (opcional)">
          <textarea
            placeholder="Notas…"
            value={formData.notes || ""}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
            onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
          />
        </Field>
        <div style={{ border: "1.5px solid var(--line)", borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
            <input
              type="checkbox"
              checked={formData.recurrente || false}
              onChange={e => setFormData({ ...formData, recurrente: e.target.checked })}
              style={{ width: 16, height: 16 }}
            />
            ¿Es recurrente?
          </label>
          {formData.recurrente && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <span style={{ fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>Cada</span>
              <StyledInput
                type="number" min="1"
                value={formData.frecuenciaValor || 1}
                onChange={e => setFormData({ ...formData, frecuenciaValor: Math.max(1, Number(e.target.value)) })}
                style={{ width: 72 }}
              />
              <StyledSelect value={formData.frecuenciaUnidad || "mes"} onChange={e => setFormData({ ...formData, frecuenciaUnidad: e.target.value })} style={{ flex: 1 }}>
                <option value="dia">día(s)</option>
                <option value="mes">mes(es)</option>
                <option value="año">año(s)</option>
              </StyledSelect>
            </div>
          )}
        </div>
        {formError && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{formError}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <SoftBtn onClick={() => setOpen(false)}>Cancelar</SoftBtn>
          <PrimaryBtn onClick={handleSave}>Guardar</PrimaryBtn>
        </div>
      </Modal>

      {/* ── Modal: eliminar recurrente ── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar transacción recurrente" width={400}>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
          "{deleteModal?.name}" está vinculada a una recurrencia. ¿Qué quieres eliminar?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => ejecutarDelete(deleteModal, "ocurrencia")}
            style={{ textAlign: "left", border: "1.5px solid var(--line)", borderRadius: 14, padding: "12px 14px", background: "var(--surface)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Solo esta ocurrencia</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>La recurrencia continuará generándose normalmente.</div>
          </button>
          <button
            onClick={() => ejecutarDelete(deleteModal, "cancelar")}
            style={{ textAlign: "left", border: "1.5px solid var(--red-tint)", borderRadius: 14, padding: "12px 14px", background: "var(--red-tint)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--red)" }}>Cancelar la recurrencia</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>No se generarán más. El historial se mantiene.</div>
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <SoftBtn onClick={() => setDeleteModal(null)}>Cerrar</SoftBtn>
        </div>
      </Modal>

      {/* ── Traspaso modal ── */}
      {openTraspaso && (
        <TraspasoForm
          cuentaOrigenId={cuentaId}
          onCreated={() => cargar()}
          onClose={() => setOpenTraspaso(false)}
        />
      )}

      {/* ── Saldo inicial modal ── */}
      <Modal open={saldoModal} onClose={() => setSaldoModal(false)} title="Saldo inicial" width={380}>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
          Establece el balance real de la cuenta antes de tus primeros movimientos.
        </p>
        <Field label="Saldo inicial (€)">
          <StyledInput type="number" step="0.01" placeholder="0,00" value={saldoInput} onChange={e => setSaldoInput(e.target.value)} autoFocus />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <SoftBtn onClick={() => setSaldoModal(false)}>Cancelar</SoftBtn>
          <PrimaryBtn onClick={async () => {
            try {
              await updateCuenta(cuentaId, { saldoInicial: Number(saldoInput) });
              toast.success("Saldo inicial actualizado");
              setSaldoModal(false);
              cargar();
            } catch {
              toast.error("Error al actualizar");
            }
          }}>Guardar</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}
