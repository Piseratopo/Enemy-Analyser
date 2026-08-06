import express from "express";
import * as userService from "./user.service.js";

const router = express.Router();

router.post("/register", async (req, res) => {
   try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
         return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
      }
      const result = await userService.register({ email, password, name });
      return res.status(201).json(result);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.post("/login", async (req, res) => {
   try {
      const { email, password } = req.body;
      if (!email || !password) {
         return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mật khẩu." });
      }
      const result = await userService.login({ email, password });
      return res.status(200).json(result);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

export default router;