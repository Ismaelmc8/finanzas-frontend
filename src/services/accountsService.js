import api from "./api";

export const getAccounts = async () => {
  const res = await api.get("/accounts");
  return res.data;
};

export const createAccount = async (account) => {
  const res = await api.post("/accounts", account);
  return res.data;
};
