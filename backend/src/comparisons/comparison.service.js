import * as comparisonRepository from "./comparison.repository.js";

export const getComparisons = async (user) => {
   if (user && user.role === "admin") {
      return await comparisonRepository.getAll();
   }
   return await comparisonRepository.getAllByUserId(user?.userId);
};

export const getComparisonsByUserId = async (userId) => {
   return await comparisonRepository.getAllByUserId(userId);
};

export const getComparisonById = async (id, user) => {
   const comparison = await comparisonRepository.getById(id);
   if (!comparison) {
      throw new Error("Không tìm thấy so sánh.");
   }
   if (user && user.role !== "admin" && comparison.createdBy !== user.userId) {
      throw new Error("Không tìm thấy so sánh hoặc thiếu quyền truy cập.");
   }
   return comparison;
};

export const createComparison = async (data, userId) => {
   if (!data.title || !data.courseIds || data.courseIds.length === 0) {
      throw new Error("Tiêu đề và danh sách khóa học là bắt buộc.");
   }
   return await comparisonRepository.create(data, userId);
};

export const updateComparison = async (id, data, user) => {
   const comparison = await comparisonRepository.getById(id);
   if (!comparison) {
      throw new Error("Không tìm thấy so sánh để cập nhật.");
   }
   if (user && user.role !== "admin" && comparison.createdBy !== user.userId) {
      throw new Error("Thiếu quyền truy cập.");
   }
   if (!data.title || !data.courseIds || data.courseIds.length === 0) {
      throw new Error("Tiêu đề và danh sách khóa học không được để trống.");
   }
   return await comparisonRepository.update(id, data);
};

export const deleteComparison = async (id, user) => {
   const comparison = await comparisonRepository.getById(id);
   if (!comparison) {
      throw new Error("Không tìm thấy so sánh để xóa.");
   }
   if (user && user.role !== "admin" && comparison.createdBy !== user.userId) {
      throw new Error("Thiếu quyền truy cập.");
   }
   return await comparisonRepository.deleteById(id);
};
