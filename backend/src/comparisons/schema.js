import { z } from "zod";

export const CompareSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe("Tên khóa học hoặc sản phẩm"),
      provider: z.string().describe("Đơn vị cung cấp / thương hiệu"),
      price: z.string().describe("Học phí hoặc giá cả"),
      duration: z.string().describe("Thời lượng học hoặc thời gian hoàn thành"),
      format: z.string().describe("Hình thức học (Online, Offline, Hybrid, v.v.)"),
      tech_stack: z.array(z.string()).describe("Công nghệ / công cụ được đề cập"),
      target: z.string().describe("Đối tượng phù hợp"),
      pros: z.array(z.string()).describe("Ưu điểm chính"),
      cons: z.array(z.string()).describe("Nhược điểm / Điểm cần lưu ý"),
    })
  ),
  verdict: z.string().describe("Lời khuyên tổng kết ngắn gọn nên chọn bên nào"),
});
