import api from "./api";

export const createTraspaso = async (data) => {
  const res = await api.post("/traspasos", data);
  return res.data;
};

export const deleteTraspaso = async (id) => {
  const res = await api.delete(`/traspasos/${id}`);
  return res.data;
};
