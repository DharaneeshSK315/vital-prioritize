import { type Patient } from "@/lib/triageEngine";
import { Activity, AlertTriangle, Clock, Users } from "lucide-react";

interface StatsCardsProps {
  patients: Patient[];
}

export const StatsCards = ({ patients }: StatsCardsProps) => {
  const critical = patients.filter((p) => p.result.priority === "Critical").length;
  const high = patients.filter((p) => p.result.priority === "High").length;
  const avgWait = Math.round(
    patients.reduce((sum, p) => sum + (Date.now() - p.admittedAt.getTime()) / 60000, 0) / patients.length
  );

  const cards = [
    {
      label: "Total Patients",
      value: patients.length,
      icon: Users,
      accent: "text-foreground",
    },
    {
      label: "Critical",
      value: critical,
      icon: AlertTriangle,
      accent: "text-critical",
    },
    {
      label: "High Priority",
      value: high,
      icon: Activity,
      accent: "text-high",
    },
    {
      label: "Avg Wait (min)",
      value: avgWait,
      icon: Clock,
      accent: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card rounded-xl shadow-clinical-sm p-5 flex items-start justify-between"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {card.label}
            </p>
            <p className={`text-2xl font-semibold mt-1 font-mono ${card.accent}`}>
              {card.value}
            </p>
          </div>
          <card.icon className={`w-5 h-5 ${card.accent} opacity-50`} />
        </div>
      ))}
    </div>
  );
};
