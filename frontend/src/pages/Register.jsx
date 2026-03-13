import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold text-slate-900">Register</h1>
        <p className="mt-2 text-sm text-slate-500">Create your account to access the platform.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await register(form);
              navigate("/login");
            } catch (err) {
              setMessage(err.response?.data?.detail || "Registration failed");
            }
          }}
        >
          <input className="w-full rounded-xl border p-3" placeholder="Full name" onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input className="w-full rounded-xl border p-3" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-xl border p-3" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {message ? <div className="text-sm text-red-600">{message}</div> : null}
          <button className="w-full rounded-xl bg-cyber-700 px-4 py-3 font-medium text-white">Register</button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-cyber-700">Login</Link>
        </p>
      </div>
    </div>
  );
}
