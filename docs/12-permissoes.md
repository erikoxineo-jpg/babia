# 12 — Matriz de Permissoes (RBAC)

> BarberFlow — SaaS multi-tenant de crescimento para barbearias
> Stack: Next.js API Routes + Prisma + PostgreSQL

---

## Visao Geral

O sistema utiliza Role-Based Access Control (RBAC) com 4 perfis hierarquicos. Cada usuario pertence a exatamente 1 tenant e possui exatamente 1 role dentro desse tenant.

### Hierarquia de Perfis

```
owner (nivel 4 — acesso total)
  └── manager (nivel 3 — operacao completa)
       └── receptionist (nivel 2 — atendimento e agenda)
            └── staff (nivel 1 — agenda propria)
```

---

## Definicao dos Perfis

### Owner (Dono/Proprietario)

**Descricao:** Proprietario da barbearia. Acesso total e irrestrito a todas as funcionalidades do sistema. E o unico que pode gerenciar configuracoes criticas do tenant, dados financeiros completos e controle de usuarios.

**Restricoes:**
- Nao pode desativar a si mesmo
- Nao pode remover o proprio papel de owner (protecao contra lockout)
- Pelo menos 1 owner deve existir por tenant

**Criacao:** Automatico no registro da conta. Apenas outro owner pode promover um usuario a owner.

---

### Manager (Gerente)

**Descricao:** Gerente operacional. Acesso completo a operacao diaria — agenda, clientes, campanhas, relatorios. Nao acessa configuracoes criticas do tenant nem dados financeiros detalhados.

**Restricoes:**
- Nao pode alterar plano de assinatura do tenant
- Nao pode excluir/desativar o tenant
- Nao pode convidar/remover owners
- Nao pode promover usuarios a owner ou manager
- Nao pode acessar financeiro detalhado (apenas metricas gerais do dashboard)

**Criacao:** Convidado pelo owner ou por outro manager.

---

### Staff (Profissional/Barbeiro)

**Descricao:** Profissional que realiza atendimentos. Acesso restrito a sua propria agenda, seus proprios clientes (que ja atendeu), e funcionalidades basicas necessarias para operar no dia a dia.

**Restricoes:**
- Ve apenas sua propria agenda
- Ve apenas clientes que ja atendeu
- Nao acessa financeiro, campanhas, relatorios ou configuracoes
- Nao pode criar/editar servicos ou profissionais
- Pode alterar status de seus proprios agendamentos
- Pode criar agendamentos apenas em sua propria agenda
- Pode criar bloqueios apenas em sua propria agenda

**Criacao:** Convidado pelo owner ou manager.

---

### Receptionist (Recepcionista)

**Descricao:** Responsavel pelo atendimento na recepcao. Gerencia a agenda de todos os profissionais, cadastra e atualiza clientes, mas sem acesso a financeiro, relatorios detalhados ou configuracoes.

**Restricoes:**
- Nao acessa dados financeiros
- Nao acessa relatorios ou metricas
- Nao pode gerenciar servicos, profissionais ou configuracoes
- Nao pode criar/enviar campanhas
- Pode criar/editar agendamentos de qualquer profissional

**Criacao:** Convidado pelo owner ou manager.

---

## Matriz de Permissoes Completa

### Legenda

| Simbolo | Significado |
|---|---|
| ✅ | Acesso total (todas as acoes) |
| 👁️ | Apenas visualizacao |
| 🔒 | Apenas dados proprios |
| ❌ | Sem acesso |

---

### Dashboard

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Ver resumo do dia | ✅ | ✅ | ✅ | 🔒 |
| Ver alertas acionaveis | ✅ | ✅ | ❌ | ❌ |
| Ver metricas por periodo | ✅ | ✅ | ❌ | ❌ |

**Detalhes:**
- Staff ve no dashboard apenas o resumo da sua propria agenda (seus agendamentos do dia, proximo atendimento)
- Receptionist ve o resumo geral do dia (agendamentos de todos os profissionais) mas nao alertas estrategicos nem metricas

---

