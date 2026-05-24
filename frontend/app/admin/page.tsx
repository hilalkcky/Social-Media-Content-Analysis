"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminPage() {

  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const user = localStorage.getItem("user");
    if (!user) router.push("/login");

    async function load() {

      const base = "http://127.0.0.1:8000";

      const u = await fetch(`${base}/admin/users`).then(r => r.json());
      setUsers(u.users || []);

      const c = await fetch(`${base}/admin/comments`).then(r => r.json());

      const uniqueComments = Array.from(
        new Map(
          (c.comments || []).map((item: any) => [
            item.text + item.result,
            item
          ])
        ).values()
      );

      setComments(uniqueComments);

      const t = await fetch(`${base}/admin/comment-types`).then(r => r.json());
      setTypes(t.types || []);

      const r = await fetch(`${base}/profile`).then(r => r.json());
      setUrls(r.urls || []);

      setLoading(false);
    }

    load();

  }, []);

  const isNeg = (c: any) =>
    String(c.result).toLowerCase().includes("olumsuz");

  const isPos = (c: any) =>
    String(c.result).toLowerCase().includes("olumlu");

  const makeAdmin = async (id: number, username: string) => {

    await fetch("http://127.0.0.1:8000/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setUsers(prev =>
      prev.map(u => u.id === id ? { ...u, isadmin: 1 } : u)
    );

    alert(`${username} admin yapıldı`);
  };

  const deleteUser = async (id: number) => {

    await fetch(`http://127.0.0.1:8000/user/delete/${id}`, {
      method: "DELETE",
    });

    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const stats = useMemo(() => ({
    total: comments.length,
    positive: comments.filter(isPos).length,
    negative: comments.filter(isNeg).length,
  }), [comments]);

  const userGraph = useMemo(() => {

    const map: any = {};

    comments.forEach(c => {

      const name = c.author || c.YorumSahibi || "Bilinmeyen";

      if (!map[name]) map[name] = { pos: 0, neg: 0 };

      isNeg(c) ? map[name].neg++ : map[name].pos++;
    });

    const labels = Object.keys(map);

    return {
      labels,
      datasets: [
        {
          label: "Olumlu",
          data: labels.map(l => map[l].pos),
          backgroundColor: "rgba(99,102,241,0.8)",
        },
        {
          label: "Olumsuz",
          data: labels.map(l => map[l].neg),
          backgroundColor: "rgba(139,92,246,0.8)",
        }
      ]
    };

  }, [comments]);

  const typeLabels = [
    { key: "nefret", label: "Nefret Söylemi" },
    { key: "mustehcen", label: "Müstehcen" },
    { key: "tehtid", label: "Tehdit" },
    { key: "hakaret", label: "Hakaret" },
    { key: "kimliknefreti", label: "Kimlik Nefreti" },
  ];

  const typeGraph = useMemo(() => {

    const counts = typeLabels.map(t =>
      types.filter((x: any) => x[t.key] === 1).length
    );

    return {
      labels: typeLabels.map(t => t.label),
      datasets: [
        {
          label: "Tür Sayısı",
          data: counts,
          backgroundColor: "rgba(99,102,241,0.8)",
        }
      ]
    };

  }, [types]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#cbd5e1" }
      }
    },
    scales: {
      x: { ticks: { color: "#cbd5e1" } },
      y: { ticks: { color: "#cbd5e1" } }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-white">
        Yükleniyor...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1220] text-white p-10">


      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

   
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 backdrop-blur-xl">

        <h2 className="mb-4 text-xl font-semibold">Kullanıcılar</h2>

        <table className="w-full text-sm">

          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                className="border-t border-white/5"   // 🔥 ÇİZGİLER SİLİK
              >

                <td className="py-3">{u.username}</td>
                <td>{u.email}</td>
                <td>{u.isadmin ? "Admin" : "User"}</td>

                <td className="flex gap-2">

                  {!u.isadmin && (
                    <button
                      onClick={() => makeAdmin(u.id, u.username)}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-sm"
                    >
                      Admin
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-3 py-1 rounded-xl bg-white/10 border border-white/10"
                  >
                    Sil
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </section>

      
      <section className="grid grid-cols-3 gap-4 mb-10">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          Toplam: {stats.total}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          Olumlu: {stats.positive}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          Olumsuz: {stats.negative}
        </div>

      </section>

      
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10">

        <h2 className="mb-4">Yorumlar</h2>

        <table className="w-full text-sm">

          <tbody>
            {comments.map((c, i) => (
              <tr
                key={i}
                className="border-t border-white/5" // 🔥 DAHA SİLİK
              >
                <td>{c.text}</td>
                <td>{c.result}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </section>

      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10">

        <h2 className="mb-4">Yorum Türleri</h2>

        <table className="w-full text-sm">

          <tbody>
            {typeLabels.map(t => (
              <tr
                key={t.key}
                className="border-t border-white/5"
              >
                <td>{t.label}</td>
                <td>{types.filter((x: any) => x[t.key] === 1).length}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </section>

      
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10">

        <h2 className="mb-4">URL’ler</h2>

        <table className="w-full text-sm">

          <tbody>
            {urls.map((u, i) => (
              <tr
                key={i}
                className="border-t border-white/5"
              >
                <td>{u.Url}</td>
                <td>{u.date}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </section>

      <section className="grid grid-cols-2 gap-6">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-64">
          <Bar data={userGraph} options={chartOptions} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-64">
          <Bar data={typeGraph} options={chartOptions} />
        </div>

      </section>

    </main>
  );
}