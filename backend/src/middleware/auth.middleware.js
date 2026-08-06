import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const authMiddleware = (req, res, next) => {
   const authHeader = req.headers.authorization;
   
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực hoặc định dạng không hợp lệ." });
   }

   const token = authHeader.split(" ")[1];

   try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
   } catch (error) {
      return res.status(401).json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn." });
   }
};