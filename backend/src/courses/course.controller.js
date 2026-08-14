import express from "express";
import * as courseService from "./course.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireStaff } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/public", async (req, res) => {
   try {
      const data = await courseService.getAllCourses(req.query);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

router.use(authMiddleware);

router.get("/", async (req, res) => {
   try {
      const data = await courseService.getCourses(req.user, req.query);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const data = await courseService.getCourseById(req.params.id, req.user);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(404).json({ message: error.message });
   }
});

router.post("/", requireStaff, async (req, res) => {
   try {
      const data = await courseService.createCourse(req.body, req.user.userId);
      return res.status(201).json(data);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.put("/:id", requireStaff, async (req, res) => {
   try {
      const data = await courseService.updateCourse(req.params.id, req.body, req.user);
      return res.status(200).json(data);
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

router.delete("/:id", requireStaff, async (req, res) => {
   try {
      await courseService.deleteCourse(req.params.id, req.user);
      return res.status(200).json({ message: "Xóa khóa học thành công." });
   } catch (error) {
      return res.status(400).json({ message: error.message });
   }
});

export default router;