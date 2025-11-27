// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api";

export default function Dashboard() {
  const { user, token } = useAuth();
  const authToken = token || user?.token; // ✅ compatible

  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !authToken) return;

      try {
        setError(null);

        if (user.role === "admin") {
          const res = await fetch(`${API_URL}/admin/overview`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Admin overview fetch failed");
          setOverview(data);
        } else {
          setLoadingOrders(true);
          const res = await fetch(`${API_URL}/orders/my`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Orders fetch failed");
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    load();
  }, [user, authToken]);

  if (!user) {
    return <div className="p-6 text-center">Please login.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Welcome, {user?.name || "User"}
      </h1>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* ================= ADMIN ================= */}
      {user?.role === "admin" ? (
        <>
          <h2 className="text-xl font-semibold">Admin Overview</h2>

          {!overview ? (
            <p>Loading overview...</p>
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              <div className="stat bg-base-200 p-4 rounded-xl">
                <div className="stat-title">Users</div>
                <div className="stat-value">{overview?.users ?? "-"}</div>
              </div>

              <div className="stat bg-base-200 p-4 rounded-xl">
                <div className="stat-title">Products</div>
                <div className="stat-value">{overview?.products ?? "-"}</div>
              </div>

              <div className="stat bg-base-200 p-4 rounded-xl">
                <div className="stat-title">Orders</div>
                <div className="stat-value">{overview?.orders ?? "-"}</div>
              </div>

              <div className="stat bg-base-200 p-4 rounded-xl">
                <div className="stat-title">Revenue</div>
                <div className="stat-value">
                  ${overview?.revenue?.toFixed?.(2) ?? "0.00"}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ================= USER ================= */
        <>
          <h2 className="text-xl font-semibold">Your Orders</h2>

          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const itemCount =
                  Array.isArray(o.items)
                    ? o.items.reduce((sum, it) => sum + (Number(it.qty) || 1), 0)
                    : 0;

                return (
                  <div
                    key={o._id}
                    className="bg-base-200 p-3 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm opacity-70">
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                      <span className="font-semibold">
                        Items: {itemCount}
                      </span>
                    </div>

                    <div className="flex flex-col md:items-end">
                      <span className="font-bold text-lg">
                        ${Number(o.totalPrice || 0).toFixed(2)}
                      </span>
                      <span
                        className={`badge ${
                          o.isPaid ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {o.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>

                    <div className="flex flex-col md:items-end">
                      <span className="capitalize">
                        Status: {o.status}
                      </span>

                      {/* ভবিষ্যতে OrderDetails পেজ বানালে এটা কাজে লাগবে */}
                      <Link
                        to={`/orders/${o._id}`}
                        className="btn btn-link btn-xs px-0"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
