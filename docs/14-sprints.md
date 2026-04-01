# BarberFlow — Plano de Sprints (30 dias)

> **Produto:** BarberFlow — SaaS de crescimento para barbearias
> **Horizonte:** 30 dias (4 sprints + 2 dias de buffer)
> **Equipe:** 1 dev full-stack senior
> **Stack:** Next.js 14 + TypeScript + Tailwind CSS + PostgreSQL + Prisma ORM
> **Deploy:** Vercel (frontend/API) + Neon (PostgreSQL serverless)
> **Última atualização:** 31/03/2026

---

## Premissas gerais

- **1 desenvolvedor full-stack senior** com experiência em React/Next.js e banco relacional
- **Sprints de 5 dias úteis** (segunda a sexta)
- **Zero DevOps:** Vercel faz deploy automático via git push; Neon gerencia o PostgreSQL serverless
- **Design system reutilizável:** investimento no Sprint 0 reduz tempo dos sprints seguintes
- **Componentes Tailwind + shadcn/ui:** não reinventar a roda em UI
- **Prisma ORM:** schema as code, migrations automáticas, type-safe queries
- **NextAuth.js:** autenticação pronta com session management
- **Foco em funcionalidade, não perfeição visual:** polimento visual acontece no Sprint 4

---

## Sprint 0 — Setup & Fundação

**Período:** Dia 1-2 (2 dias)
**Objetivo:** Ter o ambiente completo rodando com deploy automático, schema do banco, autenticação funcional e layout base pronto para receber funcionalidades.

### Itens do backlog

| ID | Item | Estimativa |
|---|---|---|
| — | Setup Next.js 14 (App Router) + TypeScript + Tailwind CSS | 2h |
| — | Configuração do Prisma com Neon (PostgreSQL) | 1h |
| — | Schema completo do banco de dados (todas as tabelas do MVP) | 4h |
| BF-001 | Registro de conta com criação de tenant | 3h |
| BF-002 | Login/logout com sessão (NextAuth.js) | 3h |
| — | Deploy inicial na Vercel (CI/CD automático via GitHub) | 1h |
| — | Layout base: AppShell, Sidebar, TopBar, responsivo | 4h |
| — | Design system: tokens de cor, tipografia, componentes base (Button, Input, Select, Card, Badge, Modal, Drawer, Toast) | 4h |
| — | Seed script com dados demo (barbearia, profissionais, serviços, clientes, agendamentos) | 2h |

### Entregável verificável

- URL de staging acessível na Vercel
- Registro de nova conta funcional — cria tenant no banco
- Login/logout funcional com sessão persistente
- Layout com sidebar navegável (links placeholder para todas as seções)
- Design system documentado em página `/dev/components` (apenas em desenvolvimento)
- Seed rodando com `npx prisma db seed` — banco populado com dados de demonstração

### Schema do banco (tabelas principais)

```
Tenant (id, name, slug, type, address, phone, email, logo_url, settings, onboarding_completed)
User (id, tenant_id, name, email, password_hash, role, status)
Professional (id, tenant_id, user_id?, name, phone, email, photo_url, color, status)
WorkingHours (id, professional_id, day_of_week, start_time, end_time, is_active)
Break (id, professional_id, day_of_week, start_time, end_time, label)
Service (id, tenant_id, name, description, duration_minutes, price, category, status)
ProfessionalService (id, professional_id, service_id, price_override?, duration_override?)
Client (id, tenant_id, name, phone, email?, photo_url?, notes, status, last_visit_at, total_visits, total_spent)
Appointment (id, tenant_id, client_id, professional_id, service_id, date, start_time, end_time, status, source, price, notes, reminder_sent)
TimeBlock (id, professional_id, start_date, end_date, start_time?, end_time?, all_day, reason)
Notification (id, tenant_id, appointment_id?, client_id?, type, channel, message, status, sent_at)
TenantSettings (id, tenant_id, cancellation_hours, noshow_limit, noshow_action, reminder_hours, notifications_enabled)
```

### Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Schema precisa de ajustes posteriores | Alta | Prisma migrations permitem alterações incrementais sem downtime |
| NextAuth demora para configurar com custom credentials | Média | Usar provider "credentials" com adapter Prisma — há exemplos prontos |
| Neon tem cold start lento | Baixa | Neon serverless tem pool de conexões; manter pelo menos 1 conexão ativa |

