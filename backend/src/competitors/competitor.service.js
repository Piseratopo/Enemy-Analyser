import * as competitorRepository from "./competitor.repository.js";
import * as courseRepository from "../courses/course.repository.js";

export const getCompetitorsByUserId = async (userId) => {
   return await competitorRepository.getAllByUserId(userId);
};

export const getCompetitorById = async (id, userId) => {
   const competitor = await competitorRepository.getById(id);
   if (!competitor || competitor.createdBy !== userId) {
      throw new Error("Không tìm thấy thông tin đối thủ hoặc thiếu quyền truy cập.");
   }
   return competitor;
};

export const createCompetitor = async (data, userId) => {
   validateCompetitorData(data);
   
   const courseIds = data.associatedMyCourseIds || [];
   await verifyAssociatedCourseIds(courseIds, userId);

   const competitorData = {
      ...data,
      associatedMyCourseIds: courseIds
   };
   
   return await competitorRepository.create(competitorData, userId);
};

export const updateCompetitor = async (id, data, userId) => {
   const competitor = await competitorRepository.getById(id);
   if (!competitor || competitor.createdBy !== userId) {
      throw new Error("Không tìm thấy thông tin đối thủ hoặc thiếu quyền truy cập.");
   }
   
   validateCompetitorData(data);
   
   const courseIds = data.associatedMyCourseIds || [];
   await verifyAssociatedCourseIds(courseIds, userId);

   const competitorData = {
      ...data,
      associatedMyCourseIds: courseIds
   };

   return await competitorRepository.update(id, competitorData);
};

export const deleteCompetitor = async (id, userId) => {
   const competitor = await competitorRepository.getById(id);
   if (!competitor || competitor.createdBy !== userId) {
      throw new Error("Không tìm thấy thông tin đối thủ để xóa hoặc thiếu quyền truy cập.");
   }
   return await competitorRepository.deleteById(id);
};

const validateCompetitorData = (data) => {
   const { name, course, fee, duration, format } = data;
   if (!name || !course || fee === undefined || !duration || !format) {
      throw new Error("Thiếu thông tin bắt buộc của đối thủ.");
   }
};

const verifyAssociatedCourseIds = async (courseIds, userId) => {
   if (!Array.isArray(courseIds)) {
      throw new Error("Danh sách khóa học liên kết (associatedMyCourseIds) phải thuộc định dạng mảng.");
   }
   
   await Promise.all(
      courseIds.map(async (courseId) => {
         const myCourse = await courseRepository.getById(courseId);
         if (!myCourse || myCourse.createdBy !== userId) {
            throw new Error(`Khóa học liên kết với ID ${courseId} không tồn tại hoặc không thuộc quyền sở hữu của bạn.`);
         }
      })
   );
};