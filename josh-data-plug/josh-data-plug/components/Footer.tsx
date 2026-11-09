import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-900 pb-24 text-brand-100 md:pb-10">
      <div className="container-x grid gap-8 py-10 md:grid-cols-3">
        <div>
          <div className="inline-block rounded-xl bg-white p-2">
            <Image src="/logo.svg" alt="JOSH DATA PLUG" width={150} height={40} />
          </div>
          <p className="mt-3 text-sm">{BRAND.tagline}</p>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-white">Quick links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/data">Buy Data</Link></li>
            <li><Link className="hover:text-white" href="/airtime">Buy Airtime</Link></li>
            <li><Link className="hover:text-white" href="/bills">Pay Bills</Link></li>
            <li><Link className="hover:text-white" href="/dashboard">My Wallet</Link></li>
            <li><Link className="hover:text-white" href="/login">Login</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-white">Contact us</h2>
          <ul className="space-y-2 text-sm">
            {BRAND.phones.map((p) => (
              <li key={p.wa}>
                <a
                  className="hover:text-white"
                  href={`https://wa.me/${p.wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 WhatsApp: {p.display}
                </a>
              </li>
            ))}
            <li>📍 {BRAND.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-200">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
