import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <h2>Enemy Analyser</h2>

      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/providers">Đơn vị đào tạo</Link></li>
        <li><Link to="/compare">So sánh khóa học</Link></li>
      </ul>

    </aside>
  );
}