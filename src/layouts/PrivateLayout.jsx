import { Navigate, Outlet } from "react-router-dom";
import AppLayout from "../components/Sidebar";

export default function PrivateLayout({ user, onLogout }) {
  if (!user) return <Navigate to="/login" />;
  return <AppLayout onLogout={onLogout}><Outlet /></AppLayout>;
}
