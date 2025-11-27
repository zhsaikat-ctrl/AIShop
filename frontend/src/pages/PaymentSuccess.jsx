import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const markPaid = async () => {
      if (!user?.token) {
        setMsg("Login required to confirm payment.");
        setLoading(false);
        return;
      }
      if (!orderId) {
        setMsg("Order ID not found.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/orders/${orderId}/pay`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            paymentResult: {
              status: "paid",
              id: orderId,
              email_address: user.email,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Payment update failed");

        clearCart();          // ✅ cart empty after success
        setPaid(true);
        setMsg("Payment successful and order confirmed!");
      } catch (e) {
        setMsg(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    markPaid();
  }, [user?.token, orderId, clearCart, user?.email]);

  // যদি user না থাকে, 1–2 সেকেন্ড পরে login-এ পাঠিয়ে দিচ্ছি
  useEffect(() => {
    if (!user && !loading) {
      const t = setTimeout(() => navigate("/login"), 1200);
      return () => clearTimeout(t);
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 px-4">
      <div className="bg-base-100 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">

        {loading ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Confirming payment...</h1>
            <p className="text-base-content/70">
              Please wait a moment.
            </p>
          </>
        ) : paid ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="bg-success text-white w-20 h-20 flex items-center justify-center rounded-full shadow-lg">
                <span className="text-4xl">✔</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-success mb-2">
              Payment Successful! 🎉
            </h1>

            <p className="text-base-content/70 mb-2">
              {msg}
            </p>

            <p className="text-sm opacity-70 mb-6">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <Link to="/" className="btn btn-primary w-full">
                Back to Home
              </Link>

              <Link to="/dashboard" className="btn btn-outline w-full">
                View Orders
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="bg-error text-white w-20 h-20 flex items-center justify-center rounded-full shadow-lg">
                <span className="text-4xl">!</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-error mb-2">
              Payment Confirmation Failed
            </h1>

            <p className="text-base-content/70 mb-6">
              {msg}
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <Link to="/checkout" className="btn btn-primary w-full">
                Back to Checkout
              </Link>

              <Link to="/" className="btn btn-outline w-full">
                Home
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
