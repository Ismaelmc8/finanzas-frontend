import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvitaciones, responderInvitacion } from "../services/accesosService";
import toast from "react-hot-toast";
import { Bell, Check, X, ArrowLeft, Users } from "lucide-react";

const ROL_LABEL = { editor: "Editor", lector: "Lector" };
const ROL_COLOR = {
  editor: { color: "var(--primary)", bg: "var(--primary-tint)" },
  lector: { color: "var(--muted)",   bg: "var(--surface-2)" },
};

export default function InvitacionesPage() {
  const navigate = useNavigate();

  const [invitaciones, setInvitaciones] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [responding,   setResponding]   = useState({});

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const mobile = vw < 768;

  const cargar = async () => {
    try { setInvitaciones(await getInvitaciones()); }
    catch { toast.error("Error cargando invitaciones"); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const responder = async (id, accion) => {
    setResponding(r => ({ ...r, [id]: accion }));
    try {
      const res = await responderInvitacion(id, accion);
      toast.success(res.mensaje);
      cargar();
    } catch {
      toast.error("Error al responder la invitación");
    } finally {
      setResponding(r => { const n = { ...r }; delete n[id]; return n; });
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "var(--muted)", fontSize: 15 }}>
        Cargando avisos…
      </div>
    );
  }

  const pendientes = invitaciones.length;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>

      {/* Mobile top bar with back button */}
      {mobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 40, height: 40, borderRadius: 13,
              background: "var(--surface)", border: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--ink)", flexShrink: 0,
              boxShadow: "var(--shadow)",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)", letterSpacing: -.4 }}>Avisos</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
              {pendientes > 0 ? `${pendientes} pendiente${pendientes !== 1 ? "s" : ""}` : "Todo al día"}
            </div>
          </div>
        </div>
      )}

      {/* Desktop header */}
      {!mobile && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>
            {pendientes > 0 ? `${pendientes} pendiente${pendientes !== 1 ? "s" : ""}` : "Todo al día"}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -1, marginTop: 2 }}>Avisos</h1>
        </div>
      )}

      {invitaciones.length === 0 ? (
        <div style={{
          background: "var(--surface)", borderRadius: 22, boxShadow: "var(--shadow)", border: "1px solid var(--line)",
          display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 24px",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, background: "var(--primary-tint)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "var(--primary)",
          }}>
            <Bell size={28} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>Sin notificaciones</div>
          <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600, textAlign: "center" }}>
            Cuando alguien te invite a una cuenta aparecerá aquí
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {invitaciones.map((inv) => {
            const rolStyle = ROL_COLOR[inv.rol] || ROL_COLOR.lector;
            const busy = responding[inv.id];
            return (
              <div
                key={inv.id}
                className="animate-popIn"
                style={{
                  background: "var(--surface)", borderRadius: 20, boxShadow: "var(--shadow)",
                  border: "1px solid var(--line)",
                  borderLeft: "3px solid var(--primary)",
                  padding: "18px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                  position: "relative",
                }}
              >
                {/* unread dot */}
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--primary)",
                }} />

                {/* icon */}
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: "var(--primary-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
                }}>
                  <Users size={20} />
                </div>

                {/* text */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                      {inv.cuenta?.nombre}
                    </span>
                    <span style={{
                      fontSize: 11.5, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                      color: rolStyle.color, background: rolStyle.bg,
                    }}>
                      {ROL_LABEL[inv.rol]}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>
                    <strong style={{ color: "var(--ink-2)" }}>{inv.propietarioAcceso?.nombre}</strong> te ha invitado a esta cuenta
                  </div>
                  {inv.cuenta?.propietario && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Propietario: {inv.cuenta.propietario.nombre}</div>
                  )}
                  {/* action buttons below text on mobile */}
                  {mobile && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => responder(inv.id, "aceptar")}
                        disabled={!!busy}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
                          color: "#fff", border: "none", borderRadius: 12, padding: "10px 14px",
                          fontSize: 13.5, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer",
                          fontFamily: "inherit", boxShadow: "0 4px 12px rgba(14,165,163,.28)",
                          opacity: busy && busy !== "aceptar" ? .5 : 1,
                        }}
                      >
                        <Check size={15} />
                        Aceptar
                      </button>
                      <button
                        onClick={() => responder(inv.id, "rechazar")}
                        disabled={!!busy}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          background: "var(--red-tint)", color: "var(--red)", border: "none", borderRadius: 12,
                          padding: "10px 14px", fontSize: 13.5, fontWeight: 700,
                          cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit",
                          opacity: busy && busy !== "rechazar" ? .5 : 1,
                        }}
                      >
                        <X size={15} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>

                {/* action buttons beside text on desktop */}
                {!mobile && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => responder(inv.id, "aceptar")}
                      disabled={!!busy}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
                        color: "#fff", border: "none", borderRadius: 12, padding: "9px 14px",
                        fontSize: 13.5, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer",
                        fontFamily: "inherit", boxShadow: "0 4px 12px rgba(14,165,163,.28)",
                        opacity: busy && busy !== "aceptar" ? .5 : 1,
                      }}
                    >
                      <Check size={15} />
                      Aceptar
                    </button>
                    <button
                      onClick={() => responder(inv.id, "rechazar")}
                      disabled={!!busy}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "var(--red-tint)", color: "var(--red)", border: "none", borderRadius: 12,
                        padding: "9px 14px", fontSize: 13.5, fontWeight: 700,
                        cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit",
                        opacity: busy && busy !== "rechazar" ? .5 : 1,
                      }}
                    >
                      <X size={15} />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