### Critério de "done"

- [ ] `npm run build` passa sem erros
- [ ] Deploy na Vercel acessível via URL
- [ ] Registro + login + logout funcionais
- [ ] Schema aplicado no banco de produção
- [ ] Seed executado com sucesso
- [ ] Layout responsivo (mobile + desktop)
- [ ] Todos os componentes base renderizando corretamente

---

## Sprint 1 — Core Operacional

**Período:** Dia 3-7 (5 dias)
**Objetivo:** Ter o núcleo operacional funcional — serviços, profissionais com horários e a agenda visual por dia/profissional com criação de agendamentos.

### Itens do backlog

| ID | Item | Estimativa | Dia |
|---|---|---|---|
| BF-003 | Wizard de onboarding (5 etapas) | G (5+ dias) | Dia 3-4 (parcial) |
| BF-004 | CRUD de serviços + templates pré-prontos | M (3-4 dias) | Dia 3 |
| BF-005 | Associação serviço-profissional | P (1-2 dias) | Dia 3 |
| BF-006 | CRUD de profissionais | M (3-4 dias) | Dia 4 |
| BF-007 | Horários de trabalho por dia da semana | M (3-4 dias) | Dia 4-5 |
| BF-008 | Pausas/intervalos | P (1-2 dias) | Dia 5 |
| BF-009 | Agenda visual por dia/profissional | G (5+ dias) | Dia 5-7 |
| BF-010 | Criação rápida de agendamento | M (3-4 dias) | Dia 6-7 |
| BF-014 | Cálculo de disponibilidade (engine) | G (5+ dias) | Dia 6-7 |

### Plano dia a dia

**Dia 3 (segunda):**
- Manhã: Serviços — CRUD completo (listagem + formulário + templates de barbearia). Reaproveitar componentes base do Sprint 0.
- Tarde: Associação serviço-profissional (tabela N:N). Iniciar wizard de onboarding (etapas 1-2).

**Dia 4 (terça):**
- Manhã: Profissionais — CRUD completo (listagem em cards + drawer de criação/edição + upload de foto).
- Tarde: Horários de trabalho — grid de 7 dias com turnos. Onboarding etapas 3-4.

**Dia 5 (quarta):**
- Manhã: Pausas/intervalos + finalizar horários. Onboarding etapa 5 + fluxo completo.
- Tarde: Iniciar agenda visual — layout de colunas por profissional, navegação por data, slots de tempo.

**Dia 6 (quinta):**
- Manhã: Cálculo de disponibilidade — engine que considera horários, pausas, bloqueios e agendamentos existentes. API endpoint.
- Tarde: Agenda — renderização dos agendamentos existentes nos slots. Cards com informações resumidas.

**Dia 7 (sexta):**
- Manhã: Criação rápida de agendamento — clique no slot, drawer com autocomplete de cliente, seleção de serviço, cálculo de término.
- Tarde: Integração agenda + disponibilidade + criação. Testes manuais do fluxo completo. Correções.

### Entregável verificável

- Wizard de onboarding funcional (5 etapas, salva dados no banco)
- Tela de serviços com CRUD completo e 6 templates de barbearia carregados
- Tela de profissionais com CRUD, configuração de horários e pausas
- Agenda visual por dia mostrando colunas por profissional com agendamentos
- Criação de agendamento clicando em slot vago — funcional end-to-end
- API de disponibilidade retornando slots corretos
- Fluxo testável: onboarding → criar serviço → criar profissional → ver agenda → criar agendamento

### Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Onboarding wizard consome tempo demais | Alta | Fazer versão simplificada (sem animações/transições elaboradas). Polir no Sprint 4. |
| Agenda visual é complexa de implementar | Alta | Usar grid CSS com posicionamento fixo por horário. Não implementar drag-and-drop (BF-046 é COULD). |
| Engine de disponibilidade tem edge cases | Média | Cobrir os casos principais (horário, pausa, bloqueio, agendamento existente). Edge cases avançados no Sprint 4. |

### Critério de "done"

- [ ] Onboarding completo cria barbearia funcional com profissionais e serviços
- [ ] CRUD de serviços e profissionais 100% funcional
- [ ] Horários e pausas configuráveis e salvando no banco
- [ ] Agenda mostra agendamentos do dia por profissional
- [ ] Criação de agendamento via agenda funcional
- [ ] API de disponibilidade retorna slots corretos em < 200ms

