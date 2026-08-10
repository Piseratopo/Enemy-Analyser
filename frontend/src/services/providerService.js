import api from "../api/axios";

export const getAllProviders = async () => {
  try {
    const response = await api.get("/api/providers");
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tải danh sách đơn vị đào tạo.";
    throw new Error(message);
  }
};

export const getProviderById = async (id) => {
  try {
    const response = await api.get(`/api/providers/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tải thông tin đơn vị đào tạo.";
    throw new Error(message);
  }
};

export const createProvider = async (data) => {
  try {
    const response = await api.post("/api/providers", data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tạo đơn vị đào tạo mới.";
    throw new Error(message);
  }
};

export const updateProvider = async (id, data) => {
  try {
    const response = await api.put(`/api/providers/${id}`, data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể cập nhật đơn vị đào tạo.";
    throw new Error(message);
  }
};

export const deleteProvider = async (id) => {
  try {
    const response = await api.delete(`/api/providers/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa đơn vị đào tạo.";
    throw new Error(message);
  }
};
