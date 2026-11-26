import type { ComponentType, SVGProps } from "react";

/**
 * ICON_MAP: satu-satunya tempat ikon didefinisikan. Komponen memanggil <Icon name="..." />,
 * bukan menulis glyph unicode atau <svg> sendiri. Semua ikon garis berbagi satu grid (24px),
 * satu ketebalan (1.75), dan mewarisi warna lewat currentColor, jadi ikut token semantik.
 */
export type IconProps = SVGProps<SVGSVGElement>;

const line: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ArrowUpRight = (p: IconProps) => (
  <svg {...line} {...p}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </svg>
);

const ArrowLeft = (p: IconProps) => (
  <svg {...line} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

const Plus = (p: IconProps) => (
  <svg {...line} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Minus = (p: IconProps) => (
  <svg {...line} {...p}>
    <path d="M5 12h14" />
  </svg>
);

const Search = (p: IconProps) => (
  <svg {...line} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

const Clock = (p: IconProps) => (
  <svg {...line} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

// Bentuk ikon di bawah mengikuti set Lucide yang dipakai di Figma
const MapPin = (p: IconProps) => (
  <svg {...line} {...p}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const starPath =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

const Star = (p: IconProps) => (
  <svg {...line} {...p}>
    <path d={starPath} />
  </svg>
);

const StarFilled = (p: IconProps) => (
  <svg {...line} fill="currentColor" {...p}>
    <path d={starPath} />
  </svg>
);

const PlayCircle = (p: IconProps) => (
  <svg {...line} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m10 8 6 4-6 4Z" />
  </svg>
);

// Logo Google memakai warna mereknya sendiri, bukan token palet.
const Google = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.72-3.78H1.34v3.09A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.34 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.34a12 12 0 0 0 0 10.8l4-3.09Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.34 6.6l4 3.09A7.2 7.2 0 0 1 12 4.75Z"
    />
  </svg>
);

export const ICON_MAP = {
  "arrow-up-right": ArrowUpRight,
  "arrow-left": ArrowLeft,
  plus: Plus,
  minus: Minus,
  search: Search,
  clock: Clock,
  "map-pin": MapPin,
  star: Star,
  "star-filled": StarFilled,
  "play-circle": PlayCircle,
  google: Google,
} satisfies Record<string, ComponentType<IconProps>>;

export type IconName = keyof typeof ICON_MAP;

type Props = { name: IconName; size?: number; className?: string };

/** Ikon dekoratif: disembunyikan dari pembaca layar. Beri teks/aria-label pada kontrol induknya. */
export function Icon({ name, size = 20, className }: Props) {
  const Cmp = ICON_MAP[name];
  return <Cmp width={size} height={size} className={className} aria-hidden="true" focusable="false" />;
}
