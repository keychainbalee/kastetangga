export default function GaleriSection() {
  const galeriKegiatan = [
    {
      id: 1,
      judul: "Kerja Bakti & Saluran Air",
      kategori: "Gotong Royong",
      tanggal: "Oktober 2026",
      gambar: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
      deskripsi: "Pembersihan got dan perapihan dahan pohon menyambut musim penghujan.",
    },
    {
      id: 2,
      judul: "Kemeriahan Lomba 17 Agustus",
      kategori: "HUT RI",
      tanggal: "Agustus 2026",
      gambar: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
      deskripsi: "Rangkaian lomba anak-anak dan jalan sehat bersama seluruh keluarga RT 05.",
    },
    {
      id: 3,
      judul: "Posyandu Balita & Lansia",
      kategori: "Kesehatan",
      tanggal: "September 2026",
      gambar: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80",
      deskripsi: "Pemeriksaan tensi rutin, imunisasi, dan pembagian vitamin gratis bagi warga.",
    },
    {
      id: 4,
      judul: "Siskamling & Patroli Malam",
      kategori: "Keamanan",
      tanggal: "Rutin Mingguan",
      gambar: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
      deskripsi: "Menjaga keamanan dan ketertiban lingkungan pos ronda bersama warga bergiliran.",
    },
  ];

  return (
    <section id="galeri" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-sky-100 pb-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Dokumentasi & Memori</span>
          <h2 className="text-2xl font-extrabold text-slate-900">Galeri Kegiatan Lingkungan</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Momen kebersamaan dan potret gotong royong antar warga RT 05.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {galeriKegiatan.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <img
                src={item.gambar}
                alt={item.judul}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-[11px] font-bold text-sky-700 rounded-lg shadow-xs">
                {item.kategori}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <span className="text-[11px] text-slate-400 font-medium block">{item.tanggal}</span>
              <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
                {item.judul}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {item.deskripsi}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}