import api from "../api/axios";

export const register = async (userData) => {
  try {
    const response = await api.post("/api/users/register", userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
    throw new Error(message);
  }
};

export const login = async (userData) => {
  try {
    const response = await api.post("/api/users/login", userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
    throw new Error(message);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/users/me");
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Xác thực không thành công.";
    throw new Error(message);
  }
};