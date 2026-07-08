import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const data = await api.signup({ email, password, organizationName });
      login(data.token, data.organization);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-lg shadow-sm border">
      <h1 className="text-xl font-semibold mb-6">Create your StockFlow account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Organization name</label>
          <input
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="My Test Store"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium hover:bg-slate-800"
        >
          Sign up
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-4">
        Already have an account? <Link to="/login" className="text-slate-900 underline">Log in</Link>
      </p>
    </div>
  );
}
