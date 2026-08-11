import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getAllProviders, createProvider, updateProvider, deleteProvider } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import "./ProviderList.css";

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({ name: "", websiteUrl: "" });
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await getAllProviders();
      setProviders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProvider(null);
    setFormData({ name: "", websiteUrl: "" });
    setShowModal(true);
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setFormData({ name: provider.name, websiteUrl: provider.websiteUrl || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn vị đào tạo này?")) return;
    try {
      await deleteProvider(id);
      loadProviders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id, formData);
      } else {
        await createProvider(formData);
      }
      setShowModal(false);
      loadProviders();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.websiteUrl || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalProviders = providers.length;
  const totalCoursesTracked = providers.reduce((sum, p) => sum + (p.courseCount || 0), 0);
  const activeProvidersCount = providers.filter(p => (p.courseCount || 0) > 0).length;

  return (
    <MainLayout>
      <div className="provider-page">
        {/* Decorative blobs */}
        <div className="provider-blob-1" />
        <div className="provider-blob-2" />

        {/* ── Header ── */}
        <div className="provider-header">
          <div className="provider-header-left">
            <h1 className="provider-title">Đơn vị đào tạo</h1>
            <p className="provider-subtitle">
              Quản lý và theo dõi các tổ chức đào tạo đối thủ trên thị trường.
            </p>
          </div>

          <div className="provider-header-right">
            {/* Search */}
            <div className="provider-search-wrap">
              <span className="material-symbols-outlined">search</span>
              <input
                className="provider-search"
                type="text"
                placeholder="Tìm kiếm đơn vị..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Add button */}
            {canEdit && (
              <button className="provider-add-btn" onClick={handleCreate}>
                <span className="material-symbols-outlined">add</span>
                Thêm mới
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="provider-error">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {error}
          </div>
        )}

        {/* ── Stats Summary ── */}
        {!loading && (
          <div className="provider-stats-grid">
            <div className="provider-stat-card">
              <div className="stat-icon-wrap primary">
                <span className="material-symbols-outlined">corporate_fare</span>
              </div>
              <div>
                <p className="stat-label">Tổng đơn vị đào tạo</p>
                <p className="stat-value">{totalProviders}</p>
              </div>
            </div>
            <div className="provider-stat-card">
              <div className="stat-icon-wrap success">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <p className="stat-label">Đơn vị có khóa học</p>
                <p className="stat-value">{activeProvidersCount}</p>
              </div>
            </div>
            <div className="provider-stat-card">
              <div className="stat-icon-wrap info">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <p className="stat-label">Tổng số khóa học</p>
                <p className="stat-value">{totalCoursesTracked}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="provider-loading">Đang tải dữ liệu...</div>
        ) : (
          <div className="provider-table-wrap">
            <table className="provider-table">
              <thead>
                <tr>
                  <th>Tên đơn vị đào tạo</th>
                  <th>Trạng thái</th>
                  <th>Số khóa học</th>
                  <th>Website</th>
                  {canEdit && <th className="th-right">Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 5 : 4} className="provider-empty">
                      <span className="material-symbols-outlined">corporate_fare</span>
                      Không có đơn vị đào tạo nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((provider) => {
                    const courseCount = provider.courseCount ?? provider._count?.courses ?? 0;
                    const isActive = courseCount > 0;

                    return (
                      <tr key={provider.id}>
                        {/* Name */}
                        <td>
                          <p className="provider-name">{provider.name}</p>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`provider-badge ${isActive ? "active" : "inactive"}`}>
                            {isActive ? "Theo dõi" : "Chưa theo dõi"}
                          </span>
                        </td>

                        {/* Course count */}
                        <td>
                          {courseCount > 0 ? (
                            <Link
                              to={`/courses?provider=${encodeURIComponent(provider.name)}`}
                              className="provider-count-link"
                              title={`Xem ${courseCount} khóa học của ${provider.name}`}
                            >
                              <span className="provider-count">{courseCount}</span>
                              <span className="material-symbols-outlined count-arrow">arrow_forward</span>
                            </Link>
                          ) : (
                            <span className="provider-count zero">0</span>
                          )}
                        </td>

                        {/* Website */}
                        <td>
                          {provider.websiteUrl ? (
                            <a
                              className="provider-website"
                              href={provider.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className="material-symbols-outlined">link</span>
                              {provider.websiteUrl.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            <span style={{ color: "#c3c6d6", fontSize: 13 }}>—</span>
                          )}
                        </td>

                        {/* Actions */}
                        {canEdit && (
                          <td className="td-actions">
                            <div className="provider-action-btns">
                              <button
                                className="btn-icon edit"
                                title="Sửa"
                                onClick={() => handleEdit(provider)}
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button
                                className="btn-icon delete"
                                title="Xóa"
                                onClick={() => handleDelete(provider.id)}
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Modal ── */}
        {showModal && (
          <div className="provider-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="provider-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingProvider ? "Cập nhật đơn vị đào tạo" : "Thêm đơn vị đào tạo mới"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="pm-field">
                  <label className="pm-label" htmlFor="pm-name">Tên đơn vị đào tạo *</label>
                  <input
                    id="pm-name"
                    className="pm-input"
                    type="text"
                    placeholder="VD: TechMaster Academy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="pm-field">
                  <label className="pm-label" htmlFor="pm-url">Website</label>
                  <input
                    id="pm-url"
                    className="pm-input"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  />
                </div>
                <div className="pm-actions">
                  <button type="button" className="pm-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="pm-submit">
                    {editingProvider ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
