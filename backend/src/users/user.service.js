import admin from "firebase-admin";
import * as userRepository from "./user.repository.js";
import { db } from "../config/firebase.js";

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
            fullName: name || "",
            role: "staff"
         });
      } catch (dbErr) {
         console.warn("Cảnh báo: Không thể lưu thông tin vào Firestore:", dbErr.message);
      }

      return {
         id: userRecord.uid,
         email: userRecord.email,
         fullName: userRecord.displayName
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
      
      // Read user data from Firestore
      const userData = await userRepository.findById(data.localId);
      
      if (!userData) {
         throw new Error("Không tìm thấy thông tin người dùng trong hệ thống.");
      }

      if (!userData.isActive) {
         throw new Error("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
      }

      return {
         token: data.idToken,
         user: {
            id: data.localId,
            email: data.email,
            fullName: userData.fullName,
            role: userData.role,
            isActive: userData.isActive
         }
      };
   } catch (error) {
      throw new Error(`Đăng nhập Firebase thất bại: ${error.message}`);
   }
};

export const getUserById = async (uid) => {
   const user = await userRepository.findById(uid);
   if (!user) {
      throw new Error("Không tìm thấy người dùng.");
   }
   return user;
};

export const getAllUsers = async () => {
   const snapshot = await db.collection("users").get();
   const users = [];
   snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
   });
   return users;
};

export const updateUser = async (uid, data) => {
   const existing = await userRepository.findById(uid);
   if (!existing) {
      throw new Error("Không tìm thấy người dùng.");
   }
   
   const allowedFields = ['fullName', 'role', 'isActive'];
   const updateData = {};
   
   allowedFields.forEach(field => {
      if (data[field] !== undefined) {
         updateData[field] = data[field];
      }
   });

   return await userRepository.update(uid, updateData);
};

export const deleteUser = async (uid) => {
   const existing = await userRepository.findById(uid);
   if (!existing) {
      throw new Error("Không tìm thấy người dùng.");
   }

   // Delete from Firebase Auth
   await admin.auth().deleteUser(uid);
   
   // Delete from Firestore
   await db.collection("users").doc(uid).delete();
   
   return true;
};