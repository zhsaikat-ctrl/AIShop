// src/pages/Payment.jsx
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { API_URL } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Payment() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setMsg("Creating payment...");

    try {
      // 1️⃣ Create payment intent
      const intentRes = await fetch(`${API_URL}/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ amount: total }),
      });

      const { clientSecret } = await intentRes.json();

      // 2️⃣ Confirm Stripe Card Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setMsg(result.error.message);
        setLoading(false);
        return;
      }

      // SUCCESS 🎉
      setMsg("Payment successful! Placing order...");

      // 3️⃣ Create Order in Backend
      const orderRes = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          items: cart,
          total,
        }),
      });

      if (!orderRes.ok) {
        setMsg("Order creation failed.");
        setLoading(false);
        return;
      }

      clearCart();
      navigate("/my-orders", { state: { success: true } });
    } catch (err) {
      setMsg("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-6 bg-base-200 p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Stripe Payment</h1>

      <p className="mb-4">
        <span className="font-semibold">Total Amount:</span> ${total}
      </p>

      <div className="bg-base-300 p-3 rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      {msg && <p className="text-info mt-3">{msg}</p>}

      <button
        onClick={handlePayment}
        className="btn btn-primary w-full mt-4"
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
