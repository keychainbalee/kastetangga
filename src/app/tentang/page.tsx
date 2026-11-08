export default function TentangPage() {
  const pengurus = [
    { jabatan: "Ketua RT", nama: "Bpk. Bambang Sutrisno", kontak: "0812-1111-2222" },
    { jabatan: "Sekretaris", nama: "Bpk. Rahmat Hidayat", kontak: "0813-3333-4444" },
    { jabatan: "Bendahara", nama: "Ibu Siti Aminah", kontak: "0815-5555-6666" },
    { jabatan: "Seksi Keamanan & Ronda", nama: "Bpk. Joko Susilo", kontak: "0818-7777-8888" },
    { jabatan: "Seksi Kebersihan Lingkungan", nama: "Bpk. Dedi Kurniawan", kontak: "0819-9999-0000" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Judul & Pengantar */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">Profil RT 05 / RW 02</h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
          Struktur kepengurusan, visi, misi, dan kontak pengurus lingkungan Kelurahan Asri.
        </p>
      </div>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
          <h2 className="text-lg font-bold text-sky-800 mb-2">Visi</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Mewujudkan lingkungan rukun tetangga yang guyub, aman, sehat, dan transparan dalam pengelolaan dana untuk kesejahteraan warga bersama.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
          <h2 className="text-lg font-bold text-sky-800 mb-2">Misi</h2>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1.5 leading-relaxed">
            <li>Menumbuhkan kepedulian dan gotong royong antar warga.</li>
            <li>Mengedepankan akuntabilitas dana iuran kas secara terbuka.</li>
            <li>Menjaga ketertiban lingkungan dan pos keamanan 24 jam.</li>
          </ul>
        </div>
      </div>

      {/* Susunan Pengurus */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Pengurus RT Periode 2025 - 2028</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pengurus.map((p, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-sky-100 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                {p.nama.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-semibold text-sky-700 block">{p.jabatan}</span>
                <span className="font-bold text-slate-900 text-sm block">{p.nama}</span>
                <span className="text-xs text-slate-400 block mt-0.5">{p.kontak}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}