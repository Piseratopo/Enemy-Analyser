import express from "express";
import * as competitorService from "./competitor.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
   try {
      const data = await competitorService.getCompetitors();
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({ message: "Lỗi hệ thống khi tải danh sách đối thủ." });
   }
});

router.post("/resync", async (req, res) => {
   try {
      await competitorService.cleanAndReseed();
      return res.status(200).json({ message: "Đã xóa và nạp lại dữ liệu thành công." });
   } catch (error) {
      return res.status(500).json({ message: "Lỗi hệ thống khi đồng bộ lại dữ liệu." });
   }
});

export default router;