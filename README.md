# AIShop 🛍️🤖  
AI-powered full-stack e-commerce platform where admins can auto-generate product metadata (English + Bangla) using OpenAI, manage inventory/orders, and users can shop with cart, wishlist, OTP/JWT login, and pay via Stripe or SSLCommerz.

---

## ✨ Features

### 👤 User Side
- ✅ Register / Login with JWT
- ✅ OTP Login via Email
- ✅ Browse Products + Product Details
- ✅ Search / Filter Products
- ✅ Add to Cart & Update Quantity
- ✅ Wishlist (Add/Remove)
- ✅ Checkout Flow
- ✅ Order Placement & Order History
- ✅ Payment:
  - Stripe (International)
  - SSLCommerz (Bangladesh)

### 🧑‍💼 Admin Side
- ✅ Admin Login + Protected Routes
- ✅ Admin Dashboard
- ✅ Add / Edit / Delete Products
- ✅ Upload Product Images (Cloudinary)
- ✅ Manage Orders (view, status)
- ✅ Manage Users (basic control)

### 🤖 AI Features
- ✅ AI Product Meta Generator:
  - title_en, title_bn  
  - description_en, description_bn  
  - category suggestion  
  - price suggestion  
- Implemented in: `backend/shop/ai_utils.py`  
- API key loaded securely from `.env`.

---

## 🧰 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS + DaisyUI
- React Router DOM
- Context API (Auth, Cart, Wishlist)
- Axios
- Chart.js

**Backend**
- Node.js + Express
- JWT Authentication
- Mongoose (MongoDB)
- Nodemailer (OTP Email)
- Multer (file handling)
- Django/Python modules (`shop`, `authapp`) for AI + structured services

**Database**
- MongoDB (main)
- SQLite (Django local dev only; ignored by git)

**3rd-Party Services**
- OpenAI API (AI meta generation)
- Cloudinary (image upload/CDN)
- Stripe (payments)
- SSLCommerz (payments)

---

## 📁 Project Structure
```bash
AIShop/
 ├─ backend/
 │   ├─ server.js               # Node/Express entry
 │   ├─ package.json
 │   ├─ config/                 # DB, Cloudinary config
 │   ├─ routes/                 # auth/products/orders/payments
 │   ├─ models/                 # Mongoose models
 │   ├─ middleware/
 │   ├─ utils/
 │   ├─ manage.py               # Django entry
 │   ├─ aishop/                 # Django project
 │   ├─ shop/                   # Django app (AI utils etc.)
 │   └─ authapp/                # Django auth app
 │
 ├─ frontend/
 │   ├─ src/
 │   ├─ package.json
 │   ├─ vite.config.js
 │   └─ tailwind.config.js
 │
 ├─ .gitignore
 └─ README.md
