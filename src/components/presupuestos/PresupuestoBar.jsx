function hexA(hex, a) {
  const h = (hex || "#0ea5a3").replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function PresupuestoBar({ nombre, icono, color, gastado, limite, cuenta }) {
  const pct      = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0;
  const superado = gastado > limite;
  const aviso    = !superado && pct >= 80;

  const barColor  = superado ? "var(--red)"   : aviso ? "var(--amber)" : "var(--green)";
  const textColor = superado ? "var(--red)"   : aviso ? "var(--amber)" : "var(--green)";

  return (
    <div style={{ paddingTop: 10, paddingBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: hexA(color || "#0ea5a3", .14),
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
        }}>
          {icono}
        </div>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
          {nombre}
          {cuenta && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginLeft: 6 }}>· {cuenta}</span>}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
          <span style={{ color: textColor }}>{gastado.toFixed(2)}</span> / {limite.toFixed(2)} €
        </span>
      </div>

      <div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: barColor,
          borderRadius: 99,
          transition: "width .6s cubic-bezier(.22,1,.36,1)",
        }} />
      </div>

      {superado && (
        <p style={{ fontSize: 11.5, color: "var(--red)", marginTop: 5, fontWeight: 700 }}>
          Superado en {(gastado - limite).toFixed(2)} €
        </p>
      )}
    </div>
  );
}
