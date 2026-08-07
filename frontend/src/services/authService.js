import api from "../api/axios";

export const register = async (userData) => {
  const response = await api.post("/api/users/register", userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post("/api/users/login", userData);
  return response.data;
};