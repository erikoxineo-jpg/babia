# 10 — Especificacao de APIs REST

> BarberFlow — SaaS multi-tenant de crescimento para barbearias
> Stack: Next.js API Routes + Prisma + PostgreSQL

---

## Convencoes Gerais

| Item | Padrao |
|---|---|
| Base URL | `/api` |
| Formato | JSON (`Content-Type: application/json`) |
| Autenticacao | Bearer token JWT via header `Authorization` |
| Tenant isolation | Todas as rotas autenticadas operam no tenant do usuario logado (extraido do JWT) |
| Paginacao | `?page=1&per_page=20` — resposta inclui `meta: { page, per_page, total, total_pages }` |
| Ordenacao | `?sort=field&order=asc\|desc` |
| Filtro de busca | `?search=texto` |
| Datas | ISO 8601 (`2026-03-31T14:30:00Z`) |
| IDs | UUID v4 |
| Soft delete | Registros desativados recebem `status: "inactive"` e `deactivated_at`, nunca sao removidos fisicamente |

### Estrutura padrao de resposta de sucesso

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Estrutura padrao de erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descricao legivel",
    "details": [ ... ]
  }
}
```

### Codigos de erro reutilizaveis

| Codigo | HTTP | Descricao |
|---|---|---|
| `UNAUTHORIZED` | 401 | Token ausente ou invalido |
| `FORBIDDEN` | 403 | Sem permissao para o recurso |
| `NOT_FOUND` | 404 | Recurso nao encontrado no tenant |
| `VALIDATION_ERROR` | 422 | Dados de entrada invalidos |
| `CONFLICT` | 409 | Conflito (ex.: horario ja ocupado) |
| `RATE_LIMITED` | 429 | Limite de requisicoes excedido |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

---

## 1. Auth

### POST /api/auth/register

**Descricao:** Cria uma nova conta de usuario e o tenant (barbearia) associado.

**Autenticacao:** Public

**Request Body:**
```json
{
  "name": "Joao Silva",
  "email": "joao@email.com",
  "password": "MinhaSenh@123",
  "password_confirmation": "MinhaSenh@123",
  "phone": "+5511999990000",
  "barbershop_name": "Barbearia do Joao",
  "slug": "barbearia-do-joao"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Joao Silva",
      "email": "joao@email.com",
      "phone": "+5511999990000",
      "role": "owner"
    },
    "tenant": {
      "id": "uuid",
      "name": "Barbearia do Joao",
      "slug": "barbearia-do-joao"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Conta e tenant criados com sucesso |
| 409 | Email ja cadastrado ou slug ja em uso |
| 422 | Dados invalidos (senha fraca, email mal formatado, etc.) |

**Regras de negocio:**
- Senha minima de 8 caracteres com pelo menos 1 maiuscula, 1 numero e 1 caractere especial
- Email deve ser unico em toda a plataforma
- Slug deve ser unico, apenas letras minusculas, numeros e hifens, entre 3 e 60 caracteres
- O usuario criador recebe automaticamente o role `owner`
- O tenant e criado com configuracoes padrao (horario 09:00-19:00, lembrete 2h, threshold inatividade 45 dias)
- Um professional e criado automaticamente vinculado ao owner

---

### POST /api/auth/login

**Descricao:** Autentica o usuario e retorna token JWT.

**Autenticacao:** Public

**Request Body:**
```json
{
  "email": "joao@email.com",
  "password": "MinhaSenh@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Joao Silva",
      "email": "joao@email.com",
      "role": "owner",
      "tenant_id": "uuid"
    },
    "tenant": {
      "id": "uuid",
      "name": "Barbearia do Joao",
      "slug": "barbearia-do-joao",
      "plan": "professional"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2026-04-07T14:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Login bem-sucedido |
| 401 | Email ou senha incorretos |
| 422 | Campos obrigatorios ausentes |
| 429 | Excedeu 5 tentativas em 15 minutos |

**Regras de negocio:**
- Apos 5 tentativas falhas no mesmo email em 15 minutos, bloquear temporariamente (rate limit)
- Token JWT expira em 7 dias
- O JWT contem: `user_id`, `tenant_id`, `role`
- Registrar `last_login_at` no usuario

---

### POST /api/auth/logout

**Descricao:** Invalida o token do usuario.

**Autenticacao:** Auth (qualquer usuario logado)

**Request Body:** Nenhum

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logout realizado com sucesso"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Logout realizado |
| 401 | Token ja invalido ou ausente |

**Regras de negocio:**
- Adicionar o token a uma blacklist (cache Redis ou tabela) ate sua expiracao natural
- Retornar 200 mesmo que o token ja esteja invalido (idempotente)

---

### POST /api/auth/forgot-password

**Descricao:** Envia email de recuperacao de senha.

**Autenticacao:** Public

**Request Body:**
```json
{
  "email": "joao@email.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Se o email existir, um link de recuperacao sera enviado"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Sempre retorna 200 (seguranca: nao revelar se email existe) |
| 422 | Email mal formatado |
| 429 | Excedeu 3 solicitacoes em 1 hora |

**Regras de negocio:**
- Sempre retornar a mesma mensagem independentemente de o email existir (prevenir enumeracao)
- Gerar token de reset com validade de 1 hora
- Invalidar tokens anteriores de reset do mesmo email
- Limite de 3 solicitacoes por hora por email

---

### GET /api/auth/me

**Descricao:** Retorna os dados do usuario logado e seu tenant.

**Autenticacao:** Auth (qualquer usuario logado)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Joao Silva",
      "email": "joao@email.com",
      "phone": "+5511999990000",
      "role": "owner",
      "avatar_url": "https://...",
      "created_at": "2026-01-15T10:00:00Z",
      "last_login_at": "2026-03-31T08:00:00Z"
    },
    "tenant": {
      "id": "uuid",
      "name": "Barbearia do Joao",
      "slug": "barbearia-do-joao",
      "plan": "professional",
      "logo_url": "https://...",
      "settings": {
        "opening_time": "09:00",
        "closing_time": "19:00",
        "slot_duration_minutes": 30,
        "reminder_hours_before": 2,
        "inactive_threshold_days": 45
      }
    }
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Dados retornados |
| 401 | Token invalido |

**Regras de negocio:**
- Dados retornados refletem o tenant do usuario autenticado
- Inclui configuracoes do tenant para uso pelo frontend

---

## 2. Tenants

### GET /api/tenant

**Descricao:** Retorna os dados completos do tenant atual.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Barbearia do Joao",
    "slug": "barbearia-do-joao",
    "plan": "professional",
    "logo_url": "https://...",
    "phone": "+5511999990000",
    "address": "Rua das Flores, 123 - Sao Paulo/SP",
    "description": "A melhor barbearia da regiao",
    "settings": {
      "opening_time": "09:00",
      "closing_time": "19:00",
      "working_days": [1, 2, 3, 4, 5, 6],
      "slot_duration_minutes": 30,
      "reminder_hours_before": 2,
      "inactive_threshold_days": 45,
      "allow_online_booking": true,
      "cancellation_policy_hours": 2,
      "no_show_limit": 3
    },
    "stats": {
      "total_professionals": 4,
      "total_clients": 230,
      "total_services": 12
    },
    "created_at": "2026-01-15T10:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Dados retornados |
| 401 | Nao autenticado |
| 403 | Role sem permissao |

**Regras de negocio:**
- O tenant e identificado pelo JWT, nao pela URL
- Staff e receptionist nao acessam dados completos do tenant

---

### PUT /api/tenant

**Descricao:** Atualiza dados basicos do tenant (nome, logo, contato, endereco).

**Autenticacao:** Auth — role: `owner`

**Request Body:**
```json
{
  "name": "Barbearia Premium do Joao",
  "phone": "+5511999990000",
  "address": "Av. Paulista, 1000 - Sao Paulo/SP",
  "description": "Barbearia premium",
  "logo_url": "https://..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Barbearia Premium do Joao",
    "slug": "barbearia-do-joao",
    "phone": "+5511999990000",
    "address": "Av. Paulista, 1000 - Sao Paulo/SP",
    "description": "Barbearia premium",
    "logo_url": "https://...",
    "updated_at": "2026-03-31T14:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Atualizado |
| 401 | Nao autenticado |
| 403 | Apenas owner pode alterar |
| 422 | Dados invalidos |

**Regras de negocio:**
- Slug nao pode ser alterado apos criacao
- Apenas owner pode alterar dados do tenant
- Nome entre 2 e 100 caracteres

---

### PUT /api/tenant/settings

**Descricao:** Atualiza configuracoes operacionais do tenant.

**Autenticacao:** Auth — role: `owner`

**Request Body:**
```json
{
  "opening_time": "08:00",
  "closing_time": "20:00",
  "working_days": [1, 2, 3, 4, 5, 6],
  "slot_duration_minutes": 30,
  "reminder_hours_before": 3,
  "inactive_threshold_days": 60,
  "allow_online_booking": true,
  "cancellation_policy_hours": 4,
  "no_show_limit": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "opening_time": "08:00",
      "closing_time": "20:00",
      "working_days": [1, 2, 3, 4, 5, 6],
      "slot_duration_minutes": 30,
      "reminder_hours_before": 3,
      "inactive_threshold_days": 60,
      "allow_online_booking": true,
      "cancellation_policy_hours": 4,
      "no_show_limit": 3
    },
    "updated_at": "2026-03-31T14:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Configuracoes atualizadas |
| 401 | Nao autenticado |
| 403 | Apenas owner pode alterar |
| 422 | Valores fora dos limites aceitos |

**Regras de negocio:**
- `opening_time` deve ser anterior a `closing_time`
- `slot_duration_minutes` aceita: 15, 30, 45, 60
- `working_days` array de 0-6 (0=domingo, 6=sabado)
- `inactive_threshold_days` minimo 7, maximo 365
- `reminder_hours_before` minimo 1, maximo 48
- `cancellation_policy_hours` minimo 0 (sem politica), maximo 72
- `no_show_limit` minimo 1, maximo 10
- Alteracoes nas configuracoes nao afetam agendamentos ja criados

---

## 3. Professionals

### GET /api/professionals

**Descricao:** Lista todos os profissionais do tenant.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `status` | string | nao | `active` (padrao), `inactive`, `all` |
| `search` | string | nao | Busca por nome |
| `page` | number | nao | Pagina (padrao: 1) |
| `per_page` | number | nao | Itens por pagina (padrao: 20, max: 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Carlos Barber",
      "email": "carlos@email.com",
      "phone": "+5511999991111",
      "avatar_url": "https://...",
      "role": "staff",
      "status": "active",
      "services": [
        { "id": "uuid", "name": "Corte Masculino" }
      ],
      "commission_percentage": 50,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 4,
    "total_pages": 1
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |
| 403 | Staff nao pode listar todos os profissionais |

**Regras de negocio:**
- Staff so ve a si mesmo (redirecionar para seu proprio perfil)
- Profissionais inativos nao aparecem por padrao
- Inclui lista resumida de servicos que o profissional atende

---

### POST /api/professionals

**Descricao:** Cria um novo profissional e seu usuario de acesso.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Request Body:**
```json
{
  "name": "Carlos Barber",
  "email": "carlos@email.com",
  "phone": "+5511999991111",
  "role": "staff",
  "commission_percentage": 50,
  "service_ids": ["uuid-1", "uuid-2"],
  "working_hours": {
    "1": { "start": "09:00", "end": "18:00" },
    "2": { "start": "09:00", "end": "18:00" },
    "3": { "start": "09:00", "end": "18:00" },
    "4": { "start": "09:00", "end": "18:00" },
    "5": { "start": "09:00", "end": "18:00" },
    "6": { "start": "09:00", "end": "14:00" }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Barber",
    "email": "carlos@email.com",
    "phone": "+5511999991111",
    "role": "staff",
    "status": "active",
    "commission_percentage": 50,
    "services": [
      { "id": "uuid-1", "name": "Corte Masculino" },
      { "id": "uuid-2", "name": "Barba" }
    ],
    "working_hours": { ... },
    "temp_password": "aB3$xYz9",
    "created_at": "2026-03-31T14:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Profissional criado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 409 | Email ja cadastrado |
| 422 | Dados invalidos |

**Regras de negocio:**
- Email deve ser unico em toda a plataforma
- Uma senha temporaria e gerada e retornada apenas nesta resposta
- O profissional deve trocar a senha no primeiro login
- `commission_percentage` entre 0 e 100
- `working_hours` chaves de 0-6 (dias da semana); dias ausentes = folga
- Horarios do profissional devem estar dentro do horario de funcionamento do tenant
- Manager nao pode criar outro manager ou owner
- `service_ids` devem pertencer ao tenant

---

### PUT /api/professionals/:id

**Descricao:** Atualiza dados de um profissional.

**Autenticacao:** Auth — roles: `owner`, `manager`, `staff` (proprio)

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do profissional |

**Request Body:**
```json
{
  "name": "Carlos Barber Atualizado",
  "phone": "+5511999992222",
  "commission_percentage": 55,
  "service_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Barber Atualizado",
    "phone": "+5511999992222",
    "commission_percentage": 55,
    "services": [ ... ],
    "updated_at": "2026-03-31T15:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Atualizado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Profissional nao encontrado no tenant |
| 422 | Dados invalidos |

**Regras de negocio:**
- Staff so pode editar seu proprio nome, phone e avatar (nao commission nem services)
- Manager nao pode alterar role de outro usuario para owner
- Alteracao de `service_ids` nao afeta agendamentos futuros ja confirmados
- `commission_percentage` so pode ser alterado por owner ou manager

---

### DELETE /api/professionals/:id

**Descricao:** Desativa um profissional (soft delete).

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do profissional |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "inactive",
    "deactivated_at": "2026-03-31T15:00:00Z",
    "reassigned_appointments": 3
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Profissional desativado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Nao encontrado no tenant |
| 409 | Nao pode desativar: e o unico profissional ativo |

**Regras de negocio:**
- Nao e permitido excluir o ultimo profissional ativo do tenant
- Owner nao pode desativar a si mesmo
- Agendamentos futuros do profissional desativado mudam para status `pending_reassignment`
- A resposta indica quantos agendamentos precisam ser reatribuidos
- Profissional desativado nao aparece na pagina publica de agendamento

---

### GET /api/professionals/:id/schedule

**Descricao:** Retorna os horarios de trabalho configurados do profissional.

**Autenticacao:** Auth — roles: `owner`, `manager`, `staff` (proprio), `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do profissional |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "professional_id": "uuid",
    "professional_name": "Carlos Barber",
    "working_hours": {
      "1": { "start": "09:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00" },
      "2": { "start": "09:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00" },
      "3": { "start": "09:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00" },
      "4": { "start": "09:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00" },
      "5": { "start": "09:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00" },
      "6": { "start": "09:00", "end": "14:00", "break_start": null, "break_end": null }
    },
    "blocks": [
      {
        "id": "uuid",
        "date": "2026-04-05",
        "start_time": "09:00",
        "end_time": "12:00",
        "reason": "Consulta medica"
      }
    ]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Horarios retornados |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Profissional nao encontrado |

**Regras de negocio:**
- Staff so pode ver seu proprio schedule
- Inclui bloqueios de horario (schedule blocks) futuros
- Dias ausentes no objeto `working_hours` significam folga

---

### PUT /api/professionals/:id/schedule

**Descricao:** Atualiza os horarios de trabalho do profissional.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do profissional |

**Request Body:**
```json
{
  "working_hours": {
    "1": { "start": "08:00", "end": "17:00", "break_start": "12:00", "break_end": "13:00" },
    "2": { "start": "08:00", "end": "17:00", "break_start": "12:00", "break_end": "13:00" },
    "3": { "start": "08:00", "end": "17:00", "break_start": "12:00", "break_end": "13:00" },
    "4": { "start": "08:00", "end": "17:00", "break_start": "12:00", "break_end": "13:00" },
    "5": { "start": "08:00", "end": "17:00", "break_start": "12:00", "break_end": "13:00" }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "professional_id": "uuid",
    "working_hours": { ... },
    "updated_at": "2026-03-31T15:00:00Z",
    "affected_appointments": 0
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Horarios atualizados |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Profissional nao encontrado |
| 422 | Horarios invalidos |

**Regras de negocio:**
- Horarios devem estar dentro do funcionamento do tenant
- `break_start` / `break_end` devem estar dentro do periodo de trabalho do dia
- A resposta informa quantos agendamentos futuros ficam fora do novo horario (nao cancela automaticamente)
- Alteracao nao afeta agendamentos existentes — cabe ao usuario resolver conflitos manualmente

---

### GET /api/professionals/:id/availability

**Descricao:** Retorna os horarios disponiveis de um profissional em uma data especifica.

**Autenticacao:** Auth — roles: `owner`, `manager`, `staff` (proprio), `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do profissional |

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | sim | Data para consulta |
| `service_id` | UUID | nao | Se fornecido, filtra slots com duracao suficiente para o servico |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "professional_id": "uuid",
    "date": "2026-04-01",
    "slots": [
      { "start": "09:00", "end": "09:30", "available": true },
      { "start": "09:30", "end": "10:00", "available": true },
      { "start": "10:00", "end": "10:30", "available": false },
      { "start": "10:30", "end": "11:00", "available": true }
    ]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Slots retornados |
| 401 | Nao autenticado |
| 404 | Profissional nao encontrado |
| 422 | Data invalida ou no passado |

**Regras de negocio:**
- Slots sao gerados com base no `slot_duration_minutes` do tenant
- Descontar: agendamentos existentes, bloqueios, intervalo de almoco
- Se `service_id` fornecido, so retornar slots onde o tempo consecutivo disponivel e >= duracao do servico
- Nao retornar slots para datas passadas
- Nao retornar slots para dias de folga do profissional

---

## 4. Services

### GET /api/services

**Descricao:** Lista todos os servicos do tenant.

**Autenticacao:** Auth — roles: todos

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `status` | string | nao | `active` (padrao), `inactive`, `all` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Corte Masculino",
      "description": "Corte classico ou moderno",
      "duration_minutes": 30,
      "price": 45.00,
      "category": "corte",
      "status": "active",
      "display_order": 1,
      "professionals_count": 3
    }
  ]
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |

**Regras de negocio:**
- Retorna ordenado por `display_order` ascendente
- Staff ve todos os servicos, pois pode precisar consultar precos

---

### POST /api/services

**Descricao:** Cria um novo servico.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Request Body:**
```json
{
  "name": "Corte + Barba",
  "description": "Combo corte e barba completa",
  "duration_minutes": 60,
  "price": 70.00,
  "category": "combo",
  "professional_ids": ["uuid-1", "uuid-2"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Corte + Barba",
    "description": "Combo corte e barba completa",
    "duration_minutes": 60,
    "price": 70.00,
    "category": "combo",
    "status": "active",
    "display_order": 5,
    "professionals": [
      { "id": "uuid-1", "name": "Carlos" },
      { "id": "uuid-2", "name": "Pedro" }
    ],
    "created_at": "2026-03-31T15:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Servico criado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 409 | Nome duplicado no tenant |
| 422 | Dados invalidos |

**Regras de negocio:**
- Nome deve ser unico dentro do tenant
- `duration_minutes` multiplo de 15, entre 15 e 240
- `price` maior ou igual a 0 (0 = cortesia)
- `display_order` atribuido automaticamente como ultimo
- `professional_ids` devem pertencer ao tenant e estar ativos

---

### PUT /api/services/:id

**Descricao:** Atualiza um servico existente.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do servico |

**Request Body:**
```json
{
  "name": "Corte + Barba Premium",
  "price": 80.00,
  "duration_minutes": 75,
  "professional_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Corte + Barba Premium",
    "price": 80.00,
    "duration_minutes": 75,
    "professionals": [ ... ],
    "updated_at": "2026-03-31T15:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Atualizado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Servico nao encontrado no tenant |
| 409 | Nome duplicado |
| 422 | Dados invalidos |

**Regras de negocio:**
- Alteracao de preco nao afeta agendamentos ja criados (mantem preco original)
- Alteracao de duracao nao afeta agendamentos ja criados
- Se a duracao mudar, alertar sobre possiveis conflitos em agendamentos futuros

---

### DELETE /api/services/:id

**Descricao:** Desativa um servico (soft delete).

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do servico |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "inactive",
    "deactivated_at": "2026-03-31T15:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Desativado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Nao encontrado |

**Regras de negocio:**
- Servico desativado nao aparece na pagina publica
- Agendamentos futuros com esse servico sao mantidos, mas nao e possivel criar novos
- Se o servico faz parte de um plano ativo, alertar mas permitir desativacao

---

### PUT /api/services/reorder

**Descricao:** Reordena a exibicao dos servicos.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Request Body:**
```json
{
  "order": [
    { "id": "uuid-3", "display_order": 1 },
    { "id": "uuid-1", "display_order": 2 },
    { "id": "uuid-2", "display_order": 3 }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Ordem atualizada com sucesso",
    "updated_count": 3
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Reordenado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 422 | IDs invalidos ou incompletos |

**Regras de negocio:**
- Todos os servicos ativos do tenant devem estar presentes no array
- IDs devem pertencer ao tenant

---

## 5. Clients

### GET /api/clients

**Descricao:** Lista clientes do tenant com filtros.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff` (apenas seus)

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `status` | string | nao | `active` (padrao), `inactive`, `all` |
| `search` | string | nao | Busca por nome, email ou telefone |
| `sort` | string | nao | `name`, `last_visit`, `total_visits`, `created_at` |
| `order` | string | nao | `asc`, `desc` (padrao: `asc`) |
| `page` | number | nao | Pagina (padrao: 1) |
| `per_page` | number | nao | Itens por pagina (padrao: 20, max: 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Roberto Souza",
      "email": "roberto@email.com",
      "phone": "+5511988880000",
      "status": "active",
      "total_visits": 12,
      "last_visit_at": "2026-03-15T10:00:00Z",
      "next_appointment_at": "2026-04-02T14:00:00Z",
      "avg_frequency_days": 21,
      "no_show_count": 1,
      "created_at": "2025-06-10T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 230,
    "total_pages": 12
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |

**Regras de negocio:**
- Staff so ve clientes que ele ja atendeu pelo menos uma vez
- Busca `search` e case-insensitive e busca parcial (ILIKE)
- `avg_frequency_days` e calculado com base nas ultimas 5 visitas

---

### GET /api/clients/:id

**Descricao:** Retorna a ficha completa do cliente.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff` (apenas se ja atendeu)

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do cliente |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Roberto Souza",
    "email": "roberto@email.com",
    "phone": "+5511988880000",
    "birthday": "1990-05-15",
    "notes": "Prefere corte com maquina 3",
    "status": "active",
    "total_visits": 12,
    "total_spent": 540.00,
    "avg_ticket": 45.00,
    "avg_frequency_days": 21,
    "last_visit_at": "2026-03-15T10:00:00Z",
    "suggested_return_date": "2026-04-05",
    "no_show_count": 1,
    "preferred_professional": {
      "id": "uuid",
      "name": "Carlos Barber"
    },
    "preferred_services": [
      { "id": "uuid", "name": "Corte Masculino", "count": 10 }
    ],
    "active_plans": [
      {
        "id": "uuid",
        "plan_name": "Plano Mensal Corte",
        "uses_remaining": 2,
        "expires_at": "2026-04-30"
      }
    ],
    "next_appointment": {
      "id": "uuid",
      "date": "2026-04-02",
      "time": "14:00",
      "service": "Corte Masculino",
      "professional": "Carlos Barber"
    },
    "created_at": "2025-06-10T10:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Ficha retornada |
| 401 | Nao autenticado |
| 403 | Staff nao atendeu este cliente |
| 404 | Cliente nao encontrado no tenant |

**Regras de negocio:**
- `suggested_return_date` = `last_visit_at` + `avg_frequency_days`
- `preferred_professional` = profissional com mais atendimentos para este cliente
- `preferred_services` ordenados por frequencia de uso decrescente
- Staff so pode ver ficha de clientes que ja atendeu

---

### POST /api/clients

**Descricao:** Cadastra um novo cliente.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff`

**Request Body:**
```json
{
  "name": "Roberto Souza",
  "email": "roberto@email.com",
  "phone": "+5511988880000",
  "birthday": "1990-05-15",
  "notes": "Prefere corte com maquina 3"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Roberto Souza",
    "email": "roberto@email.com",
    "phone": "+5511988880000",
    "birthday": "1990-05-15",
    "notes": "Prefere corte com maquina 3",
    "status": "active",
    "created_at": "2026-03-31T15:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Cliente criado |
| 401 | Nao autenticado |
| 409 | Telefone ja cadastrado no tenant |
| 422 | Dados invalidos |

**Regras de negocio:**
- Telefone deve ser unico dentro do tenant (identificador principal do cliente)
- Email e opcional mas deve ser unico dentro do tenant se fornecido
- Nome obrigatorio, minimo 2 caracteres
- Se um cliente inativo com mesmo telefone existir, reativar em vez de criar duplicado
- `birthday` formato YYYY-MM-DD, opcional

---

### PUT /api/clients/:id

**Descricao:** Atualiza dados de um cliente.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do cliente |

**Request Body:**
```json
{
  "name": "Roberto S. Souza",
  "phone": "+5511988880001",
  "notes": "Prefere corte com maquina 2 agora"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Roberto S. Souza",
    "phone": "+5511988880001",
    "notes": "Prefere corte com maquina 2 agora",
    "updated_at": "2026-03-31T16:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Atualizado |
| 401 | Nao autenticado |
| 403 | Staff nao pode editar clientes |
| 404 | Cliente nao encontrado |
| 409 | Telefone duplicado |
| 422 | Dados invalidos |

**Regras de negocio:**
- Staff nao pode editar clientes diretamente
- Telefone deve permanecer unico dentro do tenant

---

### GET /api/clients/inactive

**Descricao:** Lista clientes marcados como inativos (passaram do threshold sem visitar).

**Autenticacao:** Auth — roles: `owner`, `manager`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `days_inactive` | number | nao | Filtrar por dias sem visita (padrao: usa threshold do tenant) |
| `page` | number | nao | Pagina |
| `per_page` | number | nao | Itens por pagina |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Mario Oliveira",
      "phone": "+5511977770000",
      "last_visit_at": "2026-01-10T10:00:00Z",
      "days_since_last_visit": 80,
      "total_visits": 5,
      "total_spent": 225.00,
      "preferred_service": "Corte Masculino",
      "reactivation_sent": false
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |
| 403 | Sem permissao |

**Regras de negocio:**
- Inatividade = dias desde `last_visit_at` > `inactive_threshold_days` do tenant
- Clientes que nunca visitaram nao sao considerados inativos
- Ordenado por `days_since_last_visit` decrescente (mais inativos primeiro)
- `reactivation_sent` indica se ja foi enviada mensagem de reativacao

---

### GET /api/clients/:id/history

**Descricao:** Retorna o historico de atendimentos do cliente.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff` (apenas se ja atendeu)

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do cliente |

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `page` | number | nao | Pagina |
| `per_page` | number | nao | Itens por pagina (padrao: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2026-03-15",
      "time": "10:00",
      "service": {
        "id": "uuid",
        "name": "Corte Masculino"
      },
      "professional": {
        "id": "uuid",
        "name": "Carlos Barber"
      },
      "status": "completed",
      "price_charged": 45.00,
      "used_plan": false,
      "notes": null
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 12,
    "total_pages": 1
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Historico retornado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Cliente nao encontrado |

**Regras de negocio:**
- Ordenado por data decrescente (mais recente primeiro)
- Inclui apenas atendimentos com status `completed`, `cancelled`, `no_show`
- Staff so acessa historico de clientes que ele atendeu

---

### POST /api/clients/:id/reactivate

**Descricao:** Dispara mensagem de reativacao para um cliente inativo.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do cliente |

**Request Body:**
```json
{
  "channel": "whatsapp",
  "message_template": "reactivation_default"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "client_id": "uuid",
    "channel": "whatsapp",
    "status": "queued",
    "sent_at": null,
    "queued_at": "2026-03-31T16:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Mensagem agendada |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Cliente nao encontrado |
| 409 | Reativacao ja enviada nos ultimos 7 dias |
| 422 | Canal invalido |

**Regras de negocio:**
- Nao pode enviar reativacao para o mesmo cliente mais de 1 vez a cada 7 dias
- Cliente deve estar com status `inactive`
- Templates disponiveis: `reactivation_default`, `reactivation_discount`, `reactivation_personal`
- Canais aceitos: `whatsapp`, `sms`

---

## 6. Appointments

### GET /api/appointments

**Descricao:** Lista agendamentos com filtros.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff` (apenas proprios)

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | nao | Filtrar por data |
| `start_date` | string (YYYY-MM-DD) | nao | Inicio do periodo |
| `end_date` | string (YYYY-MM-DD) | nao | Fim do periodo |
| `professional_id` | UUID | nao | Filtrar por profissional |
| `status` | string | nao | `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show` |
| `page` | number | nao | Pagina |
| `per_page` | number | nao | Itens por pagina |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2026-04-01",
      "start_time": "14:00",
      "end_time": "14:30",
      "status": "confirmed",
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
      "source": "dashboard",
      "notes": null,
      "created_at": "2026-03-30T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |
| 422 | Parametros de data invalidos |

**Regras de negocio:**
- Staff so ve seus proprios agendamentos
- Se nenhum filtro de data, retorna agendamentos de hoje
- Ordenado por `date` + `start_time` ascendente
- `source` pode ser: `dashboard`, `public_booking`, `manual`

---

### POST /api/appointments

**Descricao:** Cria um novo agendamento.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff`

**Request Body:**
```json
{
  "client_id": "uuid",
  "professional_id": "uuid",
  "service_id": "uuid",
  "date": "2026-04-01",
  "start_time": "14:00",
  "notes": "Cliente pediu para confirmar na vespera",
  "use_plan_id": "uuid-or-null"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "end_time": "14:30",
    "status": "scheduled",
    "client": { "id": "uuid", "name": "Roberto Souza" },
    "professional": { "id": "uuid", "name": "Carlos Barber" },
    "service": { "id": "uuid", "name": "Corte Masculino" },
    "price": 45.00,
    "used_plan": false,
    "source": "dashboard",
    "notes": "Cliente pediu para confirmar na vespera",
    "created_at": "2026-03-31T16:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Agendamento criado |
| 401 | Nao autenticado |
| 403 | Staff so pode criar na propria agenda |
| 404 | Cliente, profissional ou servico nao encontrado |
| 409 | Horario ja ocupado ou conflito de agenda |
| 422 | Dados invalidos (data passada, horario fora do expediente, etc.) |

**Regras de negocio:**
- Verificar se o profissional esta ativo e atende o servico selecionado
- Verificar se o horario esta disponivel (sem conflito com outros agendamentos ou bloqueios)
- `end_time` calculado automaticamente: `start_time` + duracao do servico
- Nao permitir agendamento em data/hora passada
- Nao permitir agendamento fora do horario do profissional
- Nao permitir agendamento em dia de folga do profissional
- Se `use_plan_id` fornecido, verificar se o plano esta ativo, pertence ao cliente e tem usos restantes
- Se usar plano, `price` = 0 e `used_plan` = true
- Staff so pode criar agendamentos na propria agenda
- Dispara evento `appointment.created`
- Se o cliente tiver mais de `no_show_limit` faltas, alertar mas permitir agendamento

---

### PUT /api/appointments/:id

**Descricao:** Atualiza dados de um agendamento (exceto status).

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do agendamento |

**Request Body:**
```json
{
  "notes": "Observacao atualizada",
  "price": 50.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "notes": "Observacao atualizada",
    "price": 50.00,
    "updated_at": "2026-03-31T16:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Atualizado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Agendamento nao encontrado |
| 422 | Dados invalidos |

**Regras de negocio:**
- Nao permite alterar `professional_id`, `service_id`, `date`, `start_time` — usar endpoint de reschedule
- Nao permite alterar agendamentos com status `completed` ou `cancelled`
- Alteracao de `price` registrada em log de auditoria

---

### PUT /api/appointments/:id/status

**Descricao:** Altera o status de um agendamento (confirmar, concluir, cancelar, marcar falta).

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff` (proprio)

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do agendamento |

**Request Body:**
```json
{
  "status": "confirmed",
  "reason": null
}
```

**Valores aceitos para `status`:**
| Status | Descricao | Origem permitida |
|---|---|---|
| `confirmed` | Cliente confirmou presenca | `scheduled` |
| `completed` | Atendimento concluido | `scheduled`, `confirmed` |
| `cancelled` | Cancelado | `scheduled`, `confirmed` |
| `no_show` | Cliente nao compareceu | `scheduled`, `confirmed` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "status_changed_at": "2026-03-31T16:30:00Z",
    "changed_by": {
      "id": "uuid",
      "name": "Joao Silva"
    }
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Status alterado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Agendamento nao encontrado |
| 409 | Transicao de status invalida |
| 422 | Status invalido |

**Regras de negocio:**
- Transicoes validas: `scheduled` -> `confirmed`/`completed`/`cancelled`/`no_show`; `confirmed` -> `completed`/`cancelled`/`no_show`
- Nao e possivel reverter `completed`, `cancelled` ou `no_show`
- `cancelled` exige `reason` (obrigatorio)
- `completed` dispara evento `appointment.completed` (atualiza `last_visit`, cria transacao financeira)
- `no_show` dispara evento `appointment.no_show` (incrementa `no_show_count` do cliente)
- `cancelled` dispara evento `appointment.cancelled` (libera horario, notifica lista de espera)
- Staff so pode alterar status de seus proprios agendamentos
- Registrar quem alterou o status (`changed_by`)

---

### POST /api/appointments/:id/reschedule

**Descricao:** Reagenda um agendamento para nova data/hora/profissional.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do agendamento |

**Request Body:**
```json
{
  "date": "2026-04-03",
  "start_time": "15:00",
  "professional_id": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2026-04-03",
    "start_time": "15:00",
    "end_time": "15:30",
    "professional": { "id": "uuid", "name": "Carlos Barber" },
    "status": "scheduled",
    "rescheduled_from": {
      "date": "2026-04-01",
      "start_time": "14:00"
    },
    "reschedule_count": 1,
    "updated_at": "2026-03-31T17:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Reagendado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Agendamento nao encontrado |
| 409 | Novo horario conflita com outro agendamento |
| 422 | Dados invalidos |

**Regras de negocio:**
- So e possivel reagendar agendamentos com status `scheduled` ou `confirmed`
- O novo horario deve estar disponivel
- O profissional (se alterado) deve atender o servico do agendamento
- Status volta para `scheduled` apos reagendamento
- Incrementa `reschedule_count` do agendamento
- Maximo de 3 reagendamentos por agendamento
- O horario antigo e liberado (dispara verificacao da lista de espera)
- Enviar notificacao ao cliente sobre novo horario

---

### GET /api/appointments/available-slots

**Descricao:** Retorna horarios disponiveis para agendamento.

**Autenticacao:** Auth — roles: todos

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | sim | Data desejada |
| `professional_id` | UUID | sim | Profissional |
| `service_id` | UUID | sim | Servico (para calcular duracao) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-04-01",
    "professional": { "id": "uuid", "name": "Carlos Barber" },
    "service": { "id": "uuid", "name": "Corte Masculino", "duration_minutes": 30 },
    "available_slots": [
      { "start": "09:00", "end": "09:30" },
      { "start": "09:30", "end": "10:00" },
      { "start": "11:00", "end": "11:30" },
      { "start": "14:00", "end": "14:30" },
      { "start": "16:30", "end": "17:00" }
    ]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Slots retornados |
| 401 | Nao autenticado |
| 404 | Profissional ou servico nao encontrado |
| 422 | Data invalida, no passado, ou profissional nao atende o servico |

**Regras de negocio:**
- Considerar: horario do profissional, agendamentos existentes, bloqueios, intervalo de almoco
- So retornar slots onde ha tempo consecutivo suficiente para a duracao do servico
- Para hoje, so retornar slots futuros (hora atual + 30min minimo)
- Nao retornar slots para datas passadas

---

### GET /api/appointments/today

**Descricao:** Retorna agendamentos do dia atual (atalho para agenda diaria).

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff` (apenas proprios)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-31",
    "summary": {
      "total": 12,
      "confirmed": 8,
      "scheduled": 3,
      "completed": 1,
      "cancelled": 0
    },
    "appointments": [
      {
        "id": "uuid",
        "start_time": "09:00",
        "end_time": "09:30",
        "status": "completed",
        "client": { "id": "uuid", "name": "Roberto Souza", "phone": "+5511988880000" },
        "professional": { "id": "uuid", "name": "Carlos Barber" },
        "service": { "id": "uuid", "name": "Corte Masculino" },
        "price": 45.00
      }
    ]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Agendamentos retornados |
| 401 | Nao autenticado |

**Regras de negocio:**
- Staff so ve seus proprios agendamentos do dia
- Ordenado por `start_time` ascendente
- Inclui resumo com contagem por status

---

### GET /api/appointments/gaps

**Descricao:** Retorna horarios vagos do dia para identificar oportunidades de encaixe.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | nao | Data (padrao: hoje) |
| `professional_id` | UUID | nao | Filtrar por profissional |
| `min_duration_minutes` | number | nao | Duracao minima do gap (padrao: 30) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-31",
    "gaps": [
      {
        "professional": { "id": "uuid", "name": "Carlos Barber" },
        "start": "10:30",
        "end": "11:30",
        "duration_minutes": 60,
        "suitable_services": [
          { "id": "uuid", "name": "Corte Masculino", "duration_minutes": 30 },
          { "id": "uuid", "name": "Corte + Barba", "duration_minutes": 60 }
        ]
      }
    ],
    "total_gap_minutes": 150
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Gaps retornados |
| 401 | Nao autenticado |
| 403 | Sem permissao |

**Regras de negocio:**
- Calcula intervalos vazios entre agendamentos de cada profissional
- Exclui intervalos de almoco e bloqueios
- `suitable_services` lista servicos que cabem no gap (duracao <= duracao do gap)
- `min_duration_minutes` filtra gaps muito pequenos
- `total_gap_minutes` soma todos os gaps do dia

---

## 7. Public Booking

> Todos os endpoints de booking publico usam o slug do tenant na URL.
> Nao exigem autenticacao. Rate limiting aplicado por IP.

### GET /api/book/:slug/info

**Descricao:** Retorna informacoes publicas da barbearia.

**Autenticacao:** Public

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `slug` | string | Slug unico da barbearia |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "Barbearia do Joao",
    "slug": "barbearia-do-joao",
    "logo_url": "https://...",
    "description": "A melhor barbearia da regiao",
    "address": "Rua das Flores, 123 - Sao Paulo/SP",
    "phone": "+5511999990000",
    "opening_time": "09:00",
    "closing_time": "19:00",
    "working_days": [1, 2, 3, 4, 5, 6]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Informacoes retornadas |
| 404 | Barbearia nao encontrada ou agendamento online desabilitado |

**Regras de negocio:**
- So retorna dados se `allow_online_booking` estiver ativo no tenant
- Nao expor dados sensiveis (plano, metricas, etc.)

---

### GET /api/book/:slug/services

**Descricao:** Lista servicos disponiveis para agendamento publico.

**Autenticacao:** Public

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Corte Masculino",
      "description": "Corte classico ou moderno",
      "duration_minutes": 30,
      "price": 45.00,
      "category": "corte"
    }
  ]
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Servicos retornados |
| 404 | Barbearia nao encontrada |

**Regras de negocio:**
- Apenas servicos ativos
- Ordenados por `display_order`
- Nao exibir servicos que nenhum profissional ativo atende

---

### GET /api/book/:slug/professionals

**Descricao:** Lista profissionais disponiveis, opcionalmente filtrados por servico.

**Autenticacao:** Public

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `service_id` | UUID | nao | Filtrar profissionais que atendem este servico |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Carlos Barber",
      "avatar_url": "https://..."
    }
  ]
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Profissionais retornados |
| 404 | Barbearia ou servico nao encontrado |

**Regras de negocio:**
- Apenas profissionais ativos
- Se `service_id` fornecido, retornar apenas profissionais que atendem o servico
- Nao expor informacoes internas (email, telefone, comissao)

---

### GET /api/book/:slug/slots

**Descricao:** Retorna horarios disponiveis para uma combinacao de data/profissional/servico.

**Autenticacao:** Public

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | sim | Data desejada |
| `professional_id` | UUID | sim | Profissional |
| `service_id` | UUID | sim | Servico |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-04-01",
    "available_slots": [
      { "start": "09:00", "end": "09:30" },
      { "start": "09:30", "end": "10:00" },
      { "start": "14:00", "end": "14:30" }
    ]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Slots retornados |
| 404 | Barbearia, profissional ou servico nao encontrado |
| 422 | Data no passado ou invalida |

**Regras de negocio:**
- Mesma logica do endpoint interno de availability
- So permite consultar ate 30 dias no futuro
- Para hoje, slots devem ser no minimo 1 hora a frente (tempo para chegar)
- Rate limit: 30 requisicoes por minuto por IP

---

### POST /api/book/:slug

**Descricao:** Cria um agendamento publico (cliente agenda sozinho).

**Autenticacao:** Public

**Request Body:**
```json
{
  "client_name": "Roberto Souza",
  "client_phone": "+5511988880000",
  "client_email": "roberto@email.com",
  "professional_id": "uuid",
  "service_id": "uuid",
  "date": "2026-04-01",
  "start_time": "14:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2026-04-01",
    "start_time": "14:00",
    "end_time": "14:30",
    "status": "scheduled",
    "service": "Corte Masculino",
    "professional": "Carlos Barber",
    "barbershop": "Barbearia do Joao",
    "confirmation_message": "Agendamento confirmado! Voce recebera um lembrete."
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Agendamento criado |
| 404 | Barbearia, profissional ou servico nao encontrado |
| 409 | Horario ja ocupado |
| 422 | Dados invalidos |
| 429 | Rate limit excedido |

**Regras de negocio:**
- `client_phone` obrigatorio (identificador principal)
- Se ja existe um cliente com o mesmo telefone no tenant, vincular ao cliente existente
- Se nao existe, criar novo cliente automaticamente
- Validar que o slot ainda esta disponivel (verificacao atomica para evitar race condition)
- `source` = `public_booking`
- Rate limit: 5 agendamentos por hora por telefone
- Dispara evento `appointment.created`
- Enviar confirmacao por WhatsApp/SMS
- Se o cliente tem `no_show_count` >= `no_show_limit`, rejeitar com mensagem amigavel

---

## 8. Campaigns

### GET /api/campaigns

**Descricao:** Lista campanhas de marketing do tenant.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `status` | string | nao | `draft`, `sent`, `scheduled`, `all` |
| `page` | number | nao | Pagina |
| `per_page` | number | nao | Itens por pagina |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Promocao de Verao",
      "type": "promotional",
      "channel": "whatsapp",
      "status": "sent",
      "target_audience": "all_active",
      "recipients_count": 150,
      "sent_at": "2026-03-20T10:00:00Z",
      "results": {
        "delivered": 145,
        "read": 98,
        "clicked": 23
      },
      "created_at": "2026-03-19T14:00:00Z"
    }
  ],
  "meta": { ... }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |
| 403 | Sem permissao |

**Regras de negocio:**
- Ordenado por `created_at` decrescente
- Resultados incluidos apenas para campanhas ja enviadas

---

### POST /api/campaigns

**Descricao:** Cria uma nova campanha.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Request Body:**
```json
{
  "name": "Promocao Semana do Cliente",
  "type": "promotional",
  "channel": "whatsapp",
  "message_template": "Ola {{client_name}}! Temos uma oferta especial para voce...",
  "target_audience": "inactive_clients",
  "target_filters": {
    "days_inactive_min": 30,
    "days_inactive_max": 90
  },
  "scheduled_at": "2026-04-05T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Promocao Semana do Cliente",
    "type": "promotional",
    "channel": "whatsapp",
    "message_template": "Ola {{client_name}}! Temos uma oferta especial para voce...",
    "target_audience": "inactive_clients",
    "target_filters": { ... },
    "status": "draft",
    "estimated_recipients": 42,
    "scheduled_at": "2026-04-05T10:00:00Z",
    "created_at": "2026-03-31T17:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Campanha criada |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 422 | Dados invalidos |

**Regras de negocio:**
- `type`: `promotional`, `reactivation`, `informational`
- `channel`: `whatsapp`, `sms`
- `target_audience`: `all_active`, `inactive_clients`, `high_frequency`, `low_frequency`, `custom`
- Variaveis aceitas no template: `{{client_name}}`, `{{barbershop_name}}`, `{{last_visit_days}}`
- `scheduled_at` deve ser no futuro (minimo 1 hora a frente)
- Se `scheduled_at` nao fornecido, campanha fica como `draft`
- `estimated_recipients` calculado com base nos filtros

---

### PUT /api/campaigns/:id

**Descricao:** Atualiza uma campanha em rascunho.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID da campanha |

**Request Body:**
```json
{
  "name": "Promocao Atualizada",
  "message_template": "Novo texto...",
  "scheduled_at": "2026-04-06T10:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Promocao Atualizada",
    "status": "draft",
    "updated_at": "2026-03-31T17:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Atualizada |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Campanha nao encontrada |
| 409 | Campanha ja foi enviada — nao pode editar |
| 422 | Dados invalidos |

**Regras de negocio:**
- So pode editar campanhas com status `draft` ou `scheduled`
- Campanhas `sent` sao imutaveis
- Alterar `scheduled_at` para null volta a campanha para `draft`

---

### POST /api/campaigns/:id/send

**Descricao:** Dispara o envio de uma campanha imediatamente.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID da campanha |

**Request Body:** Nenhum

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "sending",
    "recipients_count": 42,
    "estimated_completion": "2026-03-31T17:35:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Envio iniciado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Campanha nao encontrada |
| 409 | Campanha ja enviada ou em envio |
| 422 | Campanha sem destinatarios |

**Regras de negocio:**
- So pode enviar campanhas com status `draft` ou `scheduled`
- O envio e assincrono (enfileirado em background job)
- Status muda para `sending` e depois `sent` ao concluir
- Dispara evento `campaign.sent` ao finalizar
- Limite de 1 campanha por canal por dia (para evitar spam)

---

### GET /api/campaigns/:id/results

**Descricao:** Retorna metricas detalhadas de uma campanha enviada.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID da campanha |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "campaign_id": "uuid",
    "campaign_name": "Promocao de Verao",
    "sent_at": "2026-03-20T10:00:00Z",
    "metrics": {
      "total_sent": 150,
      "delivered": 145,
      "failed": 5,
      "read": 98,
      "clicked": 23,
      "delivery_rate": 96.7,
      "read_rate": 67.6,
      "click_rate": 15.9
    },
    "conversions": {
      "appointments_booked": 8,
      "revenue_generated": 360.00
    },
    "failures": [
      { "phone": "+5511900001111", "reason": "Numero invalido" }
    ]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Resultados retornados |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Campanha nao encontrada |
| 409 | Campanha ainda nao foi enviada |

**Regras de negocio:**
- Disponivel apenas para campanhas com status `sent`
- `conversions` rastreia agendamentos criados ate 7 dias apos a campanha por clientes que receberam a mensagem
- `revenue_generated` = soma dos precos dos agendamentos convertidos

---

## 9. Plans

### GET /api/plans

**Descricao:** Lista planos/pacotes disponiveis no tenant.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `status` | string | nao | `active` (padrao), `inactive`, `all` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Plano Mensal Corte",
      "description": "4 cortes por mes",
      "price": 150.00,
      "duration_days": 30,
      "total_uses": 4,
      "services": [
        { "id": "uuid", "name": "Corte Masculino" }
      ],
      "status": "active",
      "active_subscriptions": 12,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |

**Regras de negocio:**
- `active_subscriptions` = quantidade de clientes com esse plano ativo atualmente
- Planos inativos nao podem ser atribuidos a novos clientes

---

### POST /api/plans

**Descricao:** Cria um novo plano/pacote.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Request Body:**
```json
{
  "name": "Plano Mensal Corte + Barba",
  "description": "4 cortes e 4 barbas por mes",
  "price": 250.00,
  "duration_days": 30,
  "total_uses": 8,
  "service_ids": ["uuid-corte", "uuid-barba"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Plano Mensal Corte + Barba",
    "description": "4 cortes e 4 barbas por mes",
    "price": 250.00,
    "duration_days": 30,
    "total_uses": 8,
    "services": [
      { "id": "uuid-corte", "name": "Corte Masculino" },
      { "id": "uuid-barba", "name": "Barba" }
    ],
    "status": "active",
    "created_at": "2026-03-31T18:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Plano criado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 409 | Nome duplicado no tenant |
| 422 | Dados invalidos |

**Regras de negocio:**
- `duration_days` minimo 7, maximo 365
- `total_uses` minimo 1, maximo 100
- `price` maior que 0
- `service_ids` devem pertencer ao tenant e estar ativos
- Nome unico dentro do tenant

---

### PUT /api/plans/:id

**Descricao:** Atualiza um plano existente.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do plano |

**Request Body:**
```json
{
  "name": "Plano Premium",
  "price": 280.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Plano Premium",
    "price": 280.00,
    "updated_at": "2026-03-31T18:30:00Z",
    "note": "Alteracao nao afeta assinaturas existentes"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Atualizado |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Plano nao encontrado |
| 422 | Dados invalidos |

**Regras de negocio:**
- Alteracoes de preco, duracao ou usos nao afetam assinaturas ativas existentes
- So impacta novas atribuicoes

---

### POST /api/plans/:id/assign

**Descricao:** Vincula um plano a um cliente.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do plano |

**Request Body:**
```json
{
  "client_id": "uuid",
  "start_date": "2026-04-01",
  "payment_method": "cash",
  "notes": "Pagamento realizado em especie"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan": { "id": "uuid", "name": "Plano Mensal Corte" },
    "client": { "id": "uuid", "name": "Roberto Souza" },
    "start_date": "2026-04-01",
    "expires_at": "2026-05-01",
    "total_uses": 4,
    "uses_remaining": 4,
    "status": "active",
    "payment_method": "cash",
    "created_at": "2026-03-31T18:30:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Plano atribuido |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Plano ou cliente nao encontrado |
| 409 | Cliente ja tem este plano ativo |
| 422 | Dados invalidos |

**Regras de negocio:**
- `expires_at` = `start_date` + `duration_days` do plano
- Um cliente nao pode ter dois planos identicos ativos ao mesmo tempo
- Pode ter planos diferentes ativos simultaneamente
- `payment_method`: `cash`, `card`, `pix`, `transfer`
- Cria transacao financeira no valor do plano

---

### PUT /api/client-plans/:id/use

**Descricao:** Registra o uso de um credito do plano (ao concluir atendimento).

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`, `staff`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID da assinatura do plano (client_plan) |

**Request Body:**
```json
{
  "appointment_id": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "client_plan_id": "uuid",
    "uses_remaining": 3,
    "total_uses": 4,
    "appointment_id": "uuid",
    "used_at": "2026-03-31T19:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Uso registrado |
| 401 | Nao autenticado |
| 404 | Assinatura nao encontrada |
| 409 | Plano expirado ou sem creditos restantes |
| 422 | Servico do agendamento nao faz parte do plano |

**Regras de negocio:**
- Verificar se o plano esta ativo e nao expirado
- Verificar se ha usos restantes (`uses_remaining` > 0)
- Verificar se o servico do agendamento esta coberto pelo plano
- Decrementar `uses_remaining`
- Se `uses_remaining` chegar a 0, o status do plano nao muda (pode ter renovacao futura)
- O `appointment_id` deve pertencer ao mesmo cliente e ter status `completed`

---

## 10. Waitlist

### GET /api/waitlist

**Descricao:** Lista clientes na lista de espera.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | nao | Filtrar por data desejada |
| `professional_id` | UUID | nao | Filtrar por profissional |
| `status` | string | nao | `waiting` (padrao), `notified`, `booked`, `expired` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "client": { "id": "uuid", "name": "Ana Costa", "phone": "+5511977770000" },
      "preferred_date": "2026-04-01",
      "preferred_time_range": { "start": "09:00", "end": "12:00" },
      "professional": { "id": "uuid", "name": "Carlos Barber" },
      "service": { "id": "uuid", "name": "Corte Masculino" },
      "status": "waiting",
      "created_at": "2026-03-31T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |
| 403 | Sem permissao |

**Regras de negocio:**
- Ordenado por `created_at` ascendente (primeiro a entrar, primeiro a ser notificado)
- Entradas com `preferred_date` no passado automaticamente expiram

---

### POST /api/waitlist

**Descricao:** Adiciona cliente a lista de espera.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Request Body:**
```json
{
  "client_id": "uuid",
  "service_id": "uuid",
  "professional_id": "uuid",
  "preferred_date": "2026-04-01",
  "preferred_time_range": { "start": "09:00", "end": "12:00" }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "client": { "id": "uuid", "name": "Ana Costa" },
    "service": { "id": "uuid", "name": "Corte Masculino" },
    "professional": { "id": "uuid", "name": "Carlos Barber" },
    "preferred_date": "2026-04-01",
    "preferred_time_range": { "start": "09:00", "end": "12:00" },
    "status": "waiting",
    "position": 3,
    "created_at": "2026-03-31T19:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Adicionado a lista |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 409 | Cliente ja esta na lista para a mesma data/profissional |
| 422 | Dados invalidos |

**Regras de negocio:**
- `preferred_date` deve ser no futuro
- `professional_id` opcional (null = qualquer profissional)
- Um cliente nao pode estar na lista duas vezes para a mesma data e profissional
- `position` indica a posicao na fila para a combinacao data/profissional

---

### PUT /api/waitlist/:id/notify

**Descricao:** Notifica o cliente de que um horario ficou disponivel.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID da entrada na waitlist |

**Request Body:**
```json
{
  "available_slot": {
    "date": "2026-04-01",
    "start_time": "10:30",
    "professional_id": "uuid"
  },
  "channel": "whatsapp"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "notified",
    "notified_at": "2026-03-31T19:30:00Z",
    "channel": "whatsapp"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Notificacao enviada |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Entrada nao encontrada |
| 409 | Cliente ja foi notificado |

**Regras de negocio:**
- Status muda para `notified`
- Se o cliente agendar, status muda para `booked` e a entrada e removida
- Se o cliente nao responder em 2 horas, notificar o proximo da fila
- Canais: `whatsapp`, `sms`

---

### DELETE /api/waitlist/:id

**Descricao:** Remove uma entrada da lista de espera.

**Autenticacao:** Auth — roles: `owner`, `manager`, `receptionist`

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID da entrada |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Removido da lista de espera"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Removido |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Entrada nao encontrada |

**Regras de negocio:**
- Remocao fisica (nao soft delete)
- Reordena automaticamente as posicoes dos demais na fila

---

## 11. Dashboard

### GET /api/dashboard/summary

**Descricao:** Retorna o resumo operacional do dia.

**Autenticacao:** Auth — roles: `owner`, `manager`, `staff` (dados proprios)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-31",
    "appointments": {
      "total": 18,
      "completed": 5,
      "confirmed": 8,
      "scheduled": 3,
      "cancelled": 1,
      "no_show": 1
    },
    "revenue": {
      "today": 450.00,
      "projected": 1080.00
    },
    "occupancy_rate": 75.0,
    "next_appointment": {
      "id": "uuid",
      "time": "14:00",
      "client": "Roberto Souza",
      "service": "Corte Masculino",
      "professional": "Carlos Barber"
    },
    "gaps_count": 3,
    "waitlist_count": 2
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Resumo retornado |
| 401 | Nao autenticado |

**Regras de negocio:**
- Staff ve apenas seus proprios dados no resumo
- `projected` = receita ja realizada + receita dos agendamentos restantes do dia
- `occupancy_rate` = (slots ocupados / slots totais do dia) * 100
- `gaps_count` = quantidade de horarios vagos com duracao >= `slot_duration_minutes`

---

### GET /api/dashboard/alerts

**Descricao:** Retorna alertas acionaveis que exigem atencao.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "type": "gap_alert",
        "severity": "info",
        "title": "3 horarios vagos hoje",
        "message": "Carlos tem 3 horarios vagos entre 15:00 e 17:00",
        "action": {
          "type": "link",
          "url": "/appointments/gaps?date=2026-03-31",
          "label": "Ver horarios vagos"
        },
        "created_at": "2026-03-31T07:00:00Z"
      },
      {
        "type": "inactive_clients",
        "severity": "warning",
        "title": "15 clientes inativos",
        "message": "15 clientes nao visitam ha mais de 45 dias",
        "action": {
          "type": "link",
          "url": "/clients/inactive",
          "label": "Ver clientes inativos"
        }
      },
      {
        "type": "plan_expiring",
        "severity": "warning",
        "title": "3 planos expirando esta semana",
        "message": "3 clientes tem planos que vencem nos proximos 7 dias",
        "action": {
          "type": "link",
          "url": "/plans?expiring=true",
          "label": "Ver planos"
        }
      },
      {
        "type": "no_show_risk",
        "severity": "danger",
        "title": "Cliente com historico de faltas",
        "message": "Roberto Souza (3 faltas) tem agendamento amanha as 10:00",
        "action": {
          "type": "link",
          "url": "/clients/uuid",
          "label": "Ver ficha do cliente"
        }
      }
    ]
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Alertas retornados |
| 401 | Nao autenticado |
| 403 | Sem permissao |

**Regras de negocio:**
- Tipos de alerta: `gap_alert`, `inactive_clients`, `plan_expiring`, `no_show_risk`, `waitlist_match`, `unconfirmed_appointments`
- Severidade: `info`, `warning`, `danger`
- Alertas sao gerados em tempo real com base no estado atual dos dados
- Maximo de 20 alertas retornados, priorizados por severidade

---

### GET /api/dashboard/metrics

**Descricao:** Retorna metricas agregadas por periodo.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `period` | string | nao | `today`, `week`, `month` (padrao), `quarter`, `year` |
| `start_date` | string (YYYY-MM-DD) | nao | Inicio do periodo customizado |
| `end_date` | string (YYYY-MM-DD) | nao | Fim do periodo customizado |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "start_date": "2026-03-01",
    "end_date": "2026-03-31",
    "appointments": {
      "total": 320,
      "completed": 290,
      "cancelled": 20,
      "no_show": 10,
      "completion_rate": 90.6,
      "cancellation_rate": 6.3,
      "no_show_rate": 3.1
    },
    "revenue": {
      "total": 14500.00,
      "average_ticket": 50.00,
      "from_plans": 3000.00,
      "from_direct": 11500.00
    },
    "clients": {
      "new_clients": 25,
      "returning_clients": 85,
      "retention_rate": 77.3,
      "inactive_count": 15,
      "reactivated": 3
    },
    "occupancy": {
      "average_rate": 72.5,
      "best_day": { "date": "2026-03-15", "rate": 95.0 },
      "worst_day": { "date": "2026-03-10", "rate": 45.0 }
    },
    "comparison": {
      "revenue_change_percent": 12.5,
      "appointments_change_percent": 8.3,
      "new_clients_change_percent": -5.0
    }
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Metricas retornadas |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 422 | Periodo invalido |

**Regras de negocio:**
- `comparison` compara com o periodo anterior equivalente (mes atual vs mes anterior, etc.)
- `retention_rate` = (clientes que voltaram no periodo / clientes que visitaram no periodo anterior) * 100
- Periodos customizados com `start_date`/`end_date` nao incluem comparacao
- Maximo de 1 ano de periodo

---

## 12. Financial

### GET /api/financial/summary

**Descricao:** Retorna resumo financeiro do periodo.

**Autenticacao:** Auth — roles: `owner`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `period` | string | nao | `today`, `week`, `month` (padrao), `quarter`, `year` |
| `start_date` | string (YYYY-MM-DD) | nao | Inicio customizado |
| `end_date` | string (YYYY-MM-DD) | nao | Fim customizado |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "start_date": "2026-03-01",
    "end_date": "2026-03-31",
    "total_revenue": 14500.00,
    "total_commission": 7250.00,
    "net_revenue": 7250.00,
    "plan_revenue": 3000.00,
    "direct_revenue": 11500.00,
    "average_daily_revenue": 483.33,
    "transactions_count": 290,
    "by_payment_method": {
      "cash": 3500.00,
      "card": 6000.00,
      "pix": 4000.00,
      "plan": 1000.00
    },
    "comparison": {
      "revenue_change_percent": 12.5,
      "commission_change_percent": 10.2
    }
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Resumo retornado |
| 401 | Nao autenticado |
| 403 | Apenas owner tem acesso ao financeiro |
| 422 | Periodo invalido |

**Regras de negocio:**
- Apenas owner acessa dados financeiros completos
- `total_commission` = soma das comissoes de todos os profissionais
- `net_revenue` = `total_revenue` - `total_commission`
- Transacoes geradas automaticamente ao concluir agendamentos

---

### GET /api/financial/by-professional

**Descricao:** Retorna detalhamento financeiro por profissional.

**Autenticacao:** Auth — roles: `owner`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `period` | string | nao | `today`, `week`, `month` (padrao), `quarter`, `year` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "professionals": [
      {
        "id": "uuid",
        "name": "Carlos Barber",
        "total_revenue": 5000.00,
        "commission_percentage": 50,
        "commission_value": 2500.00,
        "appointments_completed": 100,
        "average_ticket": 50.00,
        "occupancy_rate": 78.0
      },
      {
        "id": "uuid",
        "name": "Pedro Barber",
        "total_revenue": 4200.00,
        "commission_percentage": 45,
        "commission_value": 1890.00,
        "appointments_completed": 84,
        "average_ticket": 50.00,
        "occupancy_rate": 72.0
      }
    ],
    "total_revenue": 14500.00,
    "total_commission": 7250.00
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Detalhamento retornado |
| 401 | Nao autenticado |
| 403 | Apenas owner |

**Regras de negocio:**
- Ordenado por `total_revenue` decrescente
- Inclui todos os profissionais ativos que tiveram atendimentos no periodo
- `commission_value` = `total_revenue` * (`commission_percentage` / 100)

---

### GET /api/financial/by-service

**Descricao:** Retorna detalhamento financeiro por servico.

**Autenticacao:** Auth — roles: `owner`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `period` | string | nao | `today`, `week`, `month` (padrao), `quarter`, `year` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "services": [
      {
        "id": "uuid",
        "name": "Corte Masculino",
        "total_revenue": 6750.00,
        "appointments_count": 150,
        "average_price": 45.00,
        "revenue_share_percent": 46.6,
        "from_plans": 20,
        "from_direct": 130
      },
      {
        "id": "uuid",
        "name": "Barba",
        "total_revenue": 3500.00,
        "appointments_count": 100,
        "average_price": 35.00,
        "revenue_share_percent": 24.1,
        "from_plans": 15,
        "from_direct": 85
      }
    ],
    "total_revenue": 14500.00
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Detalhamento retornado |
| 401 | Nao autenticado |
| 403 | Apenas owner |

**Regras de negocio:**
- Ordenado por `total_revenue` decrescente
- `revenue_share_percent` = (receita do servico / receita total) * 100
- `from_plans` = atendimentos pagos via plano; `from_direct` = pagamento direto
- Atendimentos via plano contam na contagem mas com receita = 0 (receita do plano e contabilizada separadamente)

---

## 13. Schedule Blocks

### POST /api/schedule-blocks

**Descricao:** Cria um bloqueio de horario para um profissional (folga, consulta, etc.).

**Autenticacao:** Auth — roles: `owner`, `manager`, `staff` (proprio)

**Request Body:**
```json
{
  "professional_id": "uuid",
  "date": "2026-04-05",
  "start_time": "09:00",
  "end_time": "12:00",
  "reason": "Consulta medica",
  "all_day": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "professional": { "id": "uuid", "name": "Carlos Barber" },
    "date": "2026-04-05",
    "start_time": "09:00",
    "end_time": "12:00",
    "reason": "Consulta medica",
    "all_day": false,
    "conflicting_appointments": [
      {
        "id": "uuid",
        "time": "09:30",
        "client": "Roberto Souza"
      }
    ],
    "created_at": "2026-03-31T19:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 201 | Bloqueio criado |
| 401 | Nao autenticado |
| 403 | Staff so pode bloquear proprio horario |
| 404 | Profissional nao encontrado |
| 422 | Dados invalidos (data passada, horarios incongruentes) |

**Regras de negocio:**
- `date` deve ser no futuro
- Se `all_day` = true, ignora `start_time` e `end_time` (bloqueia o dia inteiro)
- `start_time` deve ser anterior a `end_time`
- Staff so pode criar bloqueios para si mesmo
- Retorna lista de agendamentos que conflitam (nao cancela automaticamente)
- Os agendamentos conflitantes devem ser tratados manualmente pelo usuario

---

### DELETE /api/schedule-blocks/:id

**Descricao:** Remove um bloqueio de horario.

**Autenticacao:** Auth — roles: `owner`, `manager`, `staff` (proprio)

**Path Params:**
| Param | Tipo | Descricao |
|---|---|---|
| `id` | UUID | ID do bloqueio |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Bloqueio removido com sucesso"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Removido |
| 401 | Nao autenticado |
| 403 | Staff so pode remover proprio bloqueio |
| 404 | Bloqueio nao encontrado |

**Regras de negocio:**
- Remocao fisica (nao soft delete)
- Staff so pode remover seus proprios bloqueios
- Bloqueios passados podem ser removidos (limpeza)

---

## 14. Notifications

### GET /api/notifications

**Descricao:** Lista notificacoes pendentes de envio ou recentes.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Query Params:**
| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `status` | string | nao | `pending`, `sent`, `failed`, `all` (padrao: `pending`) |
| `type` | string | nao | `reminder`, `confirmation`, `reactivation`, `waitlist`, `campaign` |
| `page` | number | nao | Pagina |
| `per_page` | number | nao | Itens por pagina |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "reminder",
      "channel": "whatsapp",
      "status": "pending",
      "recipient": {
        "client_id": "uuid",
        "name": "Roberto Souza",
        "phone": "+5511988880000"
      },
      "message_preview": "Ola Roberto! Lembrete: voce tem um...",
      "scheduled_for": "2026-04-01T12:00:00Z",
      "related_to": {
        "type": "appointment",
        "id": "uuid"
      },
      "created_at": "2026-03-31T19:00:00Z"
    }
  ],
  "meta": { ... }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Lista retornada |
| 401 | Nao autenticado |
| 403 | Sem permissao |

**Regras de negocio:**
- Notificacoes pendentes ordenadas por `scheduled_for` ascendente
- Notificacoes enviadas/falhas ordenadas por data mais recente
- `message_preview` truncado em 100 caracteres

---

### POST /api/notifications/send

**Descricao:** Envia uma notificacao manual para um cliente.

**Autenticacao:** Auth — roles: `owner`, `manager`

**Request Body:**
```json
{
  "client_id": "uuid",
  "channel": "whatsapp",
  "message": "Ola Roberto! Gostaríamos de lembrar que voce tem creditos no seu plano. Agende agora!",
  "type": "custom"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "queued",
    "channel": "whatsapp",
    "queued_at": "2026-03-31T20:00:00Z"
  }
}
```

**Status Codes:**
| Status | Condicao |
|---|---|
| 200 | Notificacao enfileirada |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Cliente nao encontrado |
| 422 | Mensagem vazia ou canal invalido |
| 429 | Limite de notificacoes manuais excedido (10 por hora) |

**Regras de negocio:**
- `channel`: `whatsapp`, `sms`
- Mensagem maxima de 500 caracteres
- Limite de 10 notificacoes manuais por hora por tenant
- Nao permitir envio para clientes que solicitaram opt-out
- Registrar em log de auditoria quem enviou a mensagem
- `type`: `custom`, `reminder`, `reactivation`

---

## Apendice: Rate Limiting

| Escopo | Limite |
|---|---|
| API geral (autenticada) | 100 req/min por usuario |
| Login | 5 tentativas / 15 min por email |
| Forgot password | 3 req / hora por email |
| Public booking endpoints | 30 req/min por IP |
| Public booking creation | 5 agendamentos / hora por telefone |
| Notificacoes manuais | 10 / hora por tenant |
| Campanhas | 1 por canal / dia por tenant |

## Apendice: Webhooks (Futuro)

Endpoints para configuracao de webhooks estao planejados para versao futura, permitindo que integracoes externas recebam eventos do sistema em tempo real.
