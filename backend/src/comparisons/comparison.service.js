import * as comparisonRepository from "./comparison.repository.js";

export const getComparisonsByUserId = async (userId) => {
   return await comparisonRepository.getAllByUserId(userId);
};

export const getComparisonById = async (id, userId) => {
   const comparison = await comparisonRepository.getById(id);
   if (!comparison || comparison.createdBy !== userId) {
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

export const updateComparison = async (id, data, userId) => {
   const comparison = await comparisonRepository.getById(id);
   if (!comparison || comparison.createdBy !== userId) {
      throw new Error("Không tìm thấy so sánh để cập nhật hoặc thiếu quyền truy cập.");
   }
   if (!data.title || !data.courseIds || data.courseIds.length === 0) {
      throw new Error("Tiêu đề và danh sách khóa học không được để trống.");
   }
   return await comparisonRepository.update(id, data);
};

export const deleteComparison = async (id, userId) => {
   const comparison = await comparisonRepository.getById(id);
   if (!comparison || comparison.createdBy !== userId) {
      throw new Error("Không tìm thấy so sánh để xóa hoặc thiếu quyền truy cập.");
   }
   return await comparisonRepository.deleteById(id);
};
