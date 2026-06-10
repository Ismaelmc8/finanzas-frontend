import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home, Wallet, ArrowLeftRight, Settings,
  Coins, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard",       icon: Home,           label: "Inicio" },
  { path: "/bancos",          icon: Wallet,         label: "Cuentas" },
  { path: "/movimientos",     icon: ArrowLeftRight, label: "Movimientos" },
  { path: "/configMovements", icon: Settings,       label: "Ajustes" },
];

export default function AppLayout({ onLogout }) {
  const location = useLocation();

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const isMobile = vw < 768;
  const collapsed = !isMobile && vw < 1180;

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const inicial = (user.nombre || "U")[0].toUpperCase();

  const isActive = (path) =>
    path === "/bancos"
      ? location.pathname.startsWith("/bancos") || location.pathname.startsWith("/cuentas")
      : location.pathname === path;

  /* ── Sidebar content (desktop + tablet) ─────────────────── */
  const SidebarContent = () => (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      padding: collapsed ? "22px 12px" : "22px 16px",
    }}>
      {/* logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: collapsed ? "4px 0 22px" : "4px 8px 22px",
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", boxShadow: "0 6px 14px rgba(14,165,163,.30)",
        }}>
          <Coins size={21} />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: -.4 }}>
            FinanzasApp
          </span>
        )}
      </div>

      {/* nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "11px 0" : "11px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 13,
                background: active ? "var(--primary-tint)" : "transparent",
                color: active ? "var(--primary)" : "var(--ink-2)",
                fontWeight: active ? 800 : 600, fontSize: 14.5,
                textDecoration: "none", position: "relative",
                transition: "background .15s, color .15s",
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* user card */}
      <Link
        to="/perfil"
        style={{
          display: "flex", alignItems: "center", gap: 11,
          padding: collapsed ? 8 : 10, borderRadius: 14,
          border: "1px solid var(--line)", textDecoration: "none",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "background .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800,
        }}>{inicial}</div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{user.nombre || "Usuario"}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email || ""}
              </div>
            </div>
            <ChevronRight size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
          </>
        )}
      </Link>
    </div>
  );

  /* ── Mobile bottom tab bar ───────────────────────────────── */
  const BottomTabBar = () => (
    <nav style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100,
      background: "var(--nav-bg)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid var(--line)",
      boxShadow: "0 -4px 20px rgba(20,20,40,.05)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = isActive(path);
        return (
          <Link
            key={path}
            to={path}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "10px 4px 10px",
              color: active ? "var(--primary)" : "var(--muted)",
              textDecoration: "none", transition: "color .15s",
            }}
          >
            <Icon size={23} strokeWidth={active ? 2.5 : 2} />
            <span style={{ fontSize: 10.5, fontWeight: active ? 800 : 600, letterSpacing: -.2 }}>
              {label === "Movimientos" ? "Movim." : label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  /* ── Layout ──────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Desktop / tablet sidebar */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 78 : 256,
          flexShrink: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--line)",
          height: "100vh",
          position: "sticky", top: 0,
          transition: "width .2s",
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <main style={{
          flex: 1,
          padding: isMobile
            ? "0 16px 86px"
            : collapsed
            ? "28px 24px 60px"
            : "34px 40px 60px",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
        }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && <BottomTabBar />}
    </div>
  );
}
