import * as courseRepository from "./course.repository.js";

export const getCoursesByUserId = async (userId) => {
   return await courseRepository.getAllByUserId(userId);
};

export const getCourseById = async (id, userId) => {
   const course = await courseRepository.getById(id);
   if (!course || course.createdBy !== userId) {
      throw new Error("Không tìm thấy khóa học hoặc thiếu quyền truy cập.");
   }
   return course;
};

export const createCourse = async (data, userId) => {
   if (!data.name) {
      throw new Error("Tên khóa học là bắt buộc.");
   }
   return await courseRepository.create(data, userId);
};

export const updateCourse = async (id, data, userId) => {
   const course = await courseRepository.getById(id);
   if (!course || course.createdBy !== userId) {
      throw new Error("Không tìm thấy khóa học để cập nhật hoặc thiếu quyền truy cập.");
   }
   if (!data.name) {
      throw new Error("Tên khóa học không được để trống.");
   }
   return await courseRepository.update(id, data);
};

export const deleteCourse = async (id, userId) => {
   const course = await courseRepository.getById(id);
   if (!course || course.createdBy !== userId) {
      throw new Error("Không tìm thấy khóa học để xóa hoặc thiếu quyền truy cập.");
   }
   return await courseRepository.deleteById(id);
};