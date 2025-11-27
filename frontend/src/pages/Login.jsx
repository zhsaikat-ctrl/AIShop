// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-base-200 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-error mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input input-bordered"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input input-bordered"
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary mt-2">Login</button>
      </form>

      <p className="mt-3 text-sm">
        Account নেই?{" "}
        <Link to="/register" className="link">
          Register করুন
        </Link>
      </p>
    </div>
  );
}
