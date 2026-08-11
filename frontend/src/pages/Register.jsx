import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

/* Password strength: returns [level 0-4, color] */
function calcStrength(val) {
  if (!val) return [0, "transparent"];
  let s = 1;
  if (val.length > 5) s = 2;
  if (val.length > 7 && /[A-Z]/.test(val) && /[0-9]/.test(val)) s = 3;
  if (val.length > 9 && /[!@#$%^&*]/.test(val)) s = 4;
  const colors = ["transparent", "#ba1a1a", "#facc15", "#22c55e", "#4edea3"];
  return [s, colors[s]];
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [strength, strengthColor] = calcStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password });
      alert("Đăng ký tài khoản thành công!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại!");
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
            src="https://lh3.googleusercontent.com/aida/AP1WRLvl3TylLX5tEdiJSMfmr6ugm9QtJ4lcdcr4uSuYyrTf6VSE955XaAlGeJVRgB8oSABumCkH-dZkcNQnSZsfpSCNmZmRDeeGaTEUVCBJPTEmW9KaI_V4Fwtl4pGOYIBNQwKelMpCU-7BF9-HcrD5JrGLZcxlHPp4c-JL4AaG4u4F5T2Wt8hXoNc0wTqCJ8pRyfgG6nMihc_x2246zk-8GqW-FkyKaoVw-K7lzAop5DcB06pQA6KhunDO9u0"
            alt="Course Analyser Logo"
          />
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join Course Analyser to start tracking competitors.</p>
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
          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="fullName">Full Name</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined">person</span>
              <input
                id="fullName"
                className="auth-input"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined">mail</span>
              <input
                id="email"
                className="auth-input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password + strength */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined">lock</span>
              <input
                id="password"
                className="auth-input"
                style={{ paddingRight: 44 }}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            {/* Strength bars */}
            <div className="auth-strength-bars">
              {[1, 2, 3, 4].map((level) => (
                <div className="auth-strength-bar" key={level}>
                  <div
                    className="auth-strength-fill"
                    style={{
                      width: strength >= level ? "100%" : "0%",
                      backgroundColor: strength >= level ? strengthColor : "transparent",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined">lock_reset</span>
              <input
                id="confirmPassword"
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Terms */}
          <div className="auth-terms">
            <input id="terms" type="checkbox" required />
            <label className="auth-terms-label" htmlFor="terms">
              I agree to the{" "}
              <a href="#">Terms of Service</a>{" "}
              and{" "}
              <a href="#">Privacy Policy</a>.
            </label>
          </div>

          {/* Submit */}
          <button className="auth-btn" type="submit" disabled={loading}>
            <span>{loading ? "Creating account..." : "Đăng ký"}</span>
            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account?
            <Link to="/">
              Đăng nhập
              <span className="material-symbols-outlined">login</span>
            </Link>
          </p>
        </div>
      </div>

      {/* Security badge */}
      <div className="auth-badge">
        <span className="material-symbols-outlined">verified_user</span>
        <span>Enterprise Grade Security</span>
      </div>
    </div>
  );
}