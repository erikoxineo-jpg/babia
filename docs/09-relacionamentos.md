# 09 - Relacionamentos e ERD

> BarberFlow -- SaaS multi-tenant de crescimento para barbearias
> Diagrama de relacionamentos, cardinalidades, chaves estrangeiras e regras de integridade
> Última atualização: 2026-03-31

---

## Sumário

1. [Diagrama de Relacionamentos (ERD Textual)](#1-diagrama-de-relacionamentos-erd-textual)
2. [Detalhamento por Relação](#2-detalhamento-por-relação)
3. [Tabelas de Junção](#3-tabelas-de-junção)
4. [Regras de Cascata e Deleção](#4-regras-de-cascata-e-deleção)
5. [Regras de Isolamento Multi-Tenant](#5-regras-de-isolamento-multi-tenant)
6. [Diagrama de Dependências para Deleção](#6-diagrama-de-dependências-para-deleção)

---

## 1. Diagrama de Relacionamentos (ERD Textual)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MULTI-TENANT CORE                              │
│                                                                             │
│  ┌──────────┐ 1───1 ┌─────────────────┐                                    │
│  │  TENANT  │───────│ TENANT_SETTINGS  │                                    │
│  └────┬─────┘       └─────────────────┘                                    │
│       │                                                                     │
│       │ 1───N                                                               │
│       ├──────────────┐                                                      │
│       │              │                                                      │
│  ┌────┴─────┐   ┌────┴──────────┐                                          │
│  │   USER   │   │ PROFESSIONAL  │                                          │
│  └────┬─────┘   └───┬───┬──────┘                                          │
│       │             │   │                                                   │
│       │ 1───N       │   │ N───M                                            │
│  ┌────┴─────┐       │   │        ┌─────────┐                               │
│  │ SESSION  │       │   └────────│ SERVICE │                               │
│  └──────────┘       │    (via     └────┬────┘                               │
│                     │ prof_services)   │                                    │
│                     │                  │                                    │
└─────────────────────┼──────────────────┼────────────────────────────────────┘
                      │                  │
┌─────────────────────┼──────────────────┼────────────────────────────────────┐
│                     │   AGENDAMENTO    │                                    │
│                     │                  │                                    │
│       ┌─────────┐   │                  │                                    │
│       │ CLIENT  │   │                  │                                    │
│       └──┬──┬───┘   │                  │                                    │
│          │  │       │                  │                                    │
│          │  │  ┌────┴──────────────────┴────┐                               │
│          │  └──│       APPOINTMENT          │                               │
│          │     └─────┬────────────────┬─────┘                               │
│          │           │                │                                     │
│          │      1───N│           1───N│                                     │
│          │  ┌────────┴──┐    ┌───────┴──────────┐                          │
│          │  │ APPT_     │    │ SCHEDULE_BLOCKS   │                          │
│          │  │ HISTORY   │    │ (via professional)│                          │
│          │  └───────────┘    └──────────────────┘                          │
│          │                                                                  │
└──────────┼──────────────────────────────────────────────────────────────────┘
           │
┌──────────┼──────────────────────────────────────────────────────────────────┐
│          │              ENGAJAMENTO & FINANCEIRO                            │
│          │                                                                  │
│          ├──── 1───N ────┬─────────────┐                                   │
│          │               │  WAITLIST   │                                    │
│          │               └─────────────┘                                   │
│          │                                                                  │
│          ├──── 1───N ────┬──────────────┐                                  │
│          │               │ TRANSACTION  │                                  │
│          │               └──────────────┘                                  │
│          │                                                                  │
│          ├──── 1───N ────┬──────────────┐       ┌──────────┐               │
│          │               │ CLIENT_PLAN  │───────│   PLAN   │               │
│          │               └──────────────┘ N───1 └──────────┘               │
│          │                                                                  │
│          ├──── 1───N ────┬──────────────────┐                              │
│          │               │ CAMPAIGN_MESSAGE │                              │
│          │               └───────┬──────────┘                              │
│          │                       │ N───1                                    │
│          │                 ┌─────┴──────┐                                  │
│          │                 │  CAMPAIGN   │                                  │
│          │                 └────────────┘                                  │
│          │                                                                  │
│          └──── 1───N ────┬───────────────┐                                 │
│                          │ NOTIFICATION  │                                  │
│                          └───────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detalhamento por Relação

### 2.1 Relações do Tenant (raiz multi-tenant)

```
Tenant 1──────1 TenantSettings
Tenant 1──────N User
Tenant 1──────N Professional
Tenant 1──────N Service
Tenant 1──────N Client
Tenant 1──────N Appointment
Tenant 1──────N Campaign
Tenant 1──────N Plan
Tenant 1──────N Transaction
Tenant 1──────N Waitlist
Tenant 1──────N Notification
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| Tenant -> TenantSettings | `tenant_settings.tenant_id` | CASCADE | Configurações são parte do tenant |
| Tenant -> User | `users.tenant_id` | CASCADE | Usuários perdem sentido sem tenant |
| Tenant -> Professional | `professionals.tenant_id` | CASCADE | Profissionais perdem sentido sem tenant |
| Tenant -> Service | `services.tenant_id` | CASCADE | Serviços perdem sentido sem tenant |
| Tenant -> Client | `clients.tenant_id` | CASCADE | Dados do cliente pertencem ao tenant |
| Tenant -> Appointment | `appointments.tenant_id` | CASCADE | Agendamentos pertencem ao tenant |
| Tenant -> Campaign | `campaigns.tenant_id` | CASCADE | Campanhas pertencem ao tenant |
| Tenant -> Plan | `plans.tenant_id` | CASCADE | Planos pertencem ao tenant |
| Tenant -> Transaction | `transactions.tenant_id` | CASCADE | Transações pertencem ao tenant |
| Tenant -> Waitlist | `waitlist.tenant_id` | CASCADE | Lista de espera pertence ao tenant |
| Tenant -> Notification | `notifications.tenant_id` | CASCADE | Notificações pertencem ao tenant |

### 2.2 Relações do User

```
User 1──────N Session
User 1──────1 Professional (opcional)
User 1──────N AppointmentHistory (changed_by)
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| User -> Session | `sessions.user_id` | CASCADE | Sessões são invalidadas ao remover user |
| User -> Professional | `professionals.user_id` | SET NULL | Professional pode existir sem user |
| User -> AppointmentHistory | `appointment_history.changed_by` | SET NULL | Log preservado, autor anulado |

### 2.3 Relações do Professional

```
Professional 1──────N ProfessionalSchedule
Professional 1──────N ProfessionalBreak
Professional N──────M Service (via professional_services)
Professional 1──────N Appointment
Professional 1──────N ScheduleBlock
Professional 1──────N Waitlist (opcional)
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| Professional -> ProfessionalSchedule | `professional_schedules.professional_id` | CASCADE | Horários são parte do profissional |
| Professional -> ProfessionalBreak | `professional_breaks.professional_id` | CASCADE | Pausas são parte do profissional |
| Professional -> ProfessionalServices | `professional_services.professional_id` | CASCADE | Associação removida junto |
| Professional -> Appointment | `appointments.professional_id` | RESTRICT | Impede deletar profissional com agendamentos |
| Professional -> ScheduleBlock | `schedule_blocks.professional_id` | CASCADE | Bloqueios são do profissional |
| Professional -> Waitlist | `waitlist.professional_id` | SET NULL | Preferência removida, entrada mantida |

### 2.4 Relações do Service

```
Service N──────M Professional (via professional_services)
Service 1──────N Appointment
Service 1──────N Waitlist
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| Service -> ProfessionalServices | `professional_services.service_id` | CASCADE | Associação removida junto |
| Service -> Appointment | `appointments.service_id` | RESTRICT | Impede deletar serviço com agendamentos |
| Service -> Waitlist | `waitlist.service_id` | CASCADE | Entrada perde sentido sem o serviço |

### 2.5 Relações do Client

```
Client 1──────N Appointment
Client 1──────N Waitlist
Client 1──────N CampaignMessage
Client 1──────N ClientPlan
Client 1──────N Transaction
Client 1──────N Notification
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| Client -> Appointment | `appointments.client_id` | RESTRICT | Impede deletar cliente com agendamentos |
| Client -> Waitlist | `waitlist.client_id` | CASCADE | Entradas na fila removidas |
| Client -> CampaignMessage | `campaign_messages.client_id` | CASCADE | Mensagens removidas |
| Client -> ClientPlan | `client_plans.client_id` | RESTRICT | Impede deletar cliente com plano ativo |
| Client -> Transaction | `transactions.client_id` | RESTRICT | Impede deletar cliente com histórico financeiro |
| Client -> Notification | `notifications.client_id` | CASCADE | Notificações removidas |

### 2.6 Relações do Appointment

```
Appointment 1──────N AppointmentHistory
Appointment 1──────N Notification (opcional)
Appointment 1──────1 Transaction (opcional)
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| Appointment -> AppointmentHistory | `appointment_history.appointment_id` | CASCADE | Log acompanha o agendamento |
| Appointment -> Notification | `notifications.appointment_id` | SET NULL | Notificação mantida, referência anulada |
| Appointment -> Transaction | `transactions.appointment_id` | SET NULL | Transação mantida, referência anulada |

### 2.7 Relações do Campaign

```
Campaign 1──────N CampaignMessage
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| Campaign -> CampaignMessage | `campaign_messages.campaign_id` | CASCADE | Mensagens são parte da campanha |

### 2.8 Relações do Plan

```
Plan 1──────N ClientPlan
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| Plan -> ClientPlan | `client_plans.plan_id` | RESTRICT | Impede deletar plano com assinaturas ativas |

### 2.9 Relações do ClientPlan

```
ClientPlan N──────1 Client
ClientPlan N──────1 Plan
ClientPlan 1──────N Transaction (opcional)
```

| Relação | FK | ON DELETE | Justificativa |
|---|---|---|---|
| ClientPlan -> Transaction | `transactions.client_plan_id` | SET NULL | Transação mantida, referência anulada |

---

## 3. Tabelas de Junção

O sistema possui **1 tabela de junção** explícita:

### professional_services

```
┌──────────────┐       ┌──────────────────────┐       ┌──────────┐
│ Professional │ 1───N │ professional_services │ N───1 │ Service  │
│              │       │                      │       │          │
│ id (PK)      │◄──────│ professional_id (PK)  │       │ id (PK)  │
│              │       │ service_id (PK)       │──────►│          │
└──────────────┘       └──────────────────────┘       └──────────┘
```

- **Cardinalidade:** N:M (um profissional executa vários serviços; um serviço é executado por vários profissionais)
- **PK composta:** `(professional_id, service_id)`
- **Sem colunas adicionais** (não há preço diferente por profissional -- o preço é do serviço)
- **ON DELETE CASCADE** em ambas as FKs

---

## 4. Regras de Cascata e Deleção

### 4.1 Estratégia de Deleção por Entidade

| Entidade | Estratégia | Motivo |
|---|---|---|
| Tenant | Soft delete (`deleted_at`) | Dados precisam ser mantidos por 90 dias |
| User | Hard delete (via CASCADE do tenant) | Sessões e referências tratadas por CASCADE/SET NULL |
| Professional | Soft delete (`deleted_at`) | Agendamentos históricos referenciam o profissional |
| Service | Desativação (`is_active = false`) | Não pode ser deletado se tiver agendamentos históricos |
| Client | Soft delete (`deleted_at`) | Histórico financeiro e de agendamentos deve ser preservado |
| Appointment | Nunca deletado | Registro histórico permanente. Status `cancelled` substitui deleção |
| AppointmentHistory | Nunca deletado | Log de auditoria imutável |
| ScheduleBlock | Hard delete | Sem dependências, pode ser removido livremente |
| Waitlist | Hard delete ou expiração | Entradas temporárias sem valor histórico |
| Campaign | Hard delete | Dados de campanha podem ser removidos |
| CampaignMessage | Cascade do Campaign | Removido junto com a campanha |
| Plan | Desativação (`is_active = false`) | Não pode ser deletado se tiver `client_plans` ativos |
| ClientPlan | Cancelamento (`status = cancelled`) | Não pode ser hard-deletado, tem transações associadas |
| Transaction | Nunca deletado | Registro financeiro imutável |
| TenantSettings | Cascade do Tenant | Removido junto com o tenant |
| Session | Hard delete | Sessão expirada é removida por cleanup job |
| Notification | Hard delete (após 90 dias) | Pode ser limpa periodicamente |
| ProfessionalSchedule | Cascade do Professional | Horários são parte do profissional |
| ProfessionalBreak | Cascade do Professional | Pausas são parte do profissional |
| ProfessionalServices | Cascade do Professional ou Service | Junção removida com qualquer lado |

### 4.2 Tabela de Comportamento ON DELETE

```
┌────────────────────────┬─────────────────────────┬─────────────┐
│ Tabela (FK)            │ Referencia              │ ON DELETE   │
├────────────────────────┼─────────────────────────┼─────────────┤
│ users.tenant_id        │ tenants.id              │ CASCADE     │
│ sessions.user_id       │ users.id                │ CASCADE     │
│ professionals.tenant_id│ tenants.id              │ CASCADE     │
│ professionals.user_id  │ users.id                │ SET NULL    │
│ prof_schedules.prof_id │ professionals.id        │ CASCADE     │
│ prof_breaks.prof_id    │ professionals.id        │ CASCADE     │
│ services.tenant_id     │ tenants.id              │ CASCADE     │
│ prof_services.prof_id  │ professionals.id        │ CASCADE     │
│ prof_services.svc_id   │ services.id             │ CASCADE     │
│ clients.tenant_id      │ tenants.id              │ CASCADE     │
│ appointments.tenant_id │ tenants.id              │ CASCADE     │
│ appointments.client_id │ clients.id              │ RESTRICT    │
│ appointments.prof_id   │ professionals.id        │ RESTRICT    │
│ appointments.svc_id    │ services.id             │ RESTRICT    │
│ appt_history.appt_id   │ appointments.id         │ CASCADE     │
│ appt_history.changed_by│ users.id                │ SET NULL    │
│ schedule_blocks.prof_id│ professionals.id        │ CASCADE     │
│ waitlist.tenant_id     │ tenants.id              │ CASCADE     │
│ waitlist.client_id     │ clients.id              │ CASCADE     │
│ waitlist.service_id    │ services.id             │ CASCADE     │
│ waitlist.prof_id       │ professionals.id        │ SET NULL    │
│ campaigns.tenant_id    │ tenants.id              │ CASCADE     │
│ campaign_msgs.camp_id  │ campaigns.id            │ CASCADE     │
│ campaign_msgs.client_id│ clients.id              │ CASCADE     │
│ plans.tenant_id        │ tenants.id              │ CASCADE     │
│ client_plans.client_id │ clients.id              │ RESTRICT    │
│ client_plans.plan_id   │ plans.id                │ RESTRICT    │
│ transactions.tenant_id │ tenants.id              │ CASCADE     │
│ transactions.appt_id   │ appointments.id         │ SET NULL    │
│ transactions.cplan_id  │ client_plans.id         │ SET NULL    │
│ transactions.client_id │ clients.id              │ RESTRICT    │
│ tenant_settings.t_id   │ tenants.id              │ CASCADE     │
│ notifications.tenant_id│ tenants.id              │ CASCADE     │
│ notifications.appt_id  │ appointments.id         │ SET NULL    │
│ notifications.client_id│ clients.id              │ CASCADE     │
└────────────────────────┴─────────────────────────┴─────────────┘
```

### 4.3 Resumo das Estratégias ON DELETE

| Estratégia | Quantidade | Uso |
|---|---|---|
| CASCADE | 23 | Dados dependentes que perdem sentido sem o pai |
| RESTRICT | 6 | Proteção contra deleção acidental de dados referenciados |
| SET NULL | 5 | Referência opcional removida, registro preservado |

---

## 5. Regras de Isolamento Multi-Tenant

### 5.1 Princípio Fundamental

**Todo dado de domínio pertence a exatamente um tenant.** Nenhuma query de negócio deve retornar dados de outro tenant.

### 5.2 Tabelas com `tenant_id` direto (isolamento nível 1)

Estas tabelas possuem `tenant_id` como coluna e devem SEMPRE incluir `WHERE tenant_id = ?` em queries:

```
users
professionals
services
clients
appointments
waitlist
campaigns
plans
transactions
tenant_settings
notifications
```

### 5.3 Tabelas sem `tenant_id` -- isoladas via relação (isolamento nível 2)

Estas tabelas não possuem `tenant_id` diretamente, mas são acessadas sempre via uma entidade pai que possui:

```
sessions              → via users.tenant_id
professional_schedules → via professionals.tenant_id
professional_breaks    → via professionals.tenant_id
professional_services  → via professionals.tenant_id
appointment_history    → via appointments.tenant_id
schedule_blocks        → via professionals.tenant_id
campaign_messages      → via campaigns.tenant_id
client_plans           → via clients.tenant_id (ou plans.tenant_id)
```

### 5.4 Regras de Acesso

```
┌────────────────────────────────────────────────────────────────┐
│                    CAMADAS DE ISOLAMENTO                       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Camada 1: Middleware Prisma                               │  │
│  │ - Toda query recebe automaticamente                       │  │
│  │   WHERE tenant_id = currentTenantId                       │  │
│  │ - Toda criação recebe automaticamente                     │  │
│  │   tenant_id = currentTenantId                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Camada 2: Row Level Security (PostgreSQL)                 │  │
│  │ - Backup de segurança no nível do banco                   │  │
│  │ - SET LOCAL app.current_tenant_id no início da transação  │  │
│  │ - Política: USING (tenant_id = current_setting(...))      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Camada 3: Validação na aplicação                          │  │
│  │ - Services verificam ownership antes de mutações          │  │
│  │ - Ex: ao criar Appointment, verificar que client_id,      │  │
│  │   professional_id e service_id pertencem ao mesmo tenant  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.5 Validações Cross-Tenant (nunca permitidas)

| Operação | Validação |
|---|---|
| Criar Appointment | `client.tenant_id == professional.tenant_id == service.tenant_id == currentTenantId` |
| Criar CampaignMessage | `campaign.tenant_id == client.tenant_id` |
| Criar ClientPlan | `client.tenant_id` deve pertencer ao mesmo tenant que `plan.tenant_id` |
| Criar Transaction | `client.tenant_id == currentTenantId`, e se `appointment_id` preenchido, `appointment.tenant_id == currentTenantId` |
| Criar Notification | `client.tenant_id == currentTenantId` |
| Criar Waitlist | `client.tenant_id == service.tenant_id == currentTenantId` |

---

## 6. Diagrama de Dependências para Deleção

Ordem segura para deletar um tenant inteiro (em caso de cancelamento definitivo):

```
Passo 1 (folhas sem dependências):
  DELETE notifications      WHERE tenant_id = ?
  DELETE campaign_messages   WHERE campaign_id IN (SELECT id FROM campaigns WHERE tenant_id = ?)
  DELETE campaigns           WHERE tenant_id = ?
  DELETE waitlist            WHERE tenant_id = ?
  DELETE sessions            WHERE user_id IN (SELECT id FROM users WHERE tenant_id = ?)

Passo 2 (com dependências em folhas já removidas):
  DELETE appointment_history WHERE appointment_id IN (SELECT id FROM appointments WHERE tenant_id = ?)
  DELETE transactions        WHERE tenant_id = ?
  DELETE schedule_blocks     WHERE professional_id IN (SELECT id FROM professionals WHERE tenant_id = ?)

Passo 3 (entidades com RESTRICT já liberadas):
  DELETE client_plans        WHERE client_id IN (SELECT id FROM clients WHERE tenant_id = ?)
  DELETE appointments        WHERE tenant_id = ?

Passo 4 (entidades core):
  DELETE professional_services WHERE professional_id IN (SELECT id FROM professionals WHERE tenant_id = ?)
  DELETE professional_breaks   WHERE professional_id IN (SELECT id FROM professionals WHERE tenant_id = ?)
  DELETE professional_schedules WHERE professional_id IN (SELECT id FROM professionals WHERE tenant_id = ?)
  DELETE professionals         WHERE tenant_id = ?
  DELETE services              WHERE tenant_id = ?
  DELETE clients               WHERE tenant_id = ?
  DELETE plans                 WHERE tenant_id = ?

Passo 5 (auth e config):
  DELETE users                 WHERE tenant_id = ?
  DELETE tenant_settings       WHERE tenant_id = ?

Passo 6 (raiz):
  DELETE tenants               WHERE id = ?
```

**Nota:** Na prática, como a maioria das FKs usa `ON DELETE CASCADE` a partir do tenant, bastaria `DELETE FROM tenants WHERE id = ?`. Porém as FKs com `RESTRICT` (em `appointments`, `client_plans`, `transactions`) impedem isso. A sequência acima resolve na ordem correta.

**Alternativa recomendada:** Implementar a deleção do tenant em uma transaction com `SET CONSTRAINTS ALL DEFERRED` para poder deletar na ordem que desejar, ou trocar os `RESTRICT` por `CASCADE` apenas para a operação de teardown (via função PL/pgSQL).

```sql
-- Função para deleção completa de tenant
CREATE OR REPLACE FUNCTION delete_tenant_cascade(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Desabilitar constraints temporariamente dentro da transaction
  SET CONSTRAINTS ALL DEFERRED;

  -- Remover na ordem inversa de dependência
  DELETE FROM notifications WHERE tenant_id = p_tenant_id;
  DELETE FROM campaign_messages WHERE campaign_id IN
    (SELECT id FROM campaigns WHERE tenant_id = p_tenant_id);
  DELETE FROM campaigns WHERE tenant_id = p_tenant_id;
  DELETE FROM waitlist WHERE tenant_id = p_tenant_id;
  DELETE FROM appointment_history WHERE appointment_id IN
    (SELECT id FROM appointments WHERE tenant_id = p_tenant_id);
  DELETE FROM transactions WHERE tenant_id = p_tenant_id;
  DELETE FROM schedule_blocks WHERE professional_id IN
    (SELECT id FROM professionals WHERE tenant_id = p_tenant_id);
  DELETE FROM client_plans WHERE client_id IN
    (SELECT id FROM clients WHERE tenant_id = p_tenant_id);
  DELETE FROM appointments WHERE tenant_id = p_tenant_id;
  DELETE FROM professional_services WHERE professional_id IN
    (SELECT id FROM professionals WHERE tenant_id = p_tenant_id);
  DELETE FROM professional_breaks WHERE professional_id IN
    (SELECT id FROM professionals WHERE tenant_id = p_tenant_id);
  DELETE FROM professional_schedules WHERE professional_id IN
    (SELECT id FROM professionals WHERE tenant_id = p_tenant_id);
  DELETE FROM professionals WHERE tenant_id = p_tenant_id;
  DELETE FROM services WHERE tenant_id = p_tenant_id;
  DELETE FROM clients WHERE tenant_id = p_tenant_id;
  DELETE FROM plans WHERE tenant_id = p_tenant_id;
  DELETE FROM sessions WHERE user_id IN
    (SELECT id FROM users WHERE tenant_id = p_tenant_id);
  DELETE FROM users WHERE tenant_id = p_tenant_id;
  DELETE FROM tenant_settings WHERE tenant_id = p_tenant_id;
  DELETE FROM tenants WHERE id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;
```

---

### Resumo de Cardinalidades

| Relação | Cardinalidade | Tabela de Junção |
|---|---|---|
| Tenant - TenantSettings | 1:1 | Nao |
| Tenant - User | 1:N | Nao |
| Tenant - Professional | 1:N | Nao |
| Tenant - Service | 1:N | Nao |
| Tenant - Client | 1:N | Nao |
| Tenant - Appointment | 1:N | Nao |
| Tenant - Campaign | 1:N | Nao |
| Tenant - Plan | 1:N | Nao |
| Tenant - Transaction | 1:N | Nao |
| Tenant - Waitlist | 1:N | Nao |
| Tenant - Notification | 1:N | Nao |
| User - Session | 1:N | Nao |
| User - Professional | 1:1 (opcional) | Nao |
| Professional - ProfessionalSchedule | 1:N | Nao |
| Professional - ProfessionalBreak | 1:N | Nao |
| Professional - Service | N:M | `professional_services` |
| Professional - Appointment | 1:N | Nao |
| Professional - ScheduleBlock | 1:N | Nao |
| Service - Appointment | 1:N | Nao |
| Service - Waitlist | 1:N | Nao |
| Client - Appointment | 1:N | Nao |
| Client - Waitlist | 1:N | Nao |
| Client - CampaignMessage | 1:N | Nao |
| Client - ClientPlan | 1:N | Nao |
| Client - Transaction | 1:N | Nao |
| Client - Notification | 1:N | Nao |
| Appointment - AppointmentHistory | 1:N | Nao |
| Appointment - Notification | 1:N (opcional) | Nao |
| Appointment - Transaction | 1:1 (opcional) | Nao |
| Campaign - CampaignMessage | 1:N | Nao |
| Plan - ClientPlan | 1:N | Nao |

**Total de relações:** 31
**Tabelas de junção:** 1 (`professional_services`)
**Tabelas totais:** 20

---

> **Referências cruzadas:** 07-banco-de-dados.md (DDL completa), 08-entidades.md (regras de domínio).
