import { Shirt } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-xl">
                <Shirt className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl">CuciSepatu<span className="text-primary-500">.id</span></span>
            </div>
            <p className="text-blue-200 text-sm max-w-xs">
              Jasa cuci sepatu profesional dengan pickup & delivery. Semarang & sekitarnya.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-3">Layanan</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>Cuci Reguler</li>
                <li>Cuci Express</li>
                <li>Deep Cleaning</li>
                <li>Repaint & Restore</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Kontak</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>📍 Semarang, Jawa Tengah</li>
                <li>📱 WhatsApp: 0857-4344-7364</li>
                <li>✉️ info@cucisepatu.id</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-blue-300 text-sm">
          © 2026 CuciSepatu.id — All rights reserved
        </div>
      </div>
    </footer>
  );
}