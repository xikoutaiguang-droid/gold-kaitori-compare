"use client";

import { useState } from "react";

export default function CompanyLogo({
  id,
  name,
  size = 32,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="font-serif-jp flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-strong"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        aria-hidden
      >
        {name.slice(0, 1)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${id}.png`}
      alt={`${name}のロゴ`}
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-border bg-surface object-contain"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
