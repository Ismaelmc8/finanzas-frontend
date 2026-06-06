import api from "./api";

export const getPresupuestos = async (params = {}) => {
  const res = await api.get("/presupuestos", { params });
  return res.data;
};

export const createPresupuesto = async (data) => {
  const res = await api.post("/presupuestos", data);
  return res.data;
};

export const updatePresupuesto = async (id, data) => {
  const res = await api.put(`/presupuestos/${id}`, data);
  return res.data;
};

export const deletePresupuesto = async (id) => {
  const res = await api.delete(`/presupuestos/${id}`);
  return res.data;
};
