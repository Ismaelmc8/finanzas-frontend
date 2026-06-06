import api from "./api";

export const getAccesos = async (cuentaId) => {
  const res = await api.get(`/cuentas/${cuentaId}/accesos`);
  return res.data;
};

export const invitarUsuario = async (cuentaId, data) => {
  const res = await api.post(`/cuentas/${cuentaId}/accesos`, data);
  return res.data;
};

export const cambiarRol = async (cuentaId, accesoId, rol) => {
  const res = await api.put(`/cuentas/${cuentaId}/accesos/${accesoId}`, { rol });
  return res.data;
};

export const revocarAcceso = async (cuentaId, accesoId) => {
  const res = await api.delete(`/cuentas/${cuentaId}/accesos/${accesoId}`);
  return res.data;
};

export const getInvitaciones = async () => {
  const res = await api.get("/invitaciones");
  return res.data;
};

export const responderInvitacion = async (id, accion) => {
  const res = await api.put(`/invitaciones/${id}`, { accion });
  return res.data;
};
