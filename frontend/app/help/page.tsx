"use client";

import { useState } from "react";

type FAQ = {
  q: string;
  a: string;
};

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      q: "Bu uygulamayı nasıl kullanabiliriz?",
      a: `Kayıt oluşturduktan sonra giriş yapınız.
URL’yi kopyalayıp ana sayfadaki alana yapıştırınız.
İncele butonuna bastıktan sonra rapor ekranı gelir.`,
    },
    {
      q: "URL'yi nasıl alabiliriz?",
      a: "İlgili gönderiye gidip tarayıcıdaki linki kopyalayabilirsiniz.",
    },
    {
      q: "Hangi sosyal medya ortamlarını inceleyebiliriz?",
      a: "TikTok ve YouTube yorum analizleri yapılabilir.",
    },
    {
      q: "Raporu yazdırabilir miyiz?",
      a: "Tarayıcıdan Print seçeneği ile PDF olarak indirebilirsiniz.",
    },
    {
      q: "Günlük kullanım sınırı var mı?",
      a: "Hayır, herhangi bir kullanım limiti yoktur.",
    },
    {
      q: "Kullanıcı adı ve şifre nasıl değiştirilir?",
      a: "Kullanıcı bilgileri panelinden değiştirebilirsiniz.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">

    
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-100px] top-[-100px] h-[450px] w-[450px] rounded-full bg-blue-500 opacity-25 blur-[140px]" />

        <div className="absolute bottom-[-150px] right-[-100px] h-[450px] w-[450px] rounded-full bg-purple-500 opacity-20 blur-[140px]" />
      </div>

     
      <section className="flex min-h-screen items-center justify-center px-6 pt-24">

        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

         
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Sıkça Sorulan Sorular
          </h1>

          <p className="mt-3 text-center text-gray-400">
            Yardım almak için aşağıdaki soruları inceleyin.
          </p>

         
          <div className="mt-10 space-y-4">

            {faqs.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-lg"
                >

                  
                  <button
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/5"
                  >
                    <span className="text-sm font-medium md:text-base">
                      {item.q}
                    </span>

                    <span
                      className={`text-xl transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                
                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-gray-300 whitespace-pre-line">
                        {item.a}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </section>
    </main>
  );
}