import { useState } from "react";
import { type Patient, generateMockPatients } from "@/lib/triageEngine";
import { StatsCards } from "@/components/StatsCards";
import { PatientTable } from "@/components/PatientTable";
import { PatientForm } from "@/components/PatientForm";
import { PatientDetail } from "@/components/PatientDetail";
import { CriticalAlerts } from "@/components/CriticalAlerts";
import { Activity, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
const Index = () => {
  const [patients, setPatients] = useState<Patient[]>(() => generateMockPatients());
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { user, logout } = useAuth();

  const addPatient = (patient: Patient) => {
    setPatients((prev) => [patient, ...prev]);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Emergency Triage</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered patient prioritization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{user?.name}</span>
              <Badge variant="secondary" className="text-xs">{user?.role}</Badge>
            </div>
            <Button onClick={() => setFormOpen(true)} size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Admission
            </Button>
            <Button onClick={logout} size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <CriticalAlerts patients={patients} />
        <StatsCards patients={patients} />
        <PatientTable patients={patients} onSelectPatient={setSelectedPatient} />
      </main>

      {/* Modals */}
      <PatientForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={addPatient} />
      <PatientDetail patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
    </div>
  );
};

export default Index;
