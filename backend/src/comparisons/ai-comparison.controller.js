import express from "express";
import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { CompareSchema } from "./schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { items, prompt: customPrompt } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Vui lòng cung cấp danh sách items (mảng khóa học) để so sánh."
      });
    }

    if (items.length < 2) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ít nhất 2 khóa học để so sánh."
      });
    }

    // Build a detailed description of each item so the AI doesn't hallucinate
    const itemsDetail = items.map((item, idx) => {
      const name = item.name || item.courseName || `Khoa hoc ${idx + 1}`;
      const provider = item.provider || "Chua ro";
      const price = item.price || item.feeDisplay || "Lien he";
      const duration = item.duration || item.durationDisplay || "Chua ro";
      const format = item.format || item.learningFormat || "Chua ro";
      const tools = Array.isArray(item.tools || item.toolCombo)
        ? (item.tools || item.toolCombo).join(", ")
        : "Chua ro";
      const target = Array.isArray(item.targetAudience)
        ? item.targetAudience.join("; ")
        : (item.target || item.targetAudience || "Chua ro");
      const strengths = Array.isArray(item.strengths)
        ? item.strengths.join("; ")
        : "";
      const weaknesses = Array.isArray(item.weaknesses)
        ? item.weaknesses.join("; ")
        : "";

      return `--- KHOA HOC ${idx + 1} ---
Ten khoa hoc: ${name}
Don vi dao tao: ${provider}
Hoc phi: ${price}
Thoi luong: ${duration}
Hinh thuc hoc: ${format}
Cong cu / cong nghe: ${tools}
Doi tuong muc tieu: ${target}
Uu diem (da biet): ${strengths || "Chua co du lieu"}
Nhuoc diem (da biet): ${weaknesses || "Chua co du lieu"}`;
    }).join("\n\n");

    const promptText = customPrompt ||
      `Ban la mot chuyen gia phan tich thi truong dao tao AI tai Viet Nam.
Duoi day la thong tin chi tiet cua ${items.length} khoa hoc can so sanh:

${itemsDetail}

Nhiem vu: Phan tich so sanh CHINH XAC CA ${items.length} KHOA HOC tren theo schema yeu cau. 
QUAN TRONG: Ket qua tra ve phai co DUNG ${items.length} phan tu trong mang "items", moi phan tu tuong ung dung thu tu voi ${items.length} khoa hoc da liet ke (khoa hoc 1 la items[0], khoa hoc 2 la items[1], ...).
Hay dua ra nhan xet bo sung them neu biet, giu nguyen thong tin da co san, va viet verdict so sanh giup nguoi hoc chon khoa hoc phu hop nhat. Tra ve bang tieng Viet.`;

    // Su dung model Gemini 3.6 Flash
    const result = streamObject({
      model: google("gemini-3.6-flash"),
      schema: CompareSchema,
      prompt: promptText,
    });

    return result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Loi khi ket noi AI streamObject:", error);
    return res.status(500).json({
      error: "AI_COMPARE_ERROR",
      message: error.message || "Loi xu ly ket noi Gemini AI API."
    });
  }
});

export default router;

