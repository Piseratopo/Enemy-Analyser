import admin from "firebase-admin";
import * as userRepository from "../users/user.repository.js";

export const authMiddleware = async (req, res, next) => {
   const authHeader = req.headers.authorization;
   
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực hoặc định dạng không hợp lệ." });
   }

   const token = authHeader.split(" ")[1];

   try {
      // Xác minh ID Token bằng Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get user data from Firestore to check isActive and role
      const user = await userRepository.findById(decodedToken.uid);
      
      if (!user) {
         return res.status(404).json({ message: "Không tìm thấy thông tin người dùng trong hệ thống." });
      }

      if (!user.isActive) {
         return res.status(403).json({ message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." });
      }
      
      req.user = {
         userId: decodedToken.uid,
         email: decodedToken.email,
         role: user.role,
         fullName: user.fullName
      };
      
      next();
   } catch (error) {
      return res.status(401).json({ message: "Mã xác thực Firebase không hợp lệ hoặc đã hết hạn." });
   }
};