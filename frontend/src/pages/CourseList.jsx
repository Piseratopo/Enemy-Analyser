import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAllCourses } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import "./CourseList.css";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCourses(new Set(courses.map(c => c.id)));
    } else {
      setSelectedCourses(new Set());
    }
  };

  const handleSelectCourse = (id) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCourses(newSelected);
  };

  const getFormatIcon = (format) => {
    switch (format?.toLowerCase()) {
      case 'online':
        return 'laptop_mac';
      case 'offline':
        return 'groups';
      case 'hybrid':
        return 'cast';
      default:
        return 'laptop_mac';
    }
  };

  const getFormatColor = (format) => {
    switch (format?.toLowerCase()) {
      case 'online':
        return 'text-on-surface-variant';
      case 'offline':
        return 'text-tertiary';
      case 'hybrid':
        return 'text-on-secondary-container';
      default:
        return 'text-on-surface-variant';
    }
  };

  const getFormatBg = (format) => {
    switch (format?.toLowerCase()) {
      case 'online':
        return 'bg-surface-variant';
      case 'offline':
        return 'bg-tertiary-container/20';
      case 'hybrid':
        return 'bg-secondary-container/50';
      default:
        return 'bg-surface-variant';
    }
  };

  return (
    <MainLayout>
      <div className="course-list">
        <div className="course-header">
          <div className="course-title-section">
            <h1>Danh sách khóa học đối thủ</h1>
            <p>Phân tích và so sánh các khóa học trên thị trường. Lọc theo cấu trúc học phí, hình thức và công nghệ để xác định khoảng trống cạnh tranh.</p>
          </div>
          <div className="course-actions">
            <button className="btn btn-secondary">
              <span className="material-symbols-outlined">download</span>
              Xuất CSV
            </button>
            {canEdit && (
              <button className="btn btn-primary">
                <span className="material-symbols-outlined">add</span>
                Thêm khóa học
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="filter-header">
                <span className="material-symbols-outlined">tune</span>
                <span>Bộ lọc</span>
              </div>
              <div className="filter-pills">
                <button className="filter-pill">
                  Đơn vị đào tạo
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
                <button className="filter-pill active">
                  Học phí: 1tr - 5tr
                  <span className="material-symbols-outlined">close</span>
                </button>
                <button className="filter-pill">
                  Hình thức
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
                <button className="filter-pill">
                  Công nghệ: Python, SQL
                  <span className="material-symbols-outlined">close</span>
                </button>
                <button className="filter-clear">Xóa tất cả</button>
              </div>
            </div>

            {/* Data Table */}
            <div className="course-table-container">
              <table className="course-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={selectedCourses.size === courses.length && courses.length > 0}
                          onChange={handleSelectAll}
                        />
                        <span className="checkbox-custom"></span>
                      </label>
                    </th>
                    <th>Tên khóa học</th>
                    <th>Đơn vị đào tạo</th>
                    <th>Học phí</th>
                    <th>Thời lượng</th>
                    <th>Hình thức</th>
                    <th className="actions-col">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        Không có khóa học nào
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id} className="course-row">
                        <td className="checkbox-col">
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={selectedCourses.has(course.id)}
                              onChange={() => handleSelectCourse(course.id)}
                            />
                            <span className="checkbox-custom"></span>
                          </label>
                        </td>
                        <td>
                          <div className="course-title-cell">
                            <div className="course-icon">
                              <span className="material-symbols-outlined">school</span>
                            </div>
                            <div className="course-title-content">
                              <div className="course-name">{course.title}</div>
                              {course.toolCombo && course.toolCombo.length > 0 && (
                                <div className="course-tags">
                                  {course.toolCombo.slice(0, 2).map((tool, index) => (
                                    <span key={index} className="course-tag">{tool}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{course.provider || "-"}</td>
                        <td className="course-fee">
                          {course.feeDisplay || `${course.minFee} - ${course.maxFee} VND`}
                        </td>
                        <td>{course.durationDisplay || "-"}</td>
                        <td>
                          <span className={`format-badge ${getFormatBg(course.learningFormat)} ${getFormatColor(course.learningFormat)}`}>
                            <span className="material-symbols-outlined">{getFormatIcon(course.learningFormat)}</span>
                            {course.learningFormat || "Online"}
                          </span>
                        </td>
                        <td className="actions-col">
                          {course.sourceUrl && (
                            <a 
                              href={course.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="action-btn"
                            >
                              <span className="material-symbols-outlined">open_in_new</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination">
                <span className="pagination-info">Hiển thị 1-{courses.length} của {courses.length} kết quả</span>
                <div className="pagination-controls">
                  <button className="pagination-btn" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="pagination-btn active">1</button>
                  <button className="pagination-btn">2</button>
                  <button className="pagination-btn">3</button>
                  <span className="pagination-ellipsis">...</span>
                  <button className="pagination-btn">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Action Bar */}
            {selectedCourses.size >= 2 && (
              <div className="action-bar">
                <div className="action-bar-content">
                  <div className="selected-count">
                    <div className="count-badge">{selectedCourses.size}</div>
                    <span>Khóa học đã chọn</span>
                  </div>
                  <div className="action-bar-divider"></div>
                  <button className="btn btn-primary">
                    <span className="material-symbols-outlined">compare_arrows</span>
                    So sánh ngay
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
