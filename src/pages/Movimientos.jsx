import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses } from "../services/expensesService";
import { getCuentas } from "../services/cuentasService";
import { getCategorias } from "../services/categoriasService";
import NuevaTransaccionModal from "../components/expenses/NuevaTransaccionModal";
import { Search, ArrowDownLeft, ArrowUpRight, TrendingUp, Plus, X } from "lucide-react";

function fmt(n) {
  return Math.abs(n ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function hexA(hex, a) {
  const h = (hex || "#0ea5a3").replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function StatCard({ label, value, color, icon: Icon, tint }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 18, padding: "14px 14px",
      boxShadow: "var(--shadow)", border: "1px solid var(--line)", flex: 1, minWidth: 0,
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: tint, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        <Icon size={16} strokeWidth={2.3} />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 10 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: -.4, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
        {fmt(value)} €
      </div>
    </div>
  );
}

function Pill({ label, active, onClick, onClear }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "6px 12px", borderRadius: 99,
        border: `1.5px solid ${active ? "var(--primary)" : "var(--line)"}`,
        background: active ? "var(--primary)" : "var(--surface)",
        color: active ? "#fff" : "var(--ink-2)",
        fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
        fontFamily: "inherit", transition: "all .15s",
        flexShrink: 0,
      }}
    >
      {label}
      {onClear && active && (
        <span
          onClick={e => { e.stopPropagation(); onClear(); }}
          style={{ display: "flex", alignItems: "center", lineHeight: 1 }}
        >
          <X size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
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

export default function Movimientos() {
  const navigate = useNavigate();

  const [rows,       setRows]       = useState([]);
  const [cuentaMap,  setCuentaMap]  = useState({});
  const [cuentas,    setCuentas]    = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [openAdd,    setOpenAdd]    = useState(false);

  const [filterText,   setFilterText]   = useState("");
  const [filterCuenta, setFilterCuenta] = useState("todas");
  const [filterMonth,  setFilterMonth]  = useState(new Date().getMonth() + 1);
  const [filterYear,   setFilterYear]   = useState(new Date().getFullYear());

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const mobile = vw < 768;

  const loadAll = () =>
    Promise.all([getExpenses(), getCuentas(), getCategorias()])
      .then(([txs, cuentasData, cats]) => {
        setRows(txs.map(r => ({ ...r, date: new Date(r.date) })));
        const map = {};
        const todas = [...(cuentasData.propias || []), ...(cuentasData.compartidas || [])];
        todas.forEach(c => {
          map[c.id] = { nombre: c.nombre, banco: c.banco?.nombre, color: c.banco?.color };
        });
        setCuentaMap(map);
        setCuentas(todas);
        setCategorias(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { loadAll(); }, []);

  const catMeta = (name) => {
    for (const c of categorias) {
      if (c.nombre === name) return { color: c.color || "#0ea5a3", emoji: c.icono || "💳" };
      for (const s of (c.subcategorias || [])) {
        if (s.nombre === name) return { color: s.color || c.color || "#0ea5a3", emoji: s.icono || c.icono || "💳" };
      }
    }
    return { color: "#0ea5a3", emoji: "💳" };
  };

  const cuentasConTx = [
    { id: "todas", label: "Todas las cuentas" },
    ...Object.entries(cuentaMap)
      .filter(([id]) => rows.some(r => String(r.cuentaId) === id))
      .map(([id, info]) => ({ id, label: info.nombre })),
  ];

  const filtered = rows.filter(r => {
    const d = r.date;
    if (filterMonth && d.getMonth() + 1 !== filterMonth) return false;
    if (filterYear  && d.getFullYear()  !== filterYear)  return false;
    if (filterCuenta !== "todas" && String(r.cuentaId) !== filterCuenta) return false;
    if (filterText) {
      const q = filterText.toLowerCase();
      if (!(r.name || "").toLowerCase().includes(q) && !(r.notes || "").toLowerCase().includes(q) &&
          !(r.category || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const ingresos = filtered.filter(r => r.type === "ingreso").reduce((s, r) => s + r.total, 0);
  const gastos   = filtered.filter(r => r.type === "gasto").reduce((s, r)   => s + r.total, 0);
  const balance  = ingresos - gastos;

  const monthLabel = `${MESES[filterMonth - 1]} ${filterYear}`;
  const isCurrentMonth = filterMonth === new Date().getMonth() + 1 && filterYear === new Date().getFullYear();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "var(--muted)", fontSize: 15 }}>
      Cargando movimientos…
    </div>
  );

  const groups = groupByDate(filtered);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
          {filtered.length} transacción{filtered.length !== 1 ? "es" : ""}
        </div>
        <h1 style={{ fontSize: mobile ? 26 : 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -1, marginTop: 2 }}>
          Movimientos
        </h1>
      </div>

      {/* ── StatCards (3 always visible) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: mobile ? 8 : 14, marginBottom: 16 }}>
        <StatCard label="Ingresos" value={ingresos} color="var(--green)" icon={ArrowDownLeft} tint="var(--green-tint)" />
        <StatCard label="Gastos"   value={gastos}   color="var(--red)"   icon={ArrowUpRight}  tint="var(--red-tint)" />
        <StatCard
          label="Balance" value={Math.abs(balance)}
          color={balance >= 0 ? "var(--green)" : "var(--red)"}
          icon={TrendingUp}
          tint={balance >= 0 ? "var(--green-tint)" : "var(--red-tint)"}
        />
      </div>

      {/* ── Search bar ── */}
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
          style={{ border: "none", outline: "none", background: "none", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", flex: 1, fontFamily: "inherit" }}
        />
        {filterText && (
          <button onClick={() => setFilterText("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center", padding: 0 }}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
        {cuentasConTx.map(c => (
          <Pill key={c.id} label={c.label} active={filterCuenta === c.id} onClick={() => setFilterCuenta(c.id)} />
        ))}
        <Pill
          label={monthLabel}
          active={true}
          onClear={!isCurrentMonth ? () => {
            const now = new Date();
            setFilterMonth(now.getMonth() + 1);
            setFilterYear(now.getFullYear());
          } : undefined}
          onClick={() => {}}
        />
      </div>

      {/* ── Transaction groups ── */}
      {groups.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", color: "var(--muted)" }}>
          <Search size={32} style={{ color: "var(--primary)", marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Sin resultados</div>
          <div style={{ fontSize: 13 }}>No hay transacciones con los filtros actuales</div>
        </div>
      ) : groups.map(([date, items]) => (
        <div key={date} style={{ marginBottom: 20 }}>
          {/* Date label */}
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", letterSpacing: .2, textTransform: "capitalize", marginBottom: 7, paddingLeft: 2 }}>
            {dateLabel(date)}
          </div>

          {/* Card for this group */}
          {mobile ? (
            <div style={{ background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
              {items.map((r, idx) => {
                const cuenta   = r.cuentaId ? cuentaMap[r.cuentaId] : null;
                const meta     = catMeta(r.category);
                const isIn     = r.type === "ingreso";
                const isTras   = r.type === "traspaso";
                const amtColor = isTras ? "var(--muted)" : isIn ? "var(--green)" : "var(--ink)";
                const sign     = isTras ? "↔" : isIn ? "+" : "−";
                return (
                  <div key={r.id} style={{ opacity: isTras ? .7 : 1 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                    }}>
                      <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: hexA(meta.color, .13), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        {meta.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: -.2 }}>
                          {r.name}
                          {r.recurrente    && <span style={{ marginLeft: 4, fontSize: 11 }}>🔁</span>}
                          {r.recurrenciaId && <span style={{ marginLeft: 4, fontSize: 11 }}>🔄</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                          {[r.category, cuenta?.nombre].filter(Boolean).join(" · ") || "Sin categoría"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: amtColor, fontVariantNumeric: "tabular-nums", letterSpacing: -.3 }}>
                          {sign}{fmt(r.total)} €
                        </div>
                      </div>
                    </div>
                    {idx < items.length - 1 && <div style={{ height: 1, background: "var(--line)", margin: "0 14px" }} />}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop: table inside card */
            <div style={{ background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
              {/* table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.3fr 1fr 1.2fr 0.9fr", padding: "10px 18px", borderBottom: "1px solid var(--line)", fontSize: 11, fontWeight: 800, color: "var(--muted)", letterSpacing: .5, textTransform: "uppercase" }}>
                <span>Concepto</span>
                <span>Cuenta</span>
                <span style={{ textAlign: "right" }}>Total</span>
                <span style={{ paddingLeft: 16 }}>Categoría</span>
                <span style={{ textAlign: "right" }}>Fecha</span>
              </div>
              {items.map((r, idx) => {
                const cuenta   = r.cuentaId ? cuentaMap[r.cuentaId] : null;
                const meta     = catMeta(r.category);
                const isIn     = r.type === "ingreso";
                const isTras   = r.type === "traspaso";
                const amtColor = isTras ? "var(--muted)" : isIn ? "var(--green)" : "var(--ink)";
                const sign     = isTras ? "↔" : isIn ? "+" : "−";
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "grid", gridTemplateColumns: "2.2fr 1.3fr 1fr 1.2fr 0.9fr",
                      alignItems: "center", padding: "12px 18px",
                      borderBottom: idx < items.length - 1 ? "1px solid var(--line)" : "none",
                      opacity: isTras ? .7 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: hexA(meta.color, .13), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
                        {meta.emoji}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                        {r.recurrente    && <span style={{ marginLeft: 5, fontSize: 12 }}>🔁</span>}
                        {r.recurrenciaId && <span style={{ marginLeft: 5, fontSize: 12 }}>🔄</span>}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      {cuenta ? (
                        <button onClick={() => navigate(`/cuentas/${r.cuentaId}`)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>
                          {cuenta.banco && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{cuenta.banco} · </span>}
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{cuenta.nombre}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Sin cuenta</span>
                      )}
                    </div>
                    <span style={{ textAlign: "right", fontSize: 14.5, fontWeight: 800, color: amtColor, fontVariantNumeric: "tabular-nums" }}>
                      {sign} {fmt(r.total)} €
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, paddingLeft: 16 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: meta.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.category || "—"}
                      </span>
                    </div>
                    <span style={{ textAlign: "right", fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>
                      {r.date.toLocaleDateString("es-ES")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {mobile && <div style={{ height: 90 }} />}

      {/* ── FAB ── */}
      <button
        onClick={() => setOpenAdd(true)}
        style={{
          position: "fixed",
          bottom: mobile ? 80 : 32,
          right: mobile ? 20 : 32,
          zIndex: 200,
          width: mobile ? 56 : "auto",
          height: mobile ? 56 : "auto",
          borderRadius: mobile ? 18 : 16,
          padding: mobile ? 0 : "13px 22px",
          background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
          color: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: mobile ? 0 : 8,
          fontSize: 14.5, fontWeight: 800, fontFamily: "inherit",
          boxShadow: "0 8px 24px rgba(14,165,163,.40)",
        }}
      >
        <Plus size={mobile ? 28 : 18} strokeWidth={2.5} />
        {!mobile && "Nuevo movimiento"}
      </button>

      {/* ── Modal ── */}
      <NuevaTransaccionModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        cuentas={cuentas}
        categorias={categorias}
        onSaved={loadAll}
      />
    </div>
  );
}
