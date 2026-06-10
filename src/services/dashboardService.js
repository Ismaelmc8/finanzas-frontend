import api from "./api";

export const getDashboard = ({ mes, año } = {}) =>
  api.get("/dashboard", { params: { mes, año } }).then(r => r.data);
