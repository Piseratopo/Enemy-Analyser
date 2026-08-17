import * as insightRepository from "./insight.repository.js";

export const getInsights = async (user) => {
   if (user && user.role === "admin") {
      return await insightRepository.getAll();
   }
   return await insightRepository.getAllByUserId(user?.userId);
};

export const getInsightsByUserId = async (userId) => {
   return await insightRepository.getAllByUserId(userId);
};

export const getInsightById = async (id, user) => {
   const insight = await insightRepository.getById(id);
   if (!insight) {
      throw new Error("Không tìm thấy thông tin insight.");
   }
   if (user && user.role !== "admin" && insight.createdBy !== user.userId) {
      throw new Error("Thiếu quyền truy cập thông tin insight.");
   }
   return insight;
};

export const createInsight = async (data, userId) => {
   validateInsightData(data);
   return await insightRepository.create(data, userId);
};

export const updateInsight = async (id, data, user) => {
   const insight = await insightRepository.getById(id);
   if (!insight) {
      throw new Error("Không tìm thấy thông tin insight để cập nhật.");
   }
   if (user && user.role !== "admin" && insight.createdBy !== user.userId) {
      throw new Error("Thiếu quyền truy cập.");
   }
   validateInsightData(data);
   return await insightRepository.update(id, data);
};

export const deleteInsight = async (id, user) => {
   const insight = await insightRepository.getById(id);
   if (!insight) {
      throw new Error("Không tìm thấy thông tin insight để xóa.");
   }
   if (user && user.role !== "admin" && insight.createdBy !== user.userId) {
      throw new Error("Thiếu quyền truy cập.");
   }
   return await insightRepository.deleteById(id);
};

const validateInsightData = (data) => {
   const { learnerGroup, userInsight, painPoint, learningNeed } = data;
   if (!learnerGroup || !userInsight || !painPoint || !learningNeed) {
      throw new Error("Thiếu thông tin phân tích learner insight bắt buộc.");
   }
};