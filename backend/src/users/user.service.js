import * as userRepository from "./user.repository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const register = async ({ email, password, name }) => {
   const existingUser = await userRepository.findByEmail(email);
   if (existingUser) {
      throw new Error("Email đã tồn tại trên hệ thống.");
   }

   const salt = await bcrypt.genSalt(10);
   const passwordHash = await bcrypt.hash(password, salt);

   const newUser = await userRepository.create({
      email,
      passwordHash,
      name
   });

   return { id: newUser.id, email: newUser.email, name: newUser.name };
};

export const login = async ({ email, password }) => {
   const user = await userRepository.findByEmail(email);
   if (!user) {
      throw new Error("Email hoặc mật khẩu không hợp lệ.");
   }

   const isMatch = await bcrypt.compare(password, user.passwordHash);
   if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không hợp lệ.");
   }

   const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
   );

   return {
      token,
      user: { id: user.id, email: user.email, name: user.name }
   };
};