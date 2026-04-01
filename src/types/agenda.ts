import type { AppointmentStatus } from "@prisma/client";

// ==========================================
// Tipos compartilhados da Agenda
// ==========================================

export interface AppointmentWithRelations {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  price: number;
  notes: string | null;
  source: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  professional: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    durationMinutes: number;
  };
}

export interface ProfessionalScheduleData {
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ProfessionalBreakData {
  startTime: string;
  endTime: string;
}

export interface ScheduleBlockData {
  id: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export interface ProfessionalWithSchedule {
  id: string;
  name: string;
  schedule: ProfessionalScheduleData | null;
  breaks: ProfessionalBreakData[];
  blocks: ScheduleBlockData[];
}

export interface AgendaData {
  appointments: AppointmentWithRelations[];
  professionals: ProfessionalWithSchedule[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface AvailableSlotsInput {
  schedule: ProfessionalScheduleData | null;
  breaks: ProfessionalBreakData[];
  blocks: { startTime: string; endTime: string }[];
  appointments: { startTime: string; endTime: string; status: string }[];
  serviceDurationMinutes: number;
  serviceIntervalMinutes: number;
  date: string;
}

// ==========================================
// Constantes de status
// ==========================================

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "border-l-warning-500 bg-warning-50",
  confirmed: "border-l-success-500 bg-success-50",
  completed: "border-l-primary-500 bg-primary-50",
  cancelled: "border-l-gray-400 bg-gray-50",
  no_show: "border-l-error-500 bg-error-50",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

export const STATUS_DOT_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-warning-500",
  confirmed: "bg-success-500",
  completed: "bg-primary-500",
  cancelled: "bg-gray-400",
  no_show: "bg-error-500",
};

export const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "completed", "cancelled", "no_show"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};
