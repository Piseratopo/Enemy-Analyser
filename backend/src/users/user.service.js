import admin from "firebase-admin";
import * as userRepository from "./user.repository.js";

export const register = async ({ email, password, name }) => {
   try {
      const userRecord = await admin.auth().createUser({
         email,
         password,
         displayName: name
      });
      
      try {
         await userRepository.create({
            uid: userRecord.uid,
            email: userRecord.email,
            name: name || ""
         });
      } catch (dbErr) {
         console.warn("Cảnh báo: Không thể lưu thông tin vào Firestore:", dbErr.message);
      }

      return {
         id: userRecord.uid,
         email: userRecord.email,
         name: userRecord.displayName
      };
   } catch (error) {
      throw new Error(`Đăng ký Firebase thất bại: ${error.message}`);
   }
};

export const login = async ({ email, password }) => {
   const apiKey = process.env.FIREBASE_API_KEY;
   if (!apiKey) {
      throw new Error("Hệ thống thiếu cấu hình FIREBASE_API_KEY trong tệp .env.");
   }

   const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

   try {
      const response = await fetch(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, password, returnSecureToken: true })
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error?.message || "Đăng nhập thất bại.");
      }

      const data = await response.json();
      
      return {
         token: data.idToken, // ID Token này sẽ dùng làm Bearer Token cho các API khác
         user: {
            id: data.localId,
            email: data.email
         }
      };
   } catch (error) {
      throw new Error(`Đăng nhập Firebase thất bại: ${error.message}`);
   }
};