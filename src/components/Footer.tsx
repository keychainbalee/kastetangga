export default function Footer() {
  return (
    <footer className="bg-sky-50/80 text-slate-600 py-10 mt-auto border-t border-sky-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="text-sky-950 font-bold text-base mb-2">WargaKas RT 05</h3>
          <p className="text-slate-600 leading-relaxed">
            Portal transparansi keuangan dan informasi iuran warga rukun tetangga. Bersama mewujudkan lingkungan yang guyub, aman, dan amanah.
          </p>
        </div>
        <div>
          <h4 className="text-sky-950 font-semibold mb-2">Kontak Darurat RT</h4>
          <ul className="space-y-1.5 text-slate-600">
            <li>Pos Ronda / Satpam: <span className="font-medium text-slate-700">0812-XXXX-XXXX</span></li>
            <li>Ketua RT 05: <span className="font-medium text-slate-700">0813-XXXX-XXXX</span></li>
            <li>Ambulans / Siaga: <span className="font-medium text-slate-700">118 / 0811-XXXX-XXXX</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sky-950 font-semibold mb-2">Sekretariat</h4>
          <p className="text-slate-600 leading-relaxed">
            Balai Warga RT 05, Jl. Melati Putih No. 10<br />
            Kecamatan Harmoni
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-sky-200/60 text-xs text-center text-slate-500">
        &copy; {new Date().getFullYear()} Pengurus RT 05 / RW 02. Dikelola terbuka untuk warga.
      </div>
    </footer>
  );
}