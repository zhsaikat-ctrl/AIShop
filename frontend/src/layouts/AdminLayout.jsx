// src/layouts/AdminLayout.jsx
import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const location = useLocation();

  const menu = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/products", label: "Products", icon: "📦" },
    { path: "/admin/orders", label: "Orders", icon: "🧾" },
  ];

  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-4">
      {/* Sidebar */}
      <aside className="bg-base-200 rounded-2xl p-4 h-fit md:h-[calc(100vh-120px)] sticky top-16">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🛠</span> Admin Panel
        </h2>

        <ul className="menu">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={active ? "active font-semibold" : ""}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
