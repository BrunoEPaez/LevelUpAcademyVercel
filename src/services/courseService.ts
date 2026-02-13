import axios from 'axios';

const API_URL = 'https://levelupacademyterminado.onrender.com'; // La dirección de tu servidor

export const getCourses = async () => {
  const response = await axios.get(`${API_URL}/courses`);
  return response.data;
};