### Agenda (Appointments)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Ver agenda de todos | ✅ | ✅ | ✅ | ❌ |
| Ver propria agenda | ✅ | ✅ | ✅ | ✅ |
| Criar agendamento (qualquer profissional) | ✅ | ✅ | ✅ | ❌ |
| Criar agendamento (proprio) | ✅ | ✅ | ✅ | ✅ |
| Editar agendamento | ✅ | ✅ | ✅ | ❌ |
| Alterar status (qualquer) | ✅ | ✅ | ✅ | ❌ |
| Alterar status (proprio) | ✅ | ✅ | ✅ | ✅ |
| Reagendar | ✅ | ✅ | ✅ | ❌ |
| Cancelar agendamento | ✅ | ✅ | ✅ | ❌ |
| Ver horarios disponiveis | ✅ | ✅ | ✅ | ✅ |
| Ver horarios vagos (gaps) | ✅ | ✅ | ✅ | ❌ |
| Ver agendamentos de hoje | ✅ | ✅ | ✅ | 🔒 |

**Detalhes:**
- Staff pode criar agendamentos apenas para si mesmo (sua propria agenda)
- Staff pode alterar status apenas dos seus proprios agendamentos (confirmar, concluir, marcar falta)
- Receptionist pode operar a agenda de qualquer profissional (criar, editar, reagendar, cancelar)
- Staff nao pode reagendar nem cancelar agendamentos (deve solicitar a recepcao/gerencia)

---

### Clientes (Clients)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Listar todos os clientes | ✅ | ✅ | ✅ | ❌ |
| Listar clientes que atendeu | ✅ | ✅ | ✅ | ✅ |
| Ver ficha completa | ✅ | ✅ | ✅ | 🔒 |
| Criar cliente | ✅ | ✅ | ✅ | ✅ |
| Editar cliente | ✅ | ✅ | ✅ | ❌ |
| Ver historico de atendimentos | ✅ | ✅ | ✅ | 🔒 |
| Excluir/desativar cliente | ✅ | ✅ | ❌ | ❌ |
| Ver clientes inativos | ✅ | ✅ | ❌ | ❌ |
| Disparar reativacao | ✅ | ✅ | ❌ | ❌ |

**Detalhes:**
- Staff so visualiza clientes que ja atendeu pelo menos uma vez (filtro automatico por `professional_id` nos atendimentos)
- Staff pode ver a ficha e historico apenas dos clientes que ja atendeu
- Staff pode criar novos clientes (necessario para atendimentos walk-in)
- Receptionist pode listar e editar todos os clientes, mas nao pode desativa-los
- A desativacao de clientes e uma acao gerencial (owner/manager)

---

### Servicos (Services)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Listar servicos | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes do servico | ✅ | ✅ | ✅ | ✅ |
| Criar servico | ✅ | ✅ | ❌ | ❌ |
| Editar servico | ✅ | ✅ | ❌ | ❌ |
| Desativar servico | ✅ | ✅ | ❌ | ❌ |
| Reordenar servicos | ✅ | ✅ | ❌ | ❌ |

**Detalhes:**
- Todos os perfis podem visualizar servicos (necessario para operar a agenda e informar precos)
- Apenas owner e manager podem gerenciar o catalogo de servicos
- Desativacao de servico nao remove agendamentos existentes

---

### Profissionais (Professionals)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Listar profissionais | ✅ | ✅ | ✅ | ❌ |
| Ver detalhes | ✅ | ✅ | ✅ | 🔒 |
| Criar profissional | ✅ | ✅ | ❌ | ❌ |
| Editar profissional (outro) | ✅ | ✅ | ❌ | ❌ |
| Editar proprio perfil | ✅ | ✅ | ❌ | ✅ |
| Desativar profissional | ✅ | ✅ | ❌ | ❌ |
| Ver horarios (schedule) | ✅ | ✅ | ✅ | 🔒 |
| Editar horarios (schedule) | ✅ | ✅ | ❌ | ❌ |
| Ver disponibilidade | ✅ | ✅ | ✅ | 🔒 |

