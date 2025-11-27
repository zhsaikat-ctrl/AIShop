// src/pages/OrderDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_STEPS = ["pending", "processing", "shipped", "completed"];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const authToken = token || user?.token;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchOrder = async () => {
    if (!authToken) {
      setMsg("Login required");
      setLoading(false);
      return;
    }

    try {
      setMsg("");
      const res = await fetch(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Order not found");
      setOrder(data);
    } catch (err) {
      console.log("Order details error:", err);
      setMsg(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, authToken]);

  if (loading) return <p className="text-center mt-6">Loading order...</p>;
  if (!order) return <p className="text-center mt-6 text-error">{msg || "Order not found."}</p>;

  const currentIndex = STATUS_STEPS.indexOf(order.status);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline">
          ← Back
        </button>
      </div>

      {/* Order Info Card */}
      <div className="bg-base-200 p-4 rounded-xl shadow space-y-1">
        <p className="text-sm text-gray-500">
          Order ID: <span className="font-mono">{order._id}</span>
        </p>

        <p>
          <span className="font-semibold">Placed on:</span>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>

        <p>
          <span className="font-semibold">Total:</span>{" "}
          ${Number(order.totalPrice || 0).toFixed(2)}
        </p>

        <p className="flex items-center gap-2">
          <span className="font-semibold">Payment:</span>
          <span className={`badge ${order.isPaid ? "badge-success" : "badge-warning"}`}>
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>
        </p>

        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="badge badge-outline capitalize">{order.status}</span>
        </p>
      </div>

      {/* Shipping Info */}
      {order.shippingAddress && (
        <div className="bg-base-200 p-4 rounded-xl shadow space-y-1">
          <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
          <p><span className="font-semibold">Name:</span> {order.shippingAddress.fullName}</p>
          <p><span className="font-semibold">Phone:</span> {order.shippingAddress.phone}</p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.district}{" "}
            {order.shippingAddress.postalCode && `- ${order.shippingAddress.postalCode}`},{" "}
            {order.shippingAddress.country}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-base-200 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Order Status</h2>

        <div className="flex items-center justify-between gap-2">
          {STATUS_STEPS.map((step, idx) => {
            const active = idx <= currentIndex;
            return (
              <div key={step} className="flex-1 flex flex-col items-center">
                <div
                  className={
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " +
                    (active ? "bg-primary text-white" : "bg-base-300 text-gray-500")
                  }
                >
                  {idx + 1}
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-center">
                  {step}
                </p>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={
                      "h-[2px] w-full mt-2 " +
                      (active ? "bg-primary" : "bg-base-300")
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="bg-base-200 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Items</h2>

        {items.length === 0 ? (
          <p>No items.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it, idx) => {
              // populated product বা snapshot দুইভাবেই সাপোর্ট
              const name = it.product?.name || it.name || "Product";
              const image = it.product?.image || it.image || "";
              const price = Number(it.price) || 0;
              const qty = Number(it.qty) || 1;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-base-300 p-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {image && (
                      <img
                        src={image}
                        alt={name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {qty} × ${price}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">${(qty * price).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        )}

        <Link to="/dashboard" className="btn btn-link btn-sm px-0 mt-3">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
