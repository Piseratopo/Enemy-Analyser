import express from "express";
import * as userService from "./user.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

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

// Get current user info
router.get("/me", authMiddleware, async (req, res) => {
   try {
      const user = await userService.getUserById(req.user.userId);
      return res.status(200).json(user);
   } catch (error) {
      return res.status(404).json({ message: error.message });
   }
});

// Admin: Get all users
router.get("/all", authMiddleware, requireRole("admin"), async (req, res) => {
   try {
      const users = await userService.getAllUsers();
      return res.status(200).json(users);
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Admin: Get user by ID
router.get("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
   try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json(user);
   } catch (error) {
      return res.status(404).json({ message: error.message });
   }
});

// Admin: Update user
router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
   try {
      const user = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json(user);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

// Admin: Delete user
router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
   try {
      await userService.deleteUser(req.params.id);
      return res.status(200).json({ message: "Xóa người dùng thành công." });
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

export default router;