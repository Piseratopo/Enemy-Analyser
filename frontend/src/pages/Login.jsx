import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Enemy Analyser</h1>
        <p>Sign in to continue</p>

        <form>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit">
            Login
          </button>
        </form>

        <p className="register-link">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}