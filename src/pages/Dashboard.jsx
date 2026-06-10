import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../services/dashboardService";
import { getInvitaciones } from "../services/accesosService";
import { getCuentas } from "../services/cuentasService";
import { getCategorias } from "../services/categoriasService";
import EvolucionChart from "../components/dashboard/EvolucionChart";
import GastosMesChart from "../components/dashboard/GastosMesChart";
import PresupuestosWidget from "../components/presupuestos/PresupuestosWidget";
import NuevaTransaccionModal from "../components/expenses/NuevaTransaccionModal";
import { ArrowDownLeft, ArrowUpRight, Bell, TrendingUp, Plus } from "lucide-react";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function fmt(n) {
  return typeof n === "number"
    ? n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0,00";
}
function fmtShort(n) {
  if (typeof n !== "number") return "0";
  const abs = Math.abs(n);
  if (abs >= 1000) return (n / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 }) + "k";
  return n.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}

function hexA(hex, a) {
  const h = (hex || "#0ea5a3").replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

/* ── Greeting bar (mobile only) ─────────────────────────────── */
function GreetingBar({ user, pendientes, navigate }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingTop: 16,
    }}>
      <div>
        <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>{greeting()} 👋</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: -.5 }}>
          {user.nombre || "Usuario"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={() => navigate("/invitaciones")}
          style={{
            position: "relative", width: 42, height: 42, borderRadius: 14,
            background: "var(--surface)", border: "1px solid var(--line)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink-2)", cursor: "pointer", boxShadow: "var(--shadow)",
          }}
        >
          <Bell size={20} />
          {pendientes > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4, minWidth: 18, height: 18,
              padding: "0 4px", borderRadius: 99, background: "var(--primary)",
              color: "#fff", fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid var(--surface)",
            }}>{pendientes}</span>
          )}
        </button>
        <button
          onClick={() => navigate("/perfil")}
          style={{
            width: 42, height: 42, borderRadius: 14,
            background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 800, border: "none", cursor: "pointer",
            boxShadow: "0 6px 14px rgba(14,165,163,.36)",
          }}
        >
          {(user.nombre || "U")[0].toUpperCase()}
        </button>
      </div>
    </div>
  );
}

/* ── Balance hero card ──────────────────────────────────────── */
function BalanceCard({ total, ingresos, gastos, mesLabel, wide }) {
  return (
    <div style={{
      position: "relative", borderRadius: wide ? 24 : 26, padding: wide ? 28 : 20, overflow: "hidden",
      background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)",
      boxShadow: "0 14px 34px rgba(14,165,163,.38)",
      ...(wide && { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }),
    }}>
      <div style={{ position: "absolute", top: -50, right: wide ? 120 : -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />

      <div style={{ position: "relative" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.78)", letterSpacing: .3 }}>
          BALANCE TOTAL{wide && mesLabel ? ` · ${mesLabel.toUpperCase()}` : ""}
        </span>
        <div style={{ fontSize: wide ? 50 : 38, fontWeight: 800, color: "#fff", letterSpacing: wide ? -1.6 : -1.2, marginTop: 6, fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>
          {fmt(total)} €
        </div>
        {!wide && (
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <MiniFlow dir="in"  label="Ingresos" value={ingresos} />
            <MiniFlow dir="out" label="Gastos"   value={gastos} />
          </div>
        )}
      </div>

      {wide && (
        <div style={{ position: "relative", display: "flex", gap: 14, flexShrink: 0 }}>
          <MiniFlow wide dir="in"  label="Ingresos del mes" value={ingresos} />
          <MiniFlow wide dir="out" label="Gastos del mes"   value={gastos} />
        </div>
      )}
    </div>
  );
}

function MiniFlow({ dir, label, value, wide }) {
  const isIn = dir === "in";
  return (
    <div style={{
      flex: wide ? undefined : 1, minWidth: wide ? 168 : undefined,
      display: "flex", alignItems: "center", gap: wide ? 12 : 10,
      background: "rgba(255,255,255,.14)", borderRadius: 16, padding: wide ? "14px 18px" : "10px 12px",
    }}>
      <div style={{
        width: wide ? 38 : 30, height: wide ? 38 : 30, borderRadius: wide ? 11 : 9,
        background: "rgba(255,255,255,.18)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
      }}>
        {isIn ? <ArrowDownLeft size={wide ? 20 : 17} strokeWidth={2.4} /> : <ArrowUpRight size={wide ? 20 : 17} strokeWidth={2.4} />}
      </div>
      <div>
        <div style={{ fontSize: wide ? 12 : 11, fontWeight: 600, color: "rgba(255,255,255,.78)" }}>{label}</div>
        <div style={{ fontSize: wide ? 22 : 14.5, fontWeight: 800, color: "#fff", letterSpacing: -.4, fontVariantNumeric: "tabular-nums" }}>
          {wide ? fmt(value) : fmtShort(value)} €
        </div>
      </div>
    </div>
  );
}

/* ── Transaction row ────────────────────────────────────────── */
function TxnRow({ t, cuentaNombre, onClick }) {
  const isIn = t.total > 0;
  const isTras = t.type === "traspaso";
  const amtColor = isTras ? "var(--gray)" : isIn ? "var(--green)" : "var(--ink)";
  const catColor = t.color || "var(--primary)";
  const catIcon  = t.icono || "📦";
  const subtitle = [t.categoria || "Sin categoría", cuentaNombre].filter(Boolean).join(" · ");
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 4px",
        background: "none", border: "none", cursor: onClick ? "pointer" : "default",
        width: "100%", textAlign: "left",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: hexA(catColor, 0.14),
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
      }}>{catIcon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: -.2 }}>
          {t.concepto || t.nombre || "Movimiento"}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, marginTop: 1 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: amtColor, letterSpacing: -.3, fontVariantNumeric: "tabular-nums" }}>
          {isIn ? "+" : ""}{fmt(t.total)} €
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
          {t.fecha ? new Date(t.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : ""}
        </div>
      </div>
    </button>
  );
}

