import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getAllCourses } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

/* ── helpers ── */
const arrayVal = (v) =>
  Array.isArray(v)
    ? v
    : typeof v === "string" && v
    ? v.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

const fmtFee = (c) =>
  c.feeDisplay ||
  (c.minFee || c.maxFee
    ? `${Number(c.minFee || 0).toLocaleString("vi")}đ`
    : null);

const initials = (str = "") => {
  if (!str) return "?";
  const words = str.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/* Donut SVG — computes stroke-dashoffset for each segment on a r=40 circle */
const CIRCUM = 2 * Math.PI * 40; // ≈ 251.33

function DonutChart({ segments }) {
  // segments: [{pct, color}]
  let offset = 0;
  const arcs = segments.map((s) => {
    const dasharray = (s.pct / 100) * CIRCUM;
    const dashoffset = CIRCUM - dasharray;
    const rotate = (offset / 100) * 360 - 90; // -90 = start at top
    offset += s.pct;
    return { ...s, dasharray, dashoffset, rotate };
  });

  return (
    <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
      {/* track */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#f2f4f6" strokeWidth="14" />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={a.color}
          strokeWidth="14"
          strokeDasharray={`${a.dasharray} ${CIRCUM}`}
          strokeDashoffset={-((offset - a.pct - segments.slice(i + 1).reduce((acc, s) => acc + s.pct, 0) - a.pct) / 100) * CIRCUM + CIRCUM - a.dasharray}
          strokeLinecap="round"
          style={{ transform: `rotate(${a.rotate}deg)`, transformOrigin: "50px 50px" }}
        />
      ))}
    </svg>
  );
}

