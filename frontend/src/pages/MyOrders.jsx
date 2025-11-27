// src/pages/MyOrders.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/my`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log("My orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Loading your orders...</p>;

  if (!orders.length)
    return <p>You have no orders yet.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-base-200 p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm text-gray-500">
                Order ID: <span className="font-mono">{o._id.slice(-8)}</span>
              </p>
              <p className="text-sm">
                Date:{" "}
                {new Date(o.createdAt).toLocaleString()}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Total:</span> ${o.total}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Status:</span>{" "}
                <span className="badge badge-outline">{o.status}</span>
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <p className="text-sm">
                <span className="font-semibold">Items:</span>{" "}
                {o.items?.length || 0}
              </p>
              <Link
                to={`/orders/${o._id}`}
                className="btn btn-sm btn-primary"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
