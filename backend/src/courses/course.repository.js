import { db } from "../config/firebase.js";

const COLLECTION_NAME = "courses";

export const getAll = async () => {
   const snapshot = await db.collection(COLLECTION_NAME).get();
   const list = [];
   snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
   });
   return list;
};

export const getAllByUserId = async (userId) => {
   const snapshot = await db.collection(COLLECTION_NAME).where("createdBy", "==", userId).get();
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
      title: data.title,
      provider: data.provider || null,
      toolCombo: data.toolCombo || [],
      targetAudience: data.targetAudience || [],
      durationDisplay: data.durationDisplay || "",
      learningFormat: data.learningFormat || "Online",
      feeDisplay: data.feeDisplay || "",
      minFee: data.minFee || 0,
      maxFee: data.maxFee || 0,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      sourceUrl: data.sourceUrl || "",
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   });
   return { id: docRef.id, ...data, createdBy: userId };
};

export const update = async (id, data, userId) => {
   await db.collection(COLLECTION_NAME).doc(id).update({
      ...data,
      updatedBy: userId,
      updatedAt: new Date().toISOString()
   });
   return { id, ...data };
};

export const deleteById = async (id) => {
   await db.collection(COLLECTION_NAME).doc(id).delete();
   return true;
};