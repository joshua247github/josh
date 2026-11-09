import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import SearchBar from "./SearchBar";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const { user, profile } = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="container-x flex items-center gap-3 py-2.5">
        <Link href="/" aria-label="JOSH DATA PLUG home" className="shrink-0">
          <Image src="/logo.svg" alt="JOSH DATA PLUG" width={150} height={40} priority />
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-2" aria-label="Account">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-accent-50 hover:text-accent-700"
              >
                {formatNaira(profile?.wallet_balance ?? 0)}
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin" className="btn-outline hidden sm:inline-flex">
                  Admin
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">
                Login
              </Link>
              <Link href="/signup" className="btn-primary hidden sm:inline-flex">
                Sign up
              </Link>
            </>
          )}
          <Link
            href="/dashboard#orders"
            aria-label="My orders"
            className="relative rounded-xl p-2 text-xl hover:bg-accent-50"
          >
            🛒
          </Link>
        </nav>
      </div>
      <div className="container-x pb-2.5 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
