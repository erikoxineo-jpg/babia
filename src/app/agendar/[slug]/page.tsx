"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MapPin,
  Phone,
  Clock,
  Scissors,
  User,
  CalendarDays,
  DollarSign,
} from "lucide-react";

// ==========================================
// Types
// ==========================================

interface BarbershopInfo {
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  category: string | null;
}

interface ProfessionalOption {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface BookingResult {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  service: string;
  professional: string;
  barbershop: string;
}

type Step = "service" | "professional" | "datetime" | "confirm";

const STEPS: Step[] = ["service", "professional", "datetime", "confirm"];
const STEP_LABELS: Record<Step, string> = {
  service: "Serviço",
  professional: "Profissional",
  datetime: "Horário",
  confirm: "Confirmar",
};

// ==========================================
// Stepper
// ==========================================

function BookingStepper({ currentStep }: { currentStep: Step }) {
  const currentIdx = STEPS.indexOf(currentStep);
  return (
    <div className="flex items-center justify-between px-2 py-5">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < currentIdx
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                  : i === currentIdx
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/30 ring-4 ring-primary-100"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < currentIdx ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span
              className={`text-[10px] mt-1 ${
                i <= currentIdx ? "text-primary-600 font-medium" : "text-gray-400"
              }`}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-colors ${
                i < currentIdx ? "bg-primary-400" : "bg-gray-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Initials Avatar
// ==========================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "from-primary-400 to-primary-600",
  "from-secondary-400 to-secondary-600",
  "from-success-400 to-success-600",
  "from-warning-400 to-warning-600",
  "from-pink-400 to-pink-600",
  "from-cyan-400 to-cyan-600",
];

// ==========================================
// Main Page
// ==========================================

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [step, setStep] = useState<Step>("service");
  const [info, setInfo] = useState<BarbershopInfo | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Selections
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Client data
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Result
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  // Load barbershop info + services
  useEffect(() => {
    async function load() {
      try {
        const [infoRes, servicesRes] = await Promise.all([
          fetch(`/api/book/${slug}/info`),
          fetch(`/api/book/${slug}/services`),
        ]);

        if (!infoRes.ok) {
          setNotFound(true);
          return;
        }

        setInfo(await infoRes.json());
        const svcData = await servicesRes.json();
        setServices(Array.isArray(svcData) ? svcData : []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // Load professionals when service is selected
  useEffect(() => {
    if (!selectedService) {
      setProfessionals([]);
      return;
    }

    fetch(`/api/book/${slug}/professionals?service_id=${selectedService.id}`)
      .then((r) => r.json())
      .then((data) => setProfessionals(Array.isArray(data) ? data : []))
      .catch(() => setProfessionals([]));
  }, [slug, selectedService]);

  // Load slots when professional + date are selected
  const fetchSlots = useCallback(async () => {
    if (!selectedProfessional || !selectedDate || !selectedService) return;

    setLoadingSlots(true);
    setSelectedTime("");

    try {
      const res = await fetch(
        `/api/book/${slug}/slots?date=${selectedDate}&professional_id=${selectedProfessional.id}&service_id=${selectedService.id}`
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [slug, selectedProfessional, selectedDate, selectedService]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Phone mask
  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit() {
    if (!selectedService || !selectedProfessional || !selectedTime || !clientName || !clientPhone) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/book/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientPhone: clientPhone.replace(/\D/g, ""),
          clientEmail: clientEmail.trim() || undefined,
          professionalId: selectedProfessional.id,
          serviceId: selectedService.id,
          date: selectedDate,
          startTime: selectedTime,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingResult(data);
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao agendar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  // Date helpers
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const maxDate30 = new Date(today);
  maxDate30.setDate(maxDate30.getDate() + 30);
  const maxDate = `${maxDate30.getFullYear()}-${String(maxDate30.getMonth() + 1).padStart(2, "0")}-${String(maxDate30.getDate()).padStart(2, "0")}`;

  // ==========================================
  // Render States
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
          <p className="text-xs text-gray-400 mt-3">Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Scissors className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Barbearia não encontrada</h1>
        <p className="text-sm text-gray-500 text-center">
          Verifique o link e tente novamente.
        </p>
      </div>
    );
  }

  // Success screen
  if (bookingResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-success-50/50">
            <CheckCircle className="w-10 h-10 text-success-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Tudo certo!</h1>
          <p className="text-sm text-gray-500 mt-1">
            Seu agendamento foi confirmado
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-50 px-5 py-3">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
              Detalhes do agendamento
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Serviço</p>
                <p className="text-sm font-medium text-gray-800">{bookingResult.service}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Profissional</p>
                <p className="text-sm font-medium text-gray-800">{bookingResult.professional}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Data</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(bookingResult.date + "T12:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Horário</p>
                <p className="text-sm font-medium text-gray-800">
                  {bookingResult.startTime} - {bookingResult.endTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {info?.phone && (
          <a
            href={`https://wa.me/${info.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-success-500 text-white text-sm font-semibold rounded-xl hover:bg-success-600 transition-colors"
          >
            <Phone size={16} />
            Falar no WhatsApp
          </a>
        )}

        <button
          onClick={() => {
            setBookingResult(null);
            setStep("service");
            setSelectedService(null);
            setSelectedProfessional(null);
            setSelectedDate("");
            setSelectedTime("");
            setClientName("");
            setClientPhone("");
            setClientEmail("");
          }}
          className="w-full mt-3 py-3 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          Agendar outro horário
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="text-center pt-6 pb-1">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/20">
          {info?.logoUrl ? (
            <img
              src={info.logoUrl}
              alt={info.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <Scissors className="w-7 h-7 text-white" />
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-800">{info?.name}</h1>
        {info?.address && (
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
            <MapPin size={11} />
            {info.address}{info.city ? `, ${info.city}` : ""}
            {info.state ? `/${info.state}` : ""}
          </p>
        )}
      </div>

      <BookingStepper currentStep={step} />

      {/* Step: Service */}
      {step === "service" && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Escolha o serviço</h2>
          {services.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Nenhum serviço disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedService(s);
                    setSelectedProfessional(null);
                    setSelectedTime("");
                    goNext();
                  }}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                    selectedService?.id === s.id
                      ? "border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10"
                      : "border-gray-100 bg-white hover:border-primary-200 hover:shadow-sm"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center mb-2.5">
                    <Scissors className="w-4 h-4 text-primary-500" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 block leading-tight">
                    {s.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{s.durationMinutes}min</span>
                  </div>
                  <p className="text-sm font-bold text-primary-600 mt-2">
                    R$ {s.price.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Professional */}
      {step === "professional" && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Escolha o profissional</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {professionals.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProfessional(p);
                  setSelectedTime("");
                  goNext();
                }}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
                  selectedProfessional?.id === p.id
                    ? "border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10"
                    : "border-gray-100 bg-white hover:border-primary-200 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden mb-2.5 bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} shadow-sm`}
                >
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-base">
                      {getInitials(p.name)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mt-5 mx-auto transition-colors"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
        </div>
      )}

      {/* Step: Date & Time */}
      {step === "datetime" && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Escolha data e horário</h2>

          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Data</label>
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
              }}
              className="w-full px-3.5 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-white transition-colors"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Horário</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Buscando horários...
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Sem horários disponíveis nesta data.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedTime(slot.start)}
                      className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                        selectedTime === slot.start
                          ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                          : "bg-white border-2 border-gray-100 text-gray-700 hover:border-primary-200"
                      }`}
                    >
                      {slot.start}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft size={16} /> Voltar
            </button>
            <button
              onClick={goNext}
              disabled={!selectedTime}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary-500/20 disabled:shadow-none"
            >
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Seus dados</h2>

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome completo</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">WhatsApp</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(formatPhone(e.target.value))}
                className="w-full px-3.5 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                E-mail <span className="text-gray-300 font-normal">(opcional)</span>
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3.5 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden mb-5">
            <div className="bg-gray-50 px-4 py-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resumo</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors size={13} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Serviço</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{selectedService?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={13} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Profissional</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{selectedProfessional?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays size={13} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Data</span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {selectedDate &&
                    new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Horário</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={13} className="text-primary-500" />
                  <span className="text-sm font-medium text-gray-600">Total</span>
                </div>
                <span className="text-lg font-bold text-primary-600">
                  R$ {selectedService?.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl mb-4">
              <p className="text-xs text-danger-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !clientName.trim() || clientPhone.replace(/\D/g, "").length < 10}
            className="w-full py-3.5 bg-primary-500 text-white text-sm font-bold rounded-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-500/20 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Agendando..." : "Confirmar agendamento"}
          </button>

          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mt-4 mx-auto transition-colors"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-10 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-300">
          Powered by <span className="font-semibold text-gray-400">BabIA</span>
        </p>
      </div>
    </div>
  );
}
