import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Patient, type PriorityLevel } from "@/lib/triageEngine";
import { PriorityBadge } from "./PriorityBadge";
import { ChevronDown, ChevronUp, Stethoscope } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

const priorityOrder: Record<PriorityLevel, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

type SortField = "priority" | "name" | "spo2" | "admittedAt" | "doctor";

export const PatientTable = ({ patients, onSelectPatient }: PatientTableProps) => {
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortAsc, setSortAsc] = useState(true);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sorted = [...patients].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "priority":
        cmp = priorityOrder[a.result.priority] - priorityOrder[b.result.priority];
        break;
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "spo2":
        cmp = a.spo2 - b.spo2;
        break;
      case "admittedAt":
        cmp = a.admittedAt.getTime() - b.admittedAt.getTime();
        break;
      case "doctor":
        cmp = a.result.doctor.specialization.localeCompare(b.result.doctor.specialization);
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  const formatTime = (date: Date) => {
    const mins = Math.round((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <div className="bg-card rounded-xl shadow-clinical-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Patient Queue</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {patients.length} active patients · sorted by {sortField}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {[
                { field: "name" as SortField, label: "Patient" },
                { field: "spo2" as SortField, label: "Vitals" },
                { field: "priority" as SortField, label: "Priority" },
                { field: "doctor" as SortField, label: "Doctor" },
                { field: "admittedAt" as SortField, label: "Admitted" },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                >
                  {label}
                  <SortIcon field={field} />
                </th>
              ))}
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Risk Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <AnimatePresence>
              {sorted.map((p) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  onClick={() => onSelectPatient(p)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.age}y · {p.symptoms}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">
                    <span className={p.spo2 < 92 ? "text-critical font-bold" : ""}>
                      {p.spo2}%
                    </span>
                    <span className="text-border mx-2">|</span>
                    <span className={p.heartRate > 120 ? "text-high font-bold" : ""}>
                      {p.heartRate}
                    </span>
                    <span className="text-muted-foreground text-xs ml-0.5">bpm</span>
                    <span className="text-border mx-2">|</span>
                    <span>{p.systolicBp}</span>
                    <span className="text-muted-foreground text-xs ml-0.5">mmHg</span>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge level={p.result.priority} pulse />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatTime(p.admittedAt)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                    {p.result.riskScore.toFixed(1)}%
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
