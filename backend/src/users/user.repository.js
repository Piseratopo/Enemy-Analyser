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

export const create = async (userData) => {
   const docRef = await db.collection(COLLECTION_NAME).add({
      ...userData,
      createdAt: new Date().toISOString()
   });
   return { id: docRef.id, ...userData };
};