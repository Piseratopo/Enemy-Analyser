import api from "../api/axios";

export const getAllComparisons = async () => {
  try {
    const response = await api.get("/api/comparisons");
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tải danh sách so sánh.";
    throw new Error(message);
  }
};

export const getComparisonById = async (id) => {
  try {
    const response = await api.get(`/api/comparisons/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tải chi tiết so sánh.";
    throw new Error(message);
  }
};

export const createComparison = async (data) => {
  try {
    const response = await api.post("/api/comparisons", data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lưu bảng so sánh.";
    throw new Error(message);
  }
};

export const updateComparison = async (id, data) => {
  try {
    const response = await api.put(`/api/comparisons/${id}`, data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể cập nhật bảng so sánh.";
    throw new Error(message);
  }
};

export const deleteComparison = async (id) => {
  try {
    const response = await api.delete(`/api/comparisons/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa bảng so sánh.";
    throw new Error(message);
  }
};

