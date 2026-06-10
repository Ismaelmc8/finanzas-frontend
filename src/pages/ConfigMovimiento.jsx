import { useState, useEffect } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../services/categoriasService";
import { getPresupuestos, createPresupuesto, updatePresupuesto, deletePresupuesto } from "../services/presupuestosService";
import { getCuentas } from "../services/cuentasService";
import { getReglas, createRegla, updateRegla, deleteRegla } from "../services/reglasService";
import EmojiPicker from "../components/ui/EmojiPicker";
import CategoriasSelect from "../components/ui/CategoriasSelect";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Wand2, ArrowRight } from "lucide-react";

const TIPO_LABEL = { gasto: "Gasto", ingreso: "Ingreso", ambos: "Ambos" };
const TIPO_COLOR = {
  gasto:   { color: "var(--red)",     bg: "var(--red-tint)" },
  ingreso: { color: "var(--green)",   bg: "var(--green-tint)" },
  ambos:   { color: "var(--primary)", bg: "var(--primary-tint)" },
};

const FORM_DEFAULT = { nombre: "", tipo: "gasto", color: "#0ea5a3", icono: "📦", parentId: null };
const PRES_DEFAULT = { categoriaId: "", importe: "", cuentaId: "" };

function hexA(hex, a) {
  const h = (hex || "#0ea5a3").replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── Shared UI atoms ─────────────────────────────────────── */
function PrimaryBtn({ children, onClick, type = "button", icon: Icon, full }) {
  return (
    <button type={type} onClick={onClick} style={{
      display: full ? "flex" : "inline-flex", width: full ? "100%" : undefined,
      alignItems: "center", justifyContent: "center", gap: 8,
      background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
      color: "#fff", border: "none", borderRadius: 14, padding: full ? "13px 18px" : "11px 18px",
      fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      boxShadow: "0 6px 16px rgba(14,165,163,.28)",
    }}>
      {Icon && <Icon size={17} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

function SoftBtn({ children, onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick} style={{
      border: "1.5px solid var(--line)", background: "var(--surface-2)", borderRadius: 12,
      padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer",
      color: "var(--ink-2)", fontFamily: "inherit",
    }}>{children}</button>
  );
}

function IconBtn({ icon: Icon, color = "var(--muted)", hoverColor, onClick, title }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ border: "none", background: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", color: h && hoverColor ? hoverColor : color, transition: "color .15s" }}
    >
      <Icon size={16} />
    </button>
  );
}

function Modal({ open, onClose, title, children, width = 440 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,14,25,.5)", backdropFilter: "blur(3px)" }} />
      <div className="animate-popIn" style={{
        position: "relative", width, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto",
        background: "var(--surface)", borderRadius: 22, padding: "20px 22px 24px",
        boxShadow: "0 30px 70px rgba(0,0,0,.25)",
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

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>{hint}</div>}
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

/* ══════════════════════════════════════════════════════════ */
export default function ConfigMovimiento() {
  const [tab, setTab] = useState("categorias");

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const mobile = vw < 768;

  const [categorias,    setCategorias]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [open,          setOpen]          = useState(false);
  const [selected,      setSelected]      = useState(null);
  const [form,          setForm]          = useState(FORM_DEFAULT);
  const [error,         setError]         = useState("");
  const [expandedCat,   setExpandedCat]   = useState(null);

  const [presupuestos,  setPresupuestos]  = useState([]);
  const [cuentas,       setCuentas]       = useState([]);
  const [openPres,      setOpenPres]      = useState(false);
  const [selectedPres,  setSelectedPres]  = useState(null);
  const [formPres,      setFormPres]      = useState(PRES_DEFAULT);
  const [errorPres,     setErrorPres]     = useState("");

  const [reglas,        setReglas]        = useState([]);
  const [openRegla,     setOpenRegla]     = useState(false);
  const [selectedRegla, setSelectedRegla] = useState(null);
  const [formRegla,     setFormRegla]     = useState({ patron: "", categoriaId: "" });
  const [errorRegla,    setErrorRegla]    = useState("");

  const cargar = async () => {
    try {
      const [cats, pres, cuentasData, reglasData] = await Promise.all([
        getCategorias(), getPresupuestos(), getCuentas(), getReglas(),
      ]);
      setCategorias(cats);
      setPresupuestos(pres);
      setCuentas([...(cuentasData.propias || []), ...(cuentasData.compartidas || [])]);
      setReglas(reglasData);
    } catch {
      toast.error("Error cargando configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNueva = (parentId = null) => {
    setSelected(null);
    const padre = parentId ? categorias.find(c => c.id === parentId) : null;
    setForm({ ...FORM_DEFAULT, parentId, color: padre?.color ?? FORM_DEFAULT.color });
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

  const handleSavePres = async (e) => {
    e.preventDefault();
    setErrorPres("");
    try {
      const payload = { categoriaId: Number(formPres.categoriaId), importe: Number(formPres.importe), cuentaId: formPres.cuentaId ? Number(formPres.cuentaId) : null };
      if (selectedPres) {
        await updatePresupuesto(selectedPres.id, { importe: payload.importe });
        toast.success("Presupuesto actualizado");
      } else {
        await createPresupuesto(payload);
        toast.success("Presupuesto creado");
      }
      setOpenPres(false); setSelectedPres(null); setFormPres(PRES_DEFAULT); cargar();
    } catch (err) {
      setErrorPres(err?.response?.data?.error || "Error al guardar");
    }
  };

  const handleDeletePres = async (p) => {
    if (!confirm(`¿Eliminar el presupuesto de "${p.categoria?.nombre}"?`)) return;
    try { await deletePresupuesto(p.id); toast.success("Presupuesto eliminado"); cargar(); }
    catch { toast.error("Error al eliminar"); }
  };

  const handleSaveRegla = async (e) => {
    e.preventDefault();
    setErrorRegla("");
    try {
      if (selectedRegla) {
        await updateRegla(selectedRegla.id, formRegla);
        toast.success("Regla actualizada");
      } else {
        await createRegla(formRegla);
        toast.success("Regla creada");
      }
      setOpenRegla(false); setSelectedRegla(null); setFormRegla({ patron: "", categoriaId: "" }); cargar();
    } catch (err) {
      setErrorRegla(err?.response?.data?.error || "Error al guardar");
    }
  };

  const handleDeleteRegla = async (r) => {
    if (!confirm(`¿Eliminar la regla "${r.patron}"?`)) return;
    try { await deleteRegla(r.id); toast.success("Regla eliminada"); cargar(); }
    catch { toast.error("Error al eliminar"); }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "var(--muted)", fontSize: 15 }}>
        Cargando ajustes…
      </div>
    );
  }

  const TABS = [
    { key: "categorias",   label: "Categorías" },
    { key: "presupuestos", label: "Presupuestos" },
    { key: "reglas",       label: "Reglas" },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 18, paddingTop: mobile ? 16 : 0 }}>
        <h1 style={{ fontSize: mobile ? 28 : 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -1 }}>Ajustes</h1>
        <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Categorías, presupuestos y reglas</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 14, padding: 4, gap: 4, marginBottom: 18 }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, textAlign: "center",
              padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, transition: "all .18s",
              background: tab === key ? "var(--surface)" : "transparent",
              color: tab === key ? "var(--ink)" : "var(--muted)",
              boxShadow: tab === key ? "0 1px 4px rgba(20,20,40,.08)" : "none",
            }}
          >{label}</button>
        ))}
      </div>

      {/* ── Categorías ────────────────────────────────────────── */}
      {tab === "categorias" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <PrimaryBtn full icon={Plus} onClick={() => abrirNueva()}>Nueva categoría</PrimaryBtn>
          </div>

          {categorias.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🏷️</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Sin categorías</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categorias.map(cat => {
                const subs   = cat.subcategorias || [];
                const isOpen = expandedCat === cat.id;
                return (
                  <div key={cat.id} style={{ background: "var(--surface)", borderRadius: 18, boxShadow: "var(--shadow)", border: "1px solid var(--line)", overflow: "hidden" }}>
                    {/* root row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 12px" }}>
                      <button
                        onClick={() => subs.length && setExpandedCat(isOpen ? null : cat.id)}
                        style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 11, background: "none", border: "none", padding: 0, cursor: subs.length ? "pointer" : "default", textAlign: "left", fontFamily: "inherit" }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: hexA(cat.color, .14), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>
                          {cat.icono}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{cat.nombre}</span>
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: TIPO_COLOR[cat.tipo]?.color, background: TIPO_COLOR[cat.tipo]?.bg, padding: "2px 8px", borderRadius: 99 }}>
                              {TIPO_LABEL[cat.tipo]}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>
                            {subs.length > 0 ? `${subs.length} subcategoría${subs.length !== 1 ? "s" : ""}` : "Sin subcategorías"}
                            {subs.length > 0 && <span style={{ color: "var(--primary)" }}>{isOpen ? " · ocultar" : " · ver"}</span>}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => abrirNueva(cat.id)}
                        style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, fontSize: 11.5, fontWeight: 800, color: "var(--primary)", background: "var(--primary-tint)", border: "none", borderRadius: 9, padding: "6px 9px", cursor: "pointer", fontFamily: "inherit" }}
                      ><Plus size={14} strokeWidth={2.6} />Sub</button>
                      <IconBtn icon={Pencil} color="var(--muted)" hoverColor="var(--primary)" onClick={() => abrirEditar(cat)} title="Editar" />
                      <IconBtn icon={Trash2} color="var(--muted)" hoverColor="var(--red)" onClick={() => handleDelete(cat)} title="Eliminar" />
                    </div>

                    {/* subcategories (collapsible) */}
                    {isOpen && subs.length > 0 && (
                      <div style={{ background: "var(--surface-2)", padding: "4px 0" }}>
                        {subs.map(sub => (
                          <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px 9px 22px" }}>
                            <span style={{ width: 8, height: 8, borderRadius: 99, background: cat.color, flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--ink-2)" }}>{sub.nombre}</span>
                            <IconBtn icon={Pencil} color="var(--muted)" hoverColor="var(--primary)" onClick={() => abrirEditar(sub)} title="Editar" />
                            <IconBtn icon={Trash2} color="var(--muted)" hoverColor="var(--red)" onClick={() => handleDelete(sub)} title="Eliminar" />
                          </div>
                        ))}
                        <button
                          onClick={() => abrirNueva(cat.id)}
                          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px 9px 22px", background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontFamily: "inherit" }}
                        >
                          <Plus size={15} strokeWidth={2.4} />
                          <span style={{ fontSize: 13, fontWeight: 800 }}>Añadir subcategoría</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal categoría */}
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title={selected ? "Editar categoría" : form.parentId ? `Nueva subcategoría` : "Nueva categoría"}
          >
            {form.parentId && !selected && (
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 14, padding: "8px 12px", background: "var(--surface-2)", borderRadius: 10 }}>
                Dentro de <strong style={{ color: "var(--ink)" }}>{categorias.find(c => c.id === form.parentId)?.nombre}</strong>
              </div>
            )}
            <form onSubmit={handleSave}>
              <Field label="Icono y nombre">
                <div style={{ display: "flex", gap: 10 }}>
                  <EmojiPicker value={form.icono} onChange={e => setForm({ ...form, icono: e })} />
                  <StyledInput placeholder="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required style={{ flex: 1 }} />
                </div>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Tipo</label>
                  <StyledSelect value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="ambos">Ambos</option>
                  </StyledSelect>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Color</label>
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: "100%", height: 44, border: "1.5px solid var(--line)", borderRadius: 12, padding: 4, cursor: "pointer" }} />
                </div>
              </div>
              {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{error}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <SoftBtn onClick={() => setOpen(false)}>Cancelar</SoftBtn>
                <PrimaryBtn type="submit">Guardar</PrimaryBtn>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* ── Presupuestos ──────────────────────────────────────── */}
      {tab === "presupuestos" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <PrimaryBtn full icon={Plus} onClick={() => { setSelectedPres(null); setFormPres(PRES_DEFAULT); setErrorPres(""); setOpenPres(true); }}>
              Nuevo presupuesto
            </PrimaryBtn>
          </div>

          {presupuestos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Sin presupuestos</div>
              <div style={{ fontSize: 14 }}>Define límites mensuales por categoría</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {presupuestos.map(p => {
                const pct    = p.importe > 0 ? Math.min(Math.round((p.gastado / p.importe) * 100), 100) : 0;
                const estado = pct >= 100 ? "Superado" : pct >= 80 ? "Cerca del límite" : "En curso";
                const ec     = pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--amber)" : "var(--green)";
                const ecHex  = pct >= 100 ? "#f04438"    : pct >= 80 ? "#f5a524"      : "#12b76a";
                return (
                  <div key={p.id} style={{ background: "var(--surface)", borderRadius: 18, padding: 14, boxShadow: "var(--shadow)", border: "1px solid var(--line)" }}>
                    {/* top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: hexA(p.categoria?.color || "#0ea5a3", .14), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {p.categoria?.icono || "💳"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{p.categoria?.nombre}</div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>
                          {p.cuenta?.nombre || "Todas las cuentas"} · mensual
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, flexShrink: 0, color: ec, background: hexA(ecHex, .12), padding: "3px 9px", borderRadius: 99 }}>{estado}</span>
                      <IconBtn icon={Pencil} color="var(--muted)" hoverColor="var(--primary)" onClick={() => { setSelectedPres(p); setFormPres({ categoriaId: p.categoriaId, importe: p.importe, cuentaId: p.cuentaId || "" }); setOpenPres(true); }} title="Editar" />
                      <IconBtn icon={Trash2} color="var(--muted)" hoverColor="var(--red)" onClick={() => handleDeletePres(p)} title="Eliminar" />
                    </div>
                    {/* progress */}
                    <div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: ec, borderRadius: 99, transition: "width .6s cubic-bezier(.22,1,.36,1)" }} />
                    </div>
                    {/* amounts */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{p.gastado?.toFixed(2)} €</span>
                      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>de {p.importe?.toFixed(2)} € · {pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Modal open={openPres} onClose={() => setOpenPres(false)} title={selectedPres ? "Editar presupuesto" : "Nuevo presupuesto"}>
            <form onSubmit={handleSavePres}>
              {!selectedPres && (
                <Field label="Categoría *">
                  <CategoriasSelect
                    categorias={categorias}
                    value={formPres.categoriaId}
                    onChange={e => setFormPres({ ...formPres, categoriaId: e.target.value })}
                    placeholder="Seleccionar..."
                    style={{ ...inputStyle }}
                    required
                  />
                </Field>
              )}
              <Field label="Límite mensual (€) *">
                <StyledInput type="number" min="0.01" step="0.01" placeholder="Ej. 400" value={formPres.importe} onChange={e => setFormPres({ ...formPres, importe: e.target.value })} required />
              </Field>
              {!selectedPres && (
                <Field label="Cuenta (opcional)">
                  <StyledSelect value={formPres.cuentaId} onChange={e => setFormPres({ ...formPres, cuentaId: e.target.value })}>
                    <option value="">Todas las cuentas</option>
                    {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </StyledSelect>
                </Field>
              )}
              {errorPres && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{errorPres}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <SoftBtn onClick={() => setOpenPres(false)}>Cancelar</SoftBtn>
                <PrimaryBtn type="submit">Guardar</PrimaryBtn>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* ── Reglas ────────────────────────────────────────────── */}
      {tab === "reglas" && (
        <div>
          {/* info card */}
          <div style={{ background: "var(--primary-tint)", borderRadius: 14, padding: 14, marginBottom: 14, display: "flex", gap: 11 }}>
            <div style={{ color: "var(--primary)", flexShrink: 0 }}><Wand2 size={22} /></div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600, lineHeight: 1.5 }}>
              Las reglas asignan categoría automáticamente al importar extractos. El patrón se compara con el concepto (sin distinguir mayúsculas).
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <PrimaryBtn full icon={Plus} onClick={() => { setSelectedRegla(null); setFormRegla({ patron: "", categoriaId: "" }); setErrorRegla(""); setOpenRegla(true); }}>
              Nueva regla
            </PrimaryBtn>
          </div>

          {reglas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Sin reglas</div>
              <div style={{ fontSize: 14 }}>Crea reglas para categorizar automáticamente las importaciones</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reglas.map(r => (
                <div
                  key={r.id}
                  style={{
                    background: "var(--surface)", borderRadius: 16, padding: 13,
                    boxShadow: "var(--shadow)", border: "1px solid var(--line)",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <code style={{ fontSize: 12.5, fontWeight: 800, background: "var(--surface-2)", padding: "4px 9px", borderRadius: 8, color: "var(--ink)", flexShrink: 0, fontFamily: "ui-monospace, monospace" }}>
                    {r.patron}
                  </code>
                  <ArrowRight size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: hexA(r.categoria?.color || "#0ea5a3", .14), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                    {r.categoria?.icono || "💳"}
                  </div>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.categoria?.nombre}
                  </span>
                  <IconBtn icon={Pencil} color="var(--muted)" hoverColor="var(--primary)" onClick={() => { setSelectedRegla(r); setFormRegla({ patron: r.patron, categoriaId: r.categoriaId }); setErrorRegla(""); setOpenRegla(true); }} title="Editar" />
                  <IconBtn icon={Trash2} color="var(--muted)" hoverColor="var(--red)" onClick={() => handleDeleteRegla(r)} title="Eliminar" />
                </div>
              ))}
            </div>
          )}

          <Modal open={openRegla} onClose={() => setOpenRegla(false)} title={selectedRegla ? "Editar regla" : "Nueva regla"}>
            <form onSubmit={handleSaveRegla}>
              <Field label="Patrón de texto *" hint="Si el concepto contiene este texto se asigna la categoría automáticamente">
                <StyledInput
                  placeholder="Ej. MERCADONA"
                  value={formRegla.patron}
                  onChange={e => setFormRegla({ ...formRegla, patron: e.target.value.toUpperCase() })}
                  style={{ fontFamily: "monospace", letterSpacing: .4 }}
                  required
                />
              </Field>
              <Field label="Categoría *">
                <CategoriasSelect
                  categorias={categorias}
                  value={formRegla.categoriaId}
                  onChange={e => setFormRegla({ ...formRegla, categoriaId: Number(e.target.value) })}
                  placeholder="Seleccionar..."
                  style={{ ...inputStyle }}
                  required
                />
              </Field>
              {errorRegla && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{errorRegla}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <SoftBtn onClick={() => setOpenRegla(false)}>Cancelar</SoftBtn>
                <PrimaryBtn type="submit">Guardar</PrimaryBtn>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
