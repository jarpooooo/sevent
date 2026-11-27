import { Icon } from "../../../../components/ui/icons";

export const rule = "h-px w-full bg-line";
export const h2 = "font-display text-[clamp(24px,2.2vw,30px)] leading-tight tracking-[-0.02em]";

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-1 text-brand" role="img" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= value ? "star-filled" : "star"} size={size} />
      ))}
    </span>
  );
}
