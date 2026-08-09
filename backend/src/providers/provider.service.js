import * as providerRepository from "./provider.repository.js";

export const getAllProviders = async () => {
   return await providerRepository.getAll();
};

export const getProviderById = async (id) => {
   const provider = await providerRepository.getById(id);
   if (!provider) {
      throw new Error("Provider không tồn tại");
   }
   return provider;
};

export const createProvider = async (data, userId) => {
   if (!data.name) {
      throw new Error("Tên provider là bắt buộc");
   }
   return await providerRepository.create(data, userId);
};

export const updateProvider = async (id, data) => {
   const existing = await providerRepository.getById(id);
   if (!existing) {
      throw new Error("Provider không tồn tại");
   }
   return await providerRepository.update(id, data);
};

export const deleteProvider = async (id) => {
   const existing = await providerRepository.getById(id);
   if (!existing) {
      throw new Error("Provider không tồn tại");
   }
   return await providerRepository.deleteById(id);
};
