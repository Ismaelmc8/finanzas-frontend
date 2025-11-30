import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function PrivateLayout({ user }) {
  if (!user) return <Navigate to="/login" />; // Protección
  return <Sidebar><Outlet /></Sidebar>;
}
