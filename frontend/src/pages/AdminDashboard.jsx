// src/pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";

// Chart.js
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useAuth();
  const token = user?.token;

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    monthlySales: [],   // ✅ always array
    recentOrders: [],   // ✅ always array
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to load stats");
      }

      const data = await res.json();

      // ✅ MERGE default fields so monthlySales never becomes undefined
      setStats((prev) => ({
        ...prev,
        ...data,
        monthlySales: Array.isArray(data.monthlySales) ? data.monthlySales : [],
        recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
      }));
    } catch (err) {
      console.log("Failed to load stats", err);
      setError("Admin stats fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // ✅ token/user change হলে আবার লোড হবে
  }, [token]);

  const chartData = useMemo(() => {
    const labels = stats.monthlySales.map((m) => m.month);
    const values = stats.monthlySales.map((m) => m.total);

    return {
      labels,
      datasets: [
        {
          label: "Sales",
          data: values,
          backgroundColor: "#4F46E5",
          borderRadius: 8,
        },
      ],
    };
  }, [stats.monthlySales]);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ✅ Loading / Error */}
      {loading && (
        <div className="alert alert-info mb-4">
          Loading admin stats...
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-primary text-white rounded-xl shadow-md">
          <h2 className="text-lg">Total Users</h2>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>

        <div className="p-5 bg-success text-white rounded-xl shadow-md">
          <h2 className="text-lg">Total Products</h2>
          <p className="text-3xl font-bold">{stats.products}</p>
        </div>

        <div className="p-5 bg-warning text-white rounded-xl shadow-md">
          <h2 className="text-lg">Total Orders</h2>
          <p className="text-3xl font-bold">{stats.orders}</p>
        </div>

        <div className="p-5 bg-accent text-white rounded-xl shadow-md">
          <h2 className="text-lg">Total Revenue</h2>
          <p className="text-3xl font-bold">${stats.revenue}</p>
        </div>
      </div>

      {/* Sales Graph */}
      <div className="bg-base-200 p-5 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>

        {stats.monthlySales.length === 0 ? (
          <p>No sales data yet.</p>
        ) : (
          <Bar data={chartData} />
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-base-200 p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>

        {stats.recentOrders.length === 0 ? (
          <p>No recent orders found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.user?.name || "Unknown"}</td>
                  <td>${order.total}</td>
                  <td className="capitalize">{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
