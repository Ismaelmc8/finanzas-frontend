import api from "./api";

export const getBancos = async () => {
  const res = await api.get("/bancos");
  return res.data;
};

export const createBanco = async (data) => {
  const res = await api.post("/bancos", data);
  return res.data;
};

export const updateBanco = async (id, data) => {
  const res = await api.put(`/bancos/${id}`, data);
  return res.data;
};

export const deleteBanco = async (id) => {
  const res = await api.delete(`/bancos/${id}`);
  return res.data;
};
