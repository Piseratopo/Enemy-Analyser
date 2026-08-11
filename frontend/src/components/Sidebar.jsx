import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#003d9b' }}>school</span>
        </div>
        <span className="sidebar-title">Enemy Analyser</span>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
          <span className="material-symbols-outlined">dashboard</span>
          <span>Bảng điều khiển</span>
        </Link>
        <Link to="/courses" className={isActive("/courses") ? "active" : ""}>
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Khóa học đối thủ</span>
        </Link>
        <Link to="/providers" className={isActive("/providers") ? "active" : ""}>
          <span className="material-symbols-outlined">corporate_fare</span>
          <span>Đơn vị đào tạo</span>
        </Link>
        <Link to="/courses/add" className={isActive("/courses/add") ? "active" : ""}>
          <span className="material-symbols-outlined">add_circle</span>
          <span>Thêm khóa học</span>
        </Link>
        <Link to="/compare" className={isActive("/compare") ? "active" : ""}>
          <span className="material-symbols-outlined">compare_arrows</span>
          <span>So sánh khóa học</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
          </div>
          <div className="user-info-text">
            <p className="user-name">{user?.fullName || user?.name || "Người dùng"}</p>
            <p className="user-role">{user?.role || "Staff"}</p>
          </div>
          <button className="sidebar-logout-btn" onClick={logout} title="Đăng xuất">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}