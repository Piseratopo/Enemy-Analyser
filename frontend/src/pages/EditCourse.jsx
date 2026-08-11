import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getCourseById, updateCourse } from "../services/courseService";
import { getAllProviders } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import "./AddCourse.css"; /* reuse AddCourse styles */

/* Convert array or comma-string → joined string for textarea */
const toStr = (v) =>
  Array.isArray(v) ? v.join(", ") : (v || "");

/* Convert array or comma-string → array for tags */
const toArr = (v) =>
  Array.isArray(v) ? v : (typeof v === "string" && v ? v.split(",").map(s => s.trim()).filter(Boolean) : []);

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "staff";

  const [providers, setProviders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    providerId: "",
    targetAudience: "",
    durationDisplay: "",
    learningFormat: "Online",
    feeDisplay: "",
    minFee: "",
    maxFee: "",
    strengths: "",
    weaknesses: "",
    salesVolume: "",
    sourceUrl: "",
  });

  const [tools, setTools] = useState([]);
  const [toolInput, setToolInput] = useState("");
  const tagInputRef = useRef(null);

  /* Load providers + existing course data */
  useEffect(() => {
    const init = async () => {
      try {
        const [providerData, courseData] = await Promise.all([
          getAllProviders(),
          getCourseById(id),
        ]);
        setProviders(providerData);

        const course = courseData.course || courseData;
        // Match stored provider name back to a provider ID for the dropdown
        const matchedProvider = providerData.find(
          p => p.name === course.provider || String(p.id) === String(course.providerId)
        );
        setFormData({
          title:           course.title         || "",
          providerId:      matchedProvider ? String(matchedProvider.id) : "",
          targetAudience:  toStr(course.targetAudience),
          durationDisplay: course.durationDisplay || "",
          learningFormat:  course.learningFormat   || "Online",
          feeDisplay:      course.feeDisplay    || "",
          minFee:          course.minFee != null ? course.minFee : "",
          maxFee:          course.maxFee != null ? course.maxFee : "",
          strengths:       toStr(course.strengths),
          weaknesses:      toStr(course.weaknesses),
          salesVolume:     course.salesVolume   || "",
          sourceUrl:       course.sourceUrl     || "",
        });
        setTools(toArr(course.toolCombo));
      } catch (err) {
        setError(err.message);
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = toolInput.trim();
      if (val && !tools.includes(val)) setTools(prev => [...prev, val]);
      setToolInput("");
    } else if (e.key === "Backspace" && toolInput === "") {
      setTools(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTools(prev => prev.filter(t => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) { setError("Bạn không có quyền chỉnh sửa khóa học."); return; }

    setLoading(true);
    setError("");
    try {
      const selectedProvider = providers.find(p => String(p.id) === String(formData.providerId));
      const courseData = {
        ...formData,
        provider: selectedProvider ? selectedProvider.name : formData.providerId,
        providerId: formData.providerId || null,
        toolCombo: tools,
        targetAudience: formData.targetAudience.split(",").map(s => s.trim()).filter(Boolean),
        strengths:      formData.strengths.split(",").map(s => s.trim()).filter(Boolean),
        weaknesses:     formData.weaknesses.split(",").map(s => s.trim()).filter(Boolean),
        minFee:    formData.minFee !== "" ? parseFloat(formData.minFee) : 0,
        maxFee:    formData.maxFee !== "" ? parseFloat(formData.maxFee) : 0,
      };
      await updateCourse(id, courseData);
      navigate("/courses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <MainLayout>
        <div className="ac-page">
          <div style={{ padding: "48px", textAlign: "center", color: "#64748B" }}>
            Đang tải dữ liệu khóa học...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="ac-page">
        {/* Page header */}
        <div className="ac-page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button
              type="button"
              onClick={() => navigate("/courses")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                color: "#64748B", fontSize: 13, fontWeight: 600,
                padding: 0, fontFamily: "Inter, sans-serif",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              Quay lại danh sách
            </button>
          </div>
          <h1 className="ac-page-title">Chỉnh sửa khóa học</h1>
          <p className="ac-page-subtitle">
            Cập nhật thông tin chi tiết về khóa học đối thủ.
          </p>
        </div>

        {error && (
          <div className="ac-error">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {error}
          </div>
        )}

        <form className="ac-form" onSubmit={handleSubmit}>

          {/* ── Section 1: Thông tin cơ bản ── */}
          <div className="ac-section">
            <h2 className="ac-section-title">
              <span className="material-symbols-outlined">info</span>
              Thông tin cơ bản
            </h2>
            <div className="ac-grid">
              <div className="ac-field">
                <label className="ac-label" htmlFor="title">Tên khóa học *</label>
                <input
                  id="title" className="ac-input" type="text" name="title"
                  value={formData.title} onChange={handleChange}
                  placeholder="VD: Data Analytics for Beginners" required
                />
              </div>

              <div className="ac-field">
                <label className="ac-label" htmlFor="providerId">Đơn vị đào tạo *</label>
                <select
                  id="providerId" className="ac-select" name="providerId"
                  value={formData.providerId} onChange={handleChange} required
                >
                  <option value="" disabled>Chọn đơn vị đào tạo</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="ac-field full">
                <label className="ac-label" htmlFor="sourceUrl">Đường dẫn nguồn</label>
                <input
                  id="sourceUrl" className="ac-input" type="url" name="sourceUrl"
                  value={formData.sourceUrl} onChange={handleChange} placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <hr className="ac-divider" />

          {/* ── Section 2: Chi tiết khóa học ── */}
          <div className="ac-section">
            <h2 className="ac-section-title">
              <span className="material-symbols-outlined">menu_book</span>
              Chi tiết khóa học
            </h2>
            <div className="ac-grid">
              <div className="ac-field">
                <label className="ac-label" htmlFor="learningFormat">Hình thức học</label>
                <select
                  id="learningFormat" className="ac-select" name="learningFormat"
                  value={formData.learningFormat} onChange={handleChange}
                >
                  <option value="Online">Online (Trực tuyến)</option>
                  <option value="Offline">Offline (Trực tiếp)</option>
                  <option value="Hybrid">Hybrid (Kết hợp)</option>
                </select>
              </div>

              <div className="ac-field">
                <label className="ac-label" htmlFor="durationDisplay">Thời lượng</label>
                <input
                  id="durationDisplay" className="ac-input" type="text" name="durationDisplay"
                  value={formData.durationDisplay} onChange={handleChange}
                  placeholder="VD: 3 tháng, 40 giờ..."
                />
              </div>

              <div className="ac-field full">
                <label className="ac-label">Công cụ / Chủ đề</label>
                <div className="ac-tags-wrap" onClick={() => tagInputRef.current?.focus()}>
                  {tools.map(tag => (
                    <span key={tag} className="ac-tag">
                      {tag}
                      <button
                        type="button" className="ac-tag-remove"
                        onClick={e => { e.stopPropagation(); removeTag(tag); }}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef} className="ac-tag-input" type="text"
                    placeholder="Thêm công cụ (nhấn Enter)"
                    value={toolInput}
                    onChange={e => setToolInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="ac-divider" />

          {/* ── Section 3: Học phí ── */}
          <div className="ac-section">
            <h2 className="ac-section-title">
              <span className="material-symbols-outlined">payments</span>
              Học phí
            </h2>
            <div className="ac-grid-3">
              <div className="ac-field">
                <label className="ac-label" htmlFor="minFee">Học phí thấp nhất (VNĐ)</label>
                <input
                  id="minFee" className="ac-input" type="number" name="minFee"
                  value={formData.minFee} onChange={handleChange} placeholder="0"
                />
              </div>
              <div className="ac-field">
                <label className="ac-label" htmlFor="maxFee">Học phí cao nhất (VNĐ)</label>
                <input
                  id="maxFee" className="ac-input" type="number" name="maxFee"
                  value={formData.maxFee} onChange={handleChange} placeholder="0"
                />
              </div>
              <div className="ac-field">
                <label className="ac-label" htmlFor="feeDisplay">Hiển thị học phí</label>
                <input
                  id="feeDisplay" className="ac-input" type="text" name="feeDisplay"
                  value={formData.feeDisplay} onChange={handleChange}
                  placeholder="VD: Từ 5.000.000đ"
                />
              </div>
            </div>
          </div>

          <hr className="ac-divider" />

          {/* ── Section 4: Phân tích đối thủ ── */}
          <div className="ac-section">
            <h2 className="ac-section-title">
              <span className="material-symbols-outlined">analytics</span>
              Phân tích đối thủ
            </h2>
            <div className="ac-grid">
              <div className="ac-field">
                <label className="ac-label tertiary" htmlFor="strengths">
                  Điểm mạnh (ngăn cách bằng dấu phẩy)
                </label>
                <textarea
                  id="strengths" className="ac-textarea" name="strengths"
                  value={formData.strengths} onChange={handleChange}
                  placeholder={"- Giảng viên giàu kinh nghiệm\n- Hỗ trợ việc làm"}
                  rows={4}
                />
              </div>
              <div className="ac-field">
                <label className="ac-label" htmlFor="weaknesses">
                  Điểm yếu (ngăn cách bằng dấu phẩy)
                </label>
                <textarea
                  id="weaknesses" className="ac-textarea" name="weaknesses"
                  value={formData.weaknesses} onChange={handleChange}
                  placeholder={"- Học phí cao\n- Lịch học không linh hoạt"}
                  rows={4}
                />
              </div>
              <div className="ac-field full">
                <label className="ac-label" htmlFor="targetAudience">
                  Đối tượng mục tiêu (ngăn cách bằng dấu phẩy)
                </label>
                <textarea
                  id="targetAudience" className="ac-textarea" name="targetAudience"
                  value={formData.targetAudience} onChange={handleChange}
                  placeholder="Người mới bắt đầu, sinh viên chuyển ngành..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="ac-actions">
            <button type="button" className="ac-btn-cancel" onClick={() => navigate("/courses")}>
              Hủy
            </button>
            <button type="submit" className="ac-btn-submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
