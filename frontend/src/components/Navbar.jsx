import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LangContext } from "../App";

export default function Navbar({ setLang, lang }) {
  const t = (en, bn) => (lang === "en" ? en : bn);

  return (
    <div className="navbar bg-base-200 shadow-md px-4">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold">
          AIShop
        </Link>
      </div>

      <div className="flex gap-3">

        {/* Language Switch */}
        <select
          className="select select-sm select-bordered"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>

        <Link to="/" className="btn btn-ghost btn-sm">
          {t("Home", "হোম")}
        </Link>

        <Link to="/cart" className="btn btn-ghost btn-sm">
          {t("Cart", "কার্ট")}
        </Link>

        <Link to="/dashboard" className="btn btn-ghost btn-sm">
          {t("Dashboard", "ড্যাশবোর্ড")}
        </Link>

        <Link to="/profile" className="btn btn-ghost btn-sm">
          {t("Profile", "প্রোফাইল")}
        </Link>

        <Link to="/login" className="btn btn-primary btn-sm">
          {t("Login", "লগইন")}
        </Link>
      </div>
    </div>
  );
}
