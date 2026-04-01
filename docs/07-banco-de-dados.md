# 07 - Banco de Dados PostgreSQL

> BarberFlow -- SaaS multi-tenant de crescimento para barbearias
> Stack: PostgreSQL 15+ / Prisma ORM
> Última atualização: 2026-03-31

---

## Sumário

1. [Convenções Gerais](#1-convenções-gerais)
2. [Enums](#2-enums)
3. [Tabelas](#3-tabelas)
   - 3.1 [tenants](#31-tenants)
   - 3.2 [users](#32-users)
   - 3.3 [sessions](#33-sessions)
   - 3.4 [professionals](#34-professionals)
   - 3.5 [professional_schedules](#35-professional_schedules)
   - 3.6 [professional_breaks](#36-professional_breaks)
   - 3.7 [services](#37-services)
   - 3.8 [professional_services](#38-professional_services)
   - 3.9 [clients](#39-clients)
   - 3.10 [appointments](#310-appointments)
   - 3.11 [appointment_history](#311-appointment_history)
   - 3.12 [schedule_blocks](#312-schedule_blocks)
   - 3.13 [waitlist](#313-waitlist)
   - 3.14 [campaigns](#314-campaigns)
   - 3.15 [campaign_messages](#315-campaign_messages)
   - 3.16 [plans](#316-plans)
   - 3.17 [client_plans](#317-client_plans)
   - 3.18 [transactions](#318-transactions)
   - 3.19 [tenant_settings](#319-tenant_settings)
   - 3.20 [notifications](#320-notifications)
4. [Resumo de Índices Estratégicos](#4-resumo-de-índices-estratégicos)
5. [Row Level Security (RLS)](#5-row-level-security-rls)

---

## 1. Convenções Gerais

| Regra | Decisão |
|---|---|
| Nomes de tabelas | `snake_case`, plural em inglês |
| Nomes de colunas | `snake_case` |
| Primary keys | `id UUID DEFAULT gen_random_uuid()` |
| Foreign keys | `<entidade_singular>_id` |
| Timestamps | `TIMESTAMPTZ` (com timezone), armazenados em UTC |
| Dinheiro | `DECIMAL(10,2)` |
| Horários de trabalho | `TIME` (HH:MM:SS) |
| Datas | `DATE` |
| Soft delete | Apenas em `tenants`, `clients`, `professionals`. Demais usam status ou hard delete |
| Tenant isolation | Toda tabela de domínio possui `tenant_id` como FK obrigatória |
| Charset | UTF-8 (padrão PostgreSQL) |
| Extensão obrigatória | `pgcrypto` (para `gen_random_uuid()`) |

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 2. Enums

```sql
-- Planos do SaaS
CREATE TYPE tenant_plan AS ENUM ('free', 'starter', 'professional', 'premium');

-- Status do tenant
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'cancelled');

-- Roles de usuário
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'professional', 'receptionist');

-- Status do cliente
CREATE TYPE client_status AS ENUM ('active', 'at_risk', 'inactive');

-- Status do agendamento
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Origem do agendamento
CREATE TYPE appointment_source AS ENUM ('public', 'internal', 'campaign');

-- Período preferido (lista de espera)
CREATE TYPE preferred_period AS ENUM ('morning', 'afternoon', 'evening');

-- Status da lista de espera
CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'scheduled', 'expired');

-- Tipo de campanha
CREATE TYPE campaign_type AS ENUM ('reactivation', 'fill_slots', 'promotion');

-- Status da campanha
CREATE TYPE campaign_status AS ENUM ('draft', 'sending', 'sent', 'completed');

-- Status da mensagem de campanha
CREATE TYPE campaign_message_status AS ENUM ('pending', 'sent', 'delivered', 'responded');

-- Status do plano do cliente
CREATE TYPE client_plan_status AS ENUM ('active', 'expired', 'cancelled');

-- Tipo de transação
CREATE TYPE transaction_type AS ENUM ('service', 'plan', 'product');

-- Método de pagamento
CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'debit_card', 'pix', 'plan_session');

-- Tipo de notificação
CREATE TYPE notification_type AS ENUM ('confirmation', 'reminder', 'reactivation', 'waitlist');

-- Canal de notificação
CREATE TYPE notification_channel AS ENUM ('whatsapp', 'sms', 'email');

-- Status de notificação
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- Dia da semana (0=Domingo, 6=Sábado)
CREATE TYPE day_of_week AS ENUM ('0', '1', '2', '3', '4', '5', '6');
```

---

## 3. Tabelas

---

### 3.1 `tenants`

> Representa uma barbearia (empresa) no sistema multi-tenant. Toda informação de domínio é isolada por tenant.

```sql
CREATE TABLE tenants (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200)  NOT NULL,
  slug          VARCHAR(100)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  address       TEXT,
  city          VARCHAR(100),
  state         CHAR(2),
  logo_url      TEXT,
  timezone      VARCHAR(50)   NOT NULL DEFAULT 'America/Sao_Paulo',
  plan          tenant_plan   NOT NULL DEFAULT 'free',
  status        tenant_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| UNIQUE | `slug` |
| UNIQUE | `email` |
| CHECK | `state ~ '^[A-Z]{2}$'` |
| CHECK | `phone ~ '^\d{10,11}$'` |
| NOT NULL | `name`, `slug`, `phone`, `email`, `timezone`, `plan`, `status` |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_tenants_slug ON tenants (slug);
CREATE UNIQUE INDEX idx_tenants_email ON tenants (email);
CREATE INDEX idx_tenants_status ON tenants (status);
CREATE INDEX idx_tenants_plan ON tenants (plan);
```

| Índice | Justificativa |
|---|---|
| `idx_tenants_slug` | Busca por slug na URL pública de agendamento |
| `idx_tenants_email` | Login e busca por email |
| `idx_tenants_status` | Filtrar tenants ativos/suspensos em queries administrativas |
| `idx_tenants_plan` | Relatórios por plano, aplicação de limites |

---

### 3.2 `users`

> Usuários do sistema com autenticação. Cada usuário pertence a um tenant e possui um role.

```sql
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          VARCHAR(200)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20),
  password_hash VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL DEFAULT 'professional',
  avatar_url    TEXT,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| UNIQUE | `(tenant_id, email)` |
| NOT NULL | `tenant_id`, `name`, `email`, `password_hash`, `role` |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_users_tenant_email ON users (tenant_id, email);
CREATE INDEX idx_users_tenant_id ON users (tenant_id);
CREATE INDEX idx_users_role ON users (tenant_id, role);
CREATE INDEX idx_users_is_active ON users (tenant_id, is_active);
```

| Índice | Justificativa |
|---|---|
| `idx_users_tenant_email` | Login: busca por email dentro do tenant |
| `idx_users_tenant_id` | Isolamento multi-tenant |
| `idx_users_role` | Listar usuários por role (ex: todos os profissionais) |
| `idx_users_is_active` | Filtrar apenas usuários ativos |

---

### 3.3 `sessions`

> Sessões de autenticação. Token opaco armazenado no banco com expiração.

```sql
CREATE TABLE sessions (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         VARCHAR(500)  NOT NULL,
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ   NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `user_id` REFERENCES `users(id)` ON DELETE CASCADE |
| UNIQUE | `token` |
| NOT NULL | `user_id`, `token`, `expires_at` |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_sessions_token ON sessions (token);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);
```

| Índice | Justificativa |
|---|---|
| `idx_sessions_token` | Validação de sessão em cada request |
| `idx_sessions_user_id` | Listar/revogar sessões do usuário |
| `idx_sessions_expires_at` | Limpeza periódica de sessões expiradas |

---

### 3.4 `professionals`

> Barbeiros/profissionais vinculados a um tenant. Pode ou não ter um user_id associado (profissional pode existir sem acesso ao sistema).

```sql
CREATE TABLE professionals (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID          REFERENCES users(id) ON DELETE SET NULL,
  name          VARCHAR(200)  NOT NULL,
  phone         VARCHAR(20),
  avatar_url    TEXT,
  specialty     VARCHAR(200),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  display_order INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| FK | `user_id` REFERENCES `users(id)` ON DELETE SET NULL |
| UNIQUE | `(tenant_id, user_id)` onde `user_id IS NOT NULL` |
| NOT NULL | `tenant_id`, `name`, `is_active`, `display_order` |

**Índices:**

```sql
CREATE INDEX idx_professionals_tenant_active ON professionals (tenant_id, is_active)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_professionals_tenant_id ON professionals (tenant_id);
CREATE UNIQUE INDEX idx_professionals_tenant_user ON professionals (tenant_id, user_id)
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_professionals_display_order ON professionals (tenant_id, display_order);
```

| Índice | Justificativa |
|---|---|
| `idx_professionals_tenant_active` | Listagem de profissionais ativos na página de agendamento |
| `idx_professionals_tenant_id` | Isolamento multi-tenant |
| `idx_professionals_tenant_user` | Garantir 1 profissional por user dentro do tenant |
| `idx_professionals_display_order` | Ordenação na UI |

---

### 3.5 `professional_schedules`

> Grade de horários de trabalho semanal de cada profissional. Um registro por dia da semana.

```sql
CREATE TABLE professional_schedules (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week       SMALLINT    NOT NULL,
  start_time        TIME        NOT NULL,
  end_time          TIME        NOT NULL,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `professional_id` REFERENCES `professionals(id)` ON DELETE CASCADE |
| UNIQUE | `(professional_id, day_of_week)` |
| CHECK | `day_of_week BETWEEN 0 AND 6` |
| CHECK | `start_time < end_time` |
| NOT NULL | `professional_id`, `day_of_week`, `start_time`, `end_time` |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_prof_schedules_prof_day
  ON professional_schedules (professional_id, day_of_week);
CREATE INDEX idx_prof_schedules_professional
  ON professional_schedules (professional_id);
```

| Índice | Justificativa |
|---|---|
| `idx_prof_schedules_prof_day` | Um horário por dia por profissional |
| `idx_prof_schedules_professional` | Buscar a grade inteira de um profissional |

---

### 3.6 `professional_breaks`

> Pausas (almoço, descanso) dentro de um dia de trabalho.

```sql
CREATE TABLE professional_breaks (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week       SMALLINT    NOT NULL,
  start_time        TIME        NOT NULL,
  end_time          TIME        NOT NULL
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `professional_id` REFERENCES `professionals(id)` ON DELETE CASCADE |
| CHECK | `day_of_week BETWEEN 0 AND 6` |
| CHECK | `start_time < end_time` |
| NOT NULL | `professional_id`, `day_of_week`, `start_time`, `end_time` |

**Índices:**

```sql
CREATE INDEX idx_prof_breaks_prof_day
  ON professional_breaks (professional_id, day_of_week);
```

| Índice | Justificativa |
|---|---|
| `idx_prof_breaks_prof_day` | Buscar pausas ao calcular slots disponíveis |

---

### 3.7 `services`

> Serviços oferecidos pela barbearia (corte, barba, combo, etc.).

```sql
CREATE TABLE services (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              VARCHAR(200)  NOT NULL,
  description       TEXT,
  duration_minutes  INTEGER       NOT NULL,
  price             DECIMAL(10,2) NOT NULL,
  category          VARCHAR(100),
  interval_minutes  INTEGER       NOT NULL DEFAULT 0,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  display_order     INTEGER       NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| CHECK | `duration_minutes > 0` |
| CHECK | `price >= 0` |
| CHECK | `interval_minutes >= 0` |
| NOT NULL | `tenant_id`, `name`, `duration_minutes`, `price`, `is_active`, `display_order` |

**Índices:**

```sql
CREATE INDEX idx_services_tenant_active ON services (tenant_id, is_active);
CREATE INDEX idx_services_tenant_id ON services (tenant_id);
CREATE INDEX idx_services_category ON services (tenant_id, category);
CREATE INDEX idx_services_display_order ON services (tenant_id, display_order);
```

| Índice | Justificativa |
|---|---|
| `idx_services_tenant_active` | Listagem de serviços ativos para agendamento |
| `idx_services_tenant_id` | Isolamento multi-tenant |
| `idx_services_category` | Filtro por categoria na UI |
| `idx_services_display_order` | Ordenação na UI |

---

### 3.8 `professional_services`

> Tabela de junção N:M entre profissionais e serviços. Define quais profissionais executam quais serviços.

```sql
CREATE TABLE professional_services (
  professional_id   UUID        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id        UUID        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, service_id)
);
```

| Constraint | Definição |
|---|---|
| PK composta | `(professional_id, service_id)` |
| FK | `professional_id` REFERENCES `professionals(id)` ON DELETE CASCADE |
| FK | `service_id` REFERENCES `services(id)` ON DELETE CASCADE |

**Índices:**

```sql
-- PK já cria índice em (professional_id, service_id)
CREATE INDEX idx_prof_services_service ON professional_services (service_id);
```

| Índice | Justificativa |
|---|---|
| PK | Buscar serviços de um profissional |
| `idx_prof_services_service` | Buscar profissionais que executam um serviço (direção inversa) |

---

### 3.9 `clients`

> Clientes da barbearia. Contém dados de contato, métricas acumuladas e status de engajamento.

```sql
CREATE TABLE clients (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            VARCHAR(200)    NOT NULL,
  phone           VARCHAR(20)     NOT NULL,
  email           VARCHAR(255),
  notes           TEXT,
  status          client_status   NOT NULL DEFAULT 'active',
  first_visit     DATE,
  last_visit      DATE,
  total_visits    INTEGER         NOT NULL DEFAULT 0,
  total_spent     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  average_ticket  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| UNIQUE | `(tenant_id, phone)` |
| CHECK | `total_visits >= 0` |
| CHECK | `total_spent >= 0` |
| CHECK | `average_ticket >= 0` |
| NOT NULL | `tenant_id`, `name`, `phone`, `status`, `total_visits`, `total_spent`, `average_ticket` |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_clients_tenant_phone ON clients (tenant_id, phone)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_tenant_status ON clients (tenant_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_tenant_last_visit ON clients (tenant_id, last_visit)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_tenant_id ON clients (tenant_id);
CREATE INDEX idx_clients_name ON clients (tenant_id, name);
CREATE INDEX idx_clients_email ON clients (tenant_id, email)
  WHERE email IS NOT NULL AND deleted_at IS NULL;
```

| Índice | Justificativa |
|---|---|
| `idx_clients_tenant_phone` | Buscar cliente por telefone (cadastro, WhatsApp). Unique parcial para soft delete |
| `idx_clients_tenant_status` | Segmentação: listar clientes por status (ativos, em risco, inativos) |
| `idx_clients_tenant_last_visit` | Identificar clientes inativos para campanhas de reativação |
| `idx_clients_tenant_id` | Isolamento multi-tenant |
| `idx_clients_name` | Busca por nome na UI |
| `idx_clients_email` | Busca por email quando existente |

---

### 3.10 `appointments`

> Agendamentos. Tabela central do sistema, conecta cliente + profissional + serviço em um horário.

```sql
CREATE TABLE appointments (
  id                UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID                NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id         UUID                NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  professional_id   UUID                NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  service_id        UUID                NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  date              DATE                NOT NULL,
  start_time        TIME                NOT NULL,
  end_time          TIME                NOT NULL,
  status            appointment_status  NOT NULL DEFAULT 'pending',
  price             DECIMAL(10,2)       NOT NULL,
  notes             TEXT,
  source            appointment_source  NOT NULL DEFAULT 'internal',
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| FK | `client_id` REFERENCES `clients(id)` ON DELETE RESTRICT |
| FK | `professional_id` REFERENCES `professionals(id)` ON DELETE RESTRICT |
| FK | `service_id` REFERENCES `services(id)` ON DELETE RESTRICT |
| CHECK | `start_time < end_time` |
| CHECK | `price >= 0` |
| NOT NULL | `tenant_id`, `client_id`, `professional_id`, `service_id`, `date`, `start_time`, `end_time`, `status`, `price`, `source` |

**Decisão de FK:** `ON DELETE RESTRICT` para `client_id`, `professional_id` e `service_id` porque agendamentos são registros históricos e não devem ser deletados em cascata. Clientes e profissionais usam soft delete.

**Índices:**

```sql
CREATE INDEX idx_appointments_tenant_date ON appointments (tenant_id, date);
CREATE INDEX idx_appointments_professional_date ON appointments (professional_id, date);
CREATE INDEX idx_appointments_client ON appointments (client_id);
CREATE INDEX idx_appointments_status ON appointments (tenant_id, status);
CREATE INDEX idx_appointments_tenant_id ON appointments (tenant_id);
CREATE INDEX idx_appointments_date_status ON appointments (tenant_id, date, status);
CREATE INDEX idx_appointments_source ON appointments (tenant_id, source);
CREATE INDEX idx_appointments_professional_date_time
  ON appointments (professional_id, date, start_time, end_time)
  WHERE status NOT IN ('cancelled', 'no_show');
```

| Índice | Justificativa |
|---|---|
| `idx_appointments_tenant_date` | Agenda do dia: buscar todos os agendamentos de uma data |
| `idx_appointments_professional_date` | Agenda individual do profissional |
| `idx_appointments_client` | Histórico de agendamentos do cliente |
| `idx_appointments_status` | Filtrar por status (pendentes, confirmados) |
| `idx_appointments_date_status` | Dashboard: agendamentos do dia por status |
| `idx_appointments_source` | Relatórios por origem |
| `idx_appointments_professional_date_time` | Detecção de conflito de horário (índice parcial exclui cancelados) |

---

### 3.11 `appointment_history`

> Log imutável de mudanças de status de agendamentos. Não permite UPDATE nem DELETE.

```sql
CREATE TABLE appointment_history (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID              NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  from_status     appointment_status,
  to_status       appointment_status NOT NULL,
  changed_by      UUID              REFERENCES users(id) ON DELETE SET NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `appointment_id` REFERENCES `appointments(id)` ON DELETE CASCADE |
| FK | `changed_by` REFERENCES `users(id)` ON DELETE SET NULL |
| NOT NULL | `appointment_id`, `to_status` |

**Nota:** `from_status` pode ser NULL no primeiro registro (criação do agendamento).

**Índices:**

```sql
CREATE INDEX idx_appointment_history_appointment
  ON appointment_history (appointment_id);
CREATE INDEX idx_appointment_history_created
  ON appointment_history (created_at);
```

| Índice | Justificativa |
|---|---|
| `idx_appointment_history_appointment` | Buscar histórico de um agendamento específico |
| `idx_appointment_history_created` | Auditoria cronológica |

---

### 3.12 `schedule_blocks`

> Bloqueios de horário (férias, falta, evento pessoal). Impede agendamentos naquele período.

```sql
CREATE TABLE schedule_blocks (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  date              DATE        NOT NULL,
  start_time        TIME        NOT NULL,
  end_time          TIME        NOT NULL,
  reason            VARCHAR(500),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `professional_id` REFERENCES `professionals(id)` ON DELETE CASCADE |
| CHECK | `start_time < end_time` |
| NOT NULL | `professional_id`, `date`, `start_time`, `end_time` |

**Índices:**

```sql
CREATE INDEX idx_schedule_blocks_prof_date
  ON schedule_blocks (professional_id, date);
```

| Índice | Justificativa |
|---|---|
| `idx_schedule_blocks_prof_date` | Verificar bloqueios ao calcular slots disponíveis |

---

### 3.13 `waitlist`

> Lista de espera. Clientes que querem atendimento mas não encontraram horário disponível.

```sql
CREATE TABLE waitlist (
  id                UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID              NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id         UUID              NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id        UUID              NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  professional_id   UUID              REFERENCES professionals(id) ON DELETE SET NULL,
  preferred_date    DATE              NOT NULL,
  preferred_period  preferred_period  NOT NULL,
  status            waitlist_status   NOT NULL DEFAULT 'waiting',
  created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| FK | `client_id` REFERENCES `clients(id)` ON DELETE CASCADE |
| FK | `service_id` REFERENCES `services(id)` ON DELETE CASCADE |
| FK | `professional_id` REFERENCES `professionals(id)` ON DELETE SET NULL |
| NOT NULL | `tenant_id`, `client_id`, `service_id`, `preferred_date`, `preferred_period`, `status` |

**Índices:**

```sql
CREATE INDEX idx_waitlist_tenant_status ON waitlist (tenant_id, status);
CREATE INDEX idx_waitlist_tenant_date ON waitlist (tenant_id, preferred_date);
CREATE INDEX idx_waitlist_client ON waitlist (client_id);
CREATE INDEX idx_waitlist_professional ON waitlist (professional_id)
  WHERE professional_id IS NOT NULL;
```

| Índice | Justificativa |
|---|---|
| `idx_waitlist_tenant_status` | Listar itens aguardando por tenant |
| `idx_waitlist_tenant_date` | Buscar por data preferida ao verificar cancelamentos |
| `idx_waitlist_client` | Histórico de espera do cliente |
| `idx_waitlist_professional` | Filtrar por profissional preferido |

---

### 3.14 `campaigns`

> Campanhas de marketing/reativação via WhatsApp.

```sql
CREATE TABLE campaigns (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID              NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            VARCHAR(200)      NOT NULL,
  type            campaign_type     NOT NULL,
  template        TEXT              NOT NULL,
  target_segment  JSONB             NOT NULL DEFAULT '{}',
  status          campaign_status   NOT NULL DEFAULT 'draft',
  sent_count      INTEGER           NOT NULL DEFAULT 0,
  response_count  INTEGER           NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  sent_at         TIMESTAMPTZ
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| CHECK | `sent_count >= 0` |
| CHECK | `response_count >= 0` |
| CHECK | `response_count <= sent_count` |
| NOT NULL | `tenant_id`, `name`, `type`, `template`, `status`, `sent_count`, `response_count` |

**Nota sobre `target_segment`:** JSONB armazena critérios de segmentação (ex: `{"status": "inactive", "days_since_visit_min": 30}`). Estrutura flexível para diferentes tipos de campanha.

**Índices:**

```sql
CREATE INDEX idx_campaigns_tenant_id ON campaigns (tenant_id);
CREATE INDEX idx_campaigns_tenant_status ON campaigns (tenant_id, status);
CREATE INDEX idx_campaigns_type ON campaigns (tenant_id, type);
```

| Índice | Justificativa |
|---|---|
| `idx_campaigns_tenant_id` | Isolamento multi-tenant |
| `idx_campaigns_tenant_status` | Listar campanhas por status |
| `idx_campaigns_type` | Filtrar por tipo de campanha |

---

### 3.15 `campaign_messages`

> Mensagens individuais enviadas dentro de uma campanha. Uma por cliente.

```sql
CREATE TABLE campaign_messages (
  id              UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID                      NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  client_id       UUID                      NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status          campaign_message_status   NOT NULL DEFAULT 'pending',
  sent_at         TIMESTAMPTZ
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `campaign_id` REFERENCES `campaigns(id)` ON DELETE CASCADE |
| FK | `client_id` REFERENCES `clients(id)` ON DELETE CASCADE |
| UNIQUE | `(campaign_id, client_id)` |
| NOT NULL | `campaign_id`, `client_id`, `status` |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_campaign_messages_campaign_client
  ON campaign_messages (campaign_id, client_id);
CREATE INDEX idx_campaign_messages_campaign ON campaign_messages (campaign_id);
CREATE INDEX idx_campaign_messages_status ON campaign_messages (campaign_id, status);
CREATE INDEX idx_campaign_messages_client ON campaign_messages (client_id);
```

| Índice | Justificativa |
|---|---|
| `idx_campaign_messages_campaign_client` | Evitar mensagem duplicada para mesmo cliente na campanha |
| `idx_campaign_messages_campaign` | Listar mensagens de uma campanha |
| `idx_campaign_messages_status` | Contar enviadas/entregues/respondidas |
| `idx_campaign_messages_client` | Histórico de campanhas recebidas pelo cliente |

---

### 3.16 `plans`

> Planos e combos vendidos pela barbearia (ex: "4 cortes por R$100").

```sql
CREATE TABLE plans (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            VARCHAR(200)    NOT NULL,
  description     TEXT,
  price           DECIMAL(10,2)   NOT NULL,
  duration_days   INTEGER         NOT NULL,
  total_sessions  INTEGER         NOT NULL,
  services        JSONB           NOT NULL DEFAULT '[]',
  is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| CHECK | `price > 0` |
| CHECK | `duration_days > 0` |
| CHECK | `total_sessions > 0` |
| NOT NULL | `tenant_id`, `name`, `price`, `duration_days`, `total_sessions`, `is_active` |

**Nota sobre `services`:** JSONB armazena array de UUIDs de serviços incluídos (ex: `["uuid-corte", "uuid-barba"]`). Flexível para combos mistos.

**Índices:**

```sql
CREATE INDEX idx_plans_tenant_id ON plans (tenant_id);
CREATE INDEX idx_plans_tenant_active ON plans (tenant_id, is_active);
```

| Índice | Justificativa |
|---|---|
| `idx_plans_tenant_id` | Isolamento multi-tenant |
| `idx_plans_tenant_active` | Listar planos ativos para venda |

---

### 3.17 `client_plans`

> Planos adquiridos por clientes. Controla sessões usadas e validade.

```sql
CREATE TABLE client_plans (
  id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID                NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  plan_id         UUID                NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  sessions_used   INTEGER             NOT NULL DEFAULT 0,
  sessions_total  INTEGER             NOT NULL,
  start_date      DATE                NOT NULL,
  end_date        DATE                NOT NULL,
  status          client_plan_status  NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `client_id` REFERENCES `clients(id)` ON DELETE RESTRICT |
| FK | `plan_id` REFERENCES `plans(id)` ON DELETE RESTRICT |
| CHECK | `sessions_used >= 0` |
| CHECK | `sessions_total > 0` |
| CHECK | `sessions_used <= sessions_total` |
| CHECK | `end_date > start_date` |
| NOT NULL | `client_id`, `plan_id`, `sessions_total`, `start_date`, `end_date`, `status` |

**Índices:**

```sql
CREATE INDEX idx_client_plans_client ON client_plans (client_id);
CREATE INDEX idx_client_plans_status ON client_plans (client_id, status);
CREATE INDEX idx_client_plans_end_date ON client_plans (end_date)
  WHERE status = 'active';
CREATE INDEX idx_client_plans_plan ON client_plans (plan_id);
```

| Índice | Justificativa |
|---|---|
| `idx_client_plans_client` | Listar planos do cliente |
| `idx_client_plans_status` | Verificar se o cliente tem plano ativo |
| `idx_client_plans_end_date` | Job de expiração de planos vencidos |
| `idx_client_plans_plan` | Relatórios por plano |

---

### 3.18 `transactions`

> Registro financeiro de todas as movimentações. Cada atendimento concluído ou venda de plano gera uma transação.

```sql
CREATE TABLE transactions (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID              NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id  UUID              REFERENCES appointments(id) ON DELETE SET NULL,
  client_plan_id  UUID              REFERENCES client_plans(id) ON DELETE SET NULL,
  client_id       UUID              NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  type            transaction_type  NOT NULL,
  amount          DECIMAL(10,2)     NOT NULL,
  payment_method  payment_method    NOT NULL,
  date            DATE              NOT NULL,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| FK | `appointment_id` REFERENCES `appointments(id)` ON DELETE SET NULL |
| FK | `client_plan_id` REFERENCES `client_plans(id)` ON DELETE SET NULL |
| FK | `client_id` REFERENCES `clients(id)` ON DELETE RESTRICT |
| CHECK | `amount > 0` |
| NOT NULL | `tenant_id`, `client_id`, `type`, `amount`, `payment_method`, `date` |

**Índices:**

```sql
CREATE INDEX idx_transactions_tenant_id ON transactions (tenant_id);
CREATE INDEX idx_transactions_tenant_date ON transactions (tenant_id, date);
CREATE INDEX idx_transactions_client ON transactions (client_id);
CREATE INDEX idx_transactions_appointment ON transactions (appointment_id)
  WHERE appointment_id IS NOT NULL;
CREATE INDEX idx_transactions_payment_method ON transactions (tenant_id, payment_method);
CREATE INDEX idx_transactions_type ON transactions (tenant_id, type);
```

| Índice | Justificativa |
|---|---|
| `idx_transactions_tenant_id` | Isolamento multi-tenant |
| `idx_transactions_tenant_date` | Relatórios financeiros por período |
| `idx_transactions_client` | Histórico financeiro do cliente |
| `idx_transactions_appointment` | Vincular transação ao agendamento |
| `idx_transactions_payment_method` | Relatórios por forma de pagamento |
| `idx_transactions_type` | Relatórios por tipo (serviço/plano/produto) |

---

### 3.19 `tenant_settings`

> Configurações operacionais de cada barbearia. Um registro por tenant (1:1).

```sql
CREATE TABLE tenant_settings (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_advance_days        INTEGER     NOT NULL DEFAULT 30,
  cancellation_policy_hours   INTEGER     NOT NULL DEFAULT 2,
  confirmation_enabled        BOOLEAN     NOT NULL DEFAULT TRUE,
  reminder_hours_before       INTEGER     NOT NULL DEFAULT 2,
  inactive_days_threshold     INTEGER     NOT NULL DEFAULT 45,
  working_days                JSONB       NOT NULL DEFAULT '[1,2,3,4,5,6]',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| UNIQUE | `tenant_id` |
| CHECK | `booking_advance_days > 0 AND booking_advance_days <= 90` |
| CHECK | `cancellation_policy_hours >= 0` |
| CHECK | `reminder_hours_before >= 0` |
| CHECK | `inactive_days_threshold > 0` |
| NOT NULL | `tenant_id`, `booking_advance_days`, `cancellation_policy_hours`, `confirmation_enabled`, `reminder_hours_before`, `inactive_days_threshold`, `working_days` |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_tenant_settings_tenant ON tenant_settings (tenant_id);
```

| Índice | Justificativa |
|---|---|
| `idx_tenant_settings_tenant` | Relação 1:1 com tenant, acesso direto |

---

### 3.20 `notifications`

> Notificações e lembretes enviados via WhatsApp/SMS/Email. Scheduladas para envio futuro ou imediato.

```sql
CREATE TABLE notifications (
  id              UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID                  NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type            notification_type     NOT NULL,
  appointment_id  UUID                  REFERENCES appointments(id) ON DELETE SET NULL,
  client_id       UUID                  NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  channel         notification_channel  NOT NULL DEFAULT 'whatsapp',
  status          notification_status   NOT NULL DEFAULT 'pending',
  scheduled_for   TIMESTAMPTZ           NOT NULL,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);
```

| Constraint | Definição |
|---|---|
| PK | `id` |
| FK | `tenant_id` REFERENCES `tenants(id)` ON DELETE CASCADE |
| FK | `appointment_id` REFERENCES `appointments(id)` ON DELETE SET NULL |
| FK | `client_id` REFERENCES `clients(id)` ON DELETE CASCADE |
| NOT NULL | `tenant_id`, `type`, `client_id`, `channel`, `status`, `scheduled_for` |

**Índices:**

```sql
CREATE INDEX idx_notifications_status_scheduled
  ON notifications (status, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_notifications_tenant_id ON notifications (tenant_id);
CREATE INDEX idx_notifications_appointment ON notifications (appointment_id)
  WHERE appointment_id IS NOT NULL;
CREATE INDEX idx_notifications_client ON notifications (client_id);
CREATE INDEX idx_notifications_type ON notifications (tenant_id, type);
```

| Índice | Justificativa |
|---|---|
| `idx_notifications_status_scheduled` | **Crítico:** Worker busca notificações pendentes ordenadas por horário de envio. Índice parcial para performance |
| `idx_notifications_tenant_id` | Isolamento multi-tenant |
| `idx_notifications_appointment` | Vincular notificações ao agendamento |
| `idx_notifications_client` | Histórico de notificações do cliente |
| `idx_notifications_type` | Filtrar por tipo (lembrete, confirmação, reativação) |

---

## 4. Resumo de Índices Estratégicos

### Índices de maior impacto em performance

| Tabela | Índice | Query principal |
|---|---|---|
| `appointments` | `(tenant_id, date)` | Agenda do dia |
| `appointments` | `(professional_id, date, start_time, end_time) WHERE status NOT IN (...)` | Detecção de conflito de horário |
| `clients` | `(tenant_id, phone) WHERE deleted_at IS NULL` | Busca/cadastro de cliente por telefone |
| `clients` | `(tenant_id, last_visit) WHERE deleted_at IS NULL` | Identificação de clientes inativos |
| `notifications` | `(status, scheduled_for) WHERE status = 'pending'` | Worker de envio de notificações |
| `professional_schedules` | `(professional_id, day_of_week)` | Cálculo de slots disponíveis |
| `schedule_blocks` | `(professional_id, date)` | Verificação de bloqueios |
| `sessions` | `(token)` | Validação de autenticação |

### Contagem total de índices por tabela

| Tabela | Quantidade de índices |
|---|---|
| `tenants` | 4 |
| `users` | 4 |
| `sessions` | 3 |
| `professionals` | 4 |
| `professional_schedules` | 2 |
| `professional_breaks` | 1 |
| `services` | 4 |
| `professional_services` | 2 |
| `clients` | 6 |
| `appointments` | 8 |
| `appointment_history` | 2 |
| `schedule_blocks` | 1 |
| `waitlist` | 4 |
| `campaigns` | 3 |
| `campaign_messages` | 4 |
| `plans` | 2 |
| `client_plans` | 4 |
| `transactions` | 6 |
| `tenant_settings` | 1 |
| `notifications` | 5 |
| **Total** | **68** |

---

## 5. Row Level Security (RLS)

Para isolamento multi-tenant no nível do banco de dados, recomenda-se habilitar RLS nas tabelas que possuem `tenant_id`:

```sql
-- Exemplo para a tabela clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_clients ON clients
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Tabelas com RLS recomendado:** `users`, `professionals`, `professional_schedules` (via join), `services`, `clients`, `appointments`, `waitlist`, `campaigns`, `campaign_messages` (via join), `plans`, `client_plans` (via join), `transactions`, `tenant_settings`, `notifications`.

**Nota:** O Prisma ORM não suporta RLS nativamente. A aplicação deve usar `SET LOCAL app.current_tenant_id = '...'` no início de cada transação, ou implementar o isolamento na camada de aplicação adicionando `WHERE tenant_id = ?` em todas as queries. A decisão do BarberFlow é usar **isolamento na camada de aplicação** via middleware do Prisma, com RLS como camada extra de segurança em produção.

---

> **Próximos documentos:** 08-entidades.md (regras de domínio), 09-relacionamentos.md (ERD).
