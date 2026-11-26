"use client";

import { useState } from "react";

type Props = {
  photoURL?: string;
  initials: string;
  sizeClass: string;
  textClass: string;
};

/** Avatar akun: menampilkan foto Google bila tersedia, dengan fallback mulus ke inisial. */
export default function UserAvatar({ photoURL, initials, sizeClass, textClass }: Props) {
  const [failed, setFailed] = useState(false);

  if (photoURL && !failed) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={photoURL}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-black/10`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-brand ${textClass} font-medium text-surface`}
    >
      {initials}
    </span>
  );
}
