import axios from 'axios';

// Usamos la variable de entorno
const API_HOST = import.meta.env.VITE_API_HOST;

const api = axios.create({
  baseURL: `${API_HOST}/api`, // Ajusta si tu backend usa un prefijo como /api
});

export default api;
