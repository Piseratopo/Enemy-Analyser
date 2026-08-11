import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { createCourse } from "../services/courseService";
import { useAuth } from "../context/AuthContext";

export default function AddCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "staff";

  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    toolCombo: "",
    targetAudience: "",
    durationDisplay: "",
    learningFormat: "Online",
    feeDisplay: "",
    minFee: "",
    maxFee: "",
    strengths: "",
    weaknesses: "",
    salesVolume: "",
    sourceUrl: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      setError("Bạn không có quyền thêm khóa học.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const courseData = {
        ...formData,
        toolCombo: formData.toolCombo.split(",").map(item => item.trim()).filter(Boolean),
        targetAudience: formData.targetAudience.split(",").map(item => item.trim()).filter(Boolean),
        strengths: formData.strengths.split(",").map(item => item.trim()).filter(Boolean),
        weaknesses: formData.weaknesses.split(",").map(item => item.trim()).filter(Boolean),
        minFee: formData.minFee ? parseFloat(formData.minFee) : 0,
        maxFee: formData.maxFee ? parseFloat(formData.maxFee) : 0
      };

      await createCourse(courseData);
      alert("Thêm khóa học thành công!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="add-course">
        <div className="provider-header">
          <h1>Thêm khóa học đối thủ</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề khóa học *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Nhập tiêu đề khóa học"
            />
          </div>

          <div className="form-group">
            <label>Đơn vị đào tạo</label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              placeholder="Nhập tên đơn vị đào tạo"
            />
          </div>

          <div className="form-group">
            <label>Công cụ/Combo (ngăn cách bằng dấu phẩy)</label>
            <input
              type="text"
              name="toolCombo"
              value={formData.toolCombo}
              onChange={handleChange}
              placeholder="Ví dụ: React, TypeScript, Node.js"
            />
          </div>

          <div className="form-group">
            <label>Đối tượng mục tiêu (ngăn cách bằng dấu phẩy)</label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              placeholder="Ví dụ: Lập trình viên, Sinh viên"
            />
          </div>

          <div className="form-group">
            <label>Thời lượng hiển thị</label>
            <input
              type="text"
              name="durationDisplay"
              value={formData.durationDisplay}
              onChange={handleChange}
              placeholder="Ví dụ: 4 tuần, 2 tháng"
            />
          </div>

          <div className="form-group">
            <label>Hình thức học</label>
            <select
              name="learningFormat"
              value={formData.learningFormat}
              onChange={handleChange}
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label>Học phí hiển thị</label>
            <input
              type="text"
              name="feeDisplay"
              value={formData.feeDisplay}
              onChange={handleChange}
              placeholder="Ví dụ: 5.000.000 VND"
            />
          </div>

          <div className="form-group">
            <label>Học phí tối thiểu</label>
            <input
              type="number"
              name="minFee"
              value={formData.minFee}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Học phí tối đa</label>
            <input
              type="number"
              name="maxFee"
              value={formData.maxFee}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Điểm mạnh (ngăn cách bằng dấu phẩy)</label>
            <input
              type="text"
              name="strengths"
              value={formData.strengths}
              onChange={handleChange}
              placeholder="Ví dụ: Giảng viên giỏi, Dự án thực tế"
            />
          </div>

          <div className="form-group">
            <label>Điểm yếu (ngăn cách bằng dấu phẩy)</label>
            <input
              type="text"
              name="weaknesses"
              value={formData.weaknesses}
              onChange={handleChange}
              placeholder="Ví dụ: Giá cao, Cần kiến thức cơ bản"
            />
          </div>

          <div className="form-group">
            <label>Sức bán</label>
            <input
              type="text"
              name="salesVolume"
              value={formData.salesVolume}
              onChange={handleChange}
              placeholder="Ví dụ: Cao, Trung bình, Thấp"
            />
          </div>

          <div className="form-group">
            <label>Link nguồn</label>
            <input
              type="url"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleChange}
              placeholder="https://example.com/course"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Đang lưu..." : "Lưu khóa học"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
