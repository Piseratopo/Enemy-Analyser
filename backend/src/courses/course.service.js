import * as courseRepository from "./course.repository.js";

export const getCourses = async (user, query = {}) => {
   if (user && user.role === "admin") {
      return await courseRepository.getAll(query);
   }
   return await courseRepository.getAllByUserId(user.userId, query);
};

export const getAllCourses = async (query = {}) => {
   return await courseRepository.getAll(query);
};

export const getCoursesByUserId = async (userId, query = {}) => {
   return await courseRepository.getAllByUserId(userId, query);
};

export const getCourseById = async (id, user) => {
   const course = await courseRepository.getById(id);
   if (!course) {
      throw new Error("Không tìm thấy khóa học.");
   }
   if (user && user.role !== "admin" && course.createdBy !== user.userId) {
      throw new Error("Không có quyền truy cập khóa học này.");
   }
   return course;
};

export const createCourse = async (data, userId) => {
   if (!data.title) {
      throw new Error("Tiêu đề khóa học là bắt buộc.");
   }
   return await courseRepository.create(data, userId);
};

export const updateCourse = async (id, data, user) => {
   const course = await courseRepository.getById(id);
   if (!course) {
      throw new Error("Không tìm thấy khóa học để cập nhật.");
   }
   if (user && user.role !== "admin" && course.createdBy !== user.userId) {
      throw new Error("Không có quyền cập nhật khóa học này.");
   }
   if (!data.title) {
      throw new Error("Tiêu đề khóa học không được để trống.");
   }
   return await courseRepository.update(id, data, user.userId);
};

export const deleteCourse = async (id, user) => {
   const course = await courseRepository.getById(id);
   if (!course) {
      throw new Error("Không tìm thấy khóa học để xóa.");
   }
   if (user && user.role !== "admin" && course.createdBy !== user.userId) {
      throw new Error("Không có quyền xóa khóa học này.");
   }
   return await courseRepository.deleteById(id);
};