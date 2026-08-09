import express from "express";
import * as providerService from "./provider.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireStaff } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
   try {
      const providers = await providerService.getAllProviders();
      return res.status(200).json(providers);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const provider = await providerService.getProviderById(req.params.id);
      return res.status(200).json(provider);
   } catch (error) {
      return res.status(404).json({ message: error.message });
   }
});

router.post("/", authMiddleware, requireStaff, async (req, res) => {
   try {
      const { name, websiteUrl } = req.body;
      const userId = req.user.userId;
      const result = await providerService.createProvider({ name, websiteUrl }, userId);
      return res.status(201).json(result);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.put("/:id", authMiddleware, requireStaff, async (req, res) => {
   try {
      const result = await providerService.updateProvider(req.params.id, req.body);
      return res.status(200).json(result);
   } catch (error) {
      return res.status(404).json({ message: error.message });
   }
});

router.delete("/:id", authMiddleware, requireStaff, async (req, res) => {
   try {
      await providerService.deleteProvider(req.params.id);
      return res.status(200).json({ message: "Xóa provider thành công" });
   } catch (error) {
      return res.status(404).json({ message: error.message });
   }
});

export default router;