// simpler, correct donut
function DonutChartSimple({ segments, total }) {
  // sorted largest-first so small segments don't hide behind each other
  let cumulPct = 0;
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#f2f4f6" strokeWidth="13" />
      {segments.map((s, i) => {
        const startAngle = (cumulPct / 100) * 360 - 90;
        const sweep = (s.pct / 100) * 360;
        cumulPct += s.pct;

        if (s.pct === 0) return null;

        // convert polar to cartesian
        const toXY = (angle, r) => ({
          x: 50 + r * Math.cos((angle * Math.PI) / 180),
          y: 50 + r * Math.sin((angle * Math.PI) / 180),
        });

        if (s.pct >= 100) {
          return (
            <circle key={i} cx="50" cy="50" r="40" fill="none"
              stroke={s.color} strokeWidth="13" />
          );
        }

        const start = toXY(startAngle, 40);
        const end = toXY(startAngle + sweep, 40);
        const largeArc = sweep > 180 ? 1 : 0;

        return (
          <path
            key={i}
            d={`M ${start.x} ${start.y} A 40 40 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke={s.color}
            strokeWidth="13"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

const FORMAT_COLORS = {
  online:  "#003d9b",
  offline: "#4edea3",
  hybrid:  "#b2c5ff",
};
const FORMAT_LABELS = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

const BAR_COLORS = ["primary", "secondary", "tertiary", "quaternary", "quinary"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCourses()
      .then((c) => setCourses(Array.isArray(c) ? c : (c?.data || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── computed stats ── */
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    // Derive provider counts from courses — no extra API call needed
    const providerNames = new Set(
      courses.map((c) => (c.provider || "").trim().toLowerCase()).filter(Boolean)
    );
    const totalProviders = providerNames.size;
    const activeProviders = totalProviders; // every provider name in courses has at least 1 course

    // format distribution
    const formatCount = { online: 0, offline: 0, hybrid: 0 };
    courses.forEach((c) => {
      const f = (c.learningFormat || "online").toLowerCase();
      if (f in formatCount) formatCount[f]++;
      else formatCount.online++;
    });

    const formatSegments = Object.entries(formatCount)
      .filter(([, v]) => v > 0)
      .map(([key, count]) => ({
        key,
        label: FORMAT_LABELS[key] || key,
        count,
        pct: totalCourses ? Math.round((count / totalCourses) * 100) : 0,
        color: FORMAT_COLORS[key] || "#c3c6d6",
      }))
      .sort((a, b) => b.count - a.count);

    // top tools
    const toolMap = {};
    courses.forEach((c) => {
      arrayVal(c.toolCombo).forEach((t) => {
        const key = t.trim();
        if (key) toolMap[key] = (toolMap[key] || 0) + 1;
      });
    });
    const topTools = Object.entries(toolMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    const maxToolCount = topTools[0]?.count || 1;

    // recent additions — sort by createdAt desc
    const recent = [...courses]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return db - da;
      })
      .slice(0, 5);

    return { totalCourses, totalProviders, activeProviders, formatSegments, topTools, maxToolCount, recent };
  }, [courses]);

  if (loading) {
    return (
      <MainLayout>
        <div className="db-page">
          <div className="db-blob-1" />
          <div className="db-blob-2" />
          <div className="db-loading">Đang tải dữ liệu...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="db-page">
        <div className="db-blob-1" />
        <div className="db-blob-2" />

        {/* ── Header ── */}
        <div className="db-header">
          <div>
            <h1 className="db-title">Bảng điều khiển</h1>
            <p className="db-subtitle">
              Tổng quan về dữ liệu khóa học và đơn vị đào tạo của đối thủ.
            </p>
          </div>
          <div className="db-header-actions">
            <button
              className="db-btn-secondary"
              onClick={() => navigate("/courses/add")}
            >
              <span className="material-symbols-outlined">add</span>
              Thêm khóa học
            </button>
            <button
              className="db-btn-primary"
              onClick={() => navigate("/courses")}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              Xem danh sách
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="db-stats-grid">
          <div className="db-stat-card">
            <div className="db-stat-corner blue" />
            <div className="db-stat-top">
              <span className="db-stat-label">Tổng khóa học</span>
              <span className="db-stat-icon blue material-symbols-outlined">inventory_2</span>
            </div>
            <div className="db-stat-value">{stats.totalCourses}</div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-corner teal" />
            <div className="db-stat-top">
              <span className="db-stat-label">Đơn vị đào tạo</span>
              <span className="db-stat-icon teal material-symbols-outlined">corporate_fare</span>
            </div>
            <div className="db-stat-value">{stats.totalProviders}</div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-corner purple" />
            <div className="db-stat-top">
              <span className="db-stat-label">Đơn vị có khóa học</span>
              <span className="db-stat-icon purple material-symbols-outlined">analytics</span>
            </div>
            <div className="db-stat-value">{stats.activeProviders}</div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-corner blue" />
            <div className="db-stat-top">
              <span className="db-stat-label">Học trực tuyến</span>
              <span className="db-stat-icon blue material-symbols-outlined">laptop_mac</span>
            </div>
            <div className="db-stat-value">
              {stats.formatSegments.find((s) => s.key === "online")?.count ?? 0}
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="db-main-grid">

          {/* Format Distribution (donut) */}
          <div className="db-card">
            <h2 className="db-card-title">Hình thức học</h2>
            {stats.totalCourses === 0 ? (
              <div className="db-loading" style={{ padding: 24 }}>Chưa có dữ liệu</div>
            ) : (
              <div className="db-donut-wrap">
                <div className="db-donut-svg-wrap">
                  <DonutChartSimple
                    segments={stats.formatSegments}
                    total={stats.totalCourses}
                  />
                  <div className="db-donut-center">
                    <span className="db-donut-center-num">{stats.totalCourses}</span>
                    <span className="db-donut-center-lbl">khóa học</span>
                  </div>
                </div>
                <div className="db-donut-legend">
                  {stats.formatSegments.map((s) => (
                    <div key={s.key} className="db-legend-row">
                      <div className="db-legend-left">
                        <span className="db-legend-dot" style={{ background: s.color }} />
                        <span>{s.label}</span>
                      </div>
                      <span className="db-legend-val">
                        {s.count} <span style={{ fontWeight: 400, fontSize: 11, color: "#64748B" }}>({s.pct}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Tools bar chart */}
          <div className="db-card">
            <div className="db-card-header">
              <h2 className="db-card-title" style={{ margin: 0 }}>Công cụ phổ biến</h2>
              <Link to="/courses" className="db-card-link">Xem tất cả</Link>
            </div>
            {stats.topTools.length === 0 ? (
              <div className="db-loading" style={{ padding: 24 }}>Chưa có dữ liệu công cụ</div>
            ) : (
              <div className="db-bars">
                {stats.topTools.map((t, i) => (
                  <div key={t.name} className="db-bar-row">
                    <div className="db-bar-meta">
                      <span className="db-bar-name">{t.name}</span>
                      <span className="db-bar-count">{t.count}</span>
                    </div>
                    <div className="db-bar-track">
                      <div
                        className={`db-bar-fill ${BAR_COLORS[i] || "quaternary"}`}
                        style={{ width: `${Math.round((t.count / stats.maxToolCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent additions */}
          <div className="db-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="db-card-header">
              <h2 className="db-card-title" style={{ margin: 0 }}>Thêm gần đây</h2>
              <span className="material-symbols-outlined" style={{ color: "#737685", fontSize: 20 }}>history</span>
            </div>

            {stats.recent.length === 0 ? (
              <div className="db-loading" style={{ padding: 24 }}>Chưa có khóa học nào</div>
            ) : (
              <div className="db-recent-list">
                {stats.recent.map((c) => {
                  const fee = fmtFee(c);
                  return (
                    <div
                      key={c.id}
                      className="db-recent-item"
                      onClick={() => navigate(`/courses/edit/${c.id}`)}
                    >
                      <div className="db-recent-avatar">
                        {initials(c.provider || c.title)}
                      </div>
                      <div className="db-recent-info">
                        <div className="db-recent-name">{c.title}</div>
                        <div className="db-recent-provider">
                          {c.provider || "—"}
                        </div>
                        <div className="db-recent-tags">
                          {c.learningFormat && (
                            <span className="db-recent-tag">{c.learningFormat}</span>
                          )}
                          {fee && (
                            <span className="db-recent-tag fee">{fee}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link to="/courses" className="db-view-all-btn">
              Xem tất cả khóa học
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}