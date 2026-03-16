import { motion, AnimatePresence } from "framer-motion";
import { type Patient } from "@/lib/triageEngine";
import { AlertTriangle } from "lucide-react";

interface CriticalAlertsProps {
  patients: Patient[];
}

export const CriticalAlerts = ({ patients }: CriticalAlertsProps) => {
  const criticals = patients.filter((p) => p.result.priority === "Critical");

  if (criticals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-critical/30 bg-critical-surface p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-critical animate-pulse-critical" />
        <span className="text-xs font-bold text-critical-foreground uppercase tracking-wider">
          Critical Alert — {criticals.length} patient{criticals.length > 1 ? "s" : ""} require
          immediate attention
        </span>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {criticals.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-card/80 rounded-lg px-4 py-2.5 border border-critical/10"
            >
              <div>
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{p.age}y</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-critical font-bold">SpO2 {p.spo2}%</span>
                <span className="text-border mx-2">|</span>
                <span>HR {p.heartRate}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
