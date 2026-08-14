import { db } from "../config/firebase.js";

const COLLECTION_NAME = "providers";

export const getAll = async () => {
   const [providersSnapshot, coursesSnapshot] = await Promise.all([
      db.collection(COLLECTION_NAME).get(),
      db.collection("courses").get()
   ]);

   const courseCountsMap = {};
   coursesSnapshot.forEach(doc => {
      const cData = doc.data();
      if (cData.providerId) {
         const pId = String(cData.providerId);
         courseCountsMap[pId] = (courseCountsMap[pId] || 0) + 1;
      }
      if (cData.provider) {
         const pName = String(cData.provider).trim().toLowerCase();
         courseCountsMap[pName] = (courseCountsMap[pName] || 0) + 1;
      }
   });

   const list = [];
   providersSnapshot.forEach(doc => {
      const data = doc.data();
      const countById = courseCountsMap[doc.id] || 0;
      const countByName = data.name ? (courseCountsMap[String(data.name).trim().toLowerCase()] || 0) : 0;
      const courseCount = Math.max(countById, countByName);
      list.push({ id: doc.id, ...data, courseCount });
   });
   return list;
};

export const getAllByUserId = async (userId) => {
   const [providersSnapshot, coursesSnapshot] = await Promise.all([
      db.collection(COLLECTION_NAME).where("createdBy", "==", userId).get(),
      db.collection("courses").where("createdBy", "==", userId).get()
   ]);

   const courseCountsMap = {};
   coursesSnapshot.forEach(doc => {
      const cData = doc.data();
      if (cData.providerId) {
         const pId = String(cData.providerId);
         courseCountsMap[pId] = (courseCountsMap[pId] || 0) + 1;
      }
      if (cData.provider) {
         const pName = String(cData.provider).trim().toLowerCase();
         courseCountsMap[pName] = (courseCountsMap[pName] || 0) + 1;
      }
   });

   const list = [];
   providersSnapshot.forEach(doc => {
      const data = doc.data();
      const countById = courseCountsMap[doc.id] || 0;
      const countByName = data.name ? (courseCountsMap[String(data.name).trim().toLowerCase()] || 0) : 0;
      const courseCount = Math.max(countById, countByName);
      list.push({ id: doc.id, ...data, courseCount });
   });
   return list;
};

export const getById = async (id) => {
   const doc = await db.collection(COLLECTION_NAME).doc(id).get();
   if (!doc.exists) return null;
   const data = doc.data();
   const coursesSnapshot = await db.collection("courses").get();
   let courseCount = 0;
   coursesSnapshot.forEach(cDoc => {
      const cData = cDoc.data();
      if (
         String(cData.providerId) === String(id) ||
         (cData.provider && String(cData.provider).trim().toLowerCase() === String(data.name).trim().toLowerCase())
      ) {
         courseCount++;
      }
   });
   return { id: doc.id, ...data, courseCount };
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
