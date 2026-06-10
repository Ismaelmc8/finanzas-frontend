import { useState, useEffect } from "react";
import { getMe, getSessions, revokeSession, revokeAllSessions } from "../services/authService";
import toast from "react-hot-toast";
import {
  Monitor, Smartphone, LogOut, User, Shield, SlidersHorizontal, ChevronRight,
} from "lucide-react";

function parseUA(ua) {
  if (!ua) return { label: "Dispositivo desconocido", icon: Monitor };
  if (/iPhone|iPad/i.test(ua)) return { label: "iPhone / iPad", icon: Smartphone };
  if (/Android/i.test(ua)) return { label: "Android", icon: Smartphone };
  if (/Windows/i.test(ua)) return { label: "Windows", icon: Monitor };
  if (/Mac OS/i.test(ua)) return { label: "Mac", icon: Monitor };
  if (/Linux/i.test(ua)) return { label: "Linux", icon: Monitor };
  return { label: ua.slice(0, 50), icon: Monitor };
}

function initials(name) {
  return (name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function MenuRow({ icon: Icon, label, onClick, danger }) {
  return (
    <>
      <button
        onClick={onClick}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "13px 10px",
          background: "none", border: "none", cursor: "pointer", width: "100%",
          textAlign: "left", borderRadius: 12, transition: "background .12s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: danger ? "var(--red-tint)" : "var(--primary-tint)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: danger ? "var(--red)" : "var(--primary)",
        }}>
          <Icon size={19} />
        </div>
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: danger ? "var(--red)" : "var(--ink)" }}>
          {label}
        </span>
        <ChevronRight size={18} style={{ color: "var(--muted)", flexShrink: 0 }} />
      </button>
    </>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--line)", margin: "0 10px" }} />;
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 22, boxShadow: "var(--shadow)", border: "1px solid var(--line)", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 4px 10px" }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: -.3 }}>{children}</h2>
      {action && (
        <button onClick={onAction} style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
          {action}
        </button>
      )}
    </div>
  );
}

export default function Perfil({ onLogout }) {
  const [user,     setUser]     = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const mobile = vw < 768;

  const cargar = async () => {
    try {
      const [me, sess] = await Promise.all([getMe(), getSessions()]);
      setUser(me);
      setSessions(sess);
    } catch {
      toast.error("Error cargando el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleRevoke = async (id) => {
    try { await revokeSession(id); toast.success("Sesión cerrada"); cargar(); }
    catch { toast.error("Error al cerrar la sesión"); }
  };

  const handleRevokeAll = async () => {
    if (!confirm("¿Cerrar todas las demás sesiones activas?")) return;
    try { const res = await revokeAllSessions(); toast.success(res.mensaje); cargar(); }
    catch { toast.error("Error"); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "var(--muted)", fontSize: 15 }}>
      Cargando perfil…
    </div>
  );

  const pad = "0";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: mobile ? "20px 0 24px" : "0" }}>
      {/* Title — desktop */}
      {!mobile && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>Tu cuenta</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -1, marginTop: 2 }}>Perfil</h1>
        </div>
      )}

      {/* Gradient profile card */}
      <div style={{ padding: `0 ${pad}`, marginBottom: 16 }}>
        <div style={{
          position: "relative", borderRadius: 24, padding: "24px 20px", overflow: "hidden",
          background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
          boxShadow: "0 14px 30px rgba(14,165,163,.34)",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ position: "absolute", bottom: -50, right: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
          <div style={{
            width: 64, height: 64, borderRadius: 22, flexShrink: 0,
            background: "rgba(255,255,255,.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#fff", position: "relative",
          }}>
            {initials(user?.nombre)}
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: -.4 }}>{user?.nombre}</div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.82)", fontWeight: 600 }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600, marginTop: 4 }}>
              Miembro desde {user?.creado_en ? new Date(user.creado_en).toLocaleDateString("es-ES", { year: "numeric", month: "long" }) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Account settings */}
      <div style={{ padding: `0 ${pad}`, marginBottom: 16 }}>
        <SectionTitle>Cuenta</SectionTitle>
        <Card>
          <MenuRow icon={User}             label="Editar perfil"     onClick={() => toast.error("Próximamente")} />
          <Divider />
          <MenuRow icon={Shield}           label="Cambiar contraseña" onClick={() => toast.error("Próximamente")} />
          <Divider />
          <MenuRow icon={SlidersHorizontal} label="Preferencias · EUR · Español" onClick={() => toast.error("Próximamente")} />
        </Card>
      </div>

      {/* Sessions */}
      <div style={{ padding: `0 ${pad}`, marginBottom: 16 }}>
        <SectionTitle action={sessions.length > 1 ? "Cerrar las demás" : undefined} onAction={handleRevokeAll}>
          Sesiones activas
        </SectionTitle>
        <Card>
          {sessions.length === 0 ? (
            <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>No hay sesiones activas</div>
          ) : sessions.map((s, i) => {
            const { label, icon: DevIcon } = parseUA(s.userAgent);
            return (
              <div key={s.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: s.current ? "var(--primary-tint)" : "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: s.current ? "var(--primary)" : "var(--muted)",
                  }}>
                    <DevIcon size={19} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{label}</span>
                      {s.current && (
                        <span style={{ fontSize: 10, fontWeight: 800, background: "var(--primary-tint)", color: "var(--primary)", padding: "2px 8px", borderRadius: 99 }}>
                          Esta sesión
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                      {s.ip || "IP desconocida"} · {s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleString("es-ES") : "—"}
                    </div>
                  </div>
                  {!s.current && (
                    <button onClick={() => handleRevoke(s.id)} style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, fontFamily: "inherit" }}>
                      Cerrar
                    </button>
                  )}
                </div>
                {i < sessions.length - 1 && <Divider />}
              </div>
            );
          })}
        </Card>
      </div>

      {/* Logout */}
      {onLogout && (
        <div style={{ padding: `0 ${pad}` }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: "var(--red-tint)", color: "var(--red)", border: "none", borderRadius: 16,
              padding: "15px 20px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
