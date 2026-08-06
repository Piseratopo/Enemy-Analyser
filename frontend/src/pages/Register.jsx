import { Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>
        <p>Create a new account</p>

        <form>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
            />
          </div>

          <button type="submit">
            Register
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}