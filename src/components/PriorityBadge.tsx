import { type PriorityLevel } from "@/lib/triageEngine";

const styles: Record<PriorityLevel, string> = {
  Critical: "bg-critical-surface text-critical-foreground border-critical/20",
  High: "bg-high-surface text-high-foreground border-high/20",
  Medium: "bg-medium-surface text-medium-foreground border-medium/20",
  Low: "bg-low-surface text-low-foreground border-low/20",
};

interface PriorityBadgeProps {
  level: PriorityLevel;
  pulse?: boolean;
}

export const PriorityBadge = ({ level, pulse }: PriorityBadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]} ${
      pulse && level === "Critical" ? "animate-pulse-critical" : ""
    }`}
  >
    {level === "Critical" && (
      <span className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse-critical" />
    )}
    {level}
  </span>
);