**Detalhes:**
- Staff ve apenas seu proprio perfil e horarios
- Staff pode editar: nome, telefone e avatar do seu proprio perfil (nao comissao, servicos ou horarios)
- Receptionist pode ver todos os profissionais e seus horarios (necessario para agendar)
- Manager pode editar todos os dados de profissionais, exceto promover alguem a owner
- Ao criar profissional, manager so pode atribuir roles `staff` ou `receptionist`

---

### Bloqueios de Horario (Schedule Blocks)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Criar bloqueio (qualquer profissional) | ✅ | ✅ | ❌ | ❌ |
| Criar bloqueio (proprio) | ✅ | ✅ | ❌ | ✅ |
| Remover bloqueio (qualquer) | ✅ | ✅ | ❌ | ❌ |
| Remover bloqueio (proprio) | ✅ | ✅ | ❌ | ✅ |

**Detalhes:**
- Staff pode criar/remover bloqueios apenas na sua propria agenda (folga, compromisso pessoal)
- Receptionist nao pode criar bloqueios (deve solicitar a gerencia)

---

### Campanhas (Campaigns)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Listar campanhas | ✅ | ✅ | ❌ | ❌ |
| Criar campanha | ✅ | ✅ | ❌ | ❌ |
| Editar campanha | ✅ | ✅ | ❌ | ❌ |
| Enviar/disparar campanha | ✅ | ✅ | ❌ | ❌ |
| Ver resultados | ✅ | ✅ | ❌ | ❌ |

**Detalhes:**
- Campanhas sao funcionalidades de marketing, restritas a gestao (owner/manager)
- Receptionist e staff nao tem acesso ao modulo de campanhas

---

### Planos/Pacotes (Plans)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Listar planos | ✅ | ✅ | ✅ | ❌ |
| Criar plano | ✅ | ✅ | ❌ | ❌ |
| Editar plano | ✅ | ✅ | ❌ | ❌ |
| Atribuir plano a cliente | ✅ | ✅ | ✅ | ❌ |
| Registrar uso de plano | ✅ | ✅ | ✅ | ✅ |

**Detalhes:**
- Receptionist pode ver planos e atribui-los a clientes (operacao de venda na recepcao)
- Receptionist nao pode criar ou editar a definicao dos planos
- Staff pode registrar uso do plano ao concluir atendimento (necessario para o fluxo de conclusao)
- Staff nao pode visualizar a lista de planos ou atribui-los

---

### Lista de Espera (Waitlist)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Listar espera | ✅ | ✅ | ✅ | ❌ |
| Adicionar a espera | ✅ | ✅ | ✅ | ❌ |
| Notificar cliente | ✅ | ✅ | ✅ | ❌ |
| Remover da espera | ✅ | ✅ | ✅ | ❌ |

**Detalhes:**
- A lista de espera e operada pela recepcao/gestao
- Staff nao interage diretamente com a lista de espera

---

### Financeiro (Financial)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Ver resumo financeiro | ✅ | ❌ | ❌ | ❌ |
| Ver detalhes por profissional | ✅ | ❌ | ❌ | ❌ |
| Ver detalhes por servico | ✅ | ❌ | ❌ | ❌ |

**Detalhes:**
- Financeiro e exclusivo do owner — informacoes sensiveis sobre receita, comissoes e rentabilidade
- Manager ve metricas agregadas no dashboard (receita do dia, estimativa) mas nao o detalhamento financeiro completo
- Nenhum outro perfil tem acesso ao modulo financeiro

---

### Relatorios e Metricas (Dashboard Metrics)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Ver metricas por periodo | ✅ | ✅ | ❌ | ❌ |
| Ver comparativo entre periodos | ✅ | ✅ | ❌ | ❌ |
| Ver taxa de retencao | ✅ | ✅ | ❌ | ❌ |
| Ver taxa de ocupacao | ✅ | ✅ | ❌ | ❌ |
| Exportar dados | ✅ | ❌ | ❌ | ❌ |

**Detalhes:**
- Manager pode visualizar metricas operacionais (agendamentos, ocupacao, retencao)
- Manager nao pode exportar dados (funcionalidade restrita ao owner)
- Metricas financeiras dentro dos relatorios sao omitidas para o manager (ve contagens mas nao valores monetarios detalhados)

