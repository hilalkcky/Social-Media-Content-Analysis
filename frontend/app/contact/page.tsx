"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
  setLoading(true);
  setSuccess(false);
  setError("");

  const response = await fetch(
    "http://127.0.0.1:8000/contact",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  setSuccess(true);

  setForm({
    name: "",
    email: "",
    message: "",
  });

} catch {
  setError("Bir hata oluştu.");
} finally {
  setLoading(false);
}
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">

     
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-100px] top-[-100px] h-[450px] w-[450px] rounded-full bg-blue-500 opacity-25 blur-[140px]" />

        <div className="absolute bottom-[-150px] right-[-100px] h-[450px] w-[450px] rounded-full bg-purple-500 opacity-20 blur-[140px]" />
      </div>


      <section className="flex min-h-screen items-center justify-center px-6 pt-24">

        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

        
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Bize Ulaşın
          </h1>

          <p className="mt-3 text-center text-gray-400">
            Görüş, öneri veya sorunlarınız için bizimle iletişime geçin.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

  
            <div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="İsminiz"
                autoComplete="name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-blue-500"
              />
            </div>

   
            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="E-posta adresiniz"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-blue-500"
              />
            </div>

           
            <div>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Mesajınız"
                rows={6}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-blue-500"
              />
            </div>

     
            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            
            {success && (
              <p className="text-sm text-green-400">
                Mesajınız başarıyla gönderildi ✅
              </p>
            )}

            
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 py-4 font-semibold transition hover:scale-[1.01] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>

          </form>
        </div>
      </section>
    </main>
  );
}