// src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AdminProducts() {
  const { user } = useAuth();
  const token = user?.token;

  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // success | error | info

  const showMsg = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
  };

  // ============================
  // Load All Products
  // ============================
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch products error:", err);
      showMsg("Failed to load products", "error");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ============================
  // Cloudinary Image Upload (Admin only)
  // ============================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      showMsg("You are not logged in as admin!", "error");
      return;
    }

    setUploading(true);
    showMsg("Uploading image...", "info");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ MUST HAVE
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      if (data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
        showMsg("Image uploaded successfully!", "success");
      } else {
        showMsg("Image upload failed", "error");
      }
    } catch (err) {
      console.log("Upload error:", err);
      showMsg(err.message || "Upload error", "error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      description: "",
    });
    setEditingId(null);
  };

  // ============================
  // Create or Update Product
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showMsg("You are not logged in as admin!", "error");
      return;
    }

    setLoading(true);
    setMsg("");

    const body = {
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
    };

    const url = editingId
      ? `${API_URL}/products/${editingId}`
      : `${API_URL}/products`;

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      showMsg(editingId ? "Product updated!" : "Product created!", "success");
      fetchProducts();
      resetForm();
    } catch (err) {
      console.log("Save product error:", err);
      showMsg(err.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Edit Product
  // ============================
  const handleEdit = (p) => {
    setEditingId(p._id);

    setForm({
      name: p.name || "",
      category: p.category || "",
      price: p.price ?? "",
      stock: p.stock ?? "",
      image: p.image || "",
      description: p.description || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ============================
  // Delete Product
  // ============================
  const handleDelete = async (id) => {
    if (!token) {
      showMsg("You are not logged in as admin!", "error");
      return;
    }

    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      showMsg("Product deleted", "success");
      fetchProducts();
    } catch (err) {
      console.log("Delete error:", err);
      showMsg(err.message || "Delete failed", "error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin – Manage Products</h1>

      {/* PRODUCT FORM */}
      <div className="bg-base-200 p-4 rounded-xl mb-6 shadow">
        <h2 className="text-xl font-semibold mb-2">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        {msg && (
          <p
            className={`mb-2 ${
              msgType === "error"
                ? "text-error"
                : msgType === "info"
                ? "text-info"
                : "text-success"
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3">
          <input
            name="name"
            className="input input-bordered"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="category"
            className="input input-bordered"
            placeholder="Category (ex: Electronics)"
            value={form.category}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            className="input input-bordered"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            name="stock"
            type="number"
            min="0"
            className="input input-bordered"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
          />

          {/* IMAGE UPLOAD AREA */}
          <div className="md:col-span-2">
            <label className="font-semibold">Product Image</label>

            <input
              type="file"
              className="file-input w-full mt-1"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {uploading && <p className="text-info mt-1">Uploading...</p>}

            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="w-28 h-28 mt-2 rounded-md object-cover border"
              />
            )}
          </div>

          <textarea
            name="description"
            className="textarea textarea-bordered md:col-span-2"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />

          <div className="flex gap-2 md:col-span-2 mt-2">
            <button className="btn btn-primary" disabled={loading || uploading}>
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm} className="btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* PRODUCT TABLE */}
      <h2 className="text-xl font-semibold mb-2">All Products</h2>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price}</td>
                  <td>{p.stock}</td>

                  <td>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="flex gap-2">
                    <button className="btn btn-xs" onClick={() => handleEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