/* ── Section header ─────────────────────────────────────────── */
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 4px 10px" }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: -.3 }}>{title}</h2>
      {action && (
        <button onClick={onAction} style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ── Card shell ─────────────────────────────────────────────── */
function Card({ children, p = 20, style = {} }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 22,
      padding: p, boxShadow: "var(--shadow)", border: "1px solid var(--line)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const año = hoy.getFullYear();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [pendientes, setPendientes] = useState(0);
  const [openAdd,   setOpenAdd]   = useState(false);
  const [cuentas,   setCuentas]   = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const mobile = vw < 768;
  const narrow = vw < 900;

  useEffect(() => {
    setLoading(true);
    setError(false);
    getDashboard({})
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getInvitaciones()
      .then(inv => setPendientes(inv.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([getCuentas(), getCategorias()])
      .then(([cuentasData, cats]) => {
        const todas = [...(cuentasData.propias || []), ...(cuentasData.compartidas || [])];
        setCuentas(todas);
        setCategorias(cats);
      })
      .catch(() => {});
  }, []);

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320, color: "var(--muted)", fontSize: 15 }}>
      Cargando dashboard…
    </div>
  );
  if (error || !data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320, color: "var(--red)", fontSize: 15 }}>
      Error cargando el dashboard
    </div>
  );

  const recientes = (data.movimientosRecientes || []).slice(0, 6);
  const cuentaIdToNombre = Object.fromEntries(cuentas.map(c => [String(c.id), c.nombre]));
  const mesLabel = MESES[mes - 1];

  /* ── delta badge for chart (balance this month vs last month) ── */
  const evDelta = (() => {
    const ev = data.evolucionMensual;
    if (!ev || ev.length < 2) return null;
    const delta = (ev[ev.length - 1].ingresos - ev[ev.length - 1].gastos)
                - (ev[ev.length - 2].ingresos - ev[ev.length - 2].gastos);
    return delta || null;
  })();

  return (
    <div>

      {/* ── Mobile greeting bar ── */}
      {mobile && (
        <GreetingBar user={user} pendientes={pendientes} navigate={navigate} />
      )}

      {/* ── Desktop header (title + Nuevo movimiento) ── */}
      {!mobile && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>{greeting()}, {user.nombre || "usuario"} 👋</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -1, marginTop: 2 }}>Resumen</h1>
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
              color: "#fff", border: "none", borderRadius: 14, padding: "12px 20px",
              fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 6px 16px rgba(14,165,163,.32)",
            }}
          >
            <Plus size={17} strokeWidth={2.4} />
            Nuevo movimiento
          </button>
        </div>
      )}

      {/* ── Balance card ── */}
      <div style={{ paddingTop: mobile ? 18 : 0 }}>
        <BalanceCard
          total={data.patrimonioTotal}
          ingresos={data.mesActual.ingresos}
          gastos={data.mesActual.gastos}
          mesLabel={mesLabel}
          wide={!narrow}
        />
      </div>

      {/* ── NARROW / MOBILE: single-column layout ── */}
      {narrow ? (
        <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 0 : 20, marginTop: mobile ? 0 : 20 }}>

          {/* Evolución */}
          <div style={{ paddingTop: mobile ? 20 : 0 }}>
            <Card>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", letterSpacing: -.3 }}>Evolución del balance</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Últimos 6 meses</div>
                </div>
                {evDelta != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: evDelta >= 0 ? "var(--green-tint)" : "var(--red-tint)", color: evDelta >= 0 ? "var(--green)" : "var(--red)", padding: "4px 9px", borderRadius: 99, fontSize: 12.5, fontWeight: 800 }}>
                    <TrendingUp size={14} strokeWidth={2.6} />
                    {evDelta >= 0 ? "+" : ""}{fmtShort(evDelta)} €
                  </div>
                )}
              </div>
              <EvolucionChart datos={data.evolucionMensual} />
            </Card>
          </div>

          {/* Presupuestos */}
          <div style={{ paddingTop: mobile ? 20 : 0 }}>
            <SectionHead title="Presupuestos" action="Gestionar" onAction={() => navigate("/configMovements")} />
            <PresupuestosWidget mes={mes} año={año} />
          </div>

          {/* Últimos movimientos */}
          {recientes.length > 0 && (
            <div style={{ paddingTop: mobile ? 20 : 0 }}>
              <SectionHead title="Últimos movimientos" action="Ver todos" onAction={() => navigate("/movimientos")} />
              <Card p="4px 14px">
                {recientes.map((tx, i) => (
                  <div key={tx.id || i}>
                    <TxnRow t={tx} cuentaNombre={cuentaIdToNombre[String(tx.cuentaId || tx.cuenta_id)]} onClick={() => navigate(`/cuentas/${tx.cuentaId || tx.cuenta_id}`)} />
                    {i < recientes.length - 1 && <div style={{ height: 1, background: "var(--line)", margin: "0 4px" }} />}
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

      ) : (
        /* ── WIDE: two-column layout ── */
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start", marginTop: 20 }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Evolución */}
            <Card>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", letterSpacing: -.3 }}>Evolución del balance</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>Últimos 6 meses</div>
                </div>
                {evDelta != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: evDelta >= 0 ? "var(--green-tint)" : "var(--red-tint)", color: evDelta >= 0 ? "var(--green)" : "var(--red)", padding: "5px 11px", borderRadius: 99, fontSize: 13, fontWeight: 800 }}>
                    <TrendingUp size={15} strokeWidth={2.6} />
                    {evDelta >= 0 ? "+" : ""}{fmtShort(evDelta)} €
                  </div>
                )}
              </div>
              <EvolucionChart datos={data.evolucionMensual} />
            </Card>

            {/* Últimos movimientos (título DENTRO de la tarjeta) */}
            {recientes.length > 0 && (
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", letterSpacing: -.3 }}>Últimos movimientos</div>
                  <button onClick={() => navigate("/movimientos")} style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    Ver todos
                  </button>
                </div>
                {recientes.map((tx, i) => (
                  <div key={tx.id || i}>
                    <TxnRow t={tx} cuentaNombre={cuentaIdToNombre[String(tx.cuentaId || tx.cuenta_id)]} onClick={() => navigate(`/cuentas/${tx.cuentaId || tx.cuenta_id}`)} />
                    {i < recientes.length - 1 && <div style={{ height: 1, background: "var(--line)" }} />}
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Presupuestos (título DENTRO de la tarjeta + lista compacta) */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", letterSpacing: -.3 }}>Presupuestos</div>
                <button onClick={() => navigate("/configMovements")} style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Gestionar
                </button>
              </div>
              <PresupuestosWidget mes={mes} año={año} variant="compact" limit={4} />
            </Card>

            {/* Gastos por mes */}
            <Card>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", letterSpacing: -.3, marginBottom: 16 }}>Gastos por mes</div>
              <GastosMesChart datos={data.evolucionMensual} />
            </Card>

          </div>

        </div>
      )}

      {mobile && <div style={{ height: 24 }} />}

      {/* ── FAB (mobile) ── */}
      {mobile && (
        <button
          onClick={() => setOpenAdd(true)}
          style={{
            position: "fixed", bottom: 80, right: 20, zIndex: 200,
            width: 56, height: 56, borderRadius: 18,
            background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
            color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(14,165,163,.46)",
          }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Nueva transacción modal ── */}
      <NuevaTransaccionModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        cuentas={cuentas}
        categorias={categorias}
        onSaved={() => {
          getDashboard({}).then(setData).catch(() => {});
        }}
      />
    </div>
  );
}
