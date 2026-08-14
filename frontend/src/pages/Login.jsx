import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative blobs */}
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />

      <div className="auth-card">
        {/* Header */}
        <div className="auth-logo-wrap">
          <img
            src="/course_analyser_logo.png"
            alt="Course Analyser Logo"
          />
          <h1 className="auth-title">Course Analyser</h1>
          <p className="auth-subtitle">Chào mừng quay trở lại. Vui lòng đăng nhập vào tài khoản của bạn.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-error" style={{ width: "100%", marginBottom: "4px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined">mail</span>
              <input
                id="email"
                className="auth-input"
                type="email"
                placeholder="ten@congty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-field-header">
              <label className="auth-label" htmlFor="password">Mật khẩu</label>
              <a className="auth-forgot" href="#">Quên mật khẩu?</a>
            </div>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined">lock</span>
              <input
                id="password"
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button className="auth-btn" type="submit" disabled={loading}>
            <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
            {!loading && <span className="material-symbols-outlined">login</span>}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Chưa có tài khoản?{" "}
            <Link to="/register">
              Đăng ký ngay
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}