import express from "express";
import * as competitorService from "./competitor.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// 1. Lấy danh sách đối thủ (Chỉ hiện các đối thủ do user hiện tại thêm)
router.get("/", async (req, res) => {
   try {
      const userId = req.user.userId;
      const data = await competitorService.getCompetitorsByUserId(userId);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách." });
   }
});

// 2. Xem chi tiết một đối thủ (Chỉ xem được nếu là người sở hữu)
router.get("/:id", async (req, res) => {
   try {
      const userId = req.user.userId;
      const data = await competitorService.getCompetitorById(req.params.id, userId);
      return res.status(200).json(data);
   } catch (error) {
      const status = error.message.includes("quyền") ? 403 : 404;
      return res.status(status).json({ message: error.message });
   }
});

// 3. Tạo mới một bản ghi đối thủ (POST)
router.post("/", async (req, res) => {
   try {
      const userId = req.user.userId;
      const data = await competitorService.createCompetitor(req.body, userId);
      return res.status(201).json(data);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

// 4. Cập nhật một bản ghi đối thủ (PUT)
router.put("/:id", async (req, res) => {
   try {
      const userId = req.user.userId;
      const data = await competitorService.updateCompetitor(req.params.id, req.body, userId);
      return res.status(200).json(data);
   } catch (error) {
      const status = error.message.includes("quyền") ? 403 : 400;
      return res.status(status).json({ message: error.message });
   }
});

// 5. Xóa bản ghi đối thủ (DELETE)
router.delete("/:id", async (req, res) => {
   try {
      const userId = req.user.userId;
      await competitorService.deleteCompetitor(req.params.id, userId);
      return res.status(200).json({ message: "Đã xóa bản ghi đối thủ thành công." });
   } catch (error) {
      const status = error.message.includes("quyền") ? 403 : 400;
      return res.status(status).json({ message: error.message });
   }
});

export default router;