"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

 useEffect(() => {
  const stored = localStorage.getItem("user");

  if (!stored) {
    router.push("/login");
    return;
  }

  const parsed = JSON.parse(stored);
  setUser(parsed); 
  setUsername(parsed.username);


  fetch(`http://localhost:8000/user/email?username=${parsed.username}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setEmail(data.email);
      }
    });

}, []);


  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/profile");
      const data = await res.json();

      setHistory(data.urls || []);
    } catch (err) {
      console.error("History error:", err);
    }
  };


const handleSave = async () => {
  if (!user) {
    alert("Kullanıcı bulunamadı");
    return;
  }

  const updatedUser = {
    ...user,
    username,
    email,
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));
  setUser(updatedUser);

  await fetch("http://localhost:8000/user/update", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: user.id,
    username,
    email,
  }),
});

  alert("Profil güncellendi 🎉");
};


  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#0b1220] text-white p-10">

      <h1 className="text-4xl font-bold mb-10">
        👤 Profil Paneli
      </h1>

      <div className="grid md:grid-cols-2 gap-8">


        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">

          <h2 className="text-xl font-semibold">
            Kullanıcı Bilgileri
          </h2>

          
          <div>
            <p className="text-gray-400 text-sm">Kullanıcı Adı</p>

            {editMode ? (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl bg-black/30 border border-white/10"
              />
            ) : (
              <p className="text-lg">{username}</p>
            )}
          </div>

     
          <div>
            <p className="text-gray-400 text-sm">E-posta</p>

            {editMode ? (
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl bg-black/30 border border-white/10"
              />
            ) : (
              <p className="text-lg">{email}</p>
            )}
          </div>

          
          <div>
            <p className="text-gray-400 text-sm">Şifre</p>
            <p className="text-lg">••••••••</p>
          </div>


          <div className="flex gap-3 pt-4">

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-5 py-2 rounded-xl bg-blue-600"
              >
                Düzenle
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-green-600"
                >
                  Kaydet
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  className="px-5 py-2 rounded-xl bg-gray-600"
                >
                  İptal
                </button>
              </>
            )}

            

          </div>

        </div>


      </div>
    </main>
  );
}