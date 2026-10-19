import { useState } from "react";
import { api, setToken } from "./api";

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const body = JSON.stringify({ email: email.trim(), password });
    try {
      if (!isLogin) await api("/auth/register", { method: "POST", body });
      const r = await api("/auth/login", { method: "POST", body });
      setToken(r.access_token);
      onAuthed(email.trim());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <section className="auth">
      <div className="card">
        <h1>{isLogin ? "Sign in" : "Create your account"}</h1>
        <p className="sub">Your chats are saved to your account, so you can pick up where you left off.</p>
        <form onSubmit={submit}>
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"} required />
          </label>
          <p className="err" role="alert">{error}</p>
          <button className="btn full" disabled={loading}>{isLogin ? "Sign in" : "Create account"}</button>
        </form>
        <p className="switch">
          {isLogin ? "New here? " : "Already have an account? "}
          <button className="link" type="button" onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); }}>
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </section>
  );
}