---

## Sprint 2 — Agendamento Completo + Clientes

**Período:** Dia 8-14 (5 dias úteis)
**Objetivo:** Completar o fluxo de agendamento (status, bloqueios, reagendamento), lançar a página pública de agendamento e ter o módulo de clientes funcional.

### Itens do backlog

| ID | Item | Estimativa | Dia |
|---|---|---|---|
| BF-011 | Status de atendimento (pendente → confirmado → concluído/cancelado/faltou) | M (3-4 dias) | Dia 8 |
| BF-012 | Bloqueio de horários | P (1-2 dias) | Dia 8 |
| BF-013 | Reagendamento (botão + drawer) | M (3-4 dias) | Dia 9 |
| BF-015 | Página pública /agendar/:slug | M (3-4 dias) | Dia 9-10 |
| BF-016 | Wizard público (serviço → profissional → data → horário → dados → confirmação) | G (5+ dias) | Dia 10-11 |
| BF-017 | Identificação por telefone | P (1-2 dias) | Dia 11 |
| BF-018 | Lista de clientes com busca e filtros | M (3-4 dias) | Dia 12 |
| BF-019 | Ficha do cliente com histórico | M (3-4 dias) | Dia 12-13 |
| BF-020 | Status automático (ativo/em risco/inativo) | P (1-2 dias) | Dia 13 |
| BF-021 | Reagendar a partir da ficha | P (1-2 dias) | Dia 14 |

### Plano dia a dia

**Dia 8 (segunda):**
- Manhã: Sistema de status — dropdown no card do agendamento, fluxo de transições validado, badges coloridos. Log de mudanças.
- Tarde: Bloqueio de horários — formulário, exibição visual na agenda, integração com engine de disponibilidade.

**Dia 9 (terça):**
- Manhã: Reagendamento — drawer com date picker, lista de slots disponíveis, validação, atualização no banco com audit trail.
- Tarde: Iniciar página pública — rota `/agendar/[slug]`, layout mobile-first, dados da barbearia, SSR/SSG para performance.

**Dia 10 (quarta):**
- Manhã: Wizard público etapas 1-3 — cards de serviços, cards de profissionais (com "Sem preferência"), calendário com dias disponíveis.
- Tarde: Wizard público etapas 4-6 — lista de horários (usa API de disponibilidade), formulário de dados, tela de confirmação.

**Dia 11 (quinta):**
- Manhã: Identificação por telefone — busca em tempo real, preenchimento automático, sugestão de último serviço/profissional.
- Tarde: Finalizar e testar fluxo público completo end-to-end. Tratamento de erros. Tela de sucesso com resumo.

**Dia 12 (sexta):**
- Manhã: Lista de clientes — tabela com busca, filtros por status, paginação, badges de contagem.
- Tarde: Ficha do cliente — dados, métricas, timeline de atendimentos, notas.

**Dia 13 (segunda):**
- Manhã: Status automático de cliente — cálculo baseado em last_visit, job de atualização, badges na lista e ficha.
- Tarde: Finalizar ficha do cliente — botões de ação rápida, integração com agenda.

**Dia 14 (terça):**
- Manhã: Reagendar a partir da ficha — botão que abre drawer pré-preenchido com dados do cliente e sugestões.
- Tarde: Testes integrados do Sprint 2. Correção de bugs. Revisão de UX nos fluxos.

### Entregável verificável

- Agendamentos com fluxo completo de status (criar → confirmar → atender → concluir)
- Bloqueios de horário visíveis na agenda e respeitados pela disponibilidade
- Reagendamento funcional via agenda e via ficha do cliente
- Página pública acessível em `barberflow.com.br/agendar/:slug`
- Cliente externo consegue agendar pelo wizard público em menos de 2 minutos
- Lista de clientes com busca, filtros e status automático
- Ficha do cliente com histórico completo e métricas
- Identificação por telefone reconhece clientes recorrentes

### Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Página pública demora mais que o previsto (mobile, SEO, performance) | Média | Usar layout simples e funcional. SEO e performance refinados no Sprint 4. |
| Wizard público tem muitas etapas para testar | Média | Testar o caminho feliz (happy path) primeiro. Edge cases (sem disponibilidade, erros) no Sprint 4. |
| Race condition na reserva de horário público | Média | Usar transaction com SELECT FOR UPDATE no PostgreSQL ao confirmar agendamento. |

