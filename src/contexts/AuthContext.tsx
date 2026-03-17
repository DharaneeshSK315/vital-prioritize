import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "Doctor" | "Nurse" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user store (simulates database)
const mockUsers: { email: string; password: string; user: User }[] = [
  {
    email: "admin@hospital.com",
    password: "admin123",
    user: { id: "1", name: "Dr. Admin", email: "admin@hospital.com", role: "Admin", createdAt: new Date() },
  },
  {
    email: "doctor@hospital.com",
    password: "doctor123",
    user: { id: "2", name: "Dr. Sarah Chen", email: "doctor@hospital.com", role: "Doctor", createdAt: new Date() },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("triage_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 600));
    const found = mockUsers.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    setUser(found.user);
    sessionStorage.setItem("triage_user", JSON.stringify(found.user));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    await new Promise((r) => setTimeout(r, 600));
    if (mockUsers.find((u) => u.email === email)) throw new Error("Email already registered");
    const newUser: User = { id: crypto.randomUUID(), name, email, role, createdAt: new Date() };
    mockUsers.push({ email, password, user: newUser });
    setUser(newUser);
    sessionStorage.setItem("triage_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("triage_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
