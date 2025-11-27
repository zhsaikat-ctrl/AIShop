// src/App.jsx
import React, { createContext, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

// User Pages
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx"; // (চাইলে রাখুন, আর না চাইলে পরে বাদ দিতে পারেন)
import Register from "./pages/Register.jsx"; // (চাইলে রাখুন)
import ProductDetails from "./pages/ProductDetails.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import OtpLogin from "./pages/OtpLogin.jsx"; // ✅ ADD OTP LOGIN

// Admin Pages
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

// Context hook (providers main.jsx এ আছে)
import { useAuth } from "./context/AuthContext.jsx";
import { useCart } from "./context/CartContext.jsx";

// Components
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Language Context
export const LangContext = createContext();

export default function App() {
  const [lang, setLang] = useState("en");
  const { user } = useAuth();
  const { count } = useCart();

  return (
    <LangContext.Provider value={lang}>
      {/* NAVBAR */}
      <div className="navbar bg-base-200 shadow-md px-4 relative z-10">
        {/* LEFT: LOGO */}
        <div className="flex-1">
          <Link to="/" className="text-xl font-bold">
            AIShop
          </Link>
        </div>

        {/* RIGHT: NAV MENU */}
        <div className="flex gap-3 items-center">
          {/* Language Switch */}
          <select
            className="select select-sm select-bordered"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>

          {/* Public Links */}
          <Link to="/" className="btn btn-ghost btn-sm">Home</Link>

          {/* Cart with badge */}
          <Link to="/cart" className="btn btn-ghost btn-sm">
            Cart
            {count > 0 && (
              <span className="badge badge-primary ml-1">{count}</span>
            )}
          </Link>

          {/* User Protected Links */}
          {user && (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link to="/profile" className="btn btn-ghost btn-sm">Profile</Link>
            </>
          )}

          {/* Admin Links */}
          {user?.role === "admin" && (
            <>
              <Link to="/admin/dashboard" className="btn btn-ghost btn-sm">Admin Dashboard</Link>
              <Link to="/admin/products" className="btn btn-ghost btn-sm">Manage Products</Link>
              <Link to="/admin/orders" className="btn btn-ghost btn-sm">Orders</Link>
            </>
          )}

          {/* Login / Account */}
          {!user ? (
            // ✅ OTP Login Page
            <Link to="/otp-login" className="btn btn-primary btn-sm">Login</Link>
          ) : (
            <Link to="/profile" className="btn btn-secondary btn-sm">Account</Link>
          )}
        </div>
      </div>

      {/* ROUTES */}
      <div className="p-4 relative z-0">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* ✅ OTP Login public route */}
          <Route path="/otp-login" element={<OtpLogin />} />

          {/* পুরনো login/register রাখতে চাইলে রাখুন */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Order details (user route) */}
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly>
                <AdminProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </LangContext.Provider>
  );
}
