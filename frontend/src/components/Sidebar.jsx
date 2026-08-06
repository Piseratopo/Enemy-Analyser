import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <h2>Enemy Analyser</h2>

      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/competitors">Competitors</Link></li>
        <li><Link to="/compare">Compare</Link></li>
      </ul>

    </aside>
  );
}