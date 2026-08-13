import express from "express";
import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { CompareSchema } from "./schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { itemA, itemB, prompt: customPrompt } = req.body || {};

    if (!itemA && !itemB && !customPrompt) {
      return res.status(400).json({
        message: "Vui lòng cung cấp itemA và itemB hoặc prompt để so sánh."
      });
    }

    const itemAStr = itemA || "Đối tượng A";
    const itemBStr = itemB || "Đối tượng B";

    const promptText = customPrompt || 
      `So sánh chi tiết 2 đối tượng sau: "${itemAStr}" và "${itemBStr}". Trả về dữ liệu chuẩn theo schema bằng tiếng Việt. So sánh khách quan, đưa ra ưu nhược điểm rõ ràng và lời khuyên tổng kết (verdict).`;

    // Sử dụng model Gemini 3.6 Flash
    const result = streamObject({
      model: google("gemini-3.6-flash"),
      schema: CompareSchema,
      prompt: promptText,
    });

    return result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Lỗi khi kết nối AI streamObject:", error);
    return res.status(500).json({ 
      error: "AI_COMPARE_ERROR",
      message: error.message || "Lỗi xử lý kết nối Gemini AI API."
    });
  }
});

export default router;
