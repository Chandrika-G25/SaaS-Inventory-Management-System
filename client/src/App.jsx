import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Settings from "./pages/Settings.jsx";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

import { NavLink } from "react-router-dom";

function NavBar() {
  const { token, organization, logout } = useAuth();
  const navigate = useNavigate();

  if (!token) return null;

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-all px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
      isActive
        ? "bg-indigo-50/80 text-indigo-600 shadow-sm border border-indigo-100/50"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-200">
              SF
            </div>
            <span className="font-outfit font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              StockFlow
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClass}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              📦 Products
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              ⚙️ Settings
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Organisation</span>
            <span className="text-sm font-bold text-slate-800">{organization?.name}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-600">
      <NavBar />
      <div className="max-w-6xl mx-auto p-6 animate-slide-up">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
