import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-16 text-center">
      <p className="text-5xl font-extrabold text-accent-600">404</p>
      <h1 className="mt-2 text-xl font-extrabold text-brand-900">Page not found</h1>
      <Link href="/" className="btn-primary mt-5">
        Back home
      </Link>
    </div>
  );
}
