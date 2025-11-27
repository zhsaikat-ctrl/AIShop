// src/pages/Profile.jsx
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api";
import { useState } from "react";

export default function Profile() {
  const { user, login } = useAuth(); // login() used to refresh updated user
  const token = user?.token;

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // ============================
  // Upload Avatar to Cloudinary
  // ============================
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading photo...");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.url) {
      setAvatar(data.url);
      setMessage("Photo uploaded!");
    } else {
      setMessage("Upload failed!");
    }

    setUploading(false);
  };

  // ============================
  // Save Profile (name + avatar)
  // ============================
  const handleSave = async () => {
    setMessage("Saving...");

    const res = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, avatar }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Update failed!");
    } else {
      login(data); // refresh context
      setMessage("Profile updated!");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 bg-base-200 p-6 rounded-xl shadow">
      
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      {message && (
        <p className="mb-3 text-sm text-info font-semibold">{message}</p>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center mb-4">
        <div className="avatar">
          <div className="w-28 rounded-full ring ring-primary ring-offset-base-200 ring-offset-2">
            <img src={avatar || "/default-avatar.png"} alt="avatar" />
          </div>
        </div>

        <label className="btn btn-sm mt-3">
          Upload New Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </label>

        {uploading && <p className="text-sm mt-1 text-info">Uploading...</p>}
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="font-semibold">Name</label>
        <input
          className="input input-bordered w-full mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Email (read-only) */}
      <div className="mb-4">
        <label className="font-semibold">Email</label>
        <input
          className="input input-bordered w-full mt-1 bg-base-300"
          value={user?.email}
          disabled
        />
      </div>

      <button
        onClick={handleSave}
        className="btn btn-primary w-full"
        disabled={uploading}
      >
        Save Profile
      </button>
    </div>
  );
}
