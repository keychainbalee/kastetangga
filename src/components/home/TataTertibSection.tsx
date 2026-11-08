export default function TataTertibSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-sky-50/60 border border-sky-200/80 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-sky-200/70 text-sky-800 text-[11px] font-bold rounded-md uppercase">
            Pedoman Lingkungan
          </span>
          <h3 className="font-bold text-slate-900 text-base">Tamu Menginap 1x24 Jam Wajib Lapor</h3>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Demi keamanan dan ketertiban bersama, warga yang menerima tamu menginap lebih dari 24 jam diharapkan melapor ke Pos Ronda atau Ketua RT setempat. Jam tenang lingkungan berlaku mulai pukul 22.00 WIB.
          </p>
        </div>
        <div className="shrink-0">
          <span className="inline-block px-4 py-2 bg-white text-sky-800 text-xs font-bold rounded-xl border border-sky-200 shadow-2xs">
            Pos Ronda Siaga 24 Jam
          </span>
        </div>
      </div>
    </section>
  );
}