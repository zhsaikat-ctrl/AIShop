// src/pages/Cart.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Items List */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold mb-2">Shopping Cart</h1>

        {cart.map((item) => (
          <div
            key={item._id}
            className="flex gap-3 bg-base-200 p-3 rounded-xl shadow items-center"
          >
            <div className="w-20 h-20 bg-base-300 rounded-lg overflow-hidden">
              <img
                src={item.image || "https://via.placeholder.com/200"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500 capitalize">
                {item.category}
              </p>
              <p className="font-bold mt-1">${item.price}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Qty:</span>
                <input
                  type="number"
                  min="1"
                  className="input input-sm input-bordered w-16"
                  value={item.qty}
                  onChange={(e) =>
                    updateQty(item._id, Number(e.target.value || 1))
                  }
                />
              </div>
              <button
                className="btn btn-xs btn-error"
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-base-200 p-4 rounded-xl shadow h-fit">
        <h2 className="text-xl font-bold mb-2">Summary</h2>
        <p className="flex justify-between mb-1">
          <span>Items:</span>
          <span>{cart.reduce((sum, i) => sum + i.qty, 0)}</span>
        </p>
        <p className="flex justify-between mb-1">
          <span>Subtotal:</span>
          <span>${total}</span>
        </p>
        <p className="flex justify-between mb-3 text-sm opacity-70">
          <span>Shipping:</span>
          <span>Calculated at checkout</span>
        </p>

        <button
          className="btn btn-primary w-full mb-2"
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </button>

        <button className="btn btn-ghost btn-sm w-full" onClick={clearCart}>
          Clear Cart
        </button>

        <Link to="/" className="btn btn-link btn-sm w-full mt-2">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
