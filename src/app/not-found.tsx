import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell py-24 text-center">
      <p className="font-display text-6xl font-bold text-orange">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold uppercase text-navy">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-steel">
        That part of the catalog does not exist.
      </p>
      <Link href="/" className="btn-orange mt-8 inline-flex">
        Back to home
      </Link>
    </div>
  );
}
