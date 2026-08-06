import * as competitorRepository from "./competitor.repository.js";

export const getCompetitorsByUserId = async (userId) => {
   return await competitorRepository.getAllByUserId(userId);
};

export const getCompetitorById = async (id, userId) => {
   const competitor = await competitorRepository.getById(id);
   if (!competitor) {
      throw new Error("Không tìm thấy thông tin đối thủ yêu cầu.");
   }
   if (competitor.createdBy !== userId) {
      throw new Error("Bạn không có quyền truy cập thông tin đối thủ này.");
   }
   return competitor;
};

export const createCompetitor = async (data, userId) => {
   validateCompetitorData(data);
   return await competitorRepository.create(data, userId);
};

export const updateCompetitor = async (id, data, userId) => {
   const competitor = await competitorRepository.getById(id);
   if (!competitor) {
      throw new Error("Không tìm thấy thông tin đối thủ để thực hiện cập nhật.");
   }
   if (competitor.createdBy !== userId) {
      throw new Error("Bạn không có quyền chỉnh sửa thông tin đối thủ này.");
   }
   validateCompetitorData(data);
   return await competitorRepository.update(id, data);
};

export const deleteCompetitor = async (id, userId) => {
   const competitor = await competitorRepository.getById(id);
   if (!competitor) {
      throw new Error("Không tìm thấy thông tin đối thủ để thực hiện xóa.");
   }
   if (competitor.createdBy !== userId) {
      throw new Error("Bạn không có quyền xóa thông tin đối thủ này.");
   }
   return await competitorRepository.deleteById(id);
};

const validateCompetitorData = (data) => {
   const { name, course, fee, duration, format } = data;
   if (!name || !course || fee === undefined || !duration || !format) {
      throw new Error("Thiếu trường dữ liệu bắt buộc (name, course, fee, duration, format).");
   }
   if (typeof fee !== "number" || fee < 0) {
      throw new Error("Học phí (fee) phải có giá trị số và lớn hơn hoặc bằng 0.");
   }
};