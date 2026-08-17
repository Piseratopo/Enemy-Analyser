import { db } from "../config/firebase.js";

const COLLECTION_NAME = "learner_insights";

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
      learnerGroup: data.learnerGroup || "",
      userInsight: data.userInsight || "",
      painPoint: data.painPoint || "",
      learningNeed: data.learningNeed || "",
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   });
   return { id: docRef.id, ...data, createdBy: userId };
};

export const update = async (id, data) => {
   await db.collection(COLLECTION_NAME).doc(id).update({
      learnerGroup: data.learnerGroup,
      userInsight: data.userInsight,
      painPoint: data.painPoint,
      learningNeed: data.learningNeed,
      updatedAt: new Date().toISOString()
   });
   return { id, ...data };
};

export const deleteById = async (id) => {
   await db.collection(COLLECTION_NAME).doc(id).delete();
   return true;
};