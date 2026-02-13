import axios from 'axios';

export const api = axios.create({
  // En Vercel, el frontend y el backend comparten la misma URL
  // Al poner '/api', axios sabrá que debe buscar en el mismo servidor
  baseURL: '/api' 
});