import { db } from "../config/firebase.js";

const COLLECTION_NAME = "competitors";

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
      ...data,
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

// Hàm nạp dữ liệu mẫu khi khởi tạo được giữ nguyên cho mục đích demo ban đầu
export const seedSampleData = async () => {
   const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
   if (!snapshot.empty) {
      console.log("Cơ sở dữ liệu đã có sẵn dữ liệu mẫu.");
      return;
   }

   const sampleCompetitors = [
      { name: "Trung tâm A", course: "Lập trình React cơ bản", targetAudience: "Người mới bắt đầu", fee: 1500000, duration: "12 giờ", format: "Online", syllabusSummary: "HTML, CSS, JS cơ bản, React core, Hooks, State", strengths: "Bài giảng trực quan, chi phí rẻ", weaknesses: "Ít dự án thực hành lớn", sourceUrl: "https://site-a.com", createdBy: "system" }
   ];

   const batch = db.batch();
   sampleCompetitors.forEach((item) => {
      const docRef = db.collection(COLLECTION_NAME).doc();
      batch.set(docRef, item);
   });

   await batch.commit();
   console.log("Đã nạp thành công các bản ghi dữ liệu mẫu hệ thống.");
};