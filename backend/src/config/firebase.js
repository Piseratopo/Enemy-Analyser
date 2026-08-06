import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../../serviceAccountKey.json");

try {
   admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
   });
   console.log("Kết nối Firebase Admin SDK thành công.");
} catch (error) {
   console.error("Lỗi khi khởi tạo Firebase Admin SDK:", error.message);
}

export const db = admin.firestore();