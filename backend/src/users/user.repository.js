import { db } from "../config/firebase.js";

const COLLECTION_NAME = "users";

export const findByEmail = async (email) => {
   const snapshot = await db.collection(COLLECTION_NAME).where("email", "==", email).get();
   if (snapshot.empty) return null;
   
   let user = null;
   snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
   });
   return user;
};

export const findById = async (uid) => {
   const doc = await db.collection(COLLECTION_NAME).doc(uid).get();
   if (!doc.exists) return null;
   return { id: doc.id, ...doc.data() };
};

export const create = async (userData) => {
   const { uid, ...data } = userData;
   const docRef = db.collection(COLLECTION_NAME).doc(uid);
   await docRef.set({
      email: data.email,
      fullName: data.fullName || data.name || "",
      role: data.role || "staff",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   });
   return { id: uid, ...data };
};

export const update = async (uid, data) => {
   const docRef = db.collection(COLLECTION_NAME).doc(uid);
   await docRef.update({
      ...data,
      updatedAt: new Date().toISOString()
   });
   return { id: uid, ...data };
};