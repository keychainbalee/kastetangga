"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Transparansi Kas", href: "/kas" },
    { name: "Tentang RT", href: "/tentang" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-sky-500 text-white shadow-sm border-b border-sky-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo RT */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white text-sky-600 font-extrabold flex items-center justify-center text-sm shadow-xs">
            RT
          </div>
          <div>
            <span className="font-bold text-white text-sm sm:text-base leading-tight block">
              WargaKas RT 05
            </span>
            <span className="text-[11px] text-sky-100 block">RW 02 Kelurahan Asri</span>
          </div>
        </Link>

        {/* Menu Desktop (Layar Tablet & Laptop) */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-sky-600 font-bold shadow-xs"
                    : "text-sky-100 hover:text-white hover:bg-sky-600/70"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="md:hidden p-2 rounded-lg bg-sky-600/80 hover:bg-sky-600 text-white focus:outline-hidden"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu Dropdown HP (Melayang di atas halaman, warna sama dengan navbar) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-sky-500 border-b border-sky-400 shadow-xl px-4 py-3 space-y-1.5 animate-slide-down">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-sky-600 font-bold shadow-xs"
                    : "text-sky-100 hover:bg-sky-600/70 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}