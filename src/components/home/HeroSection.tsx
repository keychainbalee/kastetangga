import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-16 sm:py-24 px-4 border-b border-sky-100">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="inline-block px-4 py-1.5 bg-white border border-sky-200 text-sky-700 text-xs font-bold rounded-full uppercase tracking-wider shadow-xs">
          Portal Informasi Resmi Warga
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Lingkungan Asri, Warga Guyub <span className="text-sky-600">RT 05 / RW 02</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Pusat informasi sarana lingkungan, galeri kegiatan gotong royong, serta panduan administrasi warga Kelurahan Asri.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-xs sm:max-w-none mx-auto">
          <a
            href="#galeri"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            Lihat Foto Kegiatan
          </a>
          <Link
            href="/tentang"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-800 text-sm font-semibold transition-all shadow-xs"
          >
            Susunan Pengurus RT
          </Link>
        </div>
      </div>
    </section>
  );
}