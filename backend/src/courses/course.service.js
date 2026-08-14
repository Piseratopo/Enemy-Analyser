import * as courseRepository from "./course.repository.js";

export const getAllCourses = async (query = {}) => {
   return await courseRepository.getAll(query);
};

export const getCoursesByUserId = async (userId, query = {}) => {
   return await courseRepository.getAllByUserId(userId, query);
};

export const getCourseById = async (id, userId) => {
   const course = await courseRepository.getById(id);
   if (!course) {
      throw new Error("Không tìm thấy khóa học.");
   }
   return course;
};

export const createCourse = async (data, userId) => {
   if (!data.title) {
      throw new Error("Tiêu đề khóa học là bắt buộc.");
   }
   return await courseRepository.create(data, userId);
};

export const updateCourse = async (id, data, userId) => {
   const course = await courseRepository.getById(id);
   if (!course) {
      throw new Error("Không tìm thấy khóa học để cập nhật.");
   }
   if (!data.title) {
      throw new Error("Tiêu đề khóa học không được để trống.");
   }
   return await courseRepository.update(id, data, userId);
};

export const deleteCourse = async (id, userId) => {
   const course = await courseRepository.getById(id);
   if (!course) {
      throw new Error("Không tìm thấy khóa học để xóa.");
   }
   return await courseRepository.deleteById(id);
};