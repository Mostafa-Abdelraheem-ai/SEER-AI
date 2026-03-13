import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-500">Access the SEER-AI++ analyst workspace.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await login(form);
              navigate("/dashboard");
            } catch (err) {
              setError(err.response?.data?.detail || "Login failed");
            }
          }}
        >
          <input className="w-full rounded-xl border p-3" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-xl border p-3" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="w-full rounded-xl bg-cyber-700 px-4 py-3 font-medium text-white">Login</button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          No account? <Link to="/register" className="text-cyber-700">Register</Link>
        </p>
      </div>
    </div>
  );
}
