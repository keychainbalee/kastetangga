import { CalendarCheck2, Home, IdCard } from "lucide-react";

export default function LayananSuratSection() {
  const layananSurat = [
    {
      judul: "Surat Pengantar KTP / KK",
      syarat: "Fotokopi Akta Lahir & Surat Pindah (bila ada)",
      Icon: IdCard,
    },
    {
      judul: "Surat Keterangan Domisili",
      syarat: "KTP Asli & Surat Kontrak Rumah (bagi pengontrak)",
      Icon: Home,
    },
    {
      judul: "Izin Acara / Balai Warga",
      syarat: "Pemberitahuan H-7 ke Seksi Keamanan RT",
      Icon: CalendarCheck2,
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white border border-sky-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 sm:space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            Bantuan Administrasi
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Layanan Surat Pengantar RT
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Butuh surat pengantar untuk keperluan kependudukan atau kelurahan? Berikut persyaratan ringkasnya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {layananSurat.map((item) => {
            const Icon = item.Icon;
            return (
              <div
                key={item.judul}
                className="bg-sky-50/50 p-4 sm:p-5 rounded-2xl border border-sky-100 space-y-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-sky-100 text-sky-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{item.judul}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Syarat:</strong> {item.syarat}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-1">
          <p className="text-xs text-slate-500">
            Untuk pengurusan surat, silakan hubungi Sekretaris RT di nomor WhatsApp:{" "}
            <strong className="text-sky-700">0813-3333-4444 (Bpk. Rahmat)</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