### Critério de "done"

- [ ] Fluxo de status funcional com transições validadas
- [ ] Bloqueios criados e respeitados na agenda e disponibilidade
- [ ] Reagendamento funcional com audit trail
- [ ] Página pública carrega em < 2s no mobile
- [ ] Wizard público completo — agendamento criado aparece na agenda interna
- [ ] Identificação por telefone funcional
- [ ] Lista e ficha de clientes com dados corretos
- [ ] Status automático calculado e exibido (ativo/em risco/inativo)

---

## Sprint 3 — Confirmação + Dashboard + Configurações

**Período:** Dia 15-21 (5 dias úteis)
**Objetivo:** Implementar o sistema de notificações (confirmação e lembrete), o dashboard completo com métricas e quick actions, e as configurações da barbearia.

### Itens do backlog

| ID | Item | Estimativa | Dia |
|---|---|---|---|
| BF-022 | Confirmação após agendamento | M (3-4 dias) | Dia 15 |
| BF-023 | Lembrete antes do horário | M (3-4 dias) | Dia 15-16 |
| BF-024 | Card atendimentos de hoje | P (1-2 dias) | Dia 16 |
| BF-025 | Card ocupação do dia (%) | P (1-2 dias) | Dia 16 |
| BF-026 | Card faltas da semana | P (1-2 dias) | Dia 17 |
| BF-027 | Card horários vagos hoje | P (1-2 dias) | Dia 17 |
| BF-028 | Card clientes para retorno | P (1-2 dias) | Dia 17 |
| BF-029 | Quick action "Preencher horários vagos" | M (3-4 dias) | Dia 18 |
| BF-030 | Quick action "Reativar clientes" | M (3-4 dias) | Dia 18-19 |
| BF-031 | Dados da unidade | P (1-2 dias) | Dia 19 |
| BF-032 | Horários de funcionamento | P (1-2 dias) | Dia 19 |
| BF-033 | Política de cancelamento e no-show | P (1-2 dias) | Dia 20 |
| BF-034 | Configuração de notificações | P (1-2 dias) | Dia 20 |
| — | Polimento de auth (BF-001, BF-002) se necessário | P (1-2 dias) | Dia 21 |

### Plano dia a dia

**Dia 15 (segunda):**
- Manhã: Sistema de notificações — abstração para envio (interface unificada para SMS, WhatsApp link, log). Template engine com variáveis. Confirmação automática pós-agendamento.
- Tarde: Lembrete — job agendado (cron via Vercel Cron ou similar) que verifica agendamentos próximos e envia lembretes. Flag `reminder_sent`.

**Dia 16 (terça):**
- Manhã: Finalizar notificações — testes, tratamento de erros, log de envio. Na v1, implementar como link de WhatsApp (wa.me) + log registrado no sistema.
- Tarde: Dashboard — layout com grid de cards. Card de atendimentos de hoje (BF-024) + Card de ocupação (BF-025). Queries otimizadas.

**Dia 17 (quarta):**
- Manhã: Card faltas da semana (BF-026) + Card horários vagos (BF-027) + Card clientes para retorno (BF-028).
- Tarde: Finalizar todos os cards — comparações com período anterior, formatação, responsividade.

**Dia 18 (quinta):**
- Manhã: Quick action "Preencher horários vagos" (BF-029) — painel com horários disponíveis + sugestões de clientes inteligentes baseadas em histórico.
- Tarde: Quick action "Reativar clientes" (BF-030) — lista de clientes em risco com ações de agendamento e envio de mensagem.

**Dia 19 (sexta):**
- Manhã: Configurações — dados da unidade (BF-031) com integração ViaCEP, upload de logo. Horários de funcionamento (BF-032).
- Tarde: Finalizar configurações — preview de como dados aparecem na página pública. Vinculação dos horários da barbearia com validação dos profissionais.

**Dia 20 (segunda):**
- Manhã: Política de cancelamento e no-show (BF-033) — formulário de configuração, texto editável da política, lógica de contagem de faltas.
- Tarde: Configuração de notificações (BF-034) — toggles, editor de templates, preview, restaurar padrão.

