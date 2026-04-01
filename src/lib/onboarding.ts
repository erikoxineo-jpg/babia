export const ONBOARDING_STEPS = [
  { id: 1, label: "Negócio", path: "/onboarding/barbearia" },
  { id: 2, label: "Horários", path: "/onboarding/horarios" },
  { id: 3, label: "Serviços", path: "/onboarding/servicos" },
  { id: 4, label: "Equipe", path: "/onboarding/equipe" },
  { id: 5, label: "Concluído", path: "/onboarding/concluido" },
] as const;

export function getOnboardingRedirect(step: number): string {
  if (step >= 4) return ONBOARDING_STEPS[4].path;
  return ONBOARDING_STEPS[step].path;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  for (const m of ["00", "30"]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${m}`);
  }
}

export const DAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export interface DaySchedule {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, isActive: false, startTime: "09:00", endTime: "18:00", hasBreak: false, breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: 1, isActive: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: 2, isActive: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: 3, isActive: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: 4, isActive: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: 5, isActive: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: 6, isActive: true, startTime: "09:00", endTime: "17:00", hasBreak: false, breakStart: "12:00", breakEnd: "13:00" },
];

export interface ServiceTemplate {
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
}

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  { name: "Corte Masculino", durationMinutes: 30, price: 45, category: "Corte" },
  { name: "Barba", durationMinutes: 20, price: 30, category: "Barba" },
  { name: "Corte + Barba", durationMinutes: 45, price: 65, category: "Combo" },
  { name: "Corte Infantil", durationMinutes: 25, price: 35, category: "Corte" },
  { name: "Sobrancelha", durationMinutes: 10, price: 15, category: "Acabamento" },
  { name: "Pigmentação", durationMinutes: 40, price: 50, category: "Tratamento" },
  { name: "Hidratação Capilar", durationMinutes: 30, price: 40, category: "Tratamento" },
  { name: "Relaxamento", durationMinutes: 60, price: 80, category: "Tratamento" },
];