---

### Notificacoes (Notifications)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Listar notificacoes | ✅ | ✅ | ❌ | ❌ |
| Enviar notificacao manual | ✅ | ✅ | ❌ | ❌ |

**Detalhes:**
- Gerenciamento de notificacoes e restrito a gestao
- Notificacoes automaticas (lembretes, confirmacoes) funcionam independentemente de permissoes

---

### Configuracoes (Settings)

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Dados da barbearia (nome, logo, endereco) | ✅ | 👁️ | ❌ | ❌ |
| Horario de funcionamento | ✅ | 👁️ | ❌ | ❌ |
| Duracao dos slots | ✅ | ❌ | ❌ | ❌ |
| Politica de cancelamento | ✅ | ❌ | ❌ | ❌ |
| Limite de no-show | ✅ | ❌ | ❌ | ❌ |
| Threshold de inatividade | ✅ | ❌ | ❌ | ❌ |
| Configuracao de lembretes | ✅ | ❌ | ❌ | ❌ |
| Habilitar/desabilitar booking publico | ✅ | ❌ | ❌ | ❌ |
| Gerenciar usuarios (convidar, remover) | ✅ | ❌ | ❌ | ❌ |
| Alterar plano de assinatura | ✅ | ❌ | ❌ | ❌ |
| Excluir tenant | ✅ | ❌ | ❌ | ❌ |

**Detalhes:**
- Manager pode visualizar as configuracoes atuais (para referencia) mas nao altera-las
- Todas as configuracoes criticas sao restritas ao owner
- Gerenciamento de usuarios (convidar, alterar roles, remover) e exclusivo do owner

---

### Pagina Publica de Agendamento

| Recurso | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| Configurar pagina (habilitar/desabilitar) | ✅ | ❌ | ❌ | ❌ |
| Personalizar (logo, descricao) | ✅ | ❌ | ❌ | ❌ |

**Detalhes:**
- A pagina publica e acessivel sem autenticacao por qualquer pessoa (com o slug da barbearia)
- A configuracao da pagina (habilitar, personalizar) e restrita ao owner

---

## Regras Especiais e Excecoes

### 1. Staff e isolamento de dados

O staff opera em um escopo restrito e isolado:

```
Regra: Staff SOMENTE acessa dados relacionados a si mesmo.

Agenda:
  - GET /api/appointments → filtro automatico: professional_id = user.professional_id
  - POST /api/appointments → validacao: professional_id DEVE ser o proprio
  - PUT /api/appointments/:id/status → validacao: agendamento DEVE ser do proprio

Clientes:
  - GET /api/clients → filtro automatico: clientes onde EXISTS(appointments WHERE professional_id = user.professional_id AND status = 'completed')
  - GET /api/clients/:id → validacao: DEVE existir atendimento concluido entre staff e cliente

Schedule Blocks:
  - POST /api/schedule-blocks → validacao: professional_id DEVE ser o proprio
  - DELETE /api/schedule-blocks/:id → validacao: bloqueio DEVE pertencer ao proprio

Dashboard:
  - GET /api/dashboard/summary → dados filtrados apenas para o proprio profissional
```

### 2. Receptionist e agenda multi-profissional

O receptionist tem permissoes amplas na agenda mas restritas em gestao:

```
Regra: Receptionist PODE operar a agenda de QUALQUER profissional, mas NAO PODE gerenciar configuracoes.

Agenda:
  - GET /api/appointments → sem filtro de profissional (ve todos)
  - POST /api/appointments → pode informar qualquer professional_id ativo
  - PUT /api/appointments/:id → pode editar agendamentos de qualquer profissional
  - PUT /api/appointments/:id/status → pode alterar status de qualquer agendamento
  - POST /api/appointments/:id/reschedule → pode reagendar qualquer agendamento

Clientes:
  - GET /api/clients → ve todos os clientes (necessario para operar a recepcao)
  - POST /api/clients → pode cadastrar novos clientes
  - PUT /api/clients/:id → pode atualizar dados de clientes

Planos:
  - GET /api/plans → pode visualizar para informar clientes
  - POST /api/plans/:id/assign → pode vender planos na recepcao
```

