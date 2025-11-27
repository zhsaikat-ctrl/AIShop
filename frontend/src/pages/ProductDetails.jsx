// src/pages/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { add, remove, wishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const isWishlisted = wishlist?.some((w) => w.product?._id === id);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setMsg("");
      const res = await fetch(`${API_URL}/products/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load product");

      setProduct(data);
    } catch (err) {
      console.log("Fetch product error:", err);
      setMsg(err.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // REVIEW STATES
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Login required");

    try {
      setReviewMsg("");
      const res = await fetch(`${API_URL}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(reviewForm),
      });

      const d = await res.json();

      if (!res.ok) {
        setReviewMsg(d.message || "Failed");
      } else {
        setReviewMsg("Review added!");
        setReviewForm({ rating: 5, comment: "" });
        fetchProduct();
      }
    } catch (err) {
      console.log("Review submit error:", err);
      setReviewMsg("Review submit failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!product?._id) {
    return (
      <div className="max-w-5xl mx-auto mt-10">
        <button
          className="btn btn-sm btn-outline mb-4"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <p className="text-error">{msg || "Product not found."}</p>
      </div>
    );
  }

  const reviews = product.reviews || [];
  const rating = Number(product.rating || 0);
  const numReviews = Number(product.numReviews || reviews.length || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button className="btn btn-sm btn-outline" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        <img
          src={product.image || "https://via.placeholder.com/600x400"}
          alt={product.name}
          className="rounded-xl w-full h-96 object-cover shadow"
        />

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl font-semibold text-primary">
            ${product.price}
          </p>
          <p className="mt-3">{product.description || "No description."}</p>

          <button
            className="btn btn-outline mt-4"
            onClick={() =>
              isWishlisted ? remove(product._id) : add(product._id)
            }
          >
            {isWishlisted ? "💔 Remove from Wishlist" : "❤️ Add to Wishlist"}
          </button>

          <button
            className="btn btn-primary mt-3"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="bg-base-200 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Reviews ({numReviews}) – ⭐ {rating.toFixed(1)}
        </h2>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="bg-base-300 p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="font-bold">{r.name}</span>
                  <span>⭐ {r.rating}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {user && (
          <form onSubmit={submitReview} className="mt-6 space-y-3">
            {reviewMsg && <p className="text-info">{reviewMsg}</p>}

            <select
              className="select select-bordered"
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  rating: Number(e.target.value),
                })
              }
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Stars
                </option>
              ))}
            </select>

            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Write a comment..."
              rows={3}
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
            />

            <button className="btn btn-primary">Submit Review</button>
          </form>
        )}
      </div>
    </div>
  );
}
