import "./MainLayout.css";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}