import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { user, logout } = useAuth();
    
    return (
      <header className="header">
        <h3>Enemy Analyser</h3>
  
        <div className="user-info">
          <span>{user?.fullName || "Người dùng"}</span>
          <button onClick={logout} className="logout-btn">Đăng xuất</button>
        </div>
      </header>
    );
  }