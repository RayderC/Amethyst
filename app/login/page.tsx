import Navigation from "../components/Navigation";
import '../globals.css';

export default function Login() {
  return (
    <div>
        <Navigation />
      {/* Header */}
      <div style={{ paddingBottom: "10px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
          Login
        </h1>
      </div>

      {/* Form */}
      <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="login-input">
          <label htmlFor="email" style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}></label>
          <input type="email" id="email" name="email" required placeholder="Enter Your Email" />
        </div>

        <div className="login-input">
          <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}></label>
          <input type="password" id="password" name="password" required placeholder="Enter Your Password" />
        </div>

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}