import api from "./api";

export const getCuentas = async () => {
  const res = await api.get("/cuentas");
  return res.data;
};

export const getCuenta = async (id) => {
  const res = await api.get(`/cuentas/${id}`);
  return res.data;
};

export const createCuenta = async (data) => {
  const res = await api.post("/cuentas", data);
  return res.data;
};

export const updateCuenta = async (id, data) => {
  const res = await api.put(`/cuentas/${id}`, data);
  return res.data;
};

export const deleteCuenta = async (id) => {
  const res = await api.delete(`/cuentas/${id}`);
  return res.data;
};
