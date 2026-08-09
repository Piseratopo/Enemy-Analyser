import { db } from "../config/firebase.js";

const COLLECTION_NAME = "providers";

export const getAll = async () => {
   const snapshot = await db.collection(COLLECTION_NAME).get();
   const list = [];
   snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
   });
   return list;
};

export const getById = async (id) => {
   const doc = await db.collection(COLLECTION_NAME).doc(id).get();
   if (!doc.exists) return null;
   return { id: doc.id, ...doc.data() };
};

export const create = async (data, userId) => {
   const docRef = await db.collection(COLLECTION_NAME).add({
      name: data.name,
      websiteUrl: data.websiteUrl || "",
      createdBy: userId,
      createdAt: new Date().toISOString()
   });
   return { id: docRef.id, ...data, createdBy: userId };
};

export const update = async (id, data) => {
   await db.collection(COLLECTION_NAME).doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
   });
   return { id, ...data };
};

export const deleteById = async (id) => {
   await db.collection(COLLECTION_NAME).doc(id).delete();
   return true;
};
