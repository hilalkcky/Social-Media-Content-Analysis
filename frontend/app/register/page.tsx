"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert("Lütfen tüm alanları doldur");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email, 
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Kayıt başarısız");
        return;
      }

      alert("Kayıt başarılı 🎉");
      window.location.href = "/login";

    } catch (err) {
      console.error(err);
      alert("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b1220] text-white">

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

        <h1 className="text-4xl font-bold text-center">
          Kayıt Ol
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Yeni hesap oluştur
        </p>

        <div className="mt-10 space-y-5">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-purple-500"
          />

          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-purple-500"
          />

         

          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-purple-500"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-semibold transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Oluşturuluyor..." : "Kayıt Ol"}
          </button>

        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-blue-400 hover:text-purple-400">
            Giriş Yap
          </Link>
        </p>

      </div>

    </main>
  );
}