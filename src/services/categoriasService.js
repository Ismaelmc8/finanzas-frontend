import api from "./api";

export const getCategorias = async () => {
  const res = await api.get("/categorias");
  return res.data;
};

export const createCategoria = async (data) => {
  const res = await api.post("/categorias", data);
  return res.data;
};

export const updateCategoria = async (id, data) => {
  const res = await api.put(`/categorias/${id}`, data);
  return res.data;
};

export const deleteCategoria = async (id) => {
  const res = await api.delete(`/categorias/${id}`);
  return res.data;
};
