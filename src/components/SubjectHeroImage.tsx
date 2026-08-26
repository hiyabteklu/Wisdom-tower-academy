"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

export default function SubjectHeroImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-wisdom-card to-wisdom-dark" />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover opacity-60"
      onError={() => setFailed(true)}
    />
  );
}
