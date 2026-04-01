# 11 — Eventos, Automacoes e Jobs

> BarberFlow — SaaS multi-tenant de crescimento para barbearias
> Stack: Next.js API Routes + Prisma + PostgreSQL

---

## Visao Geral da Arquitetura de Eventos

O sistema utiliza um modelo baseado em eventos internos para desacoplar acoes e disparar automacoes. Cada evento e publicado por um dominio e consumido por handlers que executam efeitos colaterais.

### Fluxo

```
[Acao do Usuario] → [API Route] → [Service Layer] → [Event Emitter]
                                                          ↓
                                                    [Event Bus]
                                                     ↓    ↓    ↓
                                              [Handler A] [Handler B] [Handler C]
                                                 ↓           ↓           ↓
                                           [Notificacao] [Banco] [Queue/Job]
```

### Convencoes

| Item | Padrao |
|---|---|
| Nomeacao | `dominio.acao` em snake_case (ex.: `appointment.created`) |
| Payload | Objeto JSON com dados relevantes + metadados |
| Processamento | Sincrono para acoes criticas (banco); assincrono para notificacoes (fila) |
| Tenant isolation | Todo evento inclui `tenant_id` no payload |
| Idempotencia | Handlers devem ser idempotentes (executar 2x nao causa efeito duplicado) |
| Auditoria | Todo evento e registrado na tabela `event_log` |

### Estrutura padrao do payload

```json
{
  "event": "appointment.created",
  "tenant_id": "uuid",
  "timestamp": "2026-03-31T14:30:00Z",
  "triggered_by": {
    "user_id": "uuid",
    "role": "receptionist",
    "source": "dashboard"
  },
  "data": { ... }
}
```

---

## Catalogo de Eventos

---

### 1. `appointment.created`

**Quando e disparado:** Um novo agendamento e criado, seja pelo dashboard, por um profissional, ou pela pagina publica de booking.

