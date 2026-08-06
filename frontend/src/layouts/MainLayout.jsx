import "./MainLayout.css";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Header />

        <div className="content">
          {children}
        </div>

      </div>

    </div>
  );
}