import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getAllCourses, deleteCourse } from "../services/courseService";
import { getAllProviders } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import "./CourseList.css";

/* ─── helpers ─────────────────────────────────────────── */
const FORMAT_META = {
  online:  { icon: "laptop_mac",  label: "Online",  cls: "fmt-online"  },
  offline: { icon: "groups",      label: "Offline", cls: "fmt-offline" },
  hybrid:  { icon: "cast",        label: "Hybrid",  cls: "fmt-hybrid"  },
};
const fmtMeta = (f) => FORMAT_META[(f || "online").toLowerCase()] || FORMAT_META.online;

const feeLabel = (c) =>
  c.feeDisplay ||
  (c.minFee || c.maxFee
    ? `${Number(c.minFee || 0).toLocaleString("vi")} – ${Number(c.maxFee || 0).toLocaleString("vi")} VNĐ`
    : "Liên hệ");

const arrayVal = (v) => (Array.isArray(v) ? v : typeof v === "string" && v ? v.split(",").map(s => s.trim()).filter(Boolean) : []);

/* ─── Detail Drawer ───────────────────────────────────── */
function CourseDrawer({ course, onClose, canEdit, onDelete }) {
  const navigate = useNavigate();
  if (!course) return null;
  const meta = fmtMeta(course.learningFormat);
  const tools = arrayVal(course.toolCombo);
  const strengths = arrayVal(course.strengths);
  const weaknesses = arrayVal(course.weaknesses);
  const audience = arrayVal(course.targetAudience);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <h2 className="drawer-title">{course.title}</h2>
              <p className="drawer-provider">
                {course.provider?.name || course.provider || "—"}
              </p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Quick chips */}
        <div className="drawer-chips">
          <span className={`format-badge ${meta.cls}`}>
            <span className="material-symbols-outlined">{meta.icon}</span>
            {meta.label}
          </span>
          {course.durationDisplay && (
            <span className="chip-neutral">
              <span className="material-symbols-outlined">schedule</span>
              {course.durationDisplay}
            </span>
          )}
          <span className="chip-fee">
            <span className="material-symbols-outlined">payments</span>
            {feeLabel(course)}
          </span>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Tools */}
          {tools.length > 0 && (
            <div className="drawer-section">
              <h3 className="drawer-section-title">
                <span className="material-symbols-outlined">build</span>
                Công cụ / Chủ đề
              </h3>
              <div className="tag-list">
                {tools.map((t, i) => <span key={i} className="tag-blue">{t}</span>)}
              </div>
            </div>
          )}

          {/* Audience */}
          {audience.length > 0 && (
            <div className="drawer-section">
              <h3 className="drawer-section-title">
                <span className="material-symbols-outlined">group</span>
                Đối tượng mục tiêu
              </h3>
              <div className="tag-list">
                {audience.map((a, i) => <span key={i} className="tag-neutral">{a}</span>)}
              </div>
            </div>
          )}

          {/* Strengths / Weaknesses */}
          {(strengths.length > 0 || weaknesses.length > 0) && (
            <div className="drawer-section">
              <h3 className="drawer-section-title">
                <span className="material-symbols-outlined">analytics</span>
                Phân tích đối thủ
              </h3>
              <div className="sw-grid">
                {strengths.length > 0 && (
                  <div className="sw-box sw-strength">
                    <p className="sw-label">
                      <span className="material-symbols-outlined">thumb_up</span>
                      Điểm mạnh
                    </p>
                    <ul>
                      {strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div className="sw-box sw-weakness">
                    <p className="sw-label">
                      <span className="material-symbols-outlined">thumb_down</span>
                      Điểm yếu
                    </p>
                    <ul>
                      {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source */}
          {course.sourceUrl && (
            <div className="drawer-section">
              <h3 className="drawer-section-title">
                <span className="material-symbols-outlined">link</span>
                Nguồn
              </h3>
              <a href={course.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                {course.sourceUrl}
                <span className="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {canEdit && (
          <div className="drawer-footer">
            <button
              className="drawer-btn-danger"
              onClick={() => { onDelete(course.id); onClose(); }}
            >
              <span className="material-symbols-outlined">delete</span>
              Xóa
            </button>
            <button
              className="drawer-btn-primary"
              onClick={() => navigate(`/courses/edit/${course.id}`)}
            >
              <span className="material-symbols-outlined">edit</span>
              Chỉnh sửa
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────── */
export default function CourseList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "staff";

  const [courses, setCourses]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [detailCourse, setDetailCourse]     = useState(null);

  // Pagination & providers
  const [page, setPage]                     = useState(1);
  const [limit]                             = useState(10);
  const [pagination, setPagination]         = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [providerList, setProviderList]     = useState([]);
  const [refreshKey, setRefreshKey]         = useState(0);

  // Filters
  const [search, setSearch]                 = useState("");
  const [filterFormat, setFilterFormat]     = useState("");
  const [filterProvider, setFilterProvider] = useState(searchParams.get("provider") || "");
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const formatRef   = useRef(null);
  const providerRef = useRef(null);

  // Fetch all providers for filter dropdown
  useEffect(() => {
    getAllProviders()
      .then((data) => {
        if (Array.isArray(data)) {
          setProviderList(data.map(p => (typeof p === "string" ? p : p.name)).filter(Boolean));
        }
      })
      .catch(console.error);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (formatRef.current && !formatRef.current.contains(e.target)) setShowFormatMenu(false);
      if (providerRef.current && !providerRef.current.contains(e.target)) setShowProviderMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset về trang 1 khi filter thay đổi (không phụ thuộc vào page)
  useEffect(() => {
    setPage(1);
  }, [search, filterFormat, filterProvider]);

  // Fetch data mỗi khi page hoặc filter thay đổi
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getAllCourses({
          page,
          limit,
          search,
          format: filterFormat,
          provider: filterProvider,
        });

        if (res && res.data && res.pagination) {
          setCourses(res.data);
          setPagination(res.pagination);
        } else if (Array.isArray(res)) {
          setCourses(res);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: res.length,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
          });
        } else {
          setCourses([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search, filterFormat, filterProvider, refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    try {
      await deleteCourse(id);
      setSelectedCourses(prev => { const s = new Set(prev); s.delete(id); return s; });
      // Trigger re-fetch bằng cách toggle một dummy state hoặc re-set page
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Xóa ${selectedCourses.size} khóa học đã chọn?`)) return;
    try {
      await Promise.all([...selectedCourses].map(id => deleteCourse(id)));
      setSelectedCourses(new Set());
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterFormat("");
    setFilterProvider("");
    // page sẽ tự reset về 1 qua useEffect trên
  };

  const hasFilters = search || filterFormat || filterProvider;

  /* Derived lists */
  const uniqueProviders = [...new Set([
    ...providerList,
    ...courses.map(c => c.provider?.name || c.provider).filter(Boolean)
  ])].sort();

  /* Selection */
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCourses(prev => {
        const next = new Set(prev);
        courses.forEach(c => next.add(c.id));
        return next;
      });
    } else {
      setSelectedCourses(prev => {
        const next = new Set(prev);
        courses.forEach(c => next.delete(c.id));
        return next;
      });
    }
  };

  const handleSelectCourse = (id) => {
    setSelectedCourses(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleExportCSV = async () => {
    try {
      const res = await getAllCourses({
        page: 1,
        limit: 1000,
        search,
        format: filterFormat,
        provider: filterProvider,
      });
      const exportData = Array.isArray(res) ? res : (res?.data || []);
      if (!exportData.length) {
        alert("Không có dữ liệu để xuất.");
        return;
      }
      const headers = ["Tên khóa học", "Đơn vị đào tạo", "Học phí", "Thời lượng", "Hình thức", "Công cụ / Chủ đề", "Nguồn"];
      const rows = exportData.map(c => [
        `"${(c.title || "").replace(/"/g, '""')}"`,
        `"${(c.provider?.name || c.provider || "").replace(/"/g, '""')}"`,
        `"${feeLabel(c)}"`,
        `"${c.durationDisplay || ""}"`,
        `"${c.learningFormat || ""}"`,
        `"${arrayVal(c.toolCombo).join(", ").replace(/"/g, '""')}"`,
        `"${c.sourceUrl || ""}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `danh_sach_khoa_hoc_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Lỗi xuất file: " + err.message);
    }
  };

  const renderPaginationNumbers = () => {
    const { currentPage, totalPages } = pagination;
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} className={`page-btn ${currentPage === 1 ? "active" : ""}`} onClick={() => setPage(1)}>
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="page-ellipsis">...</span>);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(
        <button
          key={p}
          className={`page-btn ${currentPage === p ? "active" : ""}`}
          onClick={() => setPage(p)}
        >
          {p}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="page-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className={`page-btn ${currentPage === totalPages ? "active" : ""}`}
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <MainLayout>
      <div className="course-list">
        {/* ── Header ── */}
        <div className="course-header">
          <div className="course-title-section">
            <h1>Danh sách khóa học đối thủ</h1>
            <p>Phân tích và so sánh các khóa học trên thị trường.</p>
          </div>
          <div className="course-actions">
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <span className="material-symbols-outlined">download</span>
              Xuất CSV
            </button>
            {canEdit && (
              <button className="btn btn-primary" onClick={() => navigate("/courses/add")}>
                <span className="material-symbols-outlined">add</span>
                Thêm khóa học
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="cl-error">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            {/* ── Filter Bar ── */}
            <div className="filter-bar">
              <div className="filter-header">
                <span className="material-symbols-outlined">tune</span>
                <span>Bộ lọc</span>
              </div>
              <div className="filter-pills">
                {/* Search */}
                <div className="filter-search-wrap">
                  <span className="material-symbols-outlined">search</span>
                  <input
                    className="filter-search"
                    type="text"
                    placeholder="Tìm khóa học..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                  {search && (
                    <button className="filter-search-clear" onClick={() => { setSearch(""); setPage(1); }}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>

                {/* Format dropdown */}
                <div className="filter-dropdown-wrap" ref={formatRef}>
                  <button
                    className={`filter-pill ${filterFormat ? "active" : ""}`}
                    onClick={() => setShowFormatMenu(v => !v)}
                  >
                    {filterFormat || "Hình thức"}
                    <span className="material-symbols-outlined">
                      {filterFormat ? "close" : "expand_more"}
                    </span>
                  </button>
                  {showFormatMenu && (
                    <div className="filter-dropdown">
                      {["Online", "Offline", "Hybrid"].map(f => (
                        <button
                          key={f}
                          className={`filter-dropdown-item ${filterFormat === f ? "selected" : ""}`}
                          onClick={() => { setFilterFormat(filterFormat === f ? "" : f); setPage(1); setShowFormatMenu(false); }}
                        >
                          <span className="material-symbols-outlined">{fmtMeta(f).icon}</span>
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Provider dropdown */}
                <div className="filter-dropdown-wrap" ref={providerRef}>
                  <button
                    className={`filter-pill ${filterProvider ? "active" : ""}`}
                    onClick={() => setShowProviderMenu(v => !v)}
                  >
                    {filterProvider || "Đơn vị đào tạo"}
                    <span className="material-symbols-outlined">
                      {filterProvider ? "close" : "expand_more"}
                    </span>
                  </button>
                  {showProviderMenu && (
                    <div className="filter-dropdown">
                      {uniqueProviders.length === 0 ? (
                        <div className="filter-dropdown-empty">Không có dữ liệu</div>
                      ) : uniqueProviders.map(p => (
                        <button
                          key={p}
                          className={`filter-dropdown-item ${filterProvider === p ? "selected" : ""}`}
                          onClick={() => { setFilterProvider(filterProvider === p ? "" : p); setPage(1); setShowProviderMenu(false); }}
                        >
                          <span className="material-symbols-outlined">corporate_fare</span>
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {hasFilters && (
                  <button className="filter-clear" onClick={clearFilters}>
                    <span className="material-symbols-outlined">restart_alt</span>
                    Xóa tất cả
                  </button>
                )}
              </div>

              <span className="filter-count">{pagination.totalItems} kết quả</span>
            </div>

            {/* ── Table ── */}
            <div className="course-table-container">
              <table className="course-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={courses.length > 0 && courses.every(c => selectedCourses.has(c.id))}
                          onChange={handleSelectAll}
                        />
                        <span className="checkbox-custom" />
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
                      <td colSpan={7} className="empty-state">
                        <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 8, color: "#c3c6d6" }}>inventory_2</span>
                        Không có khóa học nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    courses.map(course => {
                      const meta = fmtMeta(course.learningFormat);
                      const tools = arrayVal(course.toolCombo);
                      const providerName = course.provider?.name || course.provider || "—";
                      return (
                        <tr
                          key={course.id}
                          className={`course-row ${detailCourse?.id === course.id ? "row-active" : ""}`}
                          onClick={() => setDetailCourse(course)}
                        >
                          <td className="checkbox-col" onClick={e => e.stopPropagation()}>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={selectedCourses.has(course.id)}
                                onChange={() => handleSelectCourse(course.id)}
                              />
                              <span className="checkbox-custom" />
                            </label>
                          </td>
                          <td>
                            <div className="course-title-cell">
                              <div className="course-icon">
                                <span className="material-symbols-outlined">school</span>
                              </div>
                              <div className="course-title-content">
                                <div className="course-name">{course.title}</div>
                                {tools.length > 0 && (
                                  <div className="course-tags">
                                    {tools.slice(0, 3).map((t, i) => <span key={i} className="course-tag">{t}</span>)}
                                    {tools.length > 3 && <span className="course-tag">+{tools.length - 3}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{providerName}</td>
                          <td className="course-fee">{feeLabel(course)}</td>
                          <td>{course.durationDisplay || "—"}</td>
                          <td>
                            <span className={`format-badge ${meta.cls}`}>
                              <span className="material-symbols-outlined">{meta.icon}</span>
                              {meta.label}
                            </span>
                          </td>
                          <td className="actions-col" onClick={e => e.stopPropagation()}>
                            <div className="row-actions">
                              {/* View */}
                              <button
                                className="action-btn"
                                title="Xem chi tiết"
                                onClick={() => setDetailCourse(course)}
                              >
                                <span className="material-symbols-outlined">visibility</span>
                              </button>
                              {/* External link */}
                              {course.sourceUrl && (
                                <a
                                  className="action-btn"
                                  href={course.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Mở nguồn"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <span className="material-symbols-outlined">open_in_new</span>
                                </a>
                              )}
                              {canEdit && (
                                <>
                                  <button
                                    className="action-btn"
                                    title="Chỉnh sửa"
                                    onClick={() => navigate(`/courses/edit/${course.id}`)}
                                  >
                                    <span className="material-symbols-outlined">edit</span>
                                  </button>
                                  <button
                                    className="action-btn action-btn-danger"
                                    title="Xóa"
                                    onClick={() => handleDelete(course.id)}
                                  >
                                    <span className="material-symbols-outlined">delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="pagination">
                <span className="pagination-info">
                  Hiển thị {pagination.totalItems > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} – {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} trên tổng số {pagination.totalItems} khóa học
                </span>
                {pagination.totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      title="Trang trước"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    {renderPaginationNumbers()}
                    <button
                      className="page-btn"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      title="Trang kế"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Floating bulk action bar ── */}
            {selectedCourses.size >= 1 && (
              <div className="action-bar">
                <div className="action-bar-content">
                  <div className="selected-count">
                    <div className="count-badge">{selectedCourses.size}</div>
                    <span>Khóa học đã chọn</span>
                  </div>
                  <div className="action-bar-divider" />
                  {selectedCourses.size >= 2 && (
                    <button className="btn btn-primary">
                      <span className="material-symbols-outlined">compare_arrows</span>
                      So sánh ngay
                    </button>
                  )}
                  {canEdit && (
                    <button className="btn btn-danger" onClick={handleDeleteSelected}>
                      <span className="material-symbols-outlined">delete_sweep</span>
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      {detailCourse && (
        <CourseDrawer
          course={detailCourse}
          onClose={() => setDetailCourse(null)}
          canEdit={canEdit}
          onDelete={handleDelete}
        />
      )}
    </MainLayout>
  );
}