### 3. Manager e limitacoes de gestao

O manager tem acesso amplo a operacao mas com restricoes estrategicas:

```
Regra: Manager PODE gerenciar a operacao diaria completa, mas NAO PODE alterar configuracoes criticas.

Permitido:
  - Gerenciar servicos (criar, editar, desativar)
  - Gerenciar profissionais (criar, editar, desativar) com roles staff/receptionist
  - Gerenciar campanhas (criar, enviar)
  - Gerenciar planos (criar, editar)
  - Ver relatorios e metricas operacionais
  - Ver e operar toda a agenda
  - Gerenciar todos os clientes

Proibido:
  - Alterar configuracoes do tenant (horarios, politicas, slots)
  - Acessar financeiro detalhado
  - Gerenciar usuarios (convidar, remover, alterar roles)
  - Alterar plano de assinatura do SaaS
  - Excluir o tenant
  - Promover usuarios a owner ou manager
  - Exportar dados
```

### 4. Owner e protecoes de seguranca

```
Regra: Owner tem acesso TOTAL, com protecoes contra auto-lockout.

Protecoes:
  - Owner nao pode desativar a si mesmo
  - Owner nao pode remover seu proprio role de owner
  - Deve existir pelo menos 1 owner ativo por tenant
  - Apenas owner pode convidar/promover outro owner
  - Apenas owner pode remover outro owner (rebaixar para manager/staff)
  - A exclusao do tenant requer confirmacao dupla (email + senha)
```

---

## Implementacao Tecnica

### Middleware de Autorizacao

Cada rota da API deve passar por um middleware que verifica:

```typescript
// Ordem de verificacao:
// 1. Token JWT valido?
// 2. Usuario pertence ao tenant correto?
// 3. Role do usuario tem permissao para a acao?
// 4. Se Staff, dados sao do proprio escopo?

interface Permission {
  resource: string;    // 'appointments', 'clients', etc.
  action: string;      // 'list', 'create', 'update', 'delete', 'view'
  scope: 'all' | 'own' | 'attended';  // escopo do acesso
}

// Mapa de permissoes por role
const PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    { resource: '*', action: '*', scope: 'all' }
  ],
  manager: [
    { resource: 'appointments', action: '*', scope: 'all' },
    { resource: 'clients', action: '*', scope: 'all' },
    { resource: 'services', action: '*', scope: 'all' },
    { resource: 'professionals', action: '*', scope: 'all' },
    { resource: 'campaigns', action: '*', scope: 'all' },
    { resource: 'plans', action: '*', scope: 'all' },
    { resource: 'waitlist', action: '*', scope: 'all' },
    { resource: 'notifications', action: '*', scope: 'all' },
    { resource: 'dashboard', action: 'view', scope: 'all' },
    { resource: 'metrics', action: 'view', scope: 'all' },
    { resource: 'schedule_blocks', action: '*', scope: 'all' },
    { resource: 'settings', action: 'view', scope: 'all' },
    // Financeiro e configuracoes de escrita: NAO incluidos
  ],
  receptionist: [
    { resource: 'appointments', action: '*', scope: 'all' },
    { resource: 'clients', action: 'list', scope: 'all' },
    { resource: 'clients', action: 'create', scope: 'all' },
    { resource: 'clients', action: 'update', scope: 'all' },
    { resource: 'clients', action: 'view', scope: 'all' },
    { resource: 'services', action: 'list', scope: 'all' },
    { resource: 'services', action: 'view', scope: 'all' },
    { resource: 'professionals', action: 'list', scope: 'all' },
    { resource: 'professionals', action: 'view', scope: 'all' },
    { resource: 'plans', action: 'list', scope: 'all' },
    { resource: 'plans', action: 'assign', scope: 'all' },
    { resource: 'client_plans', action: 'use', scope: 'all' },
    { resource: 'waitlist', action: '*', scope: 'all' },
    { resource: 'dashboard', action: 'view', scope: 'all' },
  ],
  staff: [
    { resource: 'appointments', action: 'list', scope: 'own' },
    { resource: 'appointments', action: 'create', scope: 'own' },
    { resource: 'appointments', action: 'update_status', scope: 'own' },
    { resource: 'appointments', action: 'view_slots', scope: 'own' },
    { resource: 'clients', action: 'list', scope: 'attended' },
    { resource: 'clients', action: 'view', scope: 'attended' },
    { resource: 'clients', action: 'create', scope: 'all' },
    { resource: 'clients', action: 'view_history', scope: 'attended' },
    { resource: 'services', action: 'list', scope: 'all' },
    { resource: 'services', action: 'view', scope: 'all' },
    { resource: 'professionals', action: 'view', scope: 'own' },
    { resource: 'professionals', action: 'update', scope: 'own' },
    { resource: 'client_plans', action: 'use', scope: 'all' },
    { resource: 'schedule_blocks', action: 'create', scope: 'own' },
    { resource: 'schedule_blocks', action: 'delete', scope: 'own' },
    { resource: 'dashboard', action: 'view', scope: 'own' },
  ],
};
```

