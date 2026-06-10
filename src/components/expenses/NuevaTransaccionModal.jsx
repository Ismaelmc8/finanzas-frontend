import { useState, useEffect } from "react";
import { addExpense } from "../../services/expensesService";
import CategoriasSelect from "../ui/CategoriasSelect";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const inputStyle = {
  width: "100%", border: "1.5px solid var(--line)", borderRadius: 12,
  padding: "10px 13px", fontSize: 14, fontWeight: 600, background: "var(--surface)",
  color: "var(--ink)", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

export default function NuevaTransaccionModal({ open, onClose, cuentas, categorias, onSaved }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ tipo: "gasto", nombre: "", importe: "", cuentaId: "", categoria: "", fecha: today, notas: "" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (open) {
      setForm({ tipo: "gasto", nombre: "", importe: "", cuentaId: cuentas[0]?.id ?? "", categoria: "", fecha: today, notas: "" });
      setError("");
    }
  }, [open]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.importe) {
      setError("Nombre e importe son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const total = parseFloat(form.importe);
      await addExpense({
        name:     form.nombre.trim(),
        type:     form.tipo,
        total,
        units:    1,
        price:    total,
        category: form.categoria || "",
        cuentaId: form.cuentaId ? Number(form.cuentaId) : null,
        date:     new Date(form.fecha).toISOString(),
        notes:    form.notas,
        recurrente: false,
      });
      toast.success("Movimiento añadido");
      onSaved?.();
      onClose();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,14,25,.52)", backdropFilter: "blur(3px)" }} />
      <div className="animate-popIn" style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: "var(--surface)", borderRadius: "24px 24px 0 0",
        padding: "20px 20px 36px", boxShadow: "0 -20px 60px rgba(0,0,0,.22)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line)", margin: "0 auto 18px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: -.4 }}>Nuevo movimiento</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 99, background: "var(--surface-2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* tipo toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["gasto", "Gasto", "var(--red)", "var(--red-tint)"], ["ingreso", "Ingreso", "var(--green)", "var(--green-tint)"]].map(([v, l, col, bg]) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm(f => ({ ...f, tipo: v }))}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 14, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14.5, fontWeight: 800,
                  background: form.tipo === v ? bg : "var(--surface-2)",
                  color: form.tipo === v ? col : "var(--muted)",
                  transition: "all .15s",
                }}
              >{l}</button>
            ))}
          </div>

          {/* nombre */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>Nombre *</label>
            <input
              style={inputStyle}
              placeholder="Ej. Supermercado"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              autoFocus
              required
              onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
            />
          </div>

          {/* importe */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>Importe (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              style={inputStyle}
              placeholder="0,00"
              value={form.importe}
              onChange={e => setForm(f => ({ ...f, importe: e.target.value }))}
              required
              onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
            />
          </div>

          {/* cuenta + fecha */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>Cuenta (opcional)</label>
              <select
                style={{ ...inputStyle, appearance: "none" }}
                value={form.cuentaId}
                onChange={e => setForm(f => ({ ...f, cuentaId: e.target.value }))}
              >
                <option value="">Sin cuenta</option>
                {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>Fecha</label>
              <input
                type="date"
                style={inputStyle}
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
              />
            </div>
          </div>

          {/* categoría */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>Categoría</label>
            <CategoriasSelect
              categorias={categorias}
              value={form.categoria}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              valueKey="nombre"
              allLabel="Sin categoría"
              allValue=""
              style={{ ...inputStyle, appearance: "none" }}
            />
          </div>

          {/* notas */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>Notas (opcional)</label>
            <textarea
              style={{ ...inputStyle, resize: "none", height: 64 }}
              placeholder="Notas…"
              value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
            />
          </div>

          {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{error}</p>}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%", padding: "14px", borderRadius: 16, border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
              color: "#fff", fontSize: 15.5, fontWeight: 800, fontFamily: "inherit",
              boxShadow: "0 8px 20px rgba(14,165,163,.32)", opacity: saving ? .7 : 1,
            }}
          >
            {saving ? "Guardando…" : "Guardar movimiento"}
          </button>
        </form>
      </div>
    </div>
  );
}
