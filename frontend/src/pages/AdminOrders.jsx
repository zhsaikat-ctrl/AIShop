// src/pages/AdminOrders.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function AdminOrders() {
  const { user } = useAuth();
  const token = user?.token;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.log("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ============================
  // Change Order Status
  // ============================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/orders/status/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === id ? { ...ord, status } : ord
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (loading) return <p>Loading orders...</p>;

  if (!orders.length)
    return <p className="text-center mt-4">No orders found.</p>;

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Admin – Orders</h1>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>User</th>
              <th>Total</th>
              <th>Items</th>
              <th>Status</th>
              <th>Placed</th>
              <th>Update</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>
                  {o.user?.name}
                  <br />
                  <span className="text-xs text-gray-400">
                    {o.user?.email}
                  </span>
                </td>

                <td>${o.total}</td>

                <td>{o.items.length}</td>

                <td>
                  <span className="badge badge-outline">{o.status}</span>
                </td>

                <td>
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>

                {/* STATUS UPDATE DROPDOWN */}
                <td>
                  <select
                    className="select select-sm select-bordered"
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                {/* VIEW ORDER DETAILS */}
                <td>
                  <Link
                    to={`/orders/${o._id}`}
                    className="btn btn-sm btn-primary"
                  >
                    View
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
