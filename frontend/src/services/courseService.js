import api from "../api/axios";

export const getAllCourses = async () => {
  try {
    const response = await api.get("/api/courses/public");
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tải danh sách khóa học.";
    throw new Error(message);
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tải thông tin khóa học.";
    throw new Error(message);
  }
};

export const createCourse = async (data) => {
  try {
    const response = await api.post("/api/courses", data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tạo khóa học mới.";
    throw new Error(message);
  }
};

export const updateCourse = async (id, data) => {
  try {
    const response = await api.put(`/api/courses/${id}`, data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể cập nhật khóa học.";
    throw new Error(message);
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa khóa học.";
    throw new Error(message);
  }
};