### Decorator/Helper de Rota

```typescript
// Uso nas API Routes:

// Rota acessivel apenas por owner
export default withAuth({ roles: ['owner'] })(handler);

// Rota acessivel por owner e manager
export default withAuth({ roles: ['owner', 'manager'] })(handler);

// Rota com verificacao de escopo (staff ve apenas seus dados)
export default withAuth({
  roles: ['owner', 'manager', 'receptionist', 'staff'],
  scopeCheck: (user, params) => {
    if (user.role === 'staff') {
      return params.professional_id === user.professional_id;
    }
    return true;
  }
})(handler);

// Rota publica (sem autenticacao)
export default withPublicAccess()(handler);
```

### Filtros Automaticos por Role

```typescript
// Em cada query Prisma, aplicar filtro automatico baseado no role:

function getAppointmentsFilter(user: AuthUser): Prisma.AppointmentWhereInput {
  const base = { tenant_id: user.tenant_id };

  switch (user.role) {
    case 'owner':
    case 'manager':
    case 'receptionist':
      return base; // ve todos do tenant

    case 'staff':
      return {
        ...base,
        professional_id: user.professional_id // apenas proprios
      };
  }
}

function getClientsFilter(user: AuthUser): Prisma.ClientWhereInput {
  const base = { tenant_id: user.tenant_id };

  switch (user.role) {
    case 'owner':
    case 'manager':
    case 'receptionist':
      return base; // ve todos do tenant

    case 'staff':
      return {
        ...base,
        appointments: {
          some: {
            professional_id: user.professional_id,
            status: 'completed'
          }
        }
      };
  }
}
```

---

## Mapeamento de Endpoints por Role

Tabela rapida de referencia: quais endpoints cada role pode acessar.

### Auth
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `POST /api/auth/register` | Public | Public | Public | Public |
| `POST /api/auth/login` | Public | Public | Public | Public |
| `POST /api/auth/logout` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/auth/forgot-password` | Public | Public | Public | Public |
| `GET /api/auth/me` | ✅ | ✅ | ✅ | ✅ |

### Tenant
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/tenant` | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/tenant` | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/tenant/settings` | ✅ | ❌ | ❌ | ❌ |

### Professionals
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/professionals` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/professionals` | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/professionals/:id` | ✅ | ✅ | ❌ | 🔒 |
| `DELETE /api/professionals/:id` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/professionals/:id/schedule` | ✅ | ✅ | ✅ | 🔒 |
| `PUT /api/professionals/:id/schedule` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/professionals/:id/availability` | ✅ | ✅ | ✅ | 🔒 |

### Services
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/services` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/services` | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/services/:id` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/services/:id` | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/services/reorder` | ✅ | ✅ | ❌ | ❌ |

