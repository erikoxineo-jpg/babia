# 08 - Entidades de Domínio

> BarberFlow -- SaaS multi-tenant de crescimento para barbearias
> Entidades com atributos, validações, regras de negócio e transições de estado
> Última atualização: 2026-03-31

---

## Sumário

1. [Tenant](#1-tenant)
2. [User](#2-user)
3. [Professional](#3-professional)
4. [Service](#4-service)
5. [Client](#5-client)
6. [Appointment](#6-appointment)
7. [ScheduleBlock](#7-scheduleblock)
8. [Waitlist](#8-waitlist)
9. [Campaign](#9-campaign)
10. [Plan](#10-plan)
11. [ClientPlan](#11-clientplan)
12. [Transaction](#12-transaction)
13. [Notification](#13-notification)

---

## 1. Tenant

### Descrição
Representa uma barbearia (empresa) no sistema. É a raiz do isolamento multi-tenant. Todos os dados de negócio pertencem a um tenant.

### Atributos TypeScript

```typescript
interface Tenant {
  id: string;           // UUID
  name: string;         // Nome da barbearia
  slug: string;         // URL-friendly: "barbearia-do-ze"
  phone: string;        // Telefone principal
  email: string;        // Email de contato/login do owner
  address?: string;     // Endereço completo
  city?: string;        // Cidade
  state?: string;       // UF (2 caracteres)
  logoUrl?: string;     // URL da logo
  timezone: string;     // Fuso horário (ex: "America/Sao_Paulo")
  plan: TenantPlan;     // Plano do SaaS
  status: TenantStatus; // Estado do tenant
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;     // Soft delete
}

type TenantPlan = 'free' | 'starter' | 'professional' | 'premium';
type TenantStatus = 'active' | 'suspended' | 'cancelled';
```

### Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, 2-200 caracteres |
| `slug` | Obrigatório, lowercase, apenas letras/números/hífens, 3-100 caracteres, único globalmente |
| `phone` | Obrigatório, 10-11 dígitos numéricos (DDD + número) |
| `email` | Obrigatório, formato de email válido, único globalmente |
| `state` | Opcional, exatamente 2 letras maiúsculas (UF brasileira) |
| `timezone` | Obrigatório, deve ser um timezone IANA válido |
| `logoUrl` | Opcional, URL válida |

### Transições de Status

```
active --> suspended    (inadimplência ou violação de termos)
active --> cancelled    (cancelamento voluntário)
suspended --> active    (regularização do pagamento)
suspended --> cancelled (cancelamento após período suspenso)
cancelled --> active    (reativação da conta -- caso especial)
```

### Regras de Negócio

- Um tenant `suspended` não permite login de nenhum usuário.
- Um tenant `cancelled` tem seus dados mantidos por 90 dias antes de exclusão definitiva.
- O `slug` é usado na URL pública de agendamento: `app.barberflow.com/{slug}`.
- Limites por plano:

| Recurso | free | starter | professional | premium |
|---|---|---|---|---|
| Profissionais | 1 | 3 | 10 | Ilimitado |
| Agendamentos/mês | 50 | 200 | Ilimitado | Ilimitado |
| Campanhas/mês | 0 | 2 | 10 | Ilimitado |
| Notificações WhatsApp | 0 | 100 | 500 | Ilimitado |

---

## 2. User

### Descrição
Usuário com acesso ao sistema. Cada usuário pertence a um tenant e possui um role que define suas permissões.

### Atributos TypeScript

```typescript
interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

type UserRole = 'owner' | 'admin' | 'professional' | 'receptionist';
```

### Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, 2-200 caracteres |
| `email` | Obrigatório, formato de email válido, único por tenant |
| `phone` | Opcional, 10-11 dígitos numéricos |
| `password` | Mínimo 8 caracteres, pelo menos 1 letra e 1 número (validação antes do hash) |
| `role` | Obrigatório, um dos valores do enum |

### Regras de Negócio

- Cada tenant deve ter pelo menos 1 usuário com role `owner`.
- O `owner` não pode ser desativado nem ter seu role alterado (exceto por suporte).
- O `password_hash` usa bcrypt com salt rounds = 12.
- Email é único dentro do tenant, mas o mesmo email pode existir em tenants diferentes.
- Permissões por role:

| Ação | owner | admin | professional | receptionist |
|---|---|---|---|---|
| Gerenciar tenant | Sim | Nao | Nao | Nao |
| Gerenciar usuários | Sim | Sim | Nao | Nao |
| Gerenciar profissionais | Sim | Sim | Nao | Nao |
| Gerenciar serviços | Sim | Sim | Nao | Nao |
| Ver todos agendamentos | Sim | Sim | Nao | Sim |
| Criar agendamentos | Sim | Sim | Sim (próprio) | Sim |
| Ver financeiro | Sim | Sim | Nao | Nao |
| Gerenciar campanhas | Sim | Sim | Nao | Nao |
| Ver própria agenda | Sim | Sim | Sim | Nao |

---

## 3. Professional

### Descrição
Profissional/barbeiro que presta serviços. Pode ou não ter um `User` vinculado (profissional sem acesso ao sistema).

### Atributos TypeScript

```typescript
interface Professional {
  id: string;
  tenantId: string;
  userId?: string;       // Pode ser null se o profissional não tem login
  name: string;
  phone?: string;
  avatarUrl?: string;
  specialty?: string;    // Ex: "Corte degradê", "Barba artística"
  isActive: boolean;
  displayOrder: number;  // Ordem de exibição na UI
  createdAt: Date;
  deletedAt?: Date;

  // Relações
  schedules: ProfessionalSchedule[];
  breaks: ProfessionalBreak[];
  services: Service[];
}

interface ProfessionalSchedule {
  id: string;
  professionalId: string;
  dayOfWeek: number;     // 0=Domingo, 6=Sábado
  startTime: string;     // "HH:MM"
  endTime: string;       // "HH:MM"
  isActive: boolean;
}

interface ProfessionalBreak {
  id: string;
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
```

### Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, 2-200 caracteres |
| `phone` | Opcional, 10-11 dígitos numéricos |
| `specialty` | Opcional, máximo 200 caracteres |
| `displayOrder` | Inteiro >= 0 |
| `dayOfWeek` (schedule) | Inteiro 0-6 |
| `startTime` (schedule) | Formato HH:MM, deve ser anterior a endTime |
| `endTime` (schedule) | Formato HH:MM, deve ser posterior a startTime |

### Regras de Negócio

- Um profissional pode ter no máximo 1 schedule por dia da semana.
- Um profissional pode ter múltiplas pausas no mesmo dia, desde que não se sobreponham.
- As pausas devem estar dentro do horário de trabalho do dia.
- Profissional desativado (`isActive = false`) não aparece na página de agendamento público.
- Profissional com `deletedAt` preenchido é soft deleted e não aparece em nenhuma listagem.
- Profissional com agendamentos futuros não pode ser desativado sem cancelar/reatribuir os agendamentos.
- Quando `userId` é fornecido, deve ser único por tenant (1 user = 1 professional).

### Computed Fields

```typescript
// Disponibilidade em uma data específica
function isAvailableOn(date: Date): boolean;

// Próximo horário disponível
function nextAvailableSlot(date: Date, durationMinutes: number): TimeSlot | null;
```

---

## 4. Service

### Descrição
Serviço oferecido pela barbearia. Define nome, preço, duração e categoria.

### Atributos TypeScript

```typescript
interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  durationMinutes: number;   // Duração do serviço em minutos
  price: number;             // Preço em reais (decimal 2 casas)
  category?: string;         // Ex: "Corte", "Barba", "Tratamento"
  intervalMinutes: number;   // Intervalo entre atendimentos (limpeza/preparação)
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;

  // Relações
  professionals: Professional[];
}
```

### Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, 2-200 caracteres |
| `description` | Opcional, máximo 1000 caracteres |
| `durationMinutes` | Obrigatório, inteiro > 0, máximo 480 (8 horas) |
| `price` | Obrigatório, decimal >= 0 (zero para cortesias) |
| `category` | Opcional, máximo 100 caracteres |
| `intervalMinutes` | Inteiro >= 0, padrão 0, máximo 60 |
| `displayOrder` | Inteiro >= 0 |

### Regras de Negócio

- O slot de tempo total ocupado por um serviço é `durationMinutes + intervalMinutes`.
- Serviço desativado (`isActive = false`) não aparece na página de agendamento público.
- Serviço com agendamentos futuros não pode ser deletado, apenas desativado.
- Ao criar um agendamento, o `price` do appointment copia o `price` do serviço naquele momento (snapshot).
- Categorias sugeridas: "Corte", "Barba", "Combo", "Tratamento", "Outros". Mas o campo é livre.

---

## 5. Client

### Descrição
Cliente da barbearia. Contém dados de contato e métricas de engajamento calculadas automaticamente.

### Atributos TypeScript

```typescript
interface Client {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;           // Observações internas (preferências, alergias)
  status: ClientStatus;
  firstVisit?: Date;        // Data da primeira visita
  lastVisit?: Date;         // Data da última visita
  totalVisits: number;      // Total de visitas concluídas
  totalSpent: number;       // Total gasto em reais
  averageTicket: number;    // Ticket médio
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type ClientStatus = 'active' | 'at_risk' | 'inactive';
```

### Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, 2-200 caracteres |
| `phone` | Obrigatório, 10-11 dígitos numéricos, único por tenant |
| `email` | Opcional, formato de email válido |
| `notes` | Opcional, máximo 2000 caracteres |
| `totalVisits` | Inteiro >= 0 |
| `totalSpent` | Decimal >= 0 |
| `averageTicket` | Decimal >= 0 |

### Transições de Status

```
active   --> at_risk    (dias sem visita > 50% do threshold)
active   --> inactive   (dias sem visita > threshold)
at_risk  --> active     (nova visita realizada)
at_risk  --> inactive   (dias sem visita > threshold)
inactive --> active     (nova visita realizada)
```

A transição é automática, executada por um job diário que avalia `daysSinceLastVisit` contra o `inactive_days_threshold` configurado no `tenant_settings`.

### Regras de Negócio

- O `phone` é o identificador principal do cliente (usado para WhatsApp).
- O status é calculado automaticamente com base em `lastVisit` e `tenant_settings.inactive_days_threshold`:
  - `active`: visitou nos últimos N dias
  - `at_risk`: não visita há mais de 50% de N dias
  - `inactive`: não visita há mais de N dias
- Métricas são atualizadas automaticamente ao concluir um agendamento:
  - `totalVisits += 1`
  - `totalSpent += appointment.price`
  - `averageTicket = totalSpent / totalVisits`
  - `lastVisit = appointment.date`
  - Se `firstVisit` é null, `firstVisit = appointment.date`
- Cliente com soft delete não aparece em buscas, mas seus agendamentos históricos são mantidos.

### Computed Fields

```typescript
// Dias desde a última visita
get daysSinceLastVisit(): number | null {
  if (!this.lastVisit) return null;
  return differenceInDays(new Date(), this.lastVisit);
}

// Frequência média (dias entre visitas)
get averageFrequencyDays(): number | null {
  if (this.totalVisits < 2 || !this.firstVisit || !this.lastVisit) return null;
  const totalDays = differenceInDays(this.lastVisit, this.firstVisit);
  return Math.round(totalDays / (this.totalVisits - 1));
}

// Previsão da próxima visita
get predictedNextVisit(): Date | null {
  if (!this.lastVisit || !this.averageFrequencyDays) return null;
  return addDays(this.lastVisit, this.averageFrequencyDays);
}

// Score de risco de churn (0-100)
get churnRiskScore(): number {
  if (!this.daysSinceLastVisit || !this.averageFrequencyDays) return 0;
  const ratio = this.daysSinceLastVisit / this.averageFrequencyDays;
  return Math.min(100, Math.round(ratio * 50));
}

// Label de recência para display
get recencyLabel(): string {
  const days = this.daysSinceLastVisit;
  if (days === null) return 'Nunca visitou';
  if (days <= 7) return 'Esta semana';
  if (days <= 14) return 'Semana passada';
  if (days <= 30) return 'Este mês';
  if (days <= 60) return 'Mês passado';
  return `Há ${days} dias`;
}
```

---

## 6. Appointment

### Descrição
Agendamento de um serviço. Entidade central que conecta cliente, profissional e serviço em um horário específico.

### Atributos TypeScript

```typescript
interface Appointment {
  id: string;
  tenantId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: Date;              // Data do agendamento (YYYY-MM-DD)
  startTime: string;       // Hora de início "HH:MM"
  endTime: string;         // Hora de término "HH:MM"
  status: AppointmentStatus;
  price: number;           // Preço cobrado (snapshot no momento do agendamento)
  notes?: string;
  source: AppointmentSource;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;

  // Relações
  client: Client;
  professional: Professional;
  service: Service;
  history: AppointmentHistory[];
}

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
type AppointmentSource = 'public' | 'internal' | 'campaign';
```

### Validações

| Campo | Regra |
|---|---|
| `date` | Obrigatório, não pode ser no passado (exceto criação interna) |
| `startTime` | Obrigatório, formato HH:MM, deve ser anterior a endTime |
| `endTime` | Obrigatório, formato HH:MM, deve ser posterior a startTime |
| `price` | Obrigatório, decimal >= 0 |
| `notes` | Opcional, máximo 1000 caracteres |
| `date` | Não pode ultrapassar `booking_advance_days` dias no futuro (agendamento público) |

### Transições de Status

```
                  +--> confirmed --+--> completed
                  |                |
pending ----------+                +--> cancelled
                  |                |
                  +----------------+--> no_show
                  |
                  +--> cancelled
```

Regras de transição:

| De | Para | Condição |
|---|---|---|
| `pending` | `confirmed` | Confirmação manual ou automática (via notificação) |
| `pending` | `cancelled` | Cancelamento pelo cliente ou operador |
| `confirmed` | `completed` | Atendimento finalizado |
| `confirmed` | `cancelled` | Cancelamento (respeitando `cancellation_policy_hours`) |
| `confirmed` | `no_show` | Cliente não compareceu |
| `pending` | `no_show` | Cliente não compareceu e não havia confirmado |
| `completed` | *(nenhum)* | Status final, irreversível |
| `cancelled` | *(nenhum)* | Status final, irreversível |
| `no_show` | *(nenhum)* | Status final, irreversível |

### Regras de Negócio

- **Conflito de horário:** Não pode existir dois agendamentos ativos (status != `cancelled` e != `no_show`) para o mesmo profissional com sobreposição de horário na mesma data.
- **Horário de trabalho:** O agendamento deve estar dentro do horário de trabalho do profissional no dia da semana correspondente.
- **Pausas e bloqueios:** O agendamento não pode sobrepor pausas do profissional nem bloqueios de horário.
- **Serviço do profissional:** O profissional deve estar associado ao serviço na tabela `professional_services`.
- **Preço snapshot:** O `price` é copiado do serviço no momento da criação, não muda se o preço do serviço mudar depois.
- **Cancelamento:** O cliente só pode cancelar se faltar mais de `cancellation_policy_hours` horas para o agendamento. O operador pode cancelar a qualquer momento.
- **Confirmação automática:** Se `confirmation_enabled` no `tenant_settings`, uma notificação de confirmação é enviada automaticamente.
- **Lembrete:** Se configurado, um lembrete é agendado para `reminder_hours_before` horas antes do horário.
- **Source tracking:** `public` = agendamento pelo link público, `internal` = criado pelo operador, `campaign` = originado de uma campanha de reativação.
- **Ao completar:** Atualiza métricas do cliente (`totalVisits`, `totalSpent`, `averageTicket`, `lastVisit`) e cria uma `Transaction`.

### Computed Fields

```typescript
// Duração total em minutos
get durationMinutes(): number {
  return differenceInMinutes(parseTime(this.endTime), parseTime(this.startTime));
}

// Pode ser cancelado pelo cliente?
get isCancellableByClient(): boolean {
  if (this.status === 'cancelled' || this.status === 'completed' || this.status === 'no_show') return false;
  const hoursUntil = differenceInHours(this.dateTime, new Date());
  return hoursUntil >= this.tenant.settings.cancellationPolicyHours;
}

// Está no passado?
get isPast(): boolean {
  return isBefore(this.dateTime, new Date());
}

// DateTime combinado
get dateTime(): Date {
  return combineDateAndTime(this.date, this.startTime);
}
```

---

## 7. ScheduleBlock

### Descrição
Bloqueio de horário em uma data específica para um profissional. Impede agendamentos naquele intervalo.

### Atributos TypeScript

```typescript
interface ScheduleBlock {
  id: string;
  professionalId: string;
  date: Date;
  startTime: string;     // "HH:MM"
  endTime: string;       // "HH:MM"
  reason?: string;       // Ex: "Consulta médica", "Férias"
  createdAt: Date;
}
```

### Validações

| Campo | Regra |
|---|---|
| `date` | Obrigatório, não pode ser no passado |
| `startTime` | Obrigatório, formato HH:MM, deve ser anterior a endTime |
| `endTime` | Obrigatório, formato HH:MM, deve ser posterior a startTime |
| `reason` | Opcional, máximo 500 caracteres |

### Regras de Negócio

- Ao criar um bloqueio, verificar se existem agendamentos ativos no período. Se existirem, exibir alerta e exigir confirmação (os agendamentos existentes permanecem, mas novos não serão aceitos).
- Bloqueios não se sobrepõem automaticamente -- podem coexistir.
- Um bloqueio de dia inteiro pode ser criado usando `startTime = "00:00"` e `endTime = "23:59"`.
- Bloqueios passados são mantidos para histórico, mas ignorados na lógica de disponibilidade.

---

## 8. Waitlist

### Descrição
Entrada na lista de espera. Um cliente que deseja atendimento mas não encontrou horário disponível.

### Atributos TypeScript

```typescript
interface WaitlistEntry {
  id: string;
  tenantId: string;
  clientId: string;
  serviceId: string;
  professionalId?: string;  // Preferência de profissional (opcional)
  preferredDate: Date;
  preferredPeriod: PreferredPeriod;
  status: WaitlistStatus;
  createdAt: Date;
}

type PreferredPeriod = 'morning' | 'afternoon' | 'evening';
type WaitlistStatus = 'waiting' | 'notified' | 'scheduled' | 'expired';
```

### Validações

| Campo | Regra |
|---|---|
| `preferredDate` | Obrigatório, não pode ser no passado |
| `preferredPeriod` | Obrigatório, um dos valores do enum |

### Transições de Status

```
waiting --> notified    (horário liberado, cliente notificado via WhatsApp)
waiting --> expired     (data preferida já passou sem resolução)
notified --> scheduled  (cliente agendou após ser notificado)
notified --> expired    (cliente não respondeu dentro do prazo)
```

### Regras de Negócio

- Quando um agendamento é cancelado, o sistema verifica a lista de espera para aquele profissional/serviço/data e notifica clientes correspondentes.
- Definição de períodos:
  - `morning`: 06:00 - 12:00
  - `afternoon`: 12:00 - 18:00
  - `evening`: 18:00 - 22:00
- Um cliente pode ter múltiplas entradas na lista de espera para datas/períodos diferentes.
- Entradas com `preferredDate` no passado são automaticamente marcadas como `expired` pelo job diário.
- O cliente notificado tem 2 horas para responder antes de a vaga ser oferecida ao próximo da fila.

---

## 9. Campaign

### Descrição
Campanha de marketing enviada via WhatsApp para um segmento de clientes.

### Atributos TypeScript

```typescript
interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  type: CampaignType;
  template: string;           // Template da mensagem com variáveis
  targetSegment: TargetSegment;
  status: CampaignStatus;
  sentCount: number;
  responseCount: number;
  createdAt: Date;
  sentAt?: Date;

  // Relações
  messages: CampaignMessage[];
}

type CampaignType = 'reactivation' | 'fill_slots' | 'promotion';
type CampaignStatus = 'draft' | 'sending' | 'sent' | 'completed';

interface TargetSegment {
  status?: ClientStatus;                // Filtrar por status do cliente
  daysSinceVisitMin?: number;           // Mínimo de dias desde a última visita
  daysSinceVisitMax?: number;           // Máximo de dias desde a última visita
  minTotalVisits?: number;              // Mínimo de visitas totais
  minTotalSpent?: number;               // Mínimo gasto total
  serviceIds?: string[];                // Clientes que usaram estes serviços
  excludeActivePlan?: boolean;          // Excluir clientes com plano ativo
}

interface CampaignMessage {
  id: string;
  campaignId: string;
  clientId: string;
  status: CampaignMessageStatus;
  sentAt?: Date;
}

type CampaignMessageStatus = 'pending' | 'sent' | 'delivered' | 'responded';
```

### Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, 2-200 caracteres |
| `template` | Obrigatório, máximo 1000 caracteres, deve conter pelo menos `{{nome}}` |
| `targetSegment` | Obrigatório, pelo menos 1 critério definido |
| `sentCount` | Inteiro >= 0 |
| `responseCount` | Inteiro >= 0, <= sentCount |

### Transições de Status

```
draft --> sending     (operador clica em "Enviar")
sending --> sent      (todas as mensagens foram enfileiradas)
sent --> completed    (período de acompanhamento finalizado, métricas consolidadas)
```

### Regras de Negócio

- Variáveis disponíveis no template:
  - `{{nome}}` -- nome do cliente
  - `{{dias_sem_visita}}` -- dias desde a última visita
  - `{{servico_favorito}}` -- serviço mais frequente
  - `{{link_agendamento}}` -- link público de agendamento
- Uma campanha não pode ser editada após sair do status `draft`.
- O `targetSegment` é resolvido no momento do envio (snapshot dos clientes que atendem aos critérios).
- Limite de campanhas por plano do tenant (ver Tenant).
- Não enviar para clientes que já receberam campanha nos últimos 7 dias (anti-spam).
- Taxa de resposta = `responseCount / sentCount * 100`.

### Computed Fields

```typescript
// Taxa de resposta
get responseRate(): number {
  if (this.sentCount === 0) return 0;
  return Math.round((this.responseCount / this.sentCount) * 100);
}

// Taxa de entrega
get deliveryRate(): number {
  const delivered = this.messages.filter(m => m.status !== 'pending').length;
  return this.messages.length > 0 ? Math.round((delivered / this.messages.length) * 100) : 0;
}
```

---

## 10. Plan

### Descrição
Plano ou combo vendido pela barbearia. Define um pacote de sessões por um preço fixo com validade.

### Atributos TypeScript

```typescript
interface Plan {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number;            // Preço do plano em reais
  durationDays: number;     // Validade em dias
  totalSessions: number;    // Quantidade de sessões inclusas
  services: string[];       // UUIDs dos serviços incluídos
  isActive: boolean;
  createdAt: Date;
}
```

### Validações

| Campo | Regra |
|---|---|
| `name` | Obrigatório, 2-200 caracteres |
| `description` | Opcional, máximo 1000 caracteres |
| `price` | Obrigatório, decimal > 0 |
| `durationDays` | Obrigatório, inteiro > 0, máximo 365 |
| `totalSessions` | Obrigatório, inteiro > 0, máximo 100 |
| `services` | Obrigatório, array não vazio de UUIDs válidos referenciando serviços ativos do tenant |

### Regras de Negócio

- Ao vender um plano, cria-se um `ClientPlan` com `startDate = hoje` e `endDate = hoje + durationDays`.
- Ao vender um plano, cria-se uma `Transaction` do tipo `plan`.
- O `services` define quais serviços podem ser usados com as sessões do plano.
- Plano desativado não aparece para venda, mas os `ClientPlan` existentes continuam válidos.
- Exemplos de planos:
  - "4 Cortes" -- R$100, 30 dias, 4 sessões, serviço: [corte]
  - "Combo Mensal" -- R$150, 30 dias, 4 sessões, serviços: [corte, barba]

---

## 11. ClientPlan

### Descrição
Plano adquirido por um cliente. Controla o consumo de sessões e a validade.

### Atributos TypeScript

```typescript
interface ClientPlan {
  id: string;
  clientId: string;
  planId: string;
  sessionsUsed: number;
  sessionsTotal: number;
  startDate: Date;
  endDate: Date;
  status: ClientPlanStatus;
  createdAt: Date;

  // Relações
  client: Client;
  plan: Plan;
}

type ClientPlanStatus = 'active' | 'expired' | 'cancelled';
```

### Validações

| Campo | Regra |
|---|---|
| `sessionsUsed` | Inteiro >= 0, <= sessionsTotal |
| `sessionsTotal` | Inteiro > 0 |
| `startDate` | Obrigatório |
| `endDate` | Obrigatório, > startDate |

### Transições de Status

```
active --> expired      (endDate ultrapassada OU sessionsUsed == sessionsTotal)
active --> cancelled    (cancelamento manual pelo operador)
```

### Regras de Negócio

- Ao completar um agendamento cujo serviço está incluído no plano ativo do cliente:
  - `sessionsUsed += 1`
  - O pagamento do agendamento é registrado com `payment_method = 'plan_session'` e `amount = 0` (ou valor proporcional).
- Um cliente pode ter no máximo 1 plano ativo por vez.
- Quando `sessionsUsed == sessionsTotal`, o status muda automaticamente para `expired`.
- Quando `endDate` é ultrapassada, um job diário marca como `expired` (sessões restantes são perdidas).
- Cancelamento de plano pode gerar estorno proporcional (regra de negócio do tenant).

### Computed Fields

```typescript
// Sessões restantes
get sessionsRemaining(): number {
  return this.sessionsTotal - this.sessionsUsed;
}

// Percentual de uso
get usagePercentage(): number {
  return Math.round((this.sessionsUsed / this.sessionsTotal) * 100);
}

// Dias restantes
get daysRemaining(): number {
  return Math.max(0, differenceInDays(this.endDate, new Date()));
}

// Está válido?
get isValid(): boolean {
  return this.status === 'active' && this.sessionsRemaining > 0 && !isPast(this.endDate);
}

// Valor por sessão
get pricePerSession(): number {
  return this.plan.price / this.sessionsTotal;
}
```

---

## 12. Transaction

### Descrição
Registro financeiro de movimentação monetária. Cada atendimento concluído, venda de plano ou produto gera uma transação.

### Atributos TypeScript

```typescript
interface Transaction {
  id: string;
  tenantId: string;
  appointmentId?: string;    // Null se for venda de plano/produto
  clientPlanId?: string;     // Preenchido se for venda de plano
  clientId: string;
  type: TransactionType;
  amount: number;            // Valor em reais
  paymentMethod: PaymentMethod;
  date: Date;
  createdAt: Date;
}

type TransactionType = 'service' | 'plan' | 'product';
type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'plan_session';
```

### Validações

| Campo | Regra |
|---|---|
| `amount` | Obrigatório, decimal > 0 |
| `date` | Obrigatório |
| `paymentMethod` | Obrigatório, um dos valores do enum |
| `type` | Obrigatório, um dos valores do enum |
| Consistência | Se `type = 'service'`, `appointmentId` deve estar preenchido |
| Consistência | Se `type = 'plan'`, `clientPlanId` deve estar preenchido |

### Regras de Negócio

- Transações são imutáveis (append-only). Não há UPDATE nem DELETE.
- Estornos são registrados como novas transações com valor negativo (se implementado no futuro, criar um campo `is_refund`).
- `payment_method = 'plan_session'` indica que o pagamento foi feito com uma sessão do plano do cliente.
- Ao completar um agendamento:
  - Se o cliente tem plano ativo e o serviço está incluído: `type = 'service'`, `payment_method = 'plan_session'`, `amount = 0`.
  - Caso contrário: `type = 'service'`, método de pagamento informado, `amount = appointment.price`.
- Ao vender um plano: `type = 'plan'`, `amount = plan.price`.

### Computed Fields (Agregações por Tenant)

```typescript
// Receita do dia
function revenueToday(tenantId: string): number;

// Receita do mês
function revenueMonth(tenantId: string, month: number, year: number): number;

// Ticket médio do período
function averageTicket(tenantId: string, startDate: Date, endDate: Date): number;

// Distribuição por método de pagamento
function paymentMethodBreakdown(tenantId: string, startDate: Date, endDate: Date): Record<PaymentMethod, number>;
```

---

## 13. Notification

### Descrição
Notificação ou lembrete enviado ao cliente via WhatsApp, SMS ou email.

### Atributos TypeScript

```typescript
interface Notification {
  id: string;
  tenantId: string;
  type: NotificationType;
  appointmentId?: string;     // Null para notificações que não são sobre agendamento
  clientId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor: Date;         // Quando deve ser enviada
  sentAt?: Date;              // Quando foi efetivamente enviada
  createdAt: Date;
}

type NotificationType = 'confirmation' | 'reminder' | 'reactivation' | 'waitlist';
type NotificationChannel = 'whatsapp' | 'sms' | 'email';
type NotificationStatus = 'pending' | 'sent' | 'failed';
```

### Validações

| Campo | Regra |
|---|---|
| `scheduledFor` | Obrigatório, deve ser uma data/hora válida |
| `type` | Obrigatório |
| `channel` | Obrigatório |
| Consistência | Se `type` = `confirmation` ou `reminder`, `appointmentId` obrigatório |

### Transições de Status

```
pending --> sent     (envio bem-sucedido)
pending --> failed   (erro no envio: número inválido, API fora, etc.)
```

### Regras de Negócio

- **Confirmação:** Criada automaticamente ao criar um agendamento (se `confirmation_enabled`). `scheduledFor = createdAt` (envio imediato).
- **Lembrete:** Criada automaticamente ao criar/confirmar um agendamento. `scheduledFor = appointment.dateTime - reminder_hours_before`.
- **Reativação:** Criada ao enviar uma campanha de reativação.
- **Waitlist:** Criada quando um horário é liberado e o cliente está na lista de espera.
- Um worker (cron) roda a cada minuto buscando notificações com `status = 'pending'` e `scheduledFor <= NOW()`.
- Se o envio falha, o status muda para `failed`. Não há retry automático (pode ser implementado futuramente).
- Se o agendamento for cancelado, as notificações pendentes associadas são marcadas como `failed` (sem envio).
- Limite de notificações WhatsApp por plano do tenant (ver Tenant).
- Prioridade de canal: WhatsApp > SMS > Email.

---

> **Próximo documento:** 09-relacionamentos.md (ERD textual e regras de integridade).
