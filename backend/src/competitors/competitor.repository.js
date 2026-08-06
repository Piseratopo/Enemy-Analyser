import { db } from "../config/firebase.js";

const COLLECTION_NAME = "competitors";

export const getAll = async () => {
   const snapshot = await db.collection(COLLECTION_NAME).get();
   const list = [];
   snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
   });
   return list;
};

export const cleanDatabase = async () => {
   const snapshot = await db.collection(COLLECTION_NAME).get();
   const batch = db.batch();
   snapshot.forEach(doc => {
      batch.delete(doc.ref);
   });
   await batch.commit();
   console.log("Đã xóa toàn bộ dữ liệu trong collection competitors.");
};

export const seedSampleData = async () => {
   const sampleCompetitors = [
      { name: "Trung tâm A", course: "Lập trình React cơ bản", targetAudience: "Người mới bắt đầu", fee: 1500000, duration: "12 giờ", format: "Online", syllabusSummary: "HTML, CSS, JS cơ bản, React core, Hooks, State", strengths: "Bài giảng trực quan, chi phí rẻ", weaknesses: "Ít dự án thực hành lớn", sourceUrl: "https://site-a.com", comboTool: "React, VS Code", salesStrength: "Cao" },
      { name: "Học viện B", course: "Fullstack Web Developer", targetAudience: "Sinh viên ngành CNTT", fee: 8500000, duration: "48 giờ", format: "Blended", syllabusSummary: "ReactJS, Node.js, Express, MongoDB, Deployment", strengths: "Hỗ trợ 1-1 tốt, bài tập thực tế nhiều", weaknesses: "Học phí cao hơn mặt bằng chung", sourceUrl: "https://site-b.com", comboTool: "React, Node.js, MongoDB", salesStrength: "Rất cao" },
      { name: "Học viện B", course: "React Native Mobile Dev", targetAudience: "Đã biết React cơ bản", fee: 4000000, duration: "20 giờ", format: "Online", syllabusSummary: "React Native Core, Navigation, State Management, Deploy App Store", strengths: "Giảng viên có nhiều năm kinh nghiệm", weaknesses: "Tốc độ giảng bài khá nhanh", sourceUrl: "https://site-b.com/mobile", comboTool: "React Native, Expo", salesStrength: "Trung bình" },
      { name: "Trung tâm C", course: "Lập trình Node.js Backend", targetAudience: "Người muốn học Backend", fee: 2800000, duration: "18 giờ", format: "Offline", strengths: "Phòng học cơ sở vật chất đầy đủ", weaknesses: "Vị trí địa lý không thuận tiện cho học viên ngoại tỉnh", syllabusSummary: "Express, RESTful API, Postgres, Security", sourceUrl: "https://site-c.com", comboTool: "Node.js, Express, PostgreSQL", salesStrength: "Trung bình" },
      { name: "Nền tảng D", course: "Javascript nâng cao", targetAudience: "Lập trình viên muốn nâng cao trình độ", fee: 800000, duration: "8 giờ", format: "Online", syllabusSummary: "Async/Await, Prototype, Event Loop, Memory Management", strengths: "Học phí rất rẻ, truy cập trọn đời", weaknesses: "Không có giảng viên hỗ trợ trực tiếp", sourceUrl: "https://site-d.com", comboTool: "VS Code, Chrome DevTools", salesStrength: "Rất cao" },
      { name: "Học viện E", course: "UI/UX Product Design", targetAudience: "Designer, Developer", fee: 5200000, duration: "24 giờ", format: "Offline", syllabusSummary: "Figma, User Research, Wireframe, Prototyping", strengths: "Cơ hội việc làm cao sau khóa học", weaknesses: "Yêu cầu tự học nhiều ở nhà", sourceUrl: "https://site-e.com", comboTool: "Figma, Adobe XD", salesStrength: "Cao" },
      { name: "Trung tâm F", course: "Phân tích dữ liệu với Python", targetAudience: "Người làm tài chính, kinh tế", fee: 4500000, duration: "20 giờ", format: "Online", syllabusSummary: "Pandas, NumPy, Matplotlib, Data Visualization", strengths: "Lộ trình rõ ràng, thực tiễn", weaknesses: "Không đi sâu vào Machine Learning", sourceUrl: "https://site-f.com", comboTool: "Python, Jupyter Notebook", salesStrength: "Cao" },
      { name: "Học viện G", course: "Next.js & Server Components", targetAudience: "Lập trình viên Frontend", fee: 2200000, duration: "10 giờ", format: "Online", syllabusSummary: "Next.js App Router, SSR, SSG, Deployment", strengths: "Cập nhật công nghệ mới nhất", weaknesses: "Nội dung ngắn, chỉ tóm tắt cốt lõi", sourceUrl: "https://site-g.com", comboTool: "Next.js, Vercel", salesStrength: "Trung bình" }
   ];

   const batch = db.batch();
   sampleCompetitors.forEach((item) => {
      const docRef = db.collection(COLLECTION_NAME).doc();
      batch.set(docRef, item);
   });

   await batch.commit();
   console.log("Đã nạp thành công các bản ghi dữ liệu mẫu vào Firestore.");
};