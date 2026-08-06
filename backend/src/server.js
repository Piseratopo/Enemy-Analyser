import "dotenv/config";
import app from "./app.js";
import * as competitorRepository from "./competitors/competitor.repository.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
   try {
      await competitorRepository.seedSampleData();
      
      app.listen(PORT, () => {
         console.log(`Server đang vận hành tại cổng: http://localhost:${PORT}`);
      });
   } catch (error) {
      console.error("Không thể khởi động server do lỗi kết nối:", error);
      process.exit(1);
   }
};

startServer();