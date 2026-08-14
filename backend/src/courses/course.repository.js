import { db } from "../config/firebase.js";

const COLLECTION_NAME = "courses";

export const getAll = async (options = {}) => {
   const snapshot = await db.collection(COLLECTION_NAME).get();
   let list = [];
   snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
   });

   list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

   const { page, limit, search, format, provider } = options;

   if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => {
         const titleMatch = c.title && c.title.toLowerCase().includes(s);
         const providerStr = typeof c.provider === "object" ? c.provider?.name : c.provider;
         const providerMatch = providerStr && providerStr.toLowerCase().includes(s);
         const tools = Array.isArray(c.toolCombo) ? c.toolCombo : (typeof c.toolCombo === "string" ? [c.toolCombo] : []);
         const toolMatch = tools.some(t => t.toLowerCase().includes(s));
         return titleMatch || providerMatch || toolMatch;
      });
   }

   if (format) {
      list = list.filter(c => (c.learningFormat || "").toLowerCase() === format.toLowerCase());
   }

   if (provider) {
      list = list.filter(c => {
         const pName = typeof c.provider === "object" ? c.provider?.name : c.provider;
         return pName === provider;
      });
   }

   const totalItems = list.length;

   if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);
      const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

      return {
         data: paginatedList,
         pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
         }
      };
   }

   return list;
};

export const getAllByUserId = async (userId, options = {}) => {
   const snapshot = await db.collection(COLLECTION_NAME).where("createdBy", "==", userId).get();
   let list = [];
   snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
   });

   list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

   const { page, limit, search, format, provider } = options;

   if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => {
         const titleMatch = c.title && c.title.toLowerCase().includes(s);
         const providerStr = typeof c.provider === "object" ? c.provider?.name : c.provider;
         const providerMatch = providerStr && providerStr.toLowerCase().includes(s);
         const tools = Array.isArray(c.toolCombo) ? c.toolCombo : (typeof c.toolCombo === "string" ? [c.toolCombo] : []);
         const toolMatch = tools.some(t => t.toLowerCase().includes(s));
         return titleMatch || providerMatch || toolMatch;
      });
   }

   if (format) {
      list = list.filter(c => (c.learningFormat || "").toLowerCase() === format.toLowerCase());
   }

   if (provider) {
      list = list.filter(c => {
         const pName = typeof c.provider === "object" ? c.provider?.name : c.provider;
         return pName === provider;
      });
   }

   const totalItems = list.length;

   if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);
      const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

      return {
         data: paginatedList,
         pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
         }
      };
   }

   return list;
};

export const getById = async (id) => {
   const doc = await db.collection(COLLECTION_NAME).doc(id).get();
   if (!doc.exists) return null;
   return { id: doc.id, ...doc.data() };
};

export const create = async (data, userId) => {
   const docRef = await db.collection(COLLECTION_NAME).add({
      title: data.title,
      provider: data.provider || null,
      providerId: data.providerId || null,
      toolCombo: data.toolCombo || [],
      targetAudience: data.targetAudience || [],
      durationDisplay: data.durationDisplay || "",
      learningFormat: data.learningFormat || "Online",
      feeDisplay: data.feeDisplay || "",
      minFee: data.minFee || 0,
      maxFee: data.maxFee || 0,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      insights: data.insights || [],
      salesVolume: data.salesVolume || "",
      sourceUrl: data.sourceUrl || "",
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   });
   return { id: docRef.id, ...data, createdBy: userId, updatedBy: userId };
};

export const update = async (id, data, userId) => {
   const updateData = {
      ...data,
      updatedBy: userId,
      updatedAt: new Date().toISOString()
   };
   await db.collection(COLLECTION_NAME).doc(id).update(updateData);
   return { id, ...data };
};

export const deleteById = async (id) => {
   await db.collection(COLLECTION_NAME).doc(id).delete();
   return true;
};