**Dia 21 (terça):**
- Manhã: Polimento de auth — forgot password (e-mail de reset), validação de e-mail, melhorias de UX na tela de login/registro.
- Tarde: Testes integrados do Sprint 3. Dashboard com dados reais do seed. Verificação de todas as métricas.

### Entregável verificável

- Confirmação enviada automaticamente após cada agendamento (via WhatsApp link + log)
- Lembrete enviado X horas antes (verificável no log de notificações)
- Dashboard com 5 cards de métricas e 2 quick actions funcionais
- Cards com dados reais calculados a partir do banco
- Quick actions gerando sugestões relevantes de clientes
- Todas as configurações editáveis e persistentes
- Templates de notificação editáveis com preview funcional

### Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Cron jobs na Vercel têm limitações (plano free: 1/dia) | Alta | Usar Vercel Cron no plano Pro (a cada 1min) ou implementar via API route chamada por serviço externo (cron-job.org). |
| Dashboard com muitas queries pode ficar lento | Média | Agregar dados em queries otimizadas. Considerar views materializadas ou cache de 60s para métricas do dashboard. |
| Link de WhatsApp não é notificação automática "real" | Baixa | É uma limitação aceita da v1. Na prática, funciona bem para demonstração e validação. WhatsApp API real é BF-047 (COULD). |

### Critério de "done"

- [ ] Confirmação registrada no log para cada agendamento criado
- [ ] Lembrete enviado no horário configurado (verificável no log)
- [ ] Dashboard carrega em < 1s com todos os 5 cards e dados corretos
- [ ] Quick actions listam sugestões relevantes
- [ ] Configurações salvas e refletidas na operação (horários, políticas, notificações)
- [ ] Templates de notificação editáveis e com preview funcional

---

## Sprint 4 — Polish + Should Items

**Período:** Dia 22-28 (5 dias úteis)
**Objetivo:** Adicionar funcionalidades Should de alto impacto (clientes inativos, campanhas, planos, perfis de acesso), rodar testes completos, corrigir bugs e polir a experiência.

### Itens do backlog

| ID | Item | Estimativa | Dia |
|---|---|---|---|
| BF-035 | Clientes inativos — lista segmentada + ação rápida | M (3-4 dias) | Dia 22 |
| BF-036 | Templates de campanhas de reativação | P (1-2 dias) | Dia 22 |
| BF-037 | Disparo de campanha para lista | M (3-4 dias) | Dia 23 |
| BF-038 | Planos/combos simples (cadastro) | M (3-4 dias) | Dia 23-24 |
| BF-039 | Vínculo plano-cliente com controle de sessões | M (3-4 dias) | Dia 24 |
| BF-044 | Perfis de acesso básicos (owner, manager, staff, receptionist) | M (3-4 dias) | Dia 25 |
| — | Testes end-to-end (fluxos críticos) | — | Dia 26 |
| — | Correção de bugs e edge cases | — | Dia 26-27 |
| — | Seed de templates (serviços, campanhas, dados demo) | — | Dia 27 |
| — | Polish visual (UX, animações, loading states, empty states, error states) | — | Dia 27-28 |

### Plano dia a dia

**Dia 22 (segunda):**
- Manhã: Tela de clientes inativos (BF-035) — lista segmentada por tempo de inatividade, métricas de receita perdida, filtros, ações individuais.
- Tarde: Templates de campanhas (BF-036) — 5 templates prontos, editor com variáveis, preview, salvar customizados.

**Dia 23 (terça):**
- Manhã: Disparo de campanha (BF-037) — seleção de lista, escolha de template, preview, envio em lote (via WhatsApp links na v1), relatório de envio.
- Tarde: Iniciar planos (BF-038) — CRUD de planos, templates sugeridos, cálculo de economia.

**Dia 24 (quarta):**
- Manhã: Finalizar planos — vínculo plano-cliente (BF-039), controle de sessões, exibição na ficha do cliente.
- Tarde: Integração de planos com agendamentos — marcação automática de "incluído no plano", decremento de sessões ao concluir.

**Dia 25 (quinta):**
- Manhã: Perfis de acesso (BF-044) — roles no banco, middleware de autorização, filtro de menu/rotas por perfil.
- Tarde: Testar todas as permissões — staff vê apenas sua agenda, receptionist não acessa financeiro, manager acessa tudo exceto billing.

