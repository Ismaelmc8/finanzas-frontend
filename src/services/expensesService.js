// services/expensesService.js
import api from "./api";

export const getExpenses = async () => {
  const res = await api.get("/expenses");
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

export const deleteExpense = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};
