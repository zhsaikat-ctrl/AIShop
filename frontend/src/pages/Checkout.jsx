// src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ shipping form state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Bangladesh",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [msg, setMsg] = useState("");
  const [lastOrderId, setLastOrderId] = useState(null); // ✅ same order reused for 2 payment buttons

  // ✅ require login (OTP login route এ পাঠাবেন)
  useEffect(() => {
    if (!user) {
      navigate("/otp-login", { state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  // ✅ autofill from profile if exists
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user?.address?.fullName || user?.name || "",
        phone: user?.phone || "",
        street: user?.address?.street || "",
        city: user?.address?.city || "",
        district: user?.address?.district || "",
        postalCode: user?.address?.postalCode || "",
        country: user?.address?.country || "Bangladesh",
      }));
    }
  }, [user]);

  const onChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (!form.fullName.trim()) return "Full name required";
    if (!form.phone.trim()) return "Phone required";
    if (!form.street.trim()) return "Street/address required";
    if (!form.city.trim()) return "City required";
    if (!form.district.trim()) return "District required";
    return "";
  };

  // ✅ save address/phone to profile
  const saveProfileInfo = async () => {
    if (!user?.token) return;
    setSavingProfile(true);
    setMsg("");

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          phone: form.phone,
          address: {
            fullName: form.fullName,
            street: form.street,
            city: form.city,
            district: form.district,
            postalCode: form.postalCode,
            country: form.country,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Profile update failed");
      setUser(data); // AuthContext sync
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // ✅ Create order once, reuse for both Stripe & SSLCOMMERZ
  const createOrderIfNeeded = async () => {
    if (lastOrderId) return lastOrderId;

    const orderRes = await fetch(`${API_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        items: cart.map((i) => ({
          product: i._id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
        })),
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          street: form.street,
          city: form.city,
          district: form.district,
          postalCode: form.postalCode,
          country: form.country,
        },
        totalPrice: total,
        paymentMethod: "pending",
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.message || "Order create failed");

    setLastOrderId(orderData._id);
    return orderData._id;
  };

  // ✅ Stripe payment
  const handleStripePayment = async () => {
    if (!user || cart.length === 0) return;

    const err = validate();
    if (err) return setMsg(err);

    setPlacingOrder(true);
    setMsg("");

    try {
      // 1) create order if not exists
      const orderId = await createOrderIfNeeded();

      // 2) save profile for next time autofill
      await saveProfileInfo();

      // 3) Stripe checkout session
      const payRes = await fetch(`${API_URL}/pay/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          items: cart,
          orderId,
          userId: user._id,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.message || "Stripe session failed");

      window.location.href = payData.url;
    } catch (e) {
      setMsg(e.message);
      setPlacingOrder(false);
    }
  };

  // ✅ SSLCOMMERZ payment
  const handleSslPayment = async () => {
    if (!user || cart.length === 0) return;

    const err = validate();
    if (err) return setMsg(err);

    setPlacingOrder(true);
    setMsg("");

    try {
      // 1) create order if not exists
      const orderId = await createOrderIfNeeded();

      // 2) save profile for next time autofill
      await saveProfileInfo();

      // 3) SSLCOMMERZ init
      const res = await fetch(`${API_URL}/pay/sslcommerz/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "SSLC init failed");

      window.location.href = data.url;
    } catch (e) {
      setMsg(e.message);
      setPlacingOrder(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {msg && <p className="text-error">{msg}</p>}

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {/* ✅ Shipping Form */}
          <div className="bg-base-200 p-4 rounded-xl space-y-3">
            <h2 className="text-xl font-semibold">Shipping Details</h2>

            <input
              className="input input-bordered w-full"
              placeholder="Full Name"
              value={form.fullName}
              onChange={onChange("fullName")}
            />
            <input
              className="input input-bordered w-full"
              placeholder="Mobile Number"
              value={form.phone}
              onChange={onChange("phone")}
            />
            <input
              className="input input-bordered w-full"
              placeholder="Street / Village / House"
              value={form.street}
              onChange={onChange("street")}
            />

            <div className="grid md:grid-cols-2 gap-2">
              <input
                className="input input-bordered w-full"
                placeholder="City / Upazila"
                value={form.city}
                onChange={onChange("city")}
              />
              <input
                className="input input-bordered w-full"
                placeholder="District"
                value={form.district}
                onChange={onChange("district")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <input
                className="input input-bordered w-full"
                placeholder="Postal Code"
                value={form.postalCode}
                onChange={onChange("postalCode")}
              />
              <input
                className="input input-bordered w-full"
                placeholder="Country"
                value={form.country}
                onChange={onChange("country")}
              />
            </div>

            <p className="text-sm opacity-70">
              এই তথ্যগুলো আপনার প্রোফাইলে সেভ হবে যেন পরেরবার আবার দিতে না হয়।
            </p>
          </div>

          {/* ✅ Order Summary */}
          <div className="bg-base-200 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Order Summary</h2>

            {cart.map((item) => (
              <div key={item._id} className="flex justify-between mb-2">
                <span>{item.name} × {item.qty}</span>
                <span>${item.price * item.qty}</span>
              </div>
            ))}

            <hr className="my-2" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${total}</span>
            </div>
          </div>

          {/* ✅ Two payment options */}
          <div className="grid md:grid-cols-2 gap-3">
            <button
              className="btn btn-primary w-full text-lg"
              onClick={handleStripePayment}
              disabled={placingOrder || savingProfile}
            >
              {placingOrder ? "Processing..." : "Pay with Stripe"}
            </button>

            <button
              className="btn btn-success w-full text-lg"
              onClick={handleSslPayment}
              disabled={placingOrder || savingProfile}
            >
              {placingOrder ? "Processing..." : "Pay with SSLCOMMERZ"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
