"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

const baseLinks: NavLink[] = [
  { href: "/", label: "Anasayfa" },
  { href: "/help", label: "Yardım" },
  { href: "/contact", label: "İletişim" },
];

export default function Navbar() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);


  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("user"));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };


  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setProfileOpen(false);

    window.dispatchEvent(new Event("storage"));
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[#0b1220]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        <Link href="/" className="text-xl font-bold tracking-wide">
          AI Yorum Analizi
        </Link>

        <div className="hidden md:flex items-center gap-8">

          {baseLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm group"
              >
                <span
                  className={`transition ${
                    active ? "text-white font-semibold" : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {link.label}
                </span>

                <span
                  className={`absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 transition-all ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}

     
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white">
                Giriş
              </Link>
              <Link href="/register" className="text-sm text-gray-400 hover:text-white">
                Kayıt Ol
              </Link>
            </>
          ) : (
            <div className="relative">

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
              >
                Profil ▾
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111827] border border-white/10">

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Profil Bilgileri
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                  >
                    Çıkış Yap
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

     
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

      </div>

     
      <div
        className={`md:hidden overflow-hidden transition-all ${
          mobileOpen ? "max-h-96 border-t border-white/10" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-6 py-5">

          {baseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-sm text-gray-400">
                Giriş
              </Link>
              <Link href="/register" className="text-sm text-gray-400">
                Kayıt Ol
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="text-sm text-gray-400">
                Profil
              </Link>

              <button
                onClick={handleLogout}
                className="text-left text-sm text-red-400"
              >
                Çıkış Yap
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}