### Clients
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/clients` | ✅ | ✅ | ✅ | 🔒 |
| `GET /api/clients/:id` | ✅ | ✅ | ✅ | 🔒 |
| `POST /api/clients` | ✅ | ✅ | ✅ | ✅ |
| `PUT /api/clients/:id` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/clients/inactive` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/clients/:id/history` | ✅ | ✅ | ✅ | 🔒 |
| `POST /api/clients/:id/reactivate` | ✅ | ✅ | ❌ | ❌ |

### Appointments
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/appointments` | ✅ | ✅ | ✅ | 🔒 |
| `POST /api/appointments` | ✅ | ✅ | ✅ | 🔒 |
| `PUT /api/appointments/:id` | ✅ | ✅ | ✅ | ❌ |
| `PUT /api/appointments/:id/status` | ✅ | ✅ | ✅ | 🔒 |
| `POST /api/appointments/:id/reschedule` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/appointments/available-slots` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/appointments/today` | ✅ | ✅ | ✅ | 🔒 |
| `GET /api/appointments/gaps` | ✅ | ✅ | ✅ | ❌ |

### Public Booking
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/book/:slug/info` | Public | Public | Public | Public |
| `GET /api/book/:slug/services` | Public | Public | Public | Public |
| `GET /api/book/:slug/professionals` | Public | Public | Public | Public |
| `GET /api/book/:slug/slots` | Public | Public | Public | Public |
| `POST /api/book/:slug` | Public | Public | Public | Public |

### Campaigns
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/campaigns` | ✅ | ✅ | ❌ | ❌ |
| `POST /api/campaigns` | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/campaigns/:id` | ✅ | ✅ | ❌ | ❌ |
| `POST /api/campaigns/:id/send` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/campaigns/:id/results` | ✅ | ✅ | ❌ | ❌ |

### Plans
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/plans` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/plans` | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/plans/:id` | ✅ | ✅ | ❌ | ❌ |
| `POST /api/plans/:id/assign` | ✅ | ✅ | ✅ | ❌ |
| `PUT /api/client-plans/:id/use` | ✅ | ✅ | ✅ | ✅ |

### Waitlist
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/waitlist` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/waitlist` | ✅ | ✅ | ✅ | ❌ |
| `PUT /api/waitlist/:id/notify` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /api/waitlist/:id` | ✅ | ✅ | ✅ | ❌ |

### Dashboard
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/dashboard/summary` | ✅ | ✅ | ✅ | 🔒 |
| `GET /api/dashboard/alerts` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/dashboard/metrics` | ✅ | ✅ | ❌ | ❌ |

### Financial
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/financial/summary` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/financial/by-professional` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/financial/by-service` | ✅ | ❌ | ❌ | ❌ |

### Schedule Blocks
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `POST /api/schedule-blocks` | ✅ | ✅ | ❌ | 🔒 |
| `DELETE /api/schedule-blocks/:id` | ✅ | ✅ | ❌ | 🔒 |

### Notifications
| Endpoint | Owner | Manager | Receptionist | Staff |
|---|---|---|---|---|
| `GET /api/notifications` | ✅ | ✅ | ❌ | ❌ |
| `POST /api/notifications/send` | ✅ | ✅ | ❌ | ❌ |

---

## Validacao de Tenant Isolation

Independentemente do role, toda requisicao autenticada DEVE passar pela validacao de tenant isolation:

```typescript
// Middleware obrigatorio em TODAS as rotas autenticadas:

function tenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userTenantId = req.user.tenant_id;

  // 1. Qualquer recurso acessado DEVE pertencer ao tenant do usuario
  // 2. Nunca permitir acesso cross-tenant, mesmo para owners
  // 3. Todas as queries Prisma DEVEM incluir WHERE tenant_id = userTenantId

  // Para rotas com :id, verificar se o recurso pertence ao tenant
  if (req.params.id) {
    const resource = await getResource(req.params.id);
    if (resource.tenant_id !== userTenantId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recurso nao encontrado' }
      });
      // Retornar 404 e nao 403 para nao revelar existencia do recurso em outro tenant
    }
  }

  next();
}
```

**Regra critica:** Um usuario NUNCA pode acessar dados de outro tenant, independentemente do seu role. Tentativas de acesso cross-tenant retornam 404 (nao 403) para nao revelar a existencia de dados em outros tenants.
