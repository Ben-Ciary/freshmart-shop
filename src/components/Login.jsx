import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../api";
import "../css/Login.css";

export default function Login({ onAuth }) {
  const lastEmail = localStorage.getItem("shop_last_email") || "";

  const [mode, setMode] = useState(lastEmail ? "login" : "register");
  const [form, setForm] = useState({
    name: "",
    email: lastEmail,
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const update = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api(isLogin ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: form,
      });

      localStorage.setItem("shop_last_email", form.email);

      await onAuth(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async (credential) => {
    try {
      setError("");

      const data = await api("/auth/google", {
        method: "POST",
        body: { credential },
      });

      if (data?.user?.email) {
        localStorage.setItem("shop_last_email", data.user.email);
      }

      await onAuth(data);
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  const switchMode = () => {
    setError("");
    setMode(isLogin ? "register" : "login");

    setForm({
      name: "",
      email: lastEmail,
      password: "",
    });
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE */}
      <section className="auth-hero">
        <div className="brand">🛒 FreshMart</div>

        <div className="hero-content">
          <span className="hero-label">
            {isLogin ? "WELCOME BACK" : "GET STARTED"}
          </span>

          <h1>
            {isLogin
              ? "Welcome back to FreshMart."
              : "Everything you need, in one place."}
          </h1>

          <p>
            {isLogin
              ? "Sign in to continue shopping and manage your orders."
              : "Create your account and start shopping for your everyday essentials."}
          </p>

          <div className="hero-features">
            <div>✓ Easy online shopping</div>
            <div>✓ Manage your orders</div>
            <div>✓ Your cart stays organized</div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="auth-side">
        <div className="auth-card">
          <h2>{isLogin ? "Welcome back 👋" : "Create your account"}</h2>

          <p className="auth-sub">
            {isLogin
              ? "Sign in to continue shopping."
              : "Create an account to start shopping."}
          </p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={submit}>
            {!isLogin && (
              <div className="field">
                <label>Full name</label>

                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={update}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="field">
              <label>Email address</label>

              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={update}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label>Password</label>

              <input
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                minLength={6}
                value={form.password}
                onChange={update}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <div className="divider">
                <span>or</span>
              </div>

              <div className="google-wrap">
                <GoogleLogin
                  onSuccess={(response) => googleSignIn(response.credential)}
                  onError={() => setError("Google sign-in failed.")}
                />
              </div>
            </>
          )}

          <p className="switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}

            <button type="button" onClick={switchMode}>
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
