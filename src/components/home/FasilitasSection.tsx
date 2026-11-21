import { Building2, Recycle, ShieldCheck, Trees } from "lucide-react";

export default function FasilitasSection() {
  const fasilitasLingkungan = [
    {
      nama: "Balai Warga Serbaguna",
      deskripsi:
        "Ruang pertemuan bersama untuk rapat warga, arisan, pengajian, dan kegiatan sosial.",
      lokasi: "Samping Lapangan Utama",
      Icon: Building2,
    },
    {
      nama: "Pos Ronda & CCTV 24 Jam",
      deskripsi:
        "Pusat pantau keamanan lingkungan dengan sirine darurat dan kamera CCTV aktif 24/7.",
      lokasi: "Pintu Masuk Utama Gapura",
      Icon: ShieldCheck,
    },
    {
      nama: "Taman Hijau & Arena Bermain",
      deskripsi:
        "Area terbuka ramah anak, sarana santai sore warga, serta taman apotek hidup (TOGA).",
      lokasi: "Blok C Tengah",
      Icon: Trees,
    },
    {
      nama: "Bank Sampah Lingkungan",
      deskripsi:
        "Fasilitas pemilahan sampah kardus, botol, dan plastik untuk mendukung lingkungan bersih.",
      lokasi: "Area Belakang Balai RT",
      Icon: Recycle,
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-sky-100 pb-3">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            Fasilitas Umum
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Sarana & Prasarana Warga
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Fasilitas bersama yang dapat digunakan oleh seluruh warga RT 05.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fasilitasLingkungan.map((f) => {
          const Icon = f.Icon;
          return (
            <div
              key={f.nama}
              className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs hover:border-sky-300 transition-colors space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{f.nama}</h3>
                <span className="text-[11px] font-semibold text-sky-600 block mt-0.5">
                  {f.lokasi}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {f.deskripsi}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