**Payload:**
```json
{
  "event": "appointment.created",
  "tenant_id": "uuid",
  "timestamp": "2026-03-31T14:30:00Z",
  "triggered_by": {
    "user_id": "uuid-or-null",
    "role": "receptionist",
    "source": "dashboard | public_booking"
  },
  "data": {
    "appointment_id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "end_time": "14:30",
    "client": {
      "id": "uuid",
      "name": "Roberto Souza",
      "phone": "+5511988880000"
    },
    "professional": {
      "id": "uuid",
      "name": "Carlos Barber"
    },
    "service": {
      "id": "uuid",
      "name": "Corte Masculino",
      "duration_minutes": 30
    },
    "price": 45.00,
    "used_plan": false,
    "notes": null
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Enviar confirmacao ao cliente | Assincrono (fila) | Mensagem via WhatsApp/SMS confirmando data, hora, servico e profissional |
| Agendar lembrete | Sincrono (banco) | Criar registro na tabela `scheduled_notifications` com disparo X horas antes do atendimento |
| Atualizar agenda do profissional | Sincrono (banco) | Marcar o slot como ocupado na visualizacao de agenda |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 2. `appointment.confirmed`

**Quando e disparado:** O cliente confirma presenca (via link na mensagem de lembrete ou manualmente pelo dashboard).

**Payload:**
```json
{
  "event": "appointment.confirmed",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T08:00:00Z",
  "triggered_by": {
    "user_id": "uuid-or-null",
    "role": "client | receptionist",
    "source": "confirmation_link | dashboard"
  },
  "data": {
    "appointment_id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "client": {
      "id": "uuid",
      "name": "Roberto Souza"
    },
    "professional": {
      "id": "uuid",
      "name": "Carlos Barber"
    },
    "confirmed_at": "2026-04-01T08:00:00Z"
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Atualizar status do agendamento | Sincrono (banco) | `status` → `confirmed` |
| Notificar profissional | Assincrono (fila) | Enviar notificacao interna ao profissional (se configurado) |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 3. `appointment.cancelled`

**Quando e disparado:** Um agendamento e cancelado por qualquer parte (cliente, equipe, sistema).

**Payload:**
```json
{
  "event": "appointment.cancelled",
  "tenant_id": "uuid",
  "timestamp": "2026-03-31T16:00:00Z",
  "triggered_by": {
    "user_id": "uuid",
    "role": "receptionist",
    "source": "dashboard"
  },
  "data": {
    "appointment_id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "end_time": "14:30",
    "client": {
      "id": "uuid",
      "name": "Roberto Souza",
      "phone": "+5511988880000"
    },
    "professional": {
      "id": "uuid",
      "name": "Carlos Barber"
    },
    "service": {
      "id": "uuid",
      "name": "Corte Masculino"
    },
    "reason": "Cliente solicitou cancelamento",
    "cancelled_within_policy": true,
    "cancelled_at": "2026-03-31T16:00:00Z"
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Liberar horario | Sincrono (banco) | Remover o bloqueio do slot na agenda do profissional |
| Cancelar lembrete agendado | Sincrono (banco) | Remover ou invalidar o registro em `scheduled_notifications` |
| Verificar lista de espera | Assincrono (fila) | Buscar clientes na waitlist que desejam a mesma data/profissional/horario e disparar `waitlist.slot_available` |
| Notificar profissional | Assincrono (fila) | Informar o profissional sobre o cancelamento |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 4. `appointment.no_show`

**Quando e disparado:** O profissional ou equipe marca que o cliente nao compareceu ao agendamento.

**Payload:**
```json
{
  "event": "appointment.no_show",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T14:45:00Z",
  "triggered_by": {
    "user_id": "uuid",
    "role": "staff",
    "source": "dashboard"
  },
  "data": {
    "appointment_id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "client": {
      "id": "uuid",
      "name": "Roberto Souza",
      "phone": "+5511988880000",
      "no_show_count_before": 2,
      "no_show_count_after": 3
    },
    "professional": {
      "id": "uuid",
      "name": "Carlos Barber"
    },
    "service": {
      "id": "uuid",
      "name": "Corte Masculino"
    },
    "marked_at": "2026-04-01T14:45:00Z"
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Incrementar `no_show_count` do cliente | Sincrono (banco) | `client.no_show_count` += 1 |
| Avaliar bloqueio de booking publico | Sincrono (banco) | Se `no_show_count` >= `no_show_limit` do tenant, marcar cliente como `booking_blocked` |
| Liberar horario para encaixe | Sincrono (banco) | Marcar o slot como disponivel (caso ainda haja tempo util no dia) |
| Verificar lista de espera | Assincrono (fila) | Se o horario e futuro o suficiente, notificar waitlist |
| Gerar alerta para o dashboard | Sincrono (banco) | Criar alerta do tipo `no_show_risk` para proximos agendamentos do cliente |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 5. `appointment.completed`

**Quando e disparado:** O atendimento e marcado como concluido (profissional ou equipe confirma que o servico foi realizado).

**Payload:**
```json
{
  "event": "appointment.completed",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T14:35:00Z",
  "triggered_by": {
    "user_id": "uuid",
    "role": "staff",
    "source": "dashboard"
  },
  "data": {
    "appointment_id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "end_time": "14:30",
    "client": {
      "id": "uuid",
      "name": "Roberto Souza",
      "total_visits_after": 13,
      "avg_frequency_days": 21
    },
    "professional": {
      "id": "uuid",
      "name": "Carlos Barber",
      "commission_percentage": 50
    },
    "service": {
      "id": "uuid",
      "name": "Corte Masculino"
    },
    "price_charged": 45.00,
    "used_plan": false,
    "plan_id": null,
    "completed_at": "2026-04-01T14:35:00Z"
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Atualizar `last_visit_at` do cliente | Sincrono (banco) | `client.last_visit_at` = data/hora da conclusao |
| Incrementar `total_visits` do cliente | Sincrono (banco) | `client.total_visits` += 1 |
| Recalcular `avg_frequency_days` | Sincrono (banco) | Media dos intervalos entre as ultimas 5 visitas |
| Calcular `suggested_return_date` | Sincrono (banco) | `last_visit_at` + `avg_frequency_days` |
| Criar transacao financeira | Sincrono (banco) | Inserir na tabela `transactions` com `price_charged`, `commission_value`, `payment_method` |
| Registrar uso do plano (se aplicavel) | Sincrono (banco) | Se `used_plan` = true, decrementar `uses_remaining` do `client_plan` |
| Reativar cliente se estava inativo | Sincrono (banco) | Se `client.status` = `inactive`, mudar para `active` e disparar `client.reactivated` |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 6. `appointment.reminder_due`

**Quando e disparado:** O cron job `send-reminders` detecta que um lembrete esta na hora de ser enviado (X horas antes do agendamento, conforme configuracao do tenant).

**Payload:**
```json
{
  "event": "appointment.reminder_due",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T12:00:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "cron:send-reminders"
  },
  "data": {
    "appointment_id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "client": {
      "id": "uuid",
      "name": "Roberto Souza",
      "phone": "+5511988880000"
    },
    "professional": {
      "id": "uuid",
      "name": "Carlos Barber"
    },
    "service": {
      "id": "uuid",
      "name": "Corte Masculino"
    },
    "reminder_hours_before": 2,
    "notification_id": "uuid"
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Enviar lembrete ao cliente | Assincrono (fila) | Mensagem via WhatsApp/SMS com dados do agendamento e link para confirmar/cancelar |
| Atualizar status da notificacao | Sincrono (banco) | `scheduled_notification.status` → `sent` |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

**Conteudo da mensagem (template padrao):**
```
Ola {{client_name}}! Lembrete: voce tem um agendamento amanha.

📅 {{date}} as {{start_time}}
✂️ {{service_name}}
💈 {{professional_name}}

Confirme aqui: {{confirmation_link}}
Precisa cancelar? {{cancellation_link}}

{{barbershop_name}}
```

---

### 7. `client.became_inactive`

**Quando e disparado:** O cron job `check-inactive-clients` detecta que um cliente ultrapassou o threshold de inatividade do tenant (dias sem visitar).

**Payload:**
```json
{
  "event": "client.became_inactive",
  "tenant_id": "uuid",
  "timestamp": "2026-03-31T02:00:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "cron:check-inactive-clients"
  },
  "data": {
    "client": {
      "id": "uuid",
      "name": "Mario Oliveira",
      "phone": "+5511977770000",
      "email": "mario@email.com",
      "last_visit_at": "2026-02-01T10:00:00Z",
      "days_since_last_visit": 58,
      "total_visits": 5,
      "total_spent": 225.00
    },
    "threshold_days": 45,
    "preferred_service": {
      "id": "uuid",
      "name": "Corte Masculino"
    },
    "preferred_professional": {
      "id": "uuid",
      "name": "Carlos Barber"
    }
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Marcar cliente como inativo | Sincrono (banco) | `client.status` → `inactive`, `client.became_inactive_at` = agora |
| Adicionar a lista de inativos | Sincrono (banco) | Cliente passa a aparecer no endpoint `/api/clients/inactive` |
| Gerar sugestao de reativacao | Sincrono (banco) | Criar alerta no dashboard sugerindo envio de mensagem de reativacao |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

**Criterios de inatividade:**
- Cliente tem pelo menos 1 visita registrada (`total_visits` >= 1)
- Dias desde `last_visit_at` > `inactive_threshold_days` do tenant
- Cliente nao tem agendamento futuro ativo
- Cliente estava com status `active`

---

### 8. `client.reactivated`

**Quando e disparado:** Um cliente inativo volta a ter status ativo — seja por um novo agendamento, visita concluida, ou acao manual de reativacao.

**Payload:**
```json
{
  "event": "client.reactivated",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T14:35:00Z",
  "triggered_by": {
    "user_id": "uuid",
    "role": "staff",
    "source": "appointment_completed | manual_reactivation"
  },
  "data": {
    "client": {
      "id": "uuid",
      "name": "Mario Oliveira",
      "phone": "+5511977770000",
      "previous_status": "inactive",
      "days_inactive": 58,
      "became_inactive_at": "2026-02-28T02:00:00Z"
    },
    "reactivation_trigger": "appointment_completed",
    "reactivated_at": "2026-04-01T14:35:00Z"
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Atualizar status do cliente | Sincrono (banco) | `client.status` → `active`, `client.became_inactive_at` = null |
| Remover da lista de inativos | Sincrono (banco) | Cliente deixa de aparecer no endpoint de inativos |
| Registrar reativacao para metricas | Sincrono (banco) | Incrementar contador `reactivated_count` nas metricas do periodo |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 9. `waitlist.slot_available`

**Quando e disparado:** Um horario e liberado (por cancelamento, no-show ou remocao de bloqueio) e ha clientes na lista de espera compativeis com aquele slot.

**Payload:**
```json
{
  "event": "waitlist.slot_available",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T10:00:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "appointment.cancelled | appointment.no_show"
  },
  "data": {
    "available_slot": {
      "date": "2026-04-01",
      "start_time": "14:00",
      "end_time": "14:30",
      "professional": {
        "id": "uuid",
        "name": "Carlos Barber"
      }
    },
    "matching_waitlist_entries": [
      {
        "id": "uuid",
        "client": {
          "id": "uuid",
          "name": "Ana Costa",
          "phone": "+5511977770000"
        },
        "service": {
          "id": "uuid",
          "name": "Corte Masculino"
        },
        "position": 1,
        "waiting_since": "2026-03-30T10:00:00Z"
      }
    ],
    "total_matching": 1
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Notificar primeiro da fila | Assincrono (fila) | Enviar mensagem ao cliente na posicao 1 com oferta do horario |
| Marcar entrada como notificada | Sincrono (banco) | `waitlist_entry.status` → `notified`, `waitlist_entry.notified_at` = agora |
| Agendar timeout da oferta | Assincrono (fila) | Se o cliente nao responder em 2 horas, notificar o proximo da fila |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

**Logica de matching da waitlist:**
- `preferred_date` = data do slot liberado
- `professional_id` = profissional do slot OU `professional_id` = null (qualquer)
- `preferred_time_range` inclui o horario do slot
- Duracao do servico desejado cabe no slot disponivel
- Ordenar por `position` (FIFO)

---

### 10. `campaign.sent`

**Quando e disparado:** O processamento assincrono de envio de uma campanha e finalizado.

**Payload:**
```json
{
  "event": "campaign.sent",
  "tenant_id": "uuid",
  "timestamp": "2026-03-31T10:35:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "job:campaign-sender"
  },
  "data": {
    "campaign_id": "uuid",
    "campaign_name": "Promocao de Verao",
    "channel": "whatsapp",
    "results": {
      "total_sent": 150,
      "delivered": 145,
      "failed": 5,
      "failure_reasons": {
        "invalid_number": 3,
        "opted_out": 2
      }
    },
    "started_at": "2026-03-31T10:00:00Z",
    "completed_at": "2026-03-31T10:35:00Z",
    "duration_seconds": 2100
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Atualizar status da campanha | Sincrono (banco) | `campaign.status` → `sent`, registrar metricas |
| Registrar envios individuais | Sincrono (banco) | Inserir na tabela `campaign_sends` com status de cada destinatario |
| Iniciar rastreamento de conversoes | Sincrono (banco) | Marcar janela de 7 dias para rastrear agendamentos dos destinatarios |
| Notificar criador da campanha | Assincrono (fila) | Enviar notificacao interna com resumo dos resultados |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 11. `plan.expiring_soon`

**Quando e disparado:** O cron job `expire-plans` detecta que um plano de cliente vence nos proximos 7 dias.

**Payload:**
```json
{
  "event": "plan.expiring_soon",
  "tenant_id": "uuid",
  "timestamp": "2026-03-31T03:00:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "cron:expire-plans"
  },
  "data": {
    "client_plan_id": "uuid",
    "plan": {
      "id": "uuid",
      "name": "Plano Mensal Corte"
    },
    "client": {
      "id": "uuid",
      "name": "Roberto Souza",
      "phone": "+5511988880000"
    },
    "expires_at": "2026-04-05",
    "days_until_expiry": 5,
    "uses_remaining": 2,
    "total_uses": 4
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Gerar alerta no dashboard | Sincrono (banco) | Criar alerta do tipo `plan_expiring` para o dono/gerente |
| Notificar equipe | Assincrono (fila) | Enviar notificacao interna para owner/manager |
| Sugerir contato com cliente | Sincrono (banco) | Se `uses_remaining` > 0, adicionar sugestao de lembrar o cliente de usar os creditos |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 12. `plan.expired`

**Quando e disparado:** O cron job `expire-plans` detecta que a data de expiracao de um plano de cliente ja passou.

**Payload:**
```json
{
  "event": "plan.expired",
  "tenant_id": "uuid",
  "timestamp": "2026-04-06T03:00:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "cron:expire-plans"
  },
  "data": {
    "client_plan_id": "uuid",
    "plan": {
      "id": "uuid",
      "name": "Plano Mensal Corte"
    },
    "client": {
      "id": "uuid",
      "name": "Roberto Souza",
      "phone": "+5511988880000"
    },
    "expired_at": "2026-04-05",
    "uses_remaining": 2,
    "total_uses": 4,
    "was_fully_used": false
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Atualizar status do plano | Sincrono (banco) | `client_plan.status` → `expired` |
| Gerar alerta de renovacao | Sincrono (banco) | Criar alerta sugerindo ofertar renovacao ao cliente |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

---

### 13. `daily.morning_summary`

**Quando e disparado:** Cron job executado diariamente as 07:00 no fuso horario do tenant.

**Payload:**
```json
{
  "event": "daily.morning_summary",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T07:00:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "cron:daily-summary"
  },
  "data": {
    "date": "2026-04-01",
    "summary": {
      "appointments_today": 18,
      "confirmed": 12,
      "unconfirmed": 6,
      "first_appointment": "09:00",
      "last_appointment": "18:00",
      "estimated_revenue": 810.00,
      "professionals_working": [
        { "name": "Carlos Barber", "appointments": 8 },
        { "name": "Pedro Barber", "appointments": 6 },
        { "name": "Lucas Barber", "appointments": 4 }
      ],
      "gaps": {
        "total_minutes": 150,
        "count": 5
      },
      "alerts": [
        "3 agendamentos nao confirmados",
        "Roberto Souza tem historico de 3 faltas",
        "2 planos expiram esta semana"
      ]
    },
    "owner": {
      "id": "uuid",
      "name": "Joao Silva",
      "phone": "+5511999990000"
    }
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Gerar resumo do dia | Sincrono (banco) | Compilar dados de agendamentos, profissionais e alertas |
| Enviar resumo ao dono | Assincrono (fila) | Mensagem via WhatsApp com resumo formatado |
| Atualizar dashboard | Sincrono (banco) | Preencher cache do dashboard com dados pre-calculados |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` |

**Conteudo da mensagem (template padrao):**
```
Bom dia, {{owner_name}}! Resumo do dia na {{barbershop_name}}:

📅 {{date}}
📋 {{appointments_today}} agendamentos
✅ {{confirmed}} confirmados | ⏳ {{unconfirmed}} aguardando
💰 Receita estimada: R$ {{estimated_revenue}}
🕐 Primeiro: {{first_appointment}} | Ultimo: {{last_appointment}}

⚠️ Alertas:
{{#alerts}}
• {{.}}
{{/alerts}}

Tenha um otimo dia!
```

---

### 14. `daily.inactive_check`

**Quando e disparado:** Cron job executado diariamente as 02:00 (horario de baixo uso).

**Payload:**
```json
{
  "event": "daily.inactive_check",
  "tenant_id": "uuid",
  "timestamp": "2026-04-01T02:00:00Z",
  "triggered_by": {
    "user_id": null,
    "role": "system",
    "source": "cron:check-inactive-clients"
  },
  "data": {
    "threshold_days": 45,
    "clients_checked": 230,
    "newly_inactive": [
      {
        "client_id": "uuid",
        "name": "Mario Oliveira",
        "days_since_last_visit": 46,
        "last_visit_at": "2026-02-14T10:00:00Z"
      },
      {
        "client_id": "uuid",
        "name": "Fernando Lima",
        "days_since_last_visit": 48,
        "last_visit_at": "2026-02-12T14:00:00Z"
      }
    ],
    "total_inactive_after": 17,
    "previously_inactive": 15
  }
}
```

**Acoes automaticas disparadas:**

| Acao | Tipo | Descricao |
|---|---|---|
| Marcar novos inativos | Sincrono (banco) | Para cada cliente em `newly_inactive`, disparar `client.became_inactive` |
| Atualizar contagem de inativos | Sincrono (banco) | Atualizar metrica no dashboard |
| Gerar alerta se houver novos inativos | Sincrono (banco) | Criar alerta do tipo `inactive_clients` no dashboard |
| Registrar no log | Sincrono (banco) | Inserir na tabela `event_log` com resumo |

---

## Automacoes do MVP

Detalhamento das 5 automacoes principais que compoem o diferencial do BarberFlow no lancamento.

---

### Automacao 1: Confirmacao automatica pos-agendamento

**Trigger:** `appointment.created`
**Timing:** Imediato (assincrono, fila de envio)
**Canal:** WhatsApp (primario), SMS (fallback)

**Fluxo:**
```
[Agendamento criado]
    ↓
[Verificar canal preferido do cliente]
    ↓
[Montar mensagem com template de confirmacao]
    ↓
[Enfileirar para envio]
    ↓
[Enviar via WhatsApp API]
    ↓ (falha?)
[Tentar via SMS]
    ↓
[Registrar status do envio]
```

**Mensagem:**
```
Ola {{client_name}}! Seu agendamento foi confirmado:

📅 {{date}} as {{start_time}}
✂️ {{service_name}}
💈 com {{professional_name}}

📍 {{barbershop_name}}
{{barbershop_address}}

Precisa alterar? Responda esta mensagem.
```

**Regras:**
- Enviar no maximo 1 confirmacao por agendamento
- Se o agendamento for criado pela pagina publica, usar nome da barbearia como remetente
- Se o agendamento for para menos de 1 hora, enviar confirmacao com texto adaptado ("Ate ja!")
- Nao enviar confirmacao para agendamentos criados no modo "walk-in" (encaixe de ultima hora)

---

### Automacao 2: Lembrete automatico X horas antes

**Trigger:** `appointment.reminder_due` (gerado pelo cron `send-reminders`)
**Timing:** Configuravel por tenant (padrao: 2 horas antes)
**Canal:** WhatsApp (primario), SMS (fallback)

**Fluxo:**
```
[Cron executa a cada 15 minutos]
    ↓
[Buscar agendamentos com reminder_at <= agora AND reminder_sent = false]
    ↓
[Para cada agendamento encontrado:]
    ↓
[Verificar se agendamento ainda esta ativo (nao cancelado)]
    ↓
[Montar mensagem com template de lembrete]
    ↓
[Enfileirar para envio]
    ↓
[Marcar reminder_sent = true]
```

**Calculo do `reminder_at`:**
```
reminder_at = appointment.date + appointment.start_time - tenant.reminder_hours_before
```

**Exemplo:** Agendamento em 01/04 as 14:00 com lembrete de 2h → `reminder_at` = 01/04 12:00

**Mensagem:**
```
Ola {{client_name}}! Lembrete do seu agendamento:

📅 Hoje as {{start_time}}
✂️ {{service_name}}
💈 com {{professional_name}}

Confirme sua presenca: {{confirmation_link}}
Precisa cancelar? {{cancellation_link}}

{{barbershop_name}}
```

**Regras:**
- So enviar lembrete se o agendamento estiver com status `scheduled` ou `confirmed`
- Nao enviar lembrete se o agendamento ja foi concluido ou cancelado
- Nao enviar lembrete duplicado (flag `reminder_sent`)
- Se o agendamento for criado dentro da janela de lembrete (ex.: criado as 13:00, agendamento as 14:00), enviar lembrete imediato
- O link de confirmacao atualiza o status para `confirmed`
- O link de cancelamento cancela o agendamento e libera o horario

---

### Automacao 3: Marcacao automatica de cliente inativo

**Trigger:** `daily.inactive_check` (cron diario as 02:00)
**Timing:** Diario

**Fluxo:**
```
[Cron executa as 02:00]
    ↓
[Para cada tenant ativo:]
    ↓
[Buscar clientes com:
  - status = 'active'
  - total_visits >= 1
  - last_visit_at < (agora - inactive_threshold_days)
  - nenhum agendamento futuro ativo]
    ↓
[Para cada cliente encontrado:]
    ↓
[Disparar evento client.became_inactive]
    ↓
[Marcar status = 'inactive']
    ↓
[Gerar sugestao de reativacao no dashboard]
```

**Regras:**
- Processar tenant por tenant para respeitar o threshold configurado de cada um
- Nao marcar como inativo clientes com agendamento futuro (ja estao voltando)
- Nao marcar como inativo clientes recem-cadastrados sem visitas (sao "novos", nao "inativos")
- Registrar a data de inativacao (`became_inactive_at`) para metricas
- Gerar 1 alerta consolidado por tenant (nao 1 por cliente)

---

### Automacao 4: Alerta de horarios vagos no dashboard

**Trigger:** Tempo real (calculado on-demand ao acessar o dashboard)
**Timing:** Cada acesso ao dashboard / endpoint `/api/dashboard/alerts`

**Fluxo:**
```
[Usuario acessa dashboard]
    ↓
[Calcular gaps de todos os profissionais para hoje]
    ↓
[Filtrar gaps >= slot_duration_minutes]
    ↓
[Cruzar com servicos que cabem em cada gap]
    ↓
[Montar alerta com acoes sugeridas]
    ↓
[Retornar no endpoint de alertas]
```

**Logica de calculo de gap:**
```
Para cada profissional ativo:
  1. Obter working_hours do dia
  2. Obter agendamentos do dia
  3. Obter bloqueios do dia
  4. Calcular intervalos entre compromissos
  5. Descontar intervalo de almoco
  6. Gaps = intervalos com duracao >= slot_duration_minutes
```

**Formato do alerta:**
```json
{
  "type": "gap_alert",
  "severity": "info",
  "title": "{{gap_count}} horarios vagos hoje",
  "message": "{{professional_name}} tem {{gap_duration}} minutos disponiveis entre {{gap_start}} e {{gap_end}}",
  "action": {
    "type": "link",
    "url": "/appointments/gaps?date=today",
    "label": "Ver horarios vagos"
  },
  "suggestions": [
    "Ligar para clientes da lista de espera",
    "Postar disponibilidade nas redes sociais",
    "Enviar campanha de encaixe"
  ]
}
```

**Regras:**
- Gaps menores que o servico mais curto do tenant sao ignorados
- Alertas de gap sao gerados apenas para o dia atual e o proximo dia util
- Priorizar gaps no horario nobre (10h-12h e 14h-18h) com severidade `warning`

---

### Automacao 5: Sugestao de retorno baseada na frequencia

**Trigger:** `appointment.completed` (ao concluir atendimento)
**Timing:** Sincrono, calculado na conclusao do atendimento
**Visibilidade:** Exibido na ficha do cliente e no dashboard

**Fluxo:**
```
[Atendimento concluido]
    ↓
[Buscar ultimas 5 visitas do cliente]
    ↓
[Calcular intervalos entre visitas consecutivas]
    ↓
[avg_frequency_days = media dos intervalos]
    ↓
[suggested_return_date = last_visit_at + avg_frequency_days]
    ↓
[Salvar no registro do cliente]
    ↓
[Exibir na ficha do cliente]
```

**Exemplo de calculo:**
```
Visitas do Roberto:
  - 01/01 → 22/01 (21 dias)
  - 22/01 → 10/02 (19 dias)
  - 10/02 → 05/03 (23 dias)
  - 05/03 → 25/03 (20 dias)

avg_frequency_days = (21 + 19 + 23 + 20) / 4 = 20.75 → 21 dias

last_visit_at = 25/03
suggested_return_date = 25/03 + 21 dias = 15/04
```

**Regras:**
- Minimo de 2 visitas para calcular frequencia (com 1 visita nao ha como calcular intervalo)
- Se o cliente tem apenas 1 visita, usar padrao do tenant (21 dias)
- Usar no maximo as ultimas 5 visitas para o calculo (evitar distorcer com dados muito antigos)
- `avg_frequency_days` arredondado para inteiro
- Quando o `suggested_return_date` passar sem visita, o cliente e candidato a reativacao proativa
- Exibir no dashboard como "Clientes com retorno previsto para esta semana" para facilitar agendamentos proativos

**Uso no dashboard:**
```json
{
  "type": "return_suggestion",
  "severity": "info",
  "title": "5 clientes com retorno previsto esta semana",
  "clients": [
    {
      "id": "uuid",
      "name": "Roberto Souza",
      "suggested_return_date": "2026-04-01",
      "avg_frequency_days": 21,
      "preferred_professional": "Carlos Barber",
      "preferred_service": "Corte Masculino",
      "phone": "+5511988880000"
    }
  ],
  "action": {
    "type": "link",
    "url": "/clients?return_this_week=true",
    "label": "Ver clientes"
  }
}
```

---

## Jobs e Crons

Detalhamento dos processos agendados que rodam em background.

---

### Job 1: `send-reminders`

**Frequencia:** A cada 15 minutos
**Cron Expression:** `*/15 * * * *`
**Timeout:** 5 minutos

**Descricao:** Verifica a tabela `scheduled_notifications` e envia lembretes de agendamentos que estao proximos.

**Pseudocodigo:**
```
function sendReminders():
  // Buscar notificacoes pendentes cuja hora de disparo ja chegou
  notifications = SELECT * FROM scheduled_notifications
    WHERE type = 'reminder'
    AND status = 'pending'
    AND scheduled_for <= NOW()
    AND scheduled_for > NOW() - INTERVAL '1 hour'  // Safety: nao enviar lembretes muito atrasados

  FOR each notification IN notifications:
    // Verificar se o agendamento ainda esta ativo
    appointment = getAppointment(notification.appointment_id)
    IF appointment.status IN ('cancelled', 'completed', 'no_show'):
      notification.status = 'skipped'
      CONTINUE

    // Disparar evento
    emit('appointment.reminder_due', {
      appointment_id: appointment.id,
      notification_id: notification.id,
      ...
    })

    // Enfileirar envio
    queue.add('send-notification', {
      channel: tenant.settings.notification_channel,
      recipient: appointment.client.phone,
      template: 'reminder',
      data: { ... }
    })

    notification.status = 'sent'
    notification.sent_at = NOW()

  LOG("send-reminders completed: {sent}/{total} sent")
```

**Tratamento de erros:**
- Se o envio falhar, marcar `status` = `failed` e `error_message`
- Nao retentar automaticamente (evitar spam)
- Se o job demorar mais que 5 minutos, registrar timeout e abortar
- Registrar metricas: total processado, enviados, falhas, tempo de execucao

---

### Job 2: `check-inactive-clients`

**Frequencia:** Diario as 02:00
**Cron Expression:** `0 2 * * *`
**Timeout:** 10 minutos

**Descricao:** Verifica todos os clientes ativos de todos os tenants e marca como inativos os que passaram do threshold.

**Pseudocodigo:**
```
function checkInactiveClients():
  tenants = SELECT * FROM tenants WHERE status = 'active'

  FOR each tenant IN tenants:
    threshold = tenant.settings.inactive_threshold_days
    cutoff_date = NOW() - INTERVAL threshold DAYS

    newly_inactive = SELECT * FROM clients
      WHERE tenant_id = tenant.id
      AND status = 'active'
      AND total_visits >= 1
      AND last_visit_at < cutoff_date
      AND id NOT IN (
        SELECT client_id FROM appointments
        WHERE date >= TODAY
        AND status IN ('scheduled', 'confirmed')
      )

    FOR each client IN newly_inactive:
      emit('client.became_inactive', {
        client: client,
        threshold_days: threshold
      })

    LOG("[Tenant {tenant.name}] {newly_inactive.length} clientes marcados como inativos")

  LOG("check-inactive-clients completed for {tenants.length} tenants")
```

**Tratamento de erros:**
- Se falhar para um tenant, continuar com os demais
- Registrar tenants com erro para reprocessamento manual
- Nao processar tenants inativos ou suspensos

---

### Job 3: `expire-plans`

**Frequencia:** Diario as 03:00
**Cron Expression:** `0 3 * * *`
**Timeout:** 5 minutos

**Descricao:** Verifica planos de clientes que venceram ou estao proximos de vencer.

**Pseudocodigo:**
```
function expirePlans():
  // 1. Expirar planos vencidos
  expired = SELECT * FROM client_plans
    WHERE status = 'active'
    AND expires_at < TODAY

  FOR each client_plan IN expired:
    client_plan.status = 'expired'
    emit('plan.expired', {
      client_plan_id: client_plan.id,
      ...
    })

  // 2. Alertar planos proximos de vencer (7 dias)
  expiring_soon = SELECT * FROM client_plans
    WHERE status = 'active'
    AND expires_at BETWEEN TODAY AND TODAY + 7

  FOR each client_plan IN expiring_soon:
    // Verificar se alerta ja foi gerado (evitar duplicata)
    IF NOT alertAlreadySent(client_plan.id, 'plan_expiring_soon'):
      emit('plan.expiring_soon', {
        client_plan_id: client_plan.id,
        days_until_expiry: DATEDIFF(client_plan.expires_at, TODAY),
        ...
      })

  LOG("expire-plans: {expired.length} expirados, {expiring_soon.length} alertados")
```

**Tratamento de erros:**
- Processar em transacao por client_plan (falha de 1 nao afeta os demais)
- Nao expirar planos que ja estao com status `expired` (idempotencia)
- Alerta de expiracao proxima so e gerado 1 vez por plano

---

### Job 4: `daily-summary`

**Frequencia:** Diario as 07:00
**Cron Expression:** `0 7 * * *`
**Timeout:** 10 minutos

**Descricao:** Gera e envia o resumo diario da barbearia para o owner de cada tenant.

**Pseudocodigo:**
```
function dailySummary():
  tenants = SELECT * FROM tenants WHERE status = 'active'

  FOR each tenant IN tenants:
    // Compilar dados do dia
    today = TODAY
    appointments = getAppointments(tenant.id, today)
    gaps = calculateGaps(tenant.id, today)
    alerts = generateAlerts(tenant.id)
    estimated_revenue = calculateEstimatedRevenue(appointments)

    summary = {
      appointments_today: appointments.length,
      confirmed: appointments.filter(a => a.status == 'confirmed').length,
      unconfirmed: appointments.filter(a => a.status == 'scheduled').length,
      first_appointment: appointments[0]?.start_time,
      last_appointment: appointments[last]?.start_time,
      estimated_revenue: estimated_revenue,
      professionals_working: groupByProfessional(appointments),
      gaps: { total_minutes: gaps.totalMinutes, count: gaps.count },
      alerts: alerts
    }

    owner = getOwner(tenant.id)

    emit('daily.morning_summary', {
      summary: summary,
      owner: owner
    })

    // Enfileirar envio via WhatsApp
    queue.add('send-notification', {
      channel: 'whatsapp',
      recipient: owner.phone,
      template: 'daily_summary',
      data: summary
    })

  LOG("daily-summary sent to {tenants.length} tenants")
```

**Tratamento de erros:**
- Se falhar para um tenant, continuar com os demais
- Se o envio da mensagem falhar, registrar e nao retentar (o dono pode acessar o dashboard diretamente)
- Considerar fuso horario do tenant para o horario de envio (futuro)

---

## Tabelas de Suporte para Eventos

### `event_log`

Tabela de auditoria onde todos os eventos sao registrados.

```sql
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_name VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  triggered_by_user_id UUID REFERENCES users(id),
  triggered_by_source VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_event_log_tenant ON event_log(tenant_id);
CREATE INDEX idx_event_log_event ON event_log(event_name);
CREATE INDEX idx_event_log_created ON event_log(created_at);
```

### `scheduled_notifications`

Tabela para controle de notificacoes agendadas (lembretes, etc.).

```sql
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_client_id UUID REFERENCES clients(id),
  related_type VARCHAR(50),
  related_id UUID,
  message_template VARCHAR(50) NOT NULL,
  message_data JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sched_notif_pending ON scheduled_notifications(status, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_sched_notif_tenant ON scheduled_notifications(tenant_id);
```

### `campaign_sends`

Tabela para rastreamento individual de envios de campanha.

```sql
CREATE TABLE campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_status ON campaign_sends(status);
```

---

## Resumo de Eventos por Dominio

| Dominio | Evento | Tipo de Processamento |
|---|---|---|
| Appointments | `appointment.created` | Sincrono + Assincrono |
| Appointments | `appointment.confirmed` | Sincrono + Assincrono |
| Appointments | `appointment.cancelled` | Sincrono + Assincrono |
| Appointments | `appointment.no_show` | Sincrono + Assincrono |
| Appointments | `appointment.completed` | Sincrono |
| Appointments | `appointment.reminder_due` | Assincrono |
| Clients | `client.became_inactive` | Sincrono |
| Clients | `client.reactivated` | Sincrono |
| Waitlist | `waitlist.slot_available` | Assincrono |
| Campaigns | `campaign.sent` | Sincrono + Assincrono |
| Plans | `plan.expiring_soon` | Sincrono + Assincrono |
| Plans | `plan.expired` | Sincrono |
| System | `daily.morning_summary` | Assincrono |
| System | `daily.inactive_check` | Sincrono |

---

## Diagrama de Dependencias entre Eventos

```
appointment.cancelled ──→ waitlist.slot_available
appointment.no_show ────→ waitlist.slot_available
appointment.completed ──→ client.reactivated (se inativo)
daily.inactive_check ───→ client.became_inactive (para cada cliente)
cron:expire-plans ──────→ plan.expired + plan.expiring_soon
cron:send-reminders ────→ appointment.reminder_due (para cada agendamento)
cron:daily-summary ─────→ daily.morning_summary (para cada tenant)
```
