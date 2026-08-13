import { z } from "zod";

export const CompareSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().optional().describe("Tên khóa học hoặc sản phẩm"),
      provider: z.string().optional().describe("Đơn vị cung cấp / thương hiệu"),
      price: z.string().optional().describe("Học phí hoặc giá cả"),
      duration: z.string().optional().describe("Thời lượng học hoặc thời gian hoàn thành"),
      format: z.string().optional().describe("Hình thức học (Online, Offline, Hybrid, v.v.)"),
      tech_stack: z.array(z.string()).optional().describe("Công nghệ / công cụ được đề cập"),
      target: z.string().optional().describe("Đối tượng phù hợp"),
      pros: z.array(z.string()).optional().describe("Ưu điểm chính"),
      cons: z.array(z.string()).optional().describe("Nhược điểm / Điểm cần lưu ý"),
    })
  ).optional(),
  verdict: z.string().optional().describe("Lời khuyên tổng kết giúp người học chọn khóa học phù hợp nhất"),
});

