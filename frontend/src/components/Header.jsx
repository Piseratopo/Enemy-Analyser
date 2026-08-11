import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { user, logout } = useAuth();
    
    return (
      <header className="header">
        <div className="search-container">
          <span className="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Tìm kiếm khóa học, đơn vị đào tạo..."
          />
        </div>
  
        <div className="header-actions">
          <button className="header-btn" title="Thông báo">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="header-btn" title="Cài đặt">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="header-btn" onClick={logout} title="Đăng xuất">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>
    );
  }