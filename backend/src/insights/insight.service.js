import * as insightRepository from "./insight.repository.js";
import * as courseRepository from "../courses/course.repository.js";
import * as competitorRepository from "../competitors/competitor.repository.js";

export const getInsightsByUserId = async (userId) => {
   return await insightRepository.getAllByUserId(userId);
};

export const getInsightById = async (id, userId) => {
   const insight = await insightRepository.getById(id, userId);
   if (!insight || insight.createdBy !== userId) {
      throw new Error("Không tìm thấy thông tin insight hoặc thiếu quyền truy cập.");
   }
   return insight;
};

export const createInsight = async (data, userId) => {
   validateInsightData(data);
   await verifyAssociation(data.associatedCourseType, data.associatedId, userId);
   return await insightRepository.create(data, userId);
};

export const updateInsight = async (id, data, userId) => {
   const insight = await insightRepository.getById(id);
   if (!insight || insight.createdBy !== userId) {
      throw new Error("Không tìm thấy thông tin insight hoặc thiếu quyền truy cập.");
   }
   validateInsightData(data);
   await verifyAssociation(data.associatedCourseType, data.associatedId, userId);
   return await insightRepository.update(id, data);
};

export const deleteInsight = async (id, userId) => {
   const insight = await insightRepository.getById(id);
   if (!insight || insight.createdBy !== userId) {
      throw new Error("Không tìm thấy thông tin insight để xóa.");
   }
   return await insightRepository.deleteById(id);
};

const validateInsightData = (data) => {
   const { audienceGroup, userInsight, painPoint, learningNeed } = data;
   if (!audienceGroup || !userInsight || !painPoint || !learningNeed) {
      throw new Error("Thiếu thông tin phân tích learner insight bắt buộc.");
   }
};

const verifyAssociation = async (type, id, userId) => {
   if (!type || type === "none") return;
   
   if (type === "my_course") {
      const myCourse = await courseRepository.getById(id);
      if (!myCourse || myCourse.createdBy !== userId) {
         throw new Error("Khóa học liên kết không tồn tại hoặc không thuộc sở hữu của bạn.");
      }
   } else if (type === "competitor") {
      const competitor = await competitorRepository.getById(id);
      if (!competitor || competitor.createdBy !== userId) {
         throw new Error("Khóa học đối thủ liên kết không tồn tại hoặc không thuộc sở hữu của bạn.");
      }
   } else {
      throw new Error("Loại liên kết (associatedCourseType) không hợp lệ.");
   }
};