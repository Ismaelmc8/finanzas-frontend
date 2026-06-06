import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const register = async (nombre, email, password) => {
  const res = await api.post("/auth/register", { nombre, email, password });
  return res.data;
};

export const logout = async () => {
  await api.post("/auth/logout").catch(() => {}); // siempre continúa aunque falle
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const getSessions = async () => {
  const res = await api.get("/auth/sessions");
  return res.data;
};

export const revokeSession = async (id) => {
  const res = await api.delete(`/auth/sessions/${id}`);
  return res.data;
};

export const revokeAllSessions = async () => {
  const res = await api.delete("/auth/sessions");
  return res.data;
};
