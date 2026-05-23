"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Shirt } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-xl">
            <Shirt className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-primary-900">
            CuciSepatu<span className="text-primary-500">.id</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-gray-600 hover:text-primary-600 transition">Layanan</a>
          <a href="#how" className="text-gray-600 hover:text-primary-600 transition">Cara Kerja</a>
          <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition">Harga</a>
          <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition">Testimoni</a>
          <Link href="/auth/login" className="text-primary-600 font-medium hover:text-primary-700 transition">
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary-600 text-white px-5 py-2 rounded-full font-medium hover:bg-primary-700 transition shadow-md"
          >
            Daftar Gratis
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4">
          <a href="#services" className="text-gray-600">Layanan</a>
          <a href="#how" className="text-gray-600">Cara Kerja</a>
          <a href="#pricing" className="text-gray-600">Harga</a>
          <a href="#testimonials" className="text-gray-600">Testimoni</a>
          <Link href="/auth/login" className="text-primary-600 font-medium">Masuk</Link>
          <Link href="/auth/register" className="bg-primary-600 text-white text-center px-5 py-2 rounded-full font-medium">
            Daftar Gratis
          </Link>
        </div>
      )}
    </nav>
  );
}