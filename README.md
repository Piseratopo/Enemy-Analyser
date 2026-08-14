# 📊 Enemy Analyser - AI Course Market & Competitor Analysis

**Enemy Analyser** là hệ thống phân tích thị trường và đối thủ cạnh tranh chuyên sâu dành cho các khóa học đào tạo AI tại Việt Nam. Nền tảng hỗ trợ tạo bảng đối sánh đa chiều, phân tích điểm mạnh - điểm yếu và đưa ra nhận định chiến lược.

---

## 🚀 Tính năng nổi bật

- 📈 **Bảng điều khiển Tổng quan (Dashboard):** Thống kê tổng quan về số lượng khóa học, đơn vị đào tạo, mức học phí trung bình và phân bố thị trường.
- 📚 **Quản lý Khóa học (Course Management):** Tra cứu, tìm kiếm, lọc đa tiêu chí (theo đơn vị, mức giá, hình thức học, công cụ giảng dạy, đối tượng học viên) và quản lý CRUD khóa học.
- 🏢 **Quản lý Đối thủ / Đơn vị đào tạo (Provider Directory):** Hồ sơ thông tin đối thủ cạnh tranh, danh mục khóa học trực thuộc và đánh giá năng lực cạnh tranh.
- 🤖 **So sánh Đối thủ bằng Trí tuệ nhân tạo (AI Comparison Matrix):** 
  - So sánh trực quan giữa 2 hoặc nhiều khóa học.
  - Stream kết quả phân tích thời gian thực với **Google Gemini AI** qua Vercel AI SDK.
  - Ma trận so sánh chi tiết: Học phí, thời lượng, công nghệ sử dụng, ưu điểm, nhược điểm và nhận định chuyên gia (Verdict).
- 📄 **Xuất báo cáo PDF:** Hỗ trợ xuất ma trận so sánh và kết quả phân tích thành tệp PDF chuyên nghiệp.
- 🔐 **Xác thực & Bảo mật (Authentication):** Đăng ký, đăng nhập tài khoản an toàn với token JWT và phân quyền.

---

## 🛠️ Công nghệ sử dụng

