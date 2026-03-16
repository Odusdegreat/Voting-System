import { cn } from "@/lib/utils";

type BadgeProps = {
  label: string;
  tone?: "default" | "success" | "danger" | "warning";
};

const tone_classes = {
  default: "bg-white/10 text-white border border-white/10",
  success: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20",
  danger: "bg-rose-500/15 text-rose-300 border border-rose-400/20",
  warning: "bg-amber-500/15 text-amber-300 border border-amber-400/20",
};

export default function Badge({ label, tone = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone_classes[tone],
      )}
    >
      {label}
    </span>
  );
}
