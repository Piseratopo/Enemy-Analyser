import * as providerRepository from "./provider.repository.js";

export const getProviders = async (user) => {
   if (user && user.role === "admin") {
      return await providerRepository.getAll();
   }
   return await providerRepository.getAllByUserId(user.userId);
 };

export const getAllProviders = async () => {
   return await providerRepository.getAll();
};

export const getProviderById = async (id, user) => {
   const provider = await providerRepository.getById(id);
   if (!provider) {
      throw new Error("Provider không tồn tại");
   }
   if (user && user.role !== "admin" && provider.createdBy !== user.userId) {
      throw new Error("Không có quyền truy cập đơn vị đào tạo này.");
   }
   return provider;
 };

export const createProvider = async (data, userId) => {
   if (!data.name) {
      throw new Error("Tên provider là bắt buộc");
   }
   return await providerRepository.create(data, userId);
};

export const updateProvider = async (id, data, user) => {
   const existing = await providerRepository.getById(id);
   if (!existing) {
      throw new Error("Provider không tồn tại");
   }
   if (user && user.role !== "admin" && existing.createdBy !== user.userId) {
      throw new Error("Không có quyền cập nhật đơn vị đào tạo này.");
   }
   return await providerRepository.update(id, data);
};

export const deleteProvider = async (id, user) => {
   const existing = await providerRepository.getById(id);
   if (!existing) {
      throw new Error("Provider không tồn tại");
   }
   if (user && user.role !== "admin" && existing.createdBy !== user.userId) {
      throw new Error("Không có quyền xóa đơn vị đào tạo này.");
   }
   return await providerRepository.deleteById(id);
};
