import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAllProviders, createProvider, updateProvider, deleteProvider } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import "./ProviderList.css";

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  return (
    <MainLayout>
      <div className="provider-list">
        <div className="provider-header">
          <h1>Danh mục đơn vị đào tạo</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          {canEdit && (
            <button className="btn-primary" onClick={handleCreate}>
              Thêm đơn vị đào tạo
            </button>
          )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="provider-grid">
            {providers.length === 0 ? (
              <div className="empty-state">Không có đơn vị đào tạo nào</div>
            ) : (
              providers.map((provider) => (
                <div key={provider.id} className="provider-card">
                  <h3>{provider.name}</h3>
                  {provider.websiteUrl && (
                    <a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {provider.websiteUrl}
                    </a>
                  )}
                  {canEdit && (
                    <div className="provider-actions">
                      <button onClick={() => handleEdit(provider)}>Sửa</button>
                      <button onClick={() => handleDelete(provider.id)}>Xóa</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{editingProvider ? "Cập nhật đơn vị đào tạo" : "Thêm đơn vị đào tạo mới"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên đơn vị đào tạo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit">
                    {editingProvider ? "Cập nhật" : "Thêm"}
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
