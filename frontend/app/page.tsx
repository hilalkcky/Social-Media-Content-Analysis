"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidUrl = (value: string) => {
    return (
      value.includes("youtube.com") ||
      value.includes("youtu.be") ||
      value.includes("tiktok.com")
    );
  };

  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;

    if (!isValidUrl(text)) {
      alert("Sadece YouTube veya TikTok URL giriniz");
      return;
    }

    const analysisCount = Number(localStorage.getItem("analysisCount") || "0");
    const user = localStorage.getItem("user");

    if (analysisCount >= 1 && !user) {
      alert("1 ücretsiz analiz hakkınız doldu. Lütfen kayıt olun.");
      window.location.href = "/register";
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: text }),
      });

      const data = await res.json();

      localStorage.setItem("analysisResult", JSON.stringify(data));

      
      const newCount = analysisCount + 1;
      localStorage.setItem("analysisCount", newCount.toString());

      window.location.href = "/analysis";

    } catch (err) {
      console.error(err);
      alert("Backend hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[450px] w-[450px] rounded-full bg-blue-500 opacity-25 blur-[140px]" />
        <div className="absolute bottom-[-150px] right-[-120px] h-[450px] w-[450px] rounded-full bg-purple-500 opacity-20 blur-[140px]" />
      </div>

      {/* CONTENT */}
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">

        <h1 className="max-w-4xl text-4xl font-bold md:text-6xl">
          Olumsuz Yorumları
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {" "}Anında{" "}
          </span>
          Tespit Edin
        </h1>

        <p className="mt-6 max-w-2xl text-gray-400">
          YouTube ve TikTok yorumlarını yapay zeka ile analiz edin.
        </p>

        {/* INPUT BOX */}
        <div className="mt-12 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="YouTube veya TikTok URL giriniz..."
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 font-semibold transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Analiz ediliyor..." : "İncele"}
          </button>

        </div>

      </section>

    </main>
  );
}