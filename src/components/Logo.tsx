import Link from "next/link";

export function Logo({
  size = 72,
  asLink = false,
  src,
}: {
  size?: number;
  asLink?: boolean;
  src?: string;
}) {
  const badge = src ? (
    <span
      className="relative block shrink-0 select-none"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Nur Engineering Solution Logo"
        className="h-full w-full object-contain"
      />
    </span>
  ) : (
    <span
      className="relative grid shrink-0 place-items-center bg-navy text-white select-none"
      style={{
        width: size,
        height: size,
      }}
    >
      <span
        className="font-display font-bold leading-none tracking-[0.04em]"
        style={{ fontSize: size * 0.34 }}
      >
        NES
      </span>
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" aria-label="Nur Engineering Solution home" className="inline-block">
        {badge}
      </Link>
    );
  }

  return badge;
}
