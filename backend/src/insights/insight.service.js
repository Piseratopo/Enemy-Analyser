import * as insightRepository from "./insight.repository.js";

export const getInsightsByUserId = async (userId) => {
   return await insightRepository.getAllByUserId(userId);
};

export const getInsightById = async (id, userId) => {
   const insight = await insightRepository.getById(id);
   if (!insight) {
      throw new Error("Không tìm thấy thông tin insight.");
   }
   return insight;
};

export const createInsight = async (data, userId) => {
   validateInsightData(data);
   return await insightRepository.create(data, userId);
};

export const updateInsight = async (id, data, userId) => {
   const insight = await insightRepository.getById(id);
   if (!insight || insight.createdBy !== userId) {
      throw new Error("Không tìm thấy thông tin insight hoặc thiếu quyền truy cập.");
   }
   validateInsightData(data);
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
   const { learnerGroup, userInsight, painPoint, learningNeed } = data;
   if (!learnerGroup || !userInsight || !painPoint || !learningNeed) {
      throw new Error("Thiếu thông tin phân tích learner insight bắt buộc.");
   }
};