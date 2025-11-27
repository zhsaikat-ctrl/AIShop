// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../api";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { addToCart } = useCart();

  // ✅ ছোট Toast state
  const [toast, setToast] = useState("");

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 1200);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error loading products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuickViewProduct(null);
    fetchProducts();
  }, []);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const filtered = products
    .filter((p) =>
      categoryFilter === "all" ? true : p.category === categoryFilter
    )
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase().trim())
    )
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="pb-20 space-y-8">

      {/* HERO */}
      <section className="w-full">
        <div className="hero min-h-[320px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <img
              src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800"
              className="max-w-sm rounded-2xl shadow-2xl hidden md:block"
              alt="Hero"
            />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Smart Shopping with AIShop
              </h1>
              <p className="py-4 opacity-90">
                Discover modern gadgets, electronics and more with a clean,
                minimal shopping experience.
              </p>
              <Link to="/cart" className="btn btn-secondary">
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="bg-base-200 p-4 rounded-2xl shadow flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <select
            className="select select-bordered select-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Browse Products</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="skeleton h-52 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p>No products match your search.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="card bg-base-100 shadow-md hover:shadow-xl transition rounded-2xl border"
              >
                <figure className="h-36 bg-base-200 overflow-hidden rounded-t-2xl">
                  <img
                    src={p.image || "https://via.placeholder.com/200"}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-110 transition"
                  />
                </figure>

                <div className="card-body p-3">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="font-semibold text-sm line-clamp-1">
                      {p.name}
                    </h3>
                    <span className="badge badge-outline capitalize text-[10px]">
                      {p.category}
                    </span>
                  </div>

                  <p className="font-bold text-lg mt-1">${p.price}</p>

                  <div className="card-actions justify-between mt-2">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(p);
                      }}
                    >
                      Quick View
                    </button>

                    <button
                      className="btn btn-xs btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                        showToast("Added to cart!");
                      }}
                    >
                      Add
                    </button>
                  </div>

                  <Link
                    to={`/product/${p._id}`}
                    className="btn btn-link btn-xs px-0 mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Full details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct?._id && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="bg-base-100 rounded-2xl p-4 max-w-lg w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">
                {quickViewProduct.name}
              </h3>
              <button
                className="btn btn-xs btn-circle"
                onClick={() => setQuickViewProduct(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-40 bg-base-200 rounded-xl overflow-hidden">
                <img
                  src={quickViewProduct.image || "https://via.placeholder.com/300"}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="badge badge-outline capitalize mb-1">
                  {quickViewProduct.category}
                </p>
                <p className="text-2xl font-bold mb-2">
                  ${quickViewProduct.price}
                </p>
                <p className="text-sm opacity-80 mb-3 line-clamp-3">
                  {quickViewProduct.description || "No description."}
                </p>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                      showToast("Added to cart!");
                    }}
                  >
                    Add to Cart
                  </button>

                  <Link
                    to={`/product/${quickViewProduct._id}`}
                    className="btn btn-outline btn-sm"
                    onClick={() => setQuickViewProduct(null)}
                  >
                    View Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded-xl shadow z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
