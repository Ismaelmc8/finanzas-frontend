import api from "./api";

export const getReglas       = ()          => api.get("/reglas").then(r => r.data);
export const createRegla     = (data)      => api.post("/reglas", data).then(r => r.data);
export const updateRegla     = (id, data)  => api.put(`/reglas/${id}`, data).then(r => r.data);
export const deleteRegla     = (id)        => api.delete(`/reglas/${id}`).then(r => r.data);
