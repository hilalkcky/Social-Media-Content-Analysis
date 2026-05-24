"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalysisPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const result = localStorage.getItem("analysisResult");
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login");
      return;
    }

    if (result) {
       const parsed = JSON.parse(result);
       console.log(parsed.comments);

       setData(parsed);

    }
  }, [router]);


  const isTrue = (val: any) => {
    return val === 1 || val === true || val === "1";
  };

  const toYesNo = (val: any) => (isTrue(val) ? "Evet" : "Hayır");


  const negativeComments = useMemo(() => {
    if (!data?.comments) return [];

    return data.comments.filter((c: any) => {
      return c.final?.toLowerCase?.() === "olumsuz";
    });
  }, [data]);

  
  const userChartData = useMemo(() => {
    if (!negativeComments.length) return null;

    const counts: Record<string, number> = {};

    negativeComments.forEach((c: any) => {
      const user = c.user || c.author || c.username || "Bilinmeyen";
      counts[user] = (counts[user] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Olumsuz Yorum",
          data: Object.values(counts),
          backgroundColor: "rgba(129,140,248,0.85)",
          borderRadius: 8,
        },
      ],
    };
  }, [negativeComments]);

  const typeChartData = useMemo(() => {
  if (!data?.comments) return null;

  const typeMap = [
    { key: "nefret", label: "Nefret Söylemi" },
    { key: "mustehcen", label: "Müstehcen" },
    { key: "tehtid", label: "Tehdit" },
    { key: "hakaret", label: "Hakaret" },
    { key: "kimliknefreti", label: "Kimlik Nefreti" },
  ];

  const labels = typeMap.map((t) => t.label);

  const counts = typeMap.map((t) => {
    return data.comments.filter((c: any) => c.labels?.[t.key] === 1).length;
  });

  return {
    labels,
    datasets: [
      {
        label: "Tespit Sayısı",
        data: counts,
        backgroundColor: "rgba(129,140,248,0.85)",
        borderRadius: 8,
      },
    ],
  };
}, [data]);

  const chartOptions = (horizontal = false) => ({
    indexAxis: horizontal ? ("y" as const) : ("x" as const),
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: "rgba(51,65,85,0.3)" },
        ticks: { color: "#cbd5e1" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(51,65,85,0.3)" },
        ticks: { color: "#cbd5e1", stepSize: 1 },
      },
    },
  });

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Analiz yükleniyor...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">

      <div className="mb-10">
        <h1 className="text-4xl font-bold">📊 Analiz Raporu</h1>
        <p className="text-slate-400 mt-2">
          Yorum analiz sistemi
        </p>
      </div>

     <div className="grid md:grid-cols-3 gap-6 mb-10">

  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
    <p className="text-slate-400">Toplam</p>
    <h2 className="text-4xl font-bold">
      {data.total || 0}
    </h2>
  </div>

  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
    <p className="text-slate-400">Olumlu</p>
    <h2 className="text-4xl font-bold">
      {data.summary?.["Olumlu"] || 0}
    </h2>
  </div>

  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
    <p className="text-slate-400">Olumsuz</p>
    <h2 className="text-4xl font-bold">
      {data.summary?.["Olumsuz Yorum"] || 0}
    </h2>
  </div>

</div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">📝 Yorumlar</h2>

        <div className="overflow-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 text-left">Yorum</th>
                <th className="p-4 text-left">Durum</th>
              </tr>
            </thead>

            <tbody>
              {data.comments?.map((item: any, i: number) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="p-4">{item.text}</td>

                  <td className="p-4">
                    {item.final === "Olumsuz" ? (
                      <span className="text-indigo-300">⚠️ Olumsuz</span>
                    ) : (
                      <span className="text-indigo-400">✅ Olumlu</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          🚨 Olumsuz Türler
        </h2>

        <div className="overflow-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 text-left">Yorum</th>
                <th>Nefret</th>
                <th>Müstehcen</th>
                <th>Tehdit</th>
                <th>Hakaret</th>
                <th>Kimlik</th>
              </tr>
            </thead>

            <tbody>
              {data.comments?.map((item: any, i: number) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="p-4">{item.text}</td>

                  <td className="text-center">
                    {toYesNo(item.labels?.nefret)}
                  </td>

                  <td className="text-center">
                    {toYesNo(item.labels?.mustehcen)}
                  </td>

                  <td className="text-center">
                    {toYesNo(item.labels?.tehtid)}
                  </td>

                  <td className="text-center">
                    {toYesNo(item.labels?.hakaret)}
                  </td>

                  <td className="text-center">
                    {toYesNo(item.labels?.kimliknefreti)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">📊 Grafikler</h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="mb-4">Kullanıcılar</h3>

            <div className="h-64">
              {userChartData ? (
                <Bar data={userChartData} options={chartOptions(true)} />
              ) : (
                <p className="text-slate-500">Veri yok</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="mb-4">Tür Dağılımı</h3>

            <div className="h-64">
              {typeChartData ? (
                <Bar data={typeChartData} options={chartOptions()} />
              ) : (
                <p className="text-slate-500">Veri yok</p>
              )}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}