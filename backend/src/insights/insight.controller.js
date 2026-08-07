import express from "express";
import * as insightService from "./insight.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
   try {
      const data = await insightService.getInsightsByUserId(req.user.userId);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const data = await insightService.createInsight(req.body, req.user.userId);
      return res.status(201).json(data);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const data = await insightService.updateInsight(req.params.id, req.body, req.user.userId);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      await insightService.deleteInsight(req.params.id, req.user.userId);
      return res.status(200).json({ message: "Xóa learner insight thành công." });
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

export default router;