**Dia 26 (sexta):**
- Dia inteiro: Testes end-to-end dos fluxos críticos:
  1. Registro → onboarding → configuração completa
  2. Agendamento interno → status → conclusão
  3. Agendamento público → confirmação → lembrete
  4. Cliente em risco → reativação → agendamento
  5. Bloqueio → reagendamento
  6. Plano → vínculo → uso de sessão
- Listar bugs encontrados e priorizar correções.

**Dia 27 (segunda):**
- Manhã: Correção de bugs críticos e bloqueantes.
- Tarde: Seed completo de templates — serviços de barbearia (6 templates), campanhas de reativação (5 templates), dados demo realistas para demonstração.

**Dia 28 (terça):**
- Dia inteiro: Polish visual e de UX:
  - Loading states (skeletons) em todas as listas e formulários
  - Empty states com ilustração e CTA ("Nenhum serviço cadastrado. Crie o primeiro!")
  - Error states com mensagens claras e ação de retry
  - Animações sutis de transição (drawer, modal, toast)
  - Responsividade final — testar em iPhone SE, iPhone 14, Samsung Galaxy, iPad
  - Favicon, meta tags, Open Graph para página pública
  - Verificar acessibilidade básica (contraste, foco, labels)

### Entregável verificável

- Tela de clientes inativos funcional com ações de reativação
- Sistema de campanhas: selecionar lista → escolher template → disparar
- Planos cadastráveis e vinculáveis a clientes com controle de sessões
- Perfis de acesso funcionais (4 roles com permissões diferenciadas)
- Zero bugs críticos nos 6 fluxos testados
- Templates de serviço e campanha carregados no seed
- UX polida com loading, empty e error states em todas as telas

### Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Should items não cabem todos no sprint | Média | Priorizar BF-035/036/037 (reativação é core do produto) + BF-044 (acesso). BF-038/039 (planos) podem ir para o buffer se necessário. |
| Bugs encontrados nos testes consomem o tempo de polish | Alta | Reservar dia 28 inteiro para polish. Se houver bugs demais, priorizar correção sobre polish — funcionalidade > estética. |
| Perfis de acesso têm edge cases de autorização | Média | Implementar de forma simples: verificação por role em middleware. Não fazer ACL granular — 4 perfis fixos com permissões hardcoded. |

### Critério de "done"

- [ ] Clientes inativos listados e acionáveis
- [ ] Campanhas disparáveis com templates
- [ ] Planos criados, vinculados e com sessões controladas
- [ ] Perfis de acesso restringindo menu e rotas
- [ ] 6 fluxos E2E testados sem bugs críticos
- [ ] UX polida com estados de loading, empty e error
- [ ] Seed de templates completo e funcional

---

## Buffer — Deploy Final & Validação

**Período:** Dia 29-30 (2 dias)
**Objetivo:** Preparar o ambiente de produção definitivo, testar com dados reais, fazer ajustes finais e garantir que o produto está pronto para os primeiros clientes.

### Atividades

**Dia 29:**

| Hora | Atividade |
|---|---|
| 09:00-10:00 | Deploy de produção final — configurar domínio definitivo, SSL, variáveis de ambiente de produção |
| 10:00-11:00 | Configurar monitoramento: Vercel Analytics (performance) + Sentry (erros) |
| 11:00-12:00 | Teste com dados reais — criar barbearia real com serviços, profissionais e horários reais |
| 13:00-15:00 | Simular jornada completa do gestor: onboarding → configuração → criação de agenda → atendimentos |
| 15:00-17:00 | Simular jornada completa do cliente: acessar página pública → agendar → receber confirmação |
| 17:00-18:00 | Listar ajustes necessários e priorizar por impacto |

**Dia 30:**

| Hora | Atividade |
|---|---|
| 09:00-12:00 | Correção dos ajustes mais críticos identificados no dia anterior |
| 13:00-14:00 | Teste final: agendamento público em dispositivo mobile real |
| 14:00-15:00 | Preparar ambiente demo com dados fictícios mas realistas (para demonstrações comerciais) |
| 15:00-16:00 | Checklist de go-live (verificar todos os itens do documento 15-versao-lancamento.md) |
| 16:00-17:00 | Smoke test final: login, agenda, agendamento público, dashboard |
| 17:00-18:00 | Deploy final. Produto no ar. |

