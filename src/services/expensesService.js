import api from "./api";

export const getExpenses = async (cuentaId) => {
  const params = cuentaId ? { cuentaId } : {};
  const res = await api.get("/expenses", { params });
  return res.data;
};

export const addExpense = async (expense) => {
  const res = await api.post("/expenses", expense);
  return res.data;
};

export const updateExpense = async (id, expense) => {
  const res = await api.put(`/expenses/${id}`, expense);
  return res.data;
};

export const deleteExpense = async (id, modo) => {
  const params = modo ? `?modo=${modo}` : "";
  const res = await api.delete(`/expenses/${id}${params}`);
  return res.data;
};

export const generarRecurrentes = () =>
  api.post("/expenses/generar-recurrentes").then(r => r.data);
