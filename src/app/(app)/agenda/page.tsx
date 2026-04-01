"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Ban, Loader2 } from "lucide-react";
import { DateNavigator } from "@/components/agenda/DateNavigator";
import { ProfessionalFilter } from "@/components/agenda/ProfessionalFilter";
import { DayColumn } from "@/components/agenda/DayColumn";
import { NewAppointmentDrawer } from "@/components/agenda/NewAppointmentDrawer";
import { AppointmentDetailDrawer } from "@/components/agenda/AppointmentDetailDrawer";
import { BlockDrawer } from "@/components/agenda/BlockDrawer";
import { BlockDetailDrawer } from "@/components/agenda/BlockDetailDrawer";
import { RescheduleDrawer } from "@/components/agenda/RescheduleDrawer";
import type {
  AgendaData,
  AppointmentWithRelations,
  ProfessionalWithSchedule,
  ScheduleBlockData,
} from "@/types/agenda";

interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [data, setData] = useState<AgendaData | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProfessional, setFilterProfessional] = useState<string | null>(null);

  // Drawer state
  const [drawerMode, setDrawerMode] = useState<"new" | "detail" | "block-new" | "block-detail" | "reschedule" | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<(ScheduleBlockData & { professionalName: string }) | null>(null);
  const [rescheduleData, setRescheduleData] = useState<{
    appointmentId: string;
    currentDate: string;
    currentStartTime: string;
    currentProfessionalId: string;
    currentProfessionalName: string;
    clientName: string;
    serviceName: string;
    serviceId: string;
    serviceDurationMinutes: number;
  } | null>(null);
  const [prefill, setPrefill] = useState<{
    professionalId?: string;
    time?: string;
  }>({});

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?date=${selectedDate}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Buscar serviços uma vez
  useEffect(() => {
    fetch("/api/appointments/services")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json)) setServices(json);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  function handleSlotClick(professionalId: string, time: string) {
    setPrefill({ professionalId, time });
    setDrawerMode("new");
  }

  function handleAppointmentClick(appointment: AppointmentWithRelations) {
    setSelectedAppointmentId(appointment.id);
    setDrawerMode("detail");
  }

  function handleBlockClick(block: ScheduleBlockData, professionalName: string) {
    setSelectedBlock({ ...block, professionalName });
    setDrawerMode("block-detail");
  }

  function handleNewClick() {
    setPrefill({});
    setDrawerMode("new");
  }

  function handleNewBlockClick() {
    setPrefill({});
    setDrawerMode("block-new");
  }

  function handleCreated() {
    fetchAgenda();
  }

  function handleStatusChanged() {
    fetchAgenda();
  }

  function handleBlockDeleted() {
    fetchAgenda();
  }

  function handleReschedule(data: typeof rescheduleData) {
    setRescheduleData(data);
    setDrawerMode("reschedule");
  }

  function handleRescheduled() {
    fetchAgenda();
  }

  // Filtrar profissionais
  const professionals: ProfessionalWithSchedule[] = data?.professionals ?? [];
  const visibleProfessionals = filterProfessional
    ? professionals.filter((p) => p.id === filterProfessional)
    : professionals;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
        <DateNavigator date={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Filtro de profissional */}
      <div className="mb-4">
        <ProfessionalFilter
          professionals={professionals.map((p) => ({ id: p.id, name: p.name }))}
          selected={filterProfessional}
          onChange={setFilterProfessional}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : visibleProfessionals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">
            Nenhum profissional ativo encontrado.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <div className="flex min-w-0">
            {visibleProfessionals.map((pro) => {
              const proAppointments = (data?.appointments ?? []).filter(
                (a) => a.professional.id === pro.id
              );
              return (
                <DayColumn
                  key={pro.id}
                  professional={pro}
                  appointments={proAppointments}
                  date={selectedDate}
                  onSlotClick={handleSlotClick}
                  onAppointmentClick={handleAppointmentClick}
                  onBlockClick={handleBlockClick}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
        <button
          onClick={handleNewBlockClick}
          className="w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          title="Bloquear horário"
        >
          <Ban size={20} />
        </button>
        <button
          onClick={handleNewClick}
          className="w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
          title="Novo agendamento"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Drawers */}
      <NewAppointmentDrawer
        open={drawerMode === "new"}
        onClose={() => setDrawerMode(null)}
        prefill={{ ...prefill, date: selectedDate }}
        professionals={professionals.map((p) => ({ id: p.id, name: p.name }))}
        services={services}
        onCreated={handleCreated}
      />

      <AppointmentDetailDrawer
        open={drawerMode === "detail"}
        onClose={() => setDrawerMode(null)}
        appointmentId={selectedAppointmentId}
        onStatusChanged={handleStatusChanged}
        onReschedule={handleReschedule}
      />

      <BlockDrawer
        open={drawerMode === "block-new"}
        onClose={() => setDrawerMode(null)}
        professionals={professionals.map((p) => ({ id: p.id, name: p.name }))}
        prefill={{ ...prefill, date: selectedDate }}
        onCreated={handleCreated}
      />

      <BlockDetailDrawer
        open={drawerMode === "block-detail"}
        onClose={() => setDrawerMode(null)}
        block={selectedBlock}
        onDeleted={handleBlockDeleted}
      />

      <RescheduleDrawer
        open={drawerMode === "reschedule"}
        onClose={() => setDrawerMode(null)}
        data={rescheduleData}
        professionals={professionals.map((p) => ({ id: p.id, name: p.name }))}
        onRescheduled={handleRescheduled}
      />
    </div>
  );
}