### **Frontend**
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **AI Streaming:** `@ai-sdk/react` + `ai`
- **HTTP Client:** [Axios](https://axios-http.com/)
- **PDF Generation:** `jspdf` + `jspdf-autotable` + `html2canvas`
- **Styling:** Vanilla CSS (Custom Design System, Glassmorphism, Dark/Light palettes)

### **Backend**
- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) (qua `firebase-admin`)
- **AI Integration:** [Google Generative AI](https://ai.google.dev/) (`@ai-sdk/google`, Gemini Flash)
- **Validation:** [Zod](https://zod.dev/)
- **Dev Tools:** Nodemon, Dotenv, Cors

---

## 📁 Cấu trúc thư mục dự án

```text
Enemy-Analyser/
├── backend/                  # REST API & AI Server
│   ├── scripts/              # Migration & Seed scripts (seed-competitors.js)
│   ├── src/
│   │   ├── config/           # Cấu hình Firebase Admin SDK
│   │   ├── comparisons/      # Controller & Schema so sánh AI
│   │   ├── competitors/      # Quản lý đối thủ cạnh tranh
│   │   ├── courses/          # Quản lý danh mục khóa học
│   │   ├── insights/         # Báo cáo thông tin chi tiết thị trường
│   │   ├── middleware/       # Middleware xác thực & xử lý lỗi
│   │   ├── providers/        # Quản lý đối tác / đơn vị đào tạo
│   │   ├── users/            # Xác thực & quản lý tài khoản người dùng
│   │   ├── app.js            # Khởi tạo Express app & routing
│   │   └── server.js         # Entry point backend server
│   ├── serviceAccountKey.json# Khóa bảo mật Firebase Admin (không commit git)
│   ├── .env                  # Biến môi trường Backend
│   └── package.json
│
├── frontend/                 # Giao diện người dùng (React SPA)
│   ├── public/               # Static assets & favicon
│   ├── src/
│   │   ├── api/              # Cấu hình Axios client & Interceptor
│   │   ├── assets/           # Hình ảnh, icons và tài nguyên tĩnh
│   │   ├── components/       # UI Components tái sử dụng (Header, Sidebar, Modal,...)
│   │   ├── context/          # React Context (AuthContext, ThemeContext,...)
│   │   ├── layouts/          # Layout chính của ứng dụng
│   │   ├── pages/            # Các trang giao diện (Dashboard, Compare, Courses, Login,...)
│   │   ├── routes/           # Định tuyến ứng dụng (AppRoutes)
│   │   ├── services/         # Tầng giao tiếp API Backend
│   │   ├── App.jsx
│   │   ├── index.css         # Design System tokens & global styles
│   │   └── main.jsx
│   ├── vercel.json           # Cấu hình Deploy SPA trên Vercel
│   ├── vite.config.js        # Cấu hình Vite
│   └── package.json
└── README.md                 # Tài liệu hướng dẫn dự án
```

---

## ⚙️ Hướng dẫn cài đặt & Chạy cục bộ (Local Setup)

### 1. Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18.x trở lên
- **npm** hoặc **yarn**
- Tài khoản [Firebase](https://firebase.google.com/) với Firestore Database
- [Google AI Studio API Key](https://aistudio.google.com/) để sử dụng Gemini

---

### 2. Cài đặt & Cấu hình Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Chuẩn bị file `serviceAccountKey.json`:
   - Truy cập Firebase Console -> **Project Settings** -> **Service accounts** -> Nhấn **Generate new private key**.
   - Đặt file tải về vào thư mục `backend/` với tên `serviceAccountKey.json`.

4. Tạo file `.env` tại thư mục `backend/`:
   ```env
   PORT=5000
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   ```

5. *(Tùy chọn)* Nạp dữ liệu mẫu ban đầu vào Firestore:
   ```bash
   node scripts/seed-competitors.js
   ```

6. Chạy Backend server:
   ```bash
   # Chế độ phát triển (auto reload qua nodemon)
   npm run dev

   # Chế độ production
   npm start
   ```
   Backend sẽ lắng nghe tại `http://localhost:5000`. Kiểm tra trạng thái qua `http://localhost:5000/health`.

---

### 3. Cài đặt & Cấu hình Frontend

1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. *(Tùy chọn)* Tạo file `.env` tại thư mục `frontend/` nếu muốn tuỳ chỉnh URL API:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Khởi chạy Frontend development server:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ khả dụng tại `http://localhost:5173`.

---

## 📡 Danh sách API Endpoints chính

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra trạng thái hoạt động của server |
| `POST` | `/api/users/register` | Đăng ký tài khoản người dùng mới |
| `POST` | `/api/users/login` | Đăng nhập hệ thống & lấy JWT Token |
| `GET` | `/api/courses` | Lấy danh sách khóa học (hỗ trợ phân trang, lọc) |
| `POST` | `/api/courses` | Thêm khóa học mới vào hệ thống |
| `PUT` | `/api/courses/:id` | Cập nhật thông tin khóa học |
| `DELETE` | `/api/courses/:id` | Xóa khóa học |
| `GET` | `/api/providers` | Lấy danh sách các đơn vị đào tạo / đối thủ |
| `POST` | `/api/compare` | So sánh đa khóa học và phân tích AI (Stream qua Gemini) |
| `GET` | `/api/comparisons` | Lấy lịch sử các phiên so sánh |
| `GET` | `/api/insights` | Lấy các phân tích thị trường & báo cáo tổng quan |

---

## 🚀 Hướng dẫn Triển khai (Deployment)

### Backend (Vercel / Render / Railway)
- Khởi tạo project và liên kết với thư mục `backend/`.
- Cấu hình Environment Variables trên dịch vụ host: `PORT`, `GOOGLE_GENERATIVE_AI_API_KEY` và nội dung file `serviceAccountKey.json`.

### Frontend (Vercel / Netlify)
- Đặt **Root Directory** là `frontend`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Cấu hình Environment Variable: `VITE_API_URL` trỏ tới domain của Backend server.

---

## 👥 Đóng góp & Bản quyền

Dự án phục vụ mục đích nghiên cứu và phân tích thị trường đào tạo trí tuệ nhân tạo. Mọi đóng góp (Pull Request / Issue) đều được hoan nghênh!
