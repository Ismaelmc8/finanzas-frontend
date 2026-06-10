import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBancos, createBanco, deleteBanco } from "../services/bancosService";
import { createCuenta, getCuentas } from "../services/cuentasService";
import { getDashboard } from "../services/dashboardService";
import toast from "react-hot-toast";
import { Plus, X, Trash2, Users, ChevronDown, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const TIPOS = ["corriente", "ahorro", "inversion", "otro"];
const TIPO_LABEL = { corriente: "Corriente", ahorro: "Ahorro", inversion: "Inversión", otro: "Otro" };

function hexA(hex, a) {
  const h = (hex || "#0ea5a3").replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function fmt(n) {
  return typeof n === "number"
    ? n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0,00";
}
/* ── Mini flow (ingresos / gastos pill on the gradient) ── */
function MiniFlow({ dir, label, value }) {
  const isIn = dir === "in";
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", gap: 10,
      background: "rgba(255,255,255,.14)", borderRadius: 16, padding: "10px 12px",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,.18)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
      }}>
        {isIn ? <ArrowDownLeft size={17} strokeWidth={2.4} /> : <ArrowUpRight size={17} strokeWidth={2.4} />}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.75)" }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: "#fff", letterSpacing: -.2, fontVariantNumeric: "tabular-nums" }}>
          {fmt(value)} €
        </div>
      </div>
    </div>
  );
}

/* ── Balance hero card ── */
function BalanceCard({ total, ingresos, gastos }) {
  return (
    <div style={{
      position: "relative", borderRadius: 26, padding: 20, overflow: "hidden",
      background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)",
      boxShadow: "0 14px 34px rgba(14,165,163,.38)", marginBottom: 22,
    }}>
      <div style={{ position: "absolute", top: -50, right: -30, width: 170, height: 170, borderRadius: "50%", background: "rgba(255,255,255,.13)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.78)", letterSpacing: .3 }}>BALANCE TOTAL</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1.2, marginTop: 6, fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>
          {fmt(total)} €
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <MiniFlow dir="in"  label="Ingresos" value={ingresos} />
          <MiniFlow dir="out" label="Gastos"   value={gastos} />
        </div>
      </div>
    </div>
  );
}

/* ── Account card (compact horizontal row) ── */
function AccountCard({ cuenta, banco, onClick, shared }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", background: hover ? "var(--surface-2)" : "var(--surface)",
        borderRadius: 20, padding: 16, boxShadow: "var(--shadow)",
        border: "1px solid var(--line)", overflow: "hidden",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "background .12s",
      }}
    >
      {/* left color strip */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 5,
        background: `linear-gradient(180deg, ${banco.color || "#0ea5a3"}, ${hexA(banco.color || "#0ea5a3", .5)})`,
      }} />
      {/* emoji avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0, marginLeft: 4,
        background: hexA(banco.color || "#0ea5a3", .12),
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{banco.icono || "🏦"}</div>
      {/* name + subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", letterSpacing: -.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {cuenta.nombre}
          </span>
          {shared && (
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--primary)", background: "var(--primary-tint)", padding: "2px 7px", borderRadius: 99, flexShrink: 0 }}>
              {cuenta.rol === "editor" ? "Editor" : "Lector"}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
          {banco.nombre} · {TIPO_LABEL[cuenta.tipo] || cuenta.tipo} · {cuenta.moneda}
        </div>
      </div>
      {/* balance */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{
          fontSize: 17, fontWeight: 800, letterSpacing: -.4, fontVariantNumeric: "tabular-nums",
          color: (cuenta.balance ?? 0) >= 0 ? "var(--green)" : "var(--red)",
        }}>
          {fmt(cuenta.balance ?? 0)} €
        </div>
      </div>
    </button>
  );
}

/* ── Modal ── */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,14,25,.5)", backdropFilter: "blur(3px)" }} />
      <div className="animate-popIn" style={{
        position: "relative", width: 440, maxWidth: "100%", maxHeight: "88vh",
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

function StyledInput({ ...props }) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
    />
  );
}

function StyledSelect({ children, ...props }) {
  return <select {...props} style={{ ...inputStyle, appearance: "none" }}>{children}</select>;
}

function PrimaryBtn({ children, type = "button", onClick, icon: Icon }) {
  return (
    <button type={type} onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
      color: "#fff", border: "none", borderRadius: 14, padding: "12px 20px",
      fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      boxShadow: "0 6px 16px rgba(14,165,163,.32)",
    }}>
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}

function SoftBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      border: "1.5px solid var(--line)", background: "var(--surface-2)", borderRadius: 12,
      padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", color: "var(--ink-2)",
      fontFamily: "inherit",
    }}>
      {children}
    </button>
  );
}

/* ── FAB sheet (choose: new bank or new account) ── */
function FabSheet({ open, onClose, bancos, onNewBanco, onNewCuenta }) {
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
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 14, paddingLeft: 4 }}>¿Qué quieres añadir?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            onClick={() => { onClose(); onNewBanco(); }}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 12px", borderRadius: 14, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "var(--primary-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
              🏦
            </div>
            Nuevo banco
          </button>
          {bancos.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
              {bancos.map(b => (
                <button
                  key={b.id}
                  onClick={() => { onClose(); onNewCuenta(b.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 12px", borderRadius: 14, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: hexA(b.color || "#0ea5a3", .12), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {b.icono || "🏦"}
                  </div>
                  Nueva cuenta en {b.nombre}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function BancosPage() {
  const navigate = useNavigate();
  const [bancos,      setBancos]      = useState([]);
  const [compartidas, setCompartidas] = useState([]);
  const [resumen,     setResumen]     = useState({ ingresos: 0, gastos: 0 });
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState({});
  const [fabOpen,     setFabOpen]     = useState(false);
  const [modalBanco,  setModalBanco]  = useState(false);
  const [modalCuenta, setModalCuenta] = useState(null);
  const [formBanco,   setFormBanco]   = useState({ nombre: "", color: "#0ea5a3", icono: "🏦" });
  const [formCuenta,  setFormCuenta]  = useState({ nombre: "", tipo: "corriente", moneda: "EUR", saldoInicial: "" });

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const mobile = vw < 768;

  const cargar = async () => {
    try {
      const [bancosData, cuentasData, dash] = await Promise.all([getBancos(), getCuentas(), getDashboard({}).catch(() => null)]);
      setBancos(bancosData);
      setCompartidas(cuentasData.compartidas || []);
      if (dash?.mesActual) setResumen({ ingresos: dash.mesActual.ingresos || 0, gastos: dash.mesActual.gastos || 0 });
      const initial = {};
      bancosData.forEach(b => { initial[b.id] = true; });
      setExpanded(prev => {
        const merged = { ...initial };
        Object.keys(prev).forEach(k => { if (k in merged) merged[k] = prev[k]; });
        return merged;
      });
    } catch {
      toast.error("Error cargando cuentas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleCrearBanco = async (e) => {
    e.preventDefault();
    try {
      await createBanco(formBanco);
      toast.success("Banco creado");
      setModalBanco(false);
      setFormBanco({ nombre: "", color: "#0ea5a3", icono: "🏦" });
      cargar();
    } catch {
      toast.error("Error al crear el banco");
    }
  };

  const handleCrearCuenta = async (e) => {
    e.preventDefault();
    try {
      await createCuenta({ ...formCuenta, bancoId: modalCuenta });
      toast.success("Cuenta creada");
      setModalCuenta(null);
      setFormCuenta({ nombre: "", tipo: "corriente", moneda: "EUR", saldoInicial: "" });
      cargar();
    } catch {
      toast.error("Error al crear la cuenta");
    }
  };

  const handleEliminarBanco = async (id) => {
    if (!confirm("¿Eliminar este banco y todas sus cuentas?")) return;
    try {
      await deleteBanco(id);
      toast.success("Banco eliminado");
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "var(--muted)", fontSize: 15 }}>
      Cargando cuentas…
    </div>
  );

  const totalBalance = bancos.flatMap(b => b.cuentas || []).reduce((s, c) => s + (c.balance ?? 0), 0);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* ── Page title ── */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: mobile ? 28 : 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -1 }}>Cuentas</h1>
        <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Tus bancos y saldos</div>
      </div>

      {/* ── Balance hero card ── */}
      <BalanceCard total={totalBalance} ingresos={resumen.ingresos} gastos={resumen.gastos} />

      {/* ── Empty state ── */}
      {bancos.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>Sin bancos todavía</div>
          <div style={{ fontSize: 14 }}>Pulsa el botón + para crear tu primer banco</div>
        </div>
      )}

      {/* ── Owned banks ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {bancos.map(banco => {
          const cuentas    = banco.cuentas || [];
          const totalBanco = cuentas.reduce((s, c) => s + (c.balance ?? 0), 0);
          const isOpen     = expanded[banco.id] !== false;
          return (
            <div key={banco.id}>
              {/* bank header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: isOpen ? 10 : 4 }}>
                <button
                  onClick={() => toggle(banco.id)}
                  style={{
                    flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12,
                    background: "none", border: "none", cursor: "pointer", padding: "4px 0", textAlign: "left",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 13, background: hexA(banco.color || "#0ea5a3", .12), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {banco.icono || "🏦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", letterSpacing: -.2 }}>{banco.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{cuentas.length} cuenta{cuentas.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                    {fmt(totalBanco)} €
                  </div>
                  <ChevronDown
                    size={20}
                    style={{ color: "var(--muted)", flexShrink: 0, transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .2s" }}
                  />
                </button>
                {/* delete bank */}
                <button
                  onClick={() => handleEliminarBanco(banco.id)}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted)", padding: "6px 4px", borderRadius: 8, display: "flex", alignItems: "center", flexShrink: 0, transition: "color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                  title="Eliminar banco"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* account list */}
              {isOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cuentas.map(c => (
                    <AccountCard key={c.id} cuenta={c} banco={banco} onClick={() => navigate(`/cuentas/${c.id}`)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Shared accounts (clearly separated block) ── */}
      {compartidas.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ height: 1, background: "var(--line)", marginBottom: 20 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--primary-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
              <Users size={17} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", letterSpacing: -.2 }}>Compartidas conmigo</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                {compartidas.length} cuenta{compartidas.length !== 1 ? "s" : ""} de otras personas
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {compartidas.map(c => (
              <AccountCard
                key={c.id}
                cuenta={c}
                banco={c.banco || { nombre: "–", icono: "🏦", color: "#0ea5a3" }}
                onClick={() => navigate(`/cuentas/${c.id}`)}
                shared
              />
            ))}
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setFabOpen(true)}
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
        {!mobile && "Nuevo banco"}
      </button>

      {/* ── FAB sheet (nuevo banco / nueva cuenta) ── */}
      <FabSheet
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        bancos={bancos}
        onNewBanco={() => setModalBanco(true)}
        onNewCuenta={(bancoId) => setModalCuenta(bancoId)}
      />

      {/* ── Modal: nuevo banco ── */}
      <Modal open={modalBanco} onClose={() => setModalBanco(false)} title="Nuevo banco">
        <form onSubmit={handleCrearBanco}>
          <Field label="Nombre">
            <StyledInput placeholder="Ej. BBVA" value={formBanco.nombre} onChange={e => setFormBanco({ ...formBanco, nombre: e.target.value })} required autoFocus />
          </Field>
          <Field label="Icono y color">
            <div style={{ display: "flex", gap: 10 }}>
              <StyledInput placeholder="🏦" value={formBanco.icono} onChange={e => setFormBanco({ ...formBanco, icono: e.target.value })} style={{ width: 72, textAlign: "center", fontSize: 20 }} />
              <input type="color" value={formBanco.color} onChange={e => setFormBanco({ ...formBanco, color: e.target.value })} style={{ flex: 1, border: "1.5px solid var(--line)", borderRadius: 12, height: 44, cursor: "pointer", padding: 4 }} />
            </div>
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <SoftBtn onClick={() => setModalBanco(false)}>Cancelar</SoftBtn>
            <PrimaryBtn type="submit">Crear banco</PrimaryBtn>
          </div>
        </form>
      </Modal>

      {/* ── Modal: nueva cuenta ── */}
      <Modal open={!!modalCuenta} onClose={() => setModalCuenta(null)} title="Nueva cuenta">
        <form onSubmit={handleCrearCuenta}>
          <Field label="Nombre">
            <StyledInput placeholder="Ej. Cuenta corriente" value={formCuenta.nombre} onChange={e => setFormCuenta({ ...formCuenta, nombre: e.target.value })} required autoFocus />
          </Field>
          <Field label="Tipo">
            <StyledSelect value={formCuenta.tipo} onChange={e => setFormCuenta({ ...formCuenta, tipo: e.target.value })}>
              {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
            </StyledSelect>
          </Field>
          <Field label="Moneda">
            <StyledInput placeholder="EUR" value={formCuenta.moneda} onChange={e => setFormCuenta({ ...formCuenta, moneda: e.target.value })} />
          </Field>
          <Field label="Saldo inicial (€)" hint="Balance real antes de empezar a registrar movimientos">
            <StyledInput type="number" step="0.01" placeholder="0,00" value={formCuenta.saldoInicial} onChange={e => setFormCuenta({ ...formCuenta, saldoInicial: e.target.value })} />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <SoftBtn onClick={() => setModalCuenta(null)}>Cancelar</SoftBtn>
            <PrimaryBtn type="submit">Crear cuenta</PrimaryBtn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
