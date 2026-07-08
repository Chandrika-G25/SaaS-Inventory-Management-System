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

function NavBar() {
  const { token, organization, logout } = useAuth();
  const navigate = useNavigate();

  if (!token) return null;

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-semibold">StockFlow</span>
        <Link to="/" className="text-sm text-slate-300 hover:text-white">
          Dashboard
        </Link>
        <Link to="/products" className="text-sm text-slate-300 hover:text-white">
          Products
        </Link>
        <Link to="/settings" className="text-sm text-slate-300 hover:text-white">
          Settings
        </Link>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-300">
        <span>{organization?.name}</span>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
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
