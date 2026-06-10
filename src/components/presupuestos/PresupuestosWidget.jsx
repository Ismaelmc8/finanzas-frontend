import { useState, useEffect } from "react";
import { getPresupuestos } from "../../services/presupuestosService";

function hexA(hex, a) {
  const h = (hex || "#0ea5a3").replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function PresupuestoCard({ p }) {
  const pct     = p.importe > 0 ? Math.min(Math.round((p.gastado / p.importe) * 100), 100) : 0;
  const estado  = pct >= 100 ? "Superado" : pct >= 80 ? "Cerca del límite" : "En curso";
  const ec      = pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--amber)" : "var(--green)";
  const ecHex   = pct >= 100 ? "#f04438"   : pct >= 80 ? "#f5a524"      : "#12b76a";
  const color   = p.categoria?.color || "#0ea5a3";

  return (
    <div style={{
      background: "var(--surface)", borderRadius: 18, padding: 14,
      border: "1px solid var(--line)", boxShadow: "var(--shadow)",
    }}>
      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: hexA(color, 0.14),
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>
          {p.categoria?.icono || "💳"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>
            {p.categoria?.nombre || "—"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>
            {p.cuenta?.nombre || "Todas las cuentas"} · mensual
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, flexShrink: 0,
          color: ec, background: hexA(ecHex, 0.12),
          padding: "3px 9px", borderRadius: 99,
        }}>{estado}</span>
      </div>

      {/* progress bar */}
      <div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: ec,
          borderRadius: 99, transition: "width .9s cubic-bezier(.22,1,.36,1)",
        }} />
      </div>

      {/* amounts row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
          {p.gastado?.toFixed(2)} €
        </span>
        <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>
          de {p.importe?.toFixed(2)} € · {pct}%
        </span>
      </div>
    </div>
  );
}

/* Compact row — used inside a single Card (desktop dashboard) */
function PresupuestoCompactRow({ p }) {
  const pct   = p.importe > 0 ? Math.min(Math.round((p.gastado / p.importe) * 100), 100) : 0;
  const ec    = pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--amber)" : "var(--green)";
  const color = p.categoria?.color || "#0ea5a3";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: hexA(color, 0.14),
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
        }}>
          {p.categoria?.icono || "💳"}
        </div>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p.categoria?.nombre || "—"}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
          {p.gastado?.toFixed(2)} / {p.importe?.toFixed(0)} €
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: ec, borderRadius: 99, transition: "width .9s cubic-bezier(.22,1,.36,1)" }} />
      </div>
    </div>
  );
}

export default function PresupuestosWidget({ mes, año, variant = "cards", limit }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPresupuestos({ mes, año })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mes, año]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", color: "var(--muted)", fontSize: 14 }}>
      Cargando…
    </div>
  );

  if (data.length === 0) return (
    <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Sin presupuestos</div>
      <div style={{ fontSize: 13 }}>Configúralos en Ajustes → Presupuestos</div>
    </div>
  );

  const items = limit ? data.slice(0, limit) : data;

  if (variant === "compact") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map(p => <PresupuestoCompactRow key={p.id} p={p} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map(p => <PresupuestoCard key={p.id} p={p} />)}
    </div>
  );
}
