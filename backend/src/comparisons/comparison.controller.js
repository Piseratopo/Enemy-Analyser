import express from "express";
import * as comparisonService from "./comparison.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireStaff } from "../middleware/role.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
   try {
      const data = await comparisonService.getComparisons(req.user);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const data = await comparisonService.getComparisonById(req.params.id, req.user);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(404).json({ message: error.message });
   }
});

router.post("/", requireStaff, async (req, res) => {
   try {
      const data = await comparisonService.createComparison(req.body, req.user.userId);
      return res.status(201).json(data);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.put("/:id", requireStaff, async (req, res) => {
   try {
      const data = await comparisonService.updateComparison(req.params.id, req.body, req.user);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.delete("/:id", requireStaff, async (req, res) => {
   try {
      await comparisonService.deleteComparison(req.params.id, req.user);
      return res.status(200).json({ message: "Xóa so sánh thành công." });
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

export default router;