### Entregável verificável

- Ambiente de produção estável com domínio definitivo
- Monitoramento ativo (erros e performance)
- Jornada do gestor testada end-to-end com dados reais
- Jornada do cliente testada em mobile real
- Ambiente demo pronto para demonstrações
- Checklist de go-live 100% concluído
- Produto no ar e acessível

### Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Bugs críticos descobertos no teste com dados reais | Média | Dia 30 tem 3h reservadas para correções. Se o bug for grave, adiar lançamento em 1-2 dias (decisão pragmática). |
| Performance ruim em produção | Baixa | Vercel + Neon são otimizados para serverless. Se necessário, adicionar cache com Vercel KV para queries do dashboard. |
| Domínio/SSL não propagado | Baixa | Configurar domínio no dia 29 de manhã — 24h de margem para propagação DNS. |

### Critério de "done"

- [ ] Domínio final acessível com SSL
- [ ] Monitoramento configurado e recebendo dados
- [ ] Zero bugs críticos no smoke test final
- [ ] Performance: tempo de carregamento < 2s em todas as páginas
- [ ] Agendamento público funcional em mobile (Android + iOS testados)
- [ ] Ambiente demo acessível e com dados realistas
- [ ] Produto pronto para receber os primeiros clientes pagantes

---

## Resumo visual do plano

```
Semana 0 (2 dias):  [Setup ████████████████████] Deploy + Auth + Layout + Schema
Semana 1 (5 dias):  [Core  ████████████████████] Serviços + Profissionais + Agenda + Disponibilidade
Semana 2 (5 dias):  [Agend ████████████████████] Status + Página Pública + Clientes
Semana 3 (5 dias):  [Dash  ████████████████████] Notificações + Dashboard + Configurações
Semana 4 (5 dias):  [Polish████████████████████] Should items + Testes + UX Polish
Buffer   (2 dias):  [Final ████████]             Deploy produção + Validação + Go-live
```

### Total de items por sprint

| Sprint | Must | Should | Infra | Total |
|---|---|---|---|---|
| Sprint 0 | 2 (BF-001, BF-002) | 0 | 6 (setup, schema, deploy, layout, design, seed) | 8 |
| Sprint 1 | 8 (BF-003 a BF-010, BF-014) | 0 | 0 | 8 |
| Sprint 2 | 10 (BF-011 a BF-013, BF-015 a BF-021) | 0 | 0 | 10 |
| Sprint 3 | 12 (BF-022 a BF-034) + polish auth | 0 | 0 | 13 |
| Sprint 4 | 0 | 5 (BF-035 a BF-039, BF-044) | 4 (testes, bugs, seed, polish) | 9 |
| Buffer | 0 | 0 | 5 (deploy, teste, demo, checklist, go-live) | 5 |
| **Total** | **32** | **5** | **15** | **53 atividades** |

---

## Decisões técnicas firmes

1. **Next.js 14 App Router** — Server Components para páginas de consulta, Client Components para interatividade.
2. **Prisma ORM** — Type-safe, migrations, seed. Sem SQL manual exceto para queries otimizadas do dashboard.
3. **NextAuth.js com Credentials provider** — Simples, funcional, integrado com Prisma adapter.
4. **shadcn/ui + Tailwind CSS** — Componentes prontos, acessíveis, customizáveis. Sem biblioteca de UI pesada.
5. **Neon PostgreSQL** — Serverless, auto-scaling, branching para dev/staging. Custo: $0 no free tier, ~$19/mês no Pro.
6. **Vercel** — Deploy automático, preview deployments, cron jobs (Pro), analytics.
7. **Notificações v1: WhatsApp link + log** — Não integrar API de WhatsApp no MVP. Usar `wa.me/5511999999999?text=...` que abre o WhatsApp com mensagem pré-preenchida. Registrar no sistema como "link gerado". API real é Fase 2.
8. **Sem testes automatizados no Sprint 1-3** — Priorizar entrega. Testes manuais a cada sprint. Testes E2E no Sprint 4.
9. **Mobile-first na página pública, desktop-first no painel admin** — Clientes acessam no celular, gestores no computador.
10. **Sem websockets no MVP** — Polling a cada 60s para atualização da agenda. Realtime é otimização futura.
