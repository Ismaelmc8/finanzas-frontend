// services/groupsService.js
import api from "./api";

// Obtener todos los grupos del usuario autenticado
export const getGroups = async () => {
  const res = await api.get("/groups-expenses");
  return res.data;
};

// Crear un nuevo grupo
export const addGroup = async (group) => {
  const res = await api.post("/groups", group);
  return res.data;
};

// Actualizar un grupo
export const updateGroup = async (id, group) => {
  const res = await api.put(`/groups/${id}`, group);
  return res.data;
};

// Eliminar un grupo
export const deleteGroup = async (id) => {
  const res = await api.delete(`/groups/${id}`);
  return res.data;
};
