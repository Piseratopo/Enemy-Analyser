import admin from "firebase-admin";

export const authMiddleware = async (req, res, next) => {
   const authHeader = req.headers.authorization;
   
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực hoặc định dạng không hợp lệ." });
   }

   const token = authHeader.split(" ")[1];

   try {
      // Xác minh ID Token bằng Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      req.user = {
         userId: decodedToken.uid,
         email: decodedToken.email
      };
      
      next();
   } catch (error) {
      return res.status(401).json({ message: "Mã xác thực Firebase không hợp lệ hoặc đã hết hạn." });
   }
};