# BarberFlow — Wireframes Textuais Detalhados

> Documento 04 | Versão 1.0 | Março 2026
> Princípios: Mobile-first, cards grandes e clicáveis, mínimo texto, 1-3 cliques por ação.

---

## Convenções de Cores por Status

| Cor      | Significado  | Hex sugerido |
|----------|-------------|-------------|
| Verde    | Confirmado  | `#22C55E`   |
| Amarelo  | Pendente    | `#EAB308`   |
| Vermelho | Faltou      | `#EF4444`   |
| Cinza    | Cancelado   | `#9CA3AF`   |
| Azul     | Em andamento| `#3B82F6`   |

---

## 1. Tela de Login

### Layout

```
┌──────────────────────────────────────────────┐
│              (fundo escuro / gradiente)       │
│                                              │
│            ┌──────────────────┐              │
│            │   ✂ BarberFlow   │              │
│            │   "Seu negócio   │              │
│            │    crescendo"    │              │
│            │                  │              │
│            │  ┌────────────┐  │              │
│            │  │ Email      │  │              │
│            │  └────────────┘  │              │
│            │  ┌────────────┐  │              │
│            │  │ Senha    👁 │  │              │
│            │  └────────────┘  │              │
│            │                  │              │
│            │  [  Entrar  ]    │  ← botão     │
│            │                  │    primário   │
│            │  Esqueci senha   │  ← link      │
│            │                  │              │
│            │  ─── ou ───      │              │
│            │                  │              │
│            │  [Google]        │              │
│            │                  │              │
│            │  Criar conta →   │  ← link      │
│            └──────────────────┘              │
│                                              │
└──────────────────────────────────────────────┘
```

### Componentes

| Componente       | Tipo         | Detalhes                              |
|-----------------|-------------|---------------------------------------|
| Logo            | Imagem + texto | Centralizado, 48px                  |
| Subtítulo       | Texto        | Tagline do produto                   |
| Campo Email     | `Input`      | type=email, placeholder="seu@email"  |
| Campo Senha     | `Input`      | type=password, toggle visibilidade   |
| Botão Entrar    | `Button`     | variant=primary, full-width          |
| Link Esqueci    | `Link`       | Abre modal de recuperação            |
| Botão Google    | `Button`     | variant=outline, ícone Google        |
| Link Criar Conta| `Link`       | Redireciona para cadastro            |

### Ações Disponíveis

- Fazer login com email/senha
- Alternar visibilidade da senha
- Recuperar senha (abre modal)
- Login social com Google
- Ir para cadastro

### Estados

| Estado         | Comportamento                                      |
|---------------|---------------------------------------------------|
| Padrão        | Formulário vazio, botão Entrar desabilitado        |
| Preenchido    | Botão Entrar habilitado (azul primário)            |
| Carregando    | Spinner no botão, campos desabilitados             |
| Erro email    | Borda vermelha no campo, mensagem abaixo           |
| Erro senha    | Borda vermelha no campo, mensagem abaixo           |
| Erro geral    | Toast vermelho no topo "Credenciais inválidas"     |

---

## 2. Onboarding (Wizard 5 Etapas)

### Layout Geral do Wizard

```
┌──────────────────────────────────────────────┐
│  ✂ BarberFlow          Etapa 1 de 5          │
├──────────────────────────────────────────────┤
│                                              │
│  ●───●───○───○───○   (progress bar)          │
│  Tipo  Dados Horários Prof. Serviços         │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │        [CONTEÚDO DA ETAPA]           │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  [← Voltar]            [Próximo →]   │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

### Etapa 1 — Tipo de Negócio

```
┌──────────────────────────────────────────────┐
│  Qual o tipo do seu negócio?                 │
│                                              │
│  ┌──────────────┐  ┌──────────────┐          │
│  │   ✂           │  │   ✂✂          │          │
│  │  Barbearia    │  │  Salão       │          │
│  │  individual   │  │  com equipe  │          │
│  └──────────────┘  └──────────────┘          │
│                                              │
│  ┌──────────────┐  ┌──────────────┐          │
│  │   🏢          │  │   📍          │          │
│  │  Franquia /   │  │  Rede com    │          │
│  │  Rede         │  │  filiais     │          │
│  └──────────────┘  └──────────────┘          │
│                                              │
└──────────────────────────────────────────────┘
```

**Componentes**: 4 `SelectCard` com ícone, título e descrição. Seleção exclusiva (radio visual). Card selecionado tem borda primária + fundo leve.

### Etapa 2 — Dados da Unidade

```
┌──────────────────────────────────────────────┐
│  Dados da sua barbearia                      │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │ Nome do estabelecimento            │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │ Telefone / WhatsApp               │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │ CEP → busca automática            │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │ Endereço (preenchido via CEP)      │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │ Upload do logo (opcional)    [+]   │      │
│  └────────────────────────────────────┘      │
│                                              │
└──────────────────────────────────────────────┘
```

**Componentes**: `Input` (nome), `PhoneInput` (telefone), `Input` com máscara CEP (auto-busca), `Input` read-only (endereço), `FileUpload` (logo). Validações inline em tempo real.

### Etapa 3 — Horários de Funcionamento

```
┌──────────────────────────────────────────────┐
│  Horário de funcionamento                    │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │ Segunda  [✓]  08:00 ── 19:00      │      │
│  │ Terça    [✓]  08:00 ── 19:00      │      │
│  │ Quarta   [✓]  08:00 ── 19:00      │      │
│  │ Quinta   [✓]  08:00 ── 19:00      │      │
│  │ Sexta    [✓]  08:00 ── 19:00      │      │
│  │ Sábado   [✓]  08:00 ── 14:00      │      │
│  │ Domingo  [ ]  ──────────────       │      │
│  └────────────────────────────────────┘      │
│                                              │
│  Intervalo de almoço?                        │
│  [✓] Sim   12:00 ── 13:00                   │
│                                              │
│  [Copiar seg para todos os dias]   ← botão  │
│                                              │
└──────────────────────────────────────────────┘
```

**Componentes**: Lista de 7 `DayScheduleRow`, cada um com `Toggle` (ativo/inativo), 2 `TimePicker` (abertura e fechamento). Toggle para intervalo de almoço com 2 `TimePicker`. Botão utilitário "Copiar para todos".

### Etapa 4 — Profissionais

```
┌──────────────────────────────────────────────┐
│  Quem trabalha com você?                     │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │ 👤 João Silva        [Editar] [X]  │      │
│  │    Barbeiro · Seg a Sex            │      │
│  ├────────────────────────────────────┤      │
│  │ 👤 Pedro Costa        [Editar] [X] │      │
│  │    Barbeiro · Seg a Sáb            │      │
│  └────────────────────────────────────┘      │
│                                              │
│  [+ Adicionar profissional]                  │
│                                              │
│  (Se for individual, pré-preenche com        │
│   o dono como único profissional)            │
│                                              │
└──────────────────────────────────────────────┘
```

**Ao clicar "+ Adicionar"** abre Drawer lateral:

```
┌──────────────────────────────────────────────┐
│                    │ Novo Profissional    [X] │
│   (conteúdo       │                          │
│    atrás com      │ ┌──────────────────┐     │
│    overlay        │ │ Nome             │     │
│    escuro)        │ └──────────────────┘     │
│                   │ ┌──────────────────┐     │
│                   │ │ Apelido          │     │
│                   │ └──────────────────┘     │
│                   │ ┌──────────────────┐     │
│                   │ │ Telefone         │     │
│                   │ └──────────────────┘     │
│                   │                          │
│                   │ Horários:                │
│                   │ [✓] Seguir horário       │
│                   │     da barbearia         │
│                   │ [ ] Horário              │
│                   │     personalizado        │
│                   │                          │
│                   │ ┌──────────────────┐     │
│                   │ │ Upload foto (op) │     │
│                   │ └──────────────────┘     │
│                   │                          │
│                   │ [  Salvar  ]             │
│                   └──────────────────────────┘
└──────────────────────────────────────────────┘
```

**Componentes**: Lista de `ProfessionalCard` com ações editar/remover. Botão `+ Adicionar` abre `Drawer`. Dentro do drawer: `Input` (nome, apelido), `PhoneInput`, `Toggle` para tipo de horário, `FileUpload`.

### Etapa 5 — Serviços

```
┌──────────────────────────────────────────────┐
│  Quais serviços você oferece?                │
│                                              │
│  Sugestões rápidas: (chips clicáveis)        │
│  [Corte] [Barba] [Corte+Barba] [Degradê]    │
│  [Pigmentação] [Sobrancelha] [Hidratação]    │
│                                              │
│  Serviços adicionados:                       │
│  ┌────────────────────────────────────┐      │
│  │ ✂ Corte         30min   R$ 45,00  │      │
│  │                    [Editar] [X]    │      │
│  ├────────────────────────────────────┤      │
│  │ ✂ Barba         20min   R$ 30,00  │      │
│  │                    [Editar] [X]    │      │
│  └────────────────────────────────────┘      │
│                                              │
│  [+ Criar serviço personalizado]             │
│                                              │
│  ──────────────────────────────              │
│  [← Voltar]        [Concluir Setup →]        │
│                                              │
└──────────────────────────────────────────────┘
```

**Componentes**: `Chip` clicáveis para sugestões (ao clicar, adiciona com valores padrão). Lista de `ServiceCard` com nome, duração, preço, ações. Botão `+ Criar` abre `Drawer` com campos nome, duração (select: 15/20/30/45/60/90min), preço (`Input` monetário), comissão (%).

### Estados do Onboarding

| Estado           | Comportamento                                           |
|-----------------|---------------------------------------------------------|
| Etapa incompleta | Botão "Próximo" desabilitado, campos obrigatórios em vermelho |
| Etapa completa   | Botão "Próximo" habilitado (azul)                       |
| Salvando         | Spinner no botão, campos desabilitados                  |
| Erro de rede     | Toast vermelho "Erro ao salvar. Tente novamente."       |
| Concluído        | Redirect para Dashboard com toast "Barbearia configurada!" |

---

## 3. Dashboard

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔 2   👤 João   [v]      │
├────────┬─────────────────────────────────────────────────┤
│        │                                                 │
│  NAV   │  Olá, João! · Terça, 31 mar 2026               │
│        │                                                 │
│ 📊 Dash│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ 📅 Agen│  │ 12      │ │ 78%     │ │ 2       │          │
│ 👥 Clie│  │Atendim. │ │Ocupação │ │Faltas   │          │
│ ✂ Serv │  │ hoje    │ │  hoje   │ │ hoje    │          │
│ 👤 Prof│  └─────────┘ └─────────┘ └─────────┘          │
│ 📢 Camp│                                                 │
│ 🎁 Plan│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ 💰 Fina│  │ 5       │ │ 8       │ │R$1.240  │          │
│ 📈 Rela│  │Horários │ │Retorno  │ │Receita  │          │
│ ⚙ Conf │  │ vagos   │ │pendente │ │ hoje    │          │
│        │  └─────────┘ └─────────┘ └─────────┘          │
│        │                                                 │
│        │  AÇÕES RÁPIDAS                                  │
│        │  ┌─────────────────────────────────────┐       │
│        │  │ [+ Agendar]  [+ Cliente]  [Caixa]  │       │
│        │  └─────────────────────────────────────┘       │
│        │                                                 │
│        │  ALERTAS                                        │
│        │  ┌─────────────────────────────────────┐       │
│        │  │ ⚠ 3 clientes sem retorno há 30+dias │       │
│        │  │ ⚠ Horário de pico: 5 vagos às 15h   │       │
│        │  │ ✓ Meta semanal 82% atingida          │       │
│        │  └─────────────────────────────────────┘       │
│        │                                                 │
│        │  PRÓXIMOS ATENDIMENTOS                          │
│        │  ┌─────────────────────────────────────┐       │
│        │  │ 14:00  Carlos M.  Corte  [João]     │       │
│        │  │ 14:30  Rafael S.  Barba  [Pedro]    │       │
│        │  │ 15:00  ── vago ──  [Preencher]      │       │
│        │  │ 15:30  André L.   Corte+Barba [João]│       │
│        │  └─────────────────────────────────────┘       │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Layout Mobile (< 768px)

```
┌──────────────────────────┐
│  ☰  BarberFlow     🔔 👤 │
├──────────────────────────┤
│ Olá, João! · 31 mar      │
│                          │
│ ┌──────┐ ┌──────┐       │
│ │  12  │ │ 78%  │       │
│ │Atend.│ │Ocup. │       │
│ └──────┘ └──────┘       │
│ ┌──────┐ ┌──────┐       │
│ │  2   │ │  5   │       │
│ │Faltas│ │Vagos │       │
│ └──────┘ └──────┘       │
│                          │
│ [+ Agendar] [+ Cliente]  │
│                          │
│ ALERTAS                  │
│ ┌────────────────────┐   │
│ │ ⚠ 3 sem retorno    │   │
│ │ ⚠ 5 vagos às 15h   │   │
│ └────────────────────┘   │
│                          │
│ PRÓXIMOS                 │
│ ┌────────────────────┐   │
│ │ 14:00 Carlos Corte │   │
│ │ 14:30 Rafael Barba │   │
│ └────────────────────┘   │
│                          │
├──────────────────────────┤
│ 📊  📅  👥  ✂  ⚙       │
│ (bottom navigation bar)  │
└──────────────────────────┘
```

### Componentes

| Componente              | Tipo           | Detalhes                                       |
|------------------------|----------------|------------------------------------------------|
| Saudação               | Texto          | "Olá, {nome}!" + data atual                   |
| Cards de métricas      | `StatCard` x6  | Ícone, valor, label, cor condicional           |
| Ações rápidas          | `QuickActionBar` | 3 botões principais horizontais              |
| Lista de alertas       | `Alert` x N    | Ícone ⚠/✓, texto, ação opcional               |
| Próximos atendimentos  | `AppointmentCard` x N | Hora, cliente, serviço, profissional     |
| Sidebar                | `Sidebar`      | 10 itens de navegação com ícone                |
| TopBar                 | `TopBar`       | Logo, sino notificações (badge), avatar+menu   |

### Ações Disponíveis

- Clicar em qualquer `StatCard` leva ao detalhe (ex.: clique em "Faltas" abre relatório de faltas)
- "+ Agendar" abre Drawer de novo agendamento
- "+ Cliente" abre Drawer de novo cliente
- "Caixa" abre modal de fechamento do dia
- Clicar em alerta executa ação sugerida (ex.: "3 sem retorno" abre lista filtrada)
- Clicar em atendimento abre drawer de detalhes
- "Preencher" em horário vago abre drawer de novo agendamento pré-preenchido

### Estados

| Estado             | Comportamento                                            |
|-------------------|----------------------------------------------------------|
| Carregando        | 6 `Skeleton` cards + `Skeleton` lista                    |
| Sem dados (novo)  | Cards zerados + `EmptyState` "Agende seu primeiro corte" |
| Com dados         | Layout padrão descrito acima                             |
| Erro de rede      | Toast vermelho + botão "Tentar novamente"                |
| Notificação nova  | Badge vermelho no sino, animação pulse                   |

---

## 4. Agenda

### Layout Desktop

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Agenda                                         │
│  NAV   │                                                 │
│        │  ┌───────────────────────────────────────┐      │
│        │  │ [← ] 31 Mar 2026 [ →]  [Dia] [Semana]│      │
│        │  │                                       │      │
│        │  │ Filtro: [Todos ▼] [João] [Pedro]      │      │
│        │  └───────────────────────────────────────┘      │
│        │                                                 │
│        │  ┌──────────────┬──────────────┐                │
│        │  │    João      │    Pedro     │                │
│        │  ├──────────────┼──────────────┤                │
│        │  │ 08:00 ░░░░░░ │ 08:00 ░░░░░ │                │
│        │  │ 08:30 ░░░░░░ │ 08:30 ░░░░░ │                │
│        │  │ 09:00 ┌────┐ │ 09:00 ░░░░░ │                │
│        │  │       │Carl│ │ 09:30 ┌────┐ │                │
│        │  │ 09:30 │Cort│ │       │Andr│ │                │
│        │  │       └────┘ │ 10:00 │Barb│ │                │
│        │  │ 10:00 ░░░░░░ │       └────┘ │                │
│        │  │ 10:30 ┌────┐ │ 10:30 ░░░░░░ │                │
│        │  │       │Rafa│ │ 11:00 ┌────┐ │                │
│        │  │ 11:00 │C+B │ │       │Marc│ │                │
│        │  │ 11:30 │    │ │ 11:30 │Cort│ │                │
│        │  │       └────┘ │       └────┘ │                │
│        │  │ 12:00 ██████ │ 12:00 ██████ │ ← almoço      │
│        │  │ 12:30 ██████ │ 12:30 ██████ │                │
│        │  │ 13:00 ░░░░░░ │ 13:00 ░░░░░░ │                │
│        │  └──────────────┴──────────────┘                │
│        │                                                 │
│        │              [+ Novo Agendamento]   ← FAB       │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

**Legenda visual**:
- `░░░░░░` = horário disponível (clicável)
- `┌────┐` = agendamento (cor por status)
- `██████` = bloqueado/intervalo

### Drawer Lateral de Edição (ao clicar num agendamento)

```
┌──────────────────────────────────────────────────────────┐
│                           │  Agendamento           [X]   │
│                           │                              │
│     (agenda atrás         │  Status: ● Confirmado  [▼]   │
│      com overlay)         │                              │
│                           │  👤 Carlos Mendes             │
│                           │     (11) 99876-5432          │
│                           │     [Ver ficha]              │
│                           │                              │
│                           │  ✂ Corte masculino            │
│                           │  ⏱ 30 min                    │
│                           │  💰 R$ 45,00                  │
│                           │                              │
│                           │  📅 31/03/2026               │
│                           │  🕐 09:00 — 09:30            │
│                           │  👤 João (profissional)       │
│                           │                              │
│                           │  Obs: "Quer degradê baixo"   │
│                           │                              │
│                           │  ┌────────────────────────┐  │
│                           │  │ [Remarcar] [Cancelar]  │  │
│                           │  │                        │  │
│                           │  │ [Confirmar chegada]    │  │
│                           │  │ [Marcar como falta]    │  │
│                           │  └────────────────────────┘  │
│                           │                              │
└───────────────────────────┴──────────────────────────────┘
```

### Drawer de Novo Agendamento

```
┌──────────────────────────────────────────────────────────┐
│                           │  Novo Agendamento      [X]   │
│                           │                              │
│     (agenda atrás)        │  Cliente:                    │
│                           │  ┌──────────────────────┐   │
│                           │  │ 🔍 Buscar cliente     │   │
│                           │  └──────────────────────┘   │
│                           │  [+ Novo cliente]            │
│                           │                              │
│                           │  Serviço:                    │
│                           │  ┌──────────────────────┐   │
│                           │  │ Selecionar serviço ▼ │   │
│                           │  └──────────────────────┘   │
│                           │                              │
│                           │  Profissional:               │
│                           │  [João]  [Pedro]  [Qualquer] │
│                           │                              │
│                           │  Data:                       │
│                           │  ┌──────────────────────┐   │
│                           │  │ 📅 31/03/2026        │   │
│                           │  └──────────────────────┘   │
│                           │                              │
│                           │  Horário:                    │
│                           │  [09:00] [09:30] [10:00]     │
│                           │  [10:30] [11:00] [13:00]     │
│                           │  (somente horários livres)   │
│                           │                              │
│                           │  Obs (opcional):             │
│                           │  ┌──────────────────────┐   │
│                           │  │                      │   │
│                           │  └──────────────────────┘   │
│                           │                              │
│                           │  [   Agendar   ]             │
│                           │                              │
└───────────────────────────┴──────────────────────────────┘
```

### Layout Mobile — Visão Dia

```
┌──────────────────────────┐
│  ☰  Agenda         🔔 👤 │
├──────────────────────────┤
│ [←] 31 Mar 2026 [→]     │
│ [João ▼]                 │
│                          │
│ 09:00 ┌────────────────┐ │
│       │ Carlos · Corte │ │
│       │ ● Confirmado   │ │
│ 09:30 └────────────────┘ │
│                          │
│ 10:00 ── disponível ──   │
│                          │
│ 10:30 ┌────────────────┐ │
│       │ Rafael · C+B   │ │
│       │ ○ Pendente     │ │
│ 11:00 │                │ │
│ 11:30 └────────────────┘ │
│                          │
│ 12:00 ██ ALMOÇO ████████ │
│                          │
│ 13:00 ── disponível ──   │
│                          │
│        [+ Agendar] (FAB) │
├──────────────────────────┤
│ 📊  📅  👥  ✂  ⚙       │
└──────────────────────────┘
```

### Componentes

| Componente           | Tipo              | Detalhes                                    |
|---------------------|-------------------|---------------------------------------------|
| Navegação de data   | `DatePicker` inline | Setas + clique para abrir calendário       |
| Toggle visão        | `TabBar`          | "Dia" / "Semana"                            |
| Filtro profissional | `Select` / chips  | Filtrar por profissional ou "Todos"         |
| Coluna profissional | `DayColumn`       | Uma coluna por profissional na visão dia    |
| Bloco agendamento   | `AppointmentCard` | Altura proporcional à duração, cor=status   |
| Horário disponível  | `TimeSlot`        | Clicável, abre drawer pré-preenchido        |
| FAB                 | `FloatingButton`  | "+ Agendar", fixo canto inferior direito    |

### Estados

| Estado          | Comportamento                                              |
|----------------|-----------------------------------------------------------|
| Carregando     | `Skeleton` nas colunas dos profissionais                   |
| Sem agendamentos| "Nenhum agendamento hoje" + [+ Agendar primeiro horário]  |
| Dia lotado     | Todos os slots preenchidos, FAB ainda visível              |
| Conflito       | Toast amarelo "Horário já ocupado, escolha outro"          |

---

## 5. Lista de Clientes

### Layout Desktop

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Clientes (342)              [+ Novo Cliente]   │
│  NAV   │                                                 │
│        │  ┌────────────────────────────────────────┐     │
│        │  │ 🔍 Buscar por nome ou telefone          │     │
│        │  └────────────────────────────────────────┘     │
│        │                                                 │
│        │  Filtros rápidos:                               │
│        │  [Todos] [Frequentes] [Sem retorno 30d]         │
│        │  [Aniversariantes] [Novos este mês]             │
│        │                                                 │
│        │  Visão: [Cards] [Tabela]                        │
│        │                                                 │
│        │  ── VISÃO CARDS ──                              │
│        │  ┌──────────────┐ ┌──────────────┐             │
│        │  │ 👤 Carlos M.  │ │ 👤 Rafael S.  │             │
│        │  │ (11)99876-54 │ │ (11)98765-43 │             │
│        │  │ Último: 15/03│ │ Último: 28/03│             │
│        │  │ 12 visitas   │ │ 3 visitas    │             │
│        │  │ ● Frequente  │ │ ○ Novo       │             │
│        │  └──────────────┘ └──────────────┘             │
│        │  ┌──────────────┐ ┌──────────────┐             │
│        │  │ 👤 André L.   │ │ 👤 Marcos V.  │             │
│        │  │ (11)91234-56 │ │ (11)94567-89 │             │
│        │  │ Último: 01/02│ │ Último: 30/03│             │
│        │  │ 8 visitas    │ │ 1 visita     │             │
│        │  │ ⚠ Sem retorno│ │ ○ Novo       │             │
│        │  └──────────────┘ └──────────────┘             │
│        │                                                 │
│        │  ── VISÃO TABELA ──                             │
│        │  ┌────────────────────────────────────────┐     │
│        │  │ Nome     │ Telefone │ Último │ Visitas │     │
│        │  │──────────│──────────│────────│─────────│     │
│        │  │ Carlos M.│ 99876-54 │ 15/03  │ 12      │     │
│        │  │ Rafael S.│ 98765-43 │ 28/03  │ 3       │     │
│        │  │ André L. │ 91234-56 │ 01/02  │ 8       │     │
│        │  └────────────────────────────────────────┘     │
│        │                                                 │
│        │  Mostrando 1-20 de 342   [← 1 2 3 ... 18 →]    │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Componentes

| Componente        | Tipo            | Detalhes                                      |
|------------------|----------------|-----------------------------------------------|
| PageHeader       | `PageHeader`    | Título + contador + botão "Novo Cliente"      |
| Busca            | `SearchInput`   | Debounce 300ms, busca nome e telefone         |
| Filtros rápidos  | `Chip` group    | Seleção exclusiva, pré-filtros salvos         |
| Toggle visão     | `TabBar`        | "Cards" / "Tabela"                            |
| Card cliente     | `ClientCard`    | Avatar, nome, telefone, último atendimento, tag |
| Tabela           | `DataTable`     | Colunas ordenáveis, clique vai para ficha     |
| Paginação        | `Pagination`    | 20 itens por página                           |

### Ações

- Clicar em card/linha vai para Ficha do Cliente
- "+ Novo Cliente" abre Drawer lateral
- Busca filtra em tempo real
- Filtros rápidos são mutuamente exclusivos

### Estados

| Estado          | Comportamento                                                   |
|----------------|----------------------------------------------------------------|
| Carregando     | `Skeleton` cards (6 unidades) ou `Skeleton` tabela (5 linhas)  |
| Sem clientes   | `EmptyState` "Nenhum cliente ainda" + [+ Cadastrar primeiro]   |
| Busca vazia    | "Nenhum resultado para '{termo}'" + [Limpar busca]             |
| Filtro vazio   | "Nenhum cliente nesta categoria" + [Ver todos]                 |

---

## 6. Ficha do Cliente

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  ← Voltar para clientes                         │
│  NAV   │                                                 │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  HEADER RESUMO                           │   │
│        │  │                                          │   │
│        │  │  👤  Carlos Mendes                        │   │
│        │  │      (11) 99876-5432                     │   │
│        │  │      carlos@email.com                    │   │
│        │  │      Cliente desde: Jan/2025             │   │
│        │  │                                          │   │
│        │  │  ┌────────┐ ┌────────┐ ┌────────┐       │   │
│        │  │  │  12    │ │R$540  │ │ 28dias │       │   │
│        │  │  │visitas │ │ gasto │ │  freq. │       │   │
│        │  │  └────────┘ └────────┘ └────────┘       │   │
│        │  │                                          │   │
│        │  │  Tags: [Frequente] [VIP]    [+ Tag]      │   │
│        │  │                                          │   │
│        │  │  [📱 WhatsApp] [📅 Agendar] [✏ Editar]   │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  ABAS: [Histórico] [Planos] [Notas]      │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │                                          │   │
│        │  │  ── ABA HISTÓRICO (Timeline) ──          │   │
│        │  │                                          │   │
│        │  │  ● 28/03  Corte        João   R$45  ✓   │   │
│        │  │  │                                       │   │
│        │  │  ● 01/03  Corte+Barba  João   R$65  ✓   │   │
│        │  │  │                                       │   │
│        │  │  ● 03/02  Corte        Pedro  R$45  ✓   │   │
│        │  │  │                                       │   │
│        │  │  ● 05/01  Corte        João   R$45  ✗   │   │
│        │  │  │         (faltou)                      │   │
│        │  │  │                                       │   │
│        │  │  ● 10/12  Corte+Barba  João   R$65  ✓   │   │
│        │  │                                          │   │
│        │  │  [Carregar mais]                         │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Componentes

| Componente        | Tipo            | Detalhes                                      |
|------------------|----------------|-----------------------------------------------|
| Breadcrumb       | `Breadcrumb`    | "Clientes > Carlos Mendes"                    |
| Header resumo    | Card customizado| Avatar grande, dados de contato, métricas      |
| Mini stats       | `StatCard` x3   | Visitas, gasto total, frequência média        |
| Tags             | `Badge` group   | Coloridas, editáveis, + botão adicionar       |
| Ações rápidas    | `QuickActionBar`| WhatsApp, Agendar, Editar                     |
| Abas             | `TabBar`        | Histórico / Planos / Notas                    |
| Timeline         | `Timeline`      | Data, serviço, profissional, valor, status    |

### Ações Disponíveis

- WhatsApp: abre wa.me com número do cliente
- Agendar: abre Drawer de novo agendamento pré-preenchido com o cliente
- Editar: abre Drawer com dados editáveis do cliente
- Clicar em item da timeline abre detalhe do atendimento
- Adicionar/remover tags
- Mudar entre abas

### Estados

| Estado            | Comportamento                                        |
|------------------|-----------------------------------------------------|
| Carregando       | `Skeleton` header + `Skeleton` timeline             |
| Sem histórico    | `EmptyState` "Nenhum atendimento" + [Agendar agora] |
| Histórico longo  | Paginação com "Carregar mais" (20 por vez)          |
| Cliente inativo  | Banner amarelo "Sem retorno há {X} dias" + CTA      |

---

## 7. Serviços

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Serviços (8)                 [+ Novo Serviço]  │
│  NAV   │                                                 │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  ≡  Corte Masculino                      │   │
│        │  │     ⏱ 30 min  ·  💰 R$ 45,00             │   │
│        │  │     Comissão: 40%                        │   │
│        │  │     Profissionais: João, Pedro            │   │
│        │  │                          [Editar] [···]   │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  ≡  Barba                                │   │
│        │  │     ⏱ 20 min  ·  💰 R$ 30,00             │   │
│        │  │     Comissão: 40%                        │   │
│        │  │     Profissionais: João                   │   │
│        │  │                          [Editar] [···]   │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  ≡  Corte + Barba                        │   │
│        │  │     ⏱ 45 min  ·  💰 R$ 65,00             │   │
│        │  │     Comissão: 40%                        │   │
│        │  │     Profissionais: João, Pedro            │   │
│        │  │                          [Editar] [···]   │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  ≡  Degradê                              │   │
│        │  │     ⏱ 40 min  ·  💰 R$ 55,00             │   │
│        │  │     Comissão: 45%                        │   │
│        │  │     Profissionais: João                   │   │
│        │  │                          [Editar] [···]   │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ≡ = drag handle para reordenar                 │
│        │  ··· = menu: Desativar, Duplicar, Excluir       │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Drawer de Edição de Serviço

```
┌─────────────────────────────────────────────────┐
│                    │ Editar Serviço         [X]  │
│                    │                             │
│                    │ Nome:                       │
│                    │ ┌───────────────────────┐   │
│                    │ │ Corte Masculino       │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ Duração:                    │
│                    │ [15] [20] [30] [45] [60]    │
│                    │                             │
│                    │ Preço:                      │
│                    │ ┌───────────────────────┐   │
│                    │ │ R$ 45,00              │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ Comissão do profissional:   │
│                    │ ┌───────────────────────┐   │
│                    │ │ 40%                   │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ Profissionais habilitados:  │
│                    │ [✓] João                    │
│                    │ [✓] Pedro                   │
│                    │                             │
│                    │ Descrição (opcional):       │
│                    │ ┌───────────────────────┐   │
│                    │ │                       │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ [  Salvar alterações  ]     │
│                    └─────────────────────────────┘
└─────────────────────────────────────────────────┘
```

### Componentes

| Componente     | Tipo            | Detalhes                                       |
|---------------|----------------|------------------------------------------------|
| PageHeader    | `PageHeader`    | Título + contador + botão "Novo Serviço"       |
| Lista         | Sortable list   | Drag-and-drop para reordenar (react-dnd)       |
| Card serviço  | `ServiceCard`   | Nome, duração, preço, comissão, profissionais  |
| Drag handle   | Ícone ≡         | Grab cursor, arrastar para reordenar           |
| Menu ações    | `ActionMenu`    | Desativar, Duplicar, Excluir                   |
| Drawer        | `Drawer`        | Formulário de edição/criação                   |

### Estados

| Estado         | Comportamento                                          |
|---------------|-------------------------------------------------------|
| Carregando    | `Skeleton` cards (4 unidades)                          |
| Sem serviços  | `EmptyState` "Cadastre seu primeiro serviço" + CTA     |
| Arrastando    | Card com sombra elevada, placeholder no destino        |
| Desativado    | Card com opacidade 50%, tag "Inativo"                  |

---

## 8. Profissionais

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Profissionais (3)        [+ Novo Profissional] │
│  NAV   │                                                 │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  👤  João Silva (Você)                    │   │
│        │  │      Barbeiro · Dono                     │   │
│        │  │      Seg a Sex: 08:00-19:00              │   │
│        │  │      Sáb: 08:00-14:00                    │   │
│        │  │                                          │   │
│        │  │      Serviços: Corte, Barba, C+B, Degradê│   │
│        │  │                                          │   │
│        │  │      Hoje: 8/12 horários preenchidos     │   │
│        │  │                                          │   │
│        │  │      [Ver agenda] [Editar] [···]         │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  👤  Pedro Costa                         │   │
│        │  │      Barbeiro                            │   │
│        │  │      Seg a Sáb: 08:00-19:00              │   │
│        │  │                                          │   │
│        │  │      Serviços: Corte, Barba, C+B         │   │
│        │  │                                          │   │
│        │  │      Hoje: 6/12 horários preenchidos     │   │
│        │  │                                          │   │
│        │  │      [Ver agenda] [Editar] [···]         │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  👤  Lucas Almeida                       │   │
│        │  │      Barbeiro · Inativo                  │   │
│        │  │      (desativado em 15/02/2026)          │   │
│        │  │                                          │   │
│        │  │      [Reativar] [···]                    │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Drawer de Edição

```
┌─────────────────────────────────────────────────┐
│                    │ Editar Profissional    [X]  │
│                    │                             │
│                    │ ┌───────────┐               │
│                    │ │  📷 Foto  │               │
│                    │ └───────────┘               │
│                    │                             │
│                    │ Nome:                       │
│                    │ ┌───────────────────────┐   │
│                    │ │ Pedro Costa           │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ Apelido:                    │
│                    │ ┌───────────────────────┐   │
│                    │ │ Pedrão               │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ Telefone:                   │
│                    │ ┌───────────────────────┐   │
│                    │ │ (11) 98765-4321       │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ Horários:                   │
│                    │ Seg [✓] 08:00 — 19:00       │
│                    │ Ter [✓] 08:00 — 19:00       │
│                    │ Qua [✓] 08:00 — 19:00       │
│                    │ Qui [✓] 08:00 — 19:00       │
│                    │ Sex [✓] 08:00 — 19:00       │
│                    │ Sáb [✓] 08:00 — 14:00       │
│                    │ Dom [ ]                     │
│                    │                             │
│                    │ Serviços habilitados:       │
│                    │ [✓] Corte      R$45         │
│                    │ [✓] Barba      R$30         │
│                    │ [✓] Corte+Barba R$65        │
│                    │ [ ] Degradê    R$55         │
│                    │ [ ] Pigmentação R$80        │
│                    │                             │
│                    │ Comissão padrão:            │
│                    │ ┌───────────────────────┐   │
│                    │ │ 40%                   │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ [  Salvar  ]                │
│                    └─────────────────────────────┘
└─────────────────────────────────────────────────┘
```

### Componentes

| Componente          | Tipo               | Detalhes                                  |
|--------------------|--------------------|--------------------------------------------|
| PageHeader         | `PageHeader`       | Título + contador + botão novo             |
| Card profissional  | `ProfessionalCard` | Avatar, nome, cargo, horários, serviços    |
| Status ocupação    | `Badge`            | "8/12 horários" com barra de progresso     |
| Ações              | Botões inline      | Ver agenda, Editar, Menu                   |
| Menu ···           | `ActionMenu`       | Desativar, Folga, Férias, Excluir          |

### Estados

| Estado         | Comportamento                                            |
|---------------|----------------------------------------------------------|
| Carregando    | `Skeleton` cards                                          |
| Sem profissional| `EmptyState` "Adicione seu primeiro profissional" + CTA |
| Inativo       | Card com opacidade reduzida, tag "Inativo"                |
| Em férias     | Card com tag "Férias até DD/MM"                           |

---

## 9. Campanhas

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Campanhas                  [+ Nova Campanha]   │
│  NAV   │                                                 │
│        │  TEMPLATES PRONTOS                              │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  ┌────────────┐ ┌────────────┐           │   │
│        │  │  │ 📢 Retorno │ │ 🎂 Anivers. │           │   │
│        │  │  │ "Faz tempo │ │ "Parabéns! │           │   │
│        │  │  │  que não   │ │  Ganhe 15% │           │   │
│        │  │  │  vem..."   │ │  de desc." │           │   │
│        │  │  │ [Usar]     │ │ [Usar]     │           │   │
│        │  │  └────────────┘ └────────────┘           │   │
│        │  │  ┌────────────┐ ┌────────────┐           │   │
│        │  │  │ 💈 Lançam. │ │ ⭐ Fidelidde│           │   │
│        │  │  │ "Novo ser- │ │ "Você com- │           │   │
│        │  │  │  viço!"    │ │  pletou 10 │           │   │
│        │  │  │ [Usar]     │ │  cortes!"  │           │   │
│        │  │  │ [Usar]     │ │ [Usar]     │           │   │
│        │  │  └────────────┘ └────────────┘           │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  MINHAS CAMPANHAS                               │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Campanha Retorno Março                   │   │
│        │  │  Segmento: Sem retorno > 30 dias          │   │
│        │  │  Alcance: 23 clientes                     │   │
│        │  │  Canal: WhatsApp                          │   │
│        │  │  Status: ● Enviada (18/03)                │   │
│        │  │  Resultado: 8 agendaram (35%)             │   │
│        │  │                       [Ver detalhes]      │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  Aniversariantes Março                    │   │
│        │  │  Segmento: Aniversário no mês             │   │
│        │  │  Alcance: 5 clientes                      │   │
│        │  │  Canal: WhatsApp                          │   │
│        │  │  Status: ○ Rascunho                       │   │
│        │  │                  [Editar] [Enviar agora]  │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Drawer de Nova Campanha

```
┌──────────────────────────────────────────────────────────┐
│                           │  Nova Campanha          [X]  │
│                           │                              │
│                           │  Nome da campanha:           │
│                           │  ┌──────────────────────┐   │
│                           │  │                      │   │
│                           │  └──────────────────────┘   │
│                           │                              │
│                           │  Segmentação:                │
│                           │  [Sem retorno > 30d]         │
│                           │  [Aniversariantes]           │
│                           │  [Frequentes]                │
│                           │  [Todos]                     │
│                           │  [Personalizado ▼]           │
│                           │                              │
│                           │  Preview: 23 clientes        │
│                           │                              │
│                           │  Mensagem:                   │
│                           │  ┌──────────────────────┐   │
│                           │  │ Olá {nome}! Faz      │   │
│                           │  │ tempo que não te      │   │
│                           │  │ vemos. Que tal um     │   │
│                           │  │ corte? Agende aqui:   │   │
│                           │  │ {link_agendamento}    │   │
│                           │  └──────────────────────┘   │
│                           │  Variáveis: {nome} {link}   │
│                           │                              │
│                           │  Canal:                      │
│                           │  (●) WhatsApp                │
│                           │  ( ) SMS                     │
│                           │                              │
│                           │  CTA (botão na mensagem):   │
│                           │  ┌──────────────────────┐   │
│                           │  │ Agendar agora        │   │
│                           │  └──────────────────────┘   │
│                           │                              │
│                           │  [Salvar rascunho]           │
│                           │  [Enviar agora]              │
│                           │                              │
└───────────────────────────┴──────────────────────────────┘
```

### Componentes

| Componente        | Tipo             | Detalhes                                  |
|------------------|-----------------|-------------------------------------------|
| Templates        | `CampaignCard`   | Ícone, título, preview, botão "Usar"     |
| Lista campanhas  | Cards empilhados | Nome, segmento, alcance, status, resultado|
| StatusChip       | `StatusChip`     | Enviada (verde), Rascunho (cinza), Agendada (amarelo) |
| Drawer criação   | `Drawer`         | Formulário com segmentação, mensagem, CTA |
| Segmentação      | `Chip` group     | Filtros pré-definidos + personalizado     |
| Preview alcance  | Badge/texto      | "23 clientes" com atualização em tempo real |

### Estados

| Estado            | Comportamento                                          |
|------------------|-------------------------------------------------------|
| Sem campanhas    | `EmptyState` "Envie sua primeira campanha" + templates |
| Rascunho         | Botões "Editar" e "Enviar agora"                      |
| Enviando         | Spinner + "Enviando para 23 clientes..."              |
| Enviada          | Métricas de resultado (taxa de conversão)              |
| Erro de envio    | Toast vermelho + opção "Reenviar"                      |

---

## 10. Planos e Combos

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Planos e Combos               [+ Novo Plano]   │
│  NAV   │                                                 │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  🎁  Plano Fidelidade                    │   │
│        │  │      4 cortes por R$ 150,00              │   │
│        │  │      (economia de R$ 30,00)              │   │
│        │  │      Validade: 60 dias                   │   │
│        │  │                                          │   │
│        │  │      ┌─────────────────────────────┐     │   │
│        │  │      │ 12 vendidos · 8 ativos      │     │   │
│        │  │      │ R$ 1.800 faturado           │     │   │
│        │  │      └─────────────────────────────┘     │   │
│        │  │                                          │   │
│        │  │      [Ver clientes] [Editar] [···]       │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  🎁  Combo Pai & Filho                   │   │
│        │  │      2 cortes por R$ 75,00               │   │
│        │  │      (economia de R$ 15,00)              │   │
│        │  │      Validade: 30 dias                   │   │
│        │  │                                          │   │
│        │  │      ┌─────────────────────────────┐     │   │
│        │  │      │ 5 vendidos · 3 ativos       │     │   │
│        │  │      │ R$ 375 faturado             │     │   │
│        │  │      └─────────────────────────────┘     │   │
│        │  │                                          │   │
│        │  │      [Ver clientes] [Editar] [···]       │   │
│        │  ├──────────────────────────────────────────┤   │
│        │  │  🎁  Assinatura Mensal                   │   │
│        │  │      Cortes ilimitados R$ 120,00/mês     │   │
│        │  │      Renovação automática                │   │
│        │  │                                          │   │
│        │  │      ┌─────────────────────────────┐     │   │
│        │  │      │ 3 assinantes ativos         │     │   │
│        │  │      │ R$ 360/mês recorrente       │     │   │
│        │  │      └─────────────────────────────┘     │   │
│        │  │                                          │   │
│        │  │      [Ver clientes] [Editar] [···]       │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Drawer "Ver Clientes" do Plano

```
┌─────────────────────────────────────────────────┐
│                    │ Plano Fidelidade       [X]  │
│                    │ Clientes vinculados          │
│                    │                             │
│                    │ ┌───────────────────────┐   │
│                    │ │ 👤 Carlos M.           │   │
│                    │ │   Comprou: 10/03       │   │
│                    │ │   Usos: 2/4            │   │
│                    │ │   Expira: 10/05        │   │
│                    │ │   ████░░░░ 50%         │   │
│                    │ ├───────────────────────┤   │
│                    │ │ 👤 Rafael S.           │   │
│                    │ │   Comprou: 20/03       │   │
│                    │ │   Usos: 1/4            │   │
│                    │ │   Expira: 20/05        │   │
│                    │ │   ██░░░░░░ 25%         │   │
│                    │ ├───────────────────────┤   │
│                    │ │ 👤 André L.            │   │
│                    │ │   Comprou: 01/02       │   │
│                    │ │   Usos: 4/4 ✓         │   │
│                    │ │   Concluído           │   │
│                    │ │   ████████ 100%        │   │
│                    │ └───────────────────────┘   │
│                    │                             │
│                    │ [+ Vender para cliente]      │
│                    └─────────────────────────────┘
└─────────────────────────────────────────────────┘
```

### Componentes

| Componente       | Tipo          | Detalhes                                       |
|-----------------|--------------|------------------------------------------------|
| PlanCard        | `PlanCard`    | Nome, descrição, preço, economia, validade     |
| Métricas        | Mini stats    | Vendidos, ativos, faturamento                  |
| Barra progresso | Progress bar  | Usos do plano (ex: 2/4)                       |
| Lista clientes  | `ClientCard`  | Dentro do drawer, com dados de uso do plano    |
| Menu ···        | `ActionMenu`  | Desativar, Duplicar, Excluir                   |

### Estados

| Estado          | Comportamento                                        |
|----------------|-----------------------------------------------------|
| Sem planos     | `EmptyState` "Crie pacotes para fidelizar clientes"  |
| Plano expirado | Badge "Expirado" no card do cliente vinculado        |
| Plano completo | Badge "Concluído" + barra 100% verde                |

---

## 11. Financeiro

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Financeiro                                     │
│  NAV   │                                                 │
│        │  Período: [Hoje] [Semana] [Mês] [Personalizado] │
│        │                                                 │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│        │  │R$1.240  │ │R$4.860  │ │R$18.200 │          │
│        │  │ Hoje    │ │ Semana  │ │  Mês    │          │
│        │  │ ▲ 12%   │ │ ▲ 8%   │ │ ▲ 15%  │          │
│        │  └─────────┘ └─────────┘ └─────────┘          │
│        │                                                 │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│        │  │R$7.280  │ │  156    │ │ R$117   │          │
│        │  │Comissões│ │Atendim. │ │ Ticket  │          │
│        │  │  mês    │ │  mês    │ │ médio   │          │
│        │  └─────────┘ └─────────┘ └─────────┘          │
│        │                                                 │
│        │  RECEITA DIÁRIA (últimos 30 dias)               │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │     ╭─╮                                  │   │
│        │  │   ╭─╯ ╰─╮    ╭──╮      ╭──╮             │   │
│        │  │ ╭─╯     ╰──╮╭╯  ╰─╮  ╭╯  ╰─╮           │   │
│        │  │ ╯          ╰╯     ╰──╯     ╰──          │   │
│        │  │ 01   05   10   15   20   25   30         │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  RECEITA POR SERVIÇO                            │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Corte        ████████████  R$ 8.100     │   │
│        │  │  Corte+Barba  ██████████    R$ 6.500     │   │
│        │  │  Barba        ████          R$ 2.400     │   │
│        │  │  Degradê      ███           R$ 1.200     │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  RECEITA POR PROFISSIONAL                       │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  João    ████████████████  R$ 11.200     │   │
│        │  │  Pedro   ██████████        R$ 7.000      │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  FORMAS DE PAGAMENTO (mês)                      │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │      ┌──────┐                            │   │
│        │  │      │ PIX  │  52%  R$ 9.464             │   │
│        │  │      │Créd. │  28%  R$ 5.096             │   │
│        │  │      │Déb.  │  12%  R$ 2.184             │   │
│        │  │      │Dinh. │   8%  R$ 1.456             │   │
│        │  │      └──────┘                            │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Componentes

| Componente           | Tipo           | Detalhes                                  |
|---------------------|----------------|-------------------------------------------|
| Filtro período      | `TabBar`       | Hoje, Semana, Mês, Personalizado          |
| Cards resumo        | `StatCard` x6  | Valor, label, variação % com seta         |
| Gráfico linha       | Chart (recharts)| Receita diária dos últimos 30 dias       |
| Barras horizontais  | Horizontal bar | Receita por serviço e por profissional    |
| Donut/pizza         | Pie chart      | Formas de pagamento                       |

### Estados

| Estado           | Comportamento                                     |
|-----------------|--------------------------------------------------|
| Carregando      | `Skeleton` cards + `Skeleton` gráficos            |
| Sem dados       | `EmptyState` "Sem movimentação neste período"     |
| Período vazio   | Cards zerados + gráficos flat                     |
| Comparação      | Seta ▲ verde (cresceu) ou ▼ vermelho (caiu)       |

---

## 12. Relatórios

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Relatórios                                     │
│  NAV   │                                                 │
│        │  Período: [Semana] [Mês] [Trimestre] [Custom]   │
│        │                                                 │
│        │  ── VISÃO GERAL ──                              │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│        │  │  156    │ │  92%    │ │  8%     │          │
│        │  │Atendim. │ │Ocupação │ │ Faltas  │          │
│        │  │ ▲ 12%   │ │ ▲ 5%   │ │ ▼ 3%   │          │
│        │  └─────────┘ └─────────┘ └─────────┘          │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│        │  │  42     │ │  18     │ │  85%    │          │
│        │  │Clientes │ │ Novos   │ │Retenção │          │
│        │  │ únicos  │ │clientes │ │         │          │
│        │  └─────────┘ └─────────┘ └─────────┘          │
│        │                                                 │
│        │  ── ATENDIMENTOS POR DIA DA SEMANA ──           │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Seg  ████████████  28                    │   │
│        │  │  Ter  ██████████    22                    │   │
│        │  │  Qua  ████████████  26                    │   │
│        │  │  Qui  ██████████████ 32                   │   │
│        │  │  Sex  ████████████████ 36                 │   │
│        │  │  Sáb  ██████████    20                    │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ── HORÁRIOS DE PICO ──                         │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Hora  │ Seg │ Ter │ Qua │ Qui │ Sex │   │   │
│        │  │  09:00 │ 🟢  │ 🟢  │ 🟡  │ 🟢  │ 🟢  │   │   │
│        │  │  10:00 │ 🟢  │ 🟡  │ 🟢  │ 🟢  │ 🟢  │   │   │
│        │  │  11:00 │ 🟡  │ 🔴  │ 🟡  │ 🟡  │ 🟢  │   │   │
│        │  │  14:00 │ 🟢  │ 🟢  │ 🟢  │ 🟢  │ 🟢  │   │   │
│        │  │  15:00 │ 🔴  │ 🔴  │ 🔴  │ 🟡  │ 🟡  │   │   │
│        │  │  16:00 │ 🔴  │ 🟡  │ 🔴  │ 🔴  │ 🔴  │   │   │
│        │  │  17:00 │ 🟡  │ 🟡  │ 🟡  │ 🔴  │ 🔴  │   │   │
│        │  │                                          │   │
│        │  │  🟢 Alta demanda  🟡 Média  🔴 Baixa     │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ── TOP SERVIÇOS ──                             │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │ 1. Corte Masculino     72x   R$ 3.240    │   │
│        │  │ 2. Corte + Barba       45x   R$ 2.925    │   │
│        │  │ 3. Barba               28x   R$ 840      │   │
│        │  │ 4. Degradê             11x   R$ 605      │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ── TOP PROFISSIONAIS ──                        │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │ 👤 João   96 atend.  95% ocup.  4.8★     │   │
│        │  │ 👤 Pedro  60 atend.  88% ocup.  4.6★     │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  [Exportar PDF]  [Exportar CSV]                 │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Componentes

| Componente           | Tipo            | Detalhes                                 |
|---------------------|----------------|------------------------------------------|
| Filtro período      | `TabBar`        | Semana, Mês, Trimestre, Custom           |
| Cards métricas      | `StatCard` x6   | Valor, label, variação %                 |
| Barras dia da semana| Horizontal bar  | Atendimentos por dia                     |
| Heatmap horários    | Tabela colorida | Demanda por hora x dia (verde/amarelo/vermelho) |
| Ranking serviços    | Lista ordenada  | Posição, nome, quantidade, receita       |
| Ranking profissionais| Lista ordenada | Avatar, nome, atendimentos, ocupação, nota |
| Botões exportar     | `Button` x2     | PDF e CSV                                |

### Estados

| Estado          | Comportamento                                        |
|----------------|-----------------------------------------------------|
| Carregando     | `Skeleton` em todos os blocos                        |
| Sem dados      | `EmptyState` "Sem dados para este período"           |
| Exportando     | Toast "Gerando relatório..." + download automático   |

---

## 13. Configurações

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  BarberFlow                🔔   👤 João              │
├────────┬─────────────────────────────────────────────────┤
│        │  Configurações                                  │
│  NAV   │                                                 │
│        │  [Unidade] [Horários] [Políticas] [Notificações]│
│        │                                                 │
│        │  ══════════════════════════════════════════      │
│        │                                                 │
│        │  ── ABA UNIDADE ──                              │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Logo: [📷 logo.png] [Alterar]           │   │
│        │  │                                          │   │
│        │  │  Nome: ┌────────────────────────┐        │   │
│        │  │        │ Barbearia do João      │        │   │
│        │  │        └────────────────────────┘        │   │
│        │  │                                          │   │
│        │  │  Telefone: ┌────────────────────┐        │   │
│        │  │            │ (11) 99876-5432    │        │   │
│        │  │            └────────────────────┘        │   │
│        │  │                                          │   │
│        │  │  Endereço: ┌────────────────────┐        │   │
│        │  │            │ Rua das Flores, 123│        │   │
│        │  │            └────────────────────┘        │   │
│        │  │                                          │   │
│        │  │  Link de agendamento:                    │   │
│        │  │  barberflow.com/barbearia-do-joao        │   │
│        │  │  [Copiar link] [QR Code]                 │   │
│        │  │                                          │   │
│        │  │  [Salvar alterações]                     │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ── ABA HORÁRIOS ──                             │
│        │  (mesma estrutura da Etapa 3 do Onboarding)     │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Segunda  [✓]  08:00 ── 19:00            │   │
│        │  │  Terça    [✓]  08:00 ── 19:00            │   │
│        │  │  ...                                     │   │
│        │  │  Domingo  [ ]  ──────                    │   │
│        │  │                                          │   │
│        │  │  Intervalo: [✓] 12:00 ── 13:00           │   │
│        │  │                                          │   │
│        │  │  Intervalo entre agendamentos:            │   │
│        │  │  [0 min] [5 min] [10 min] [15 min]       │   │
│        │  │                                          │   │
│        │  │  [Salvar alterações]                     │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ── ABA POLÍTICAS ──                            │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Antecedência mínima para agendar:       │   │
│        │  │  [1h] [2h] [4h] [12h] [24h]              │   │
│        │  │                                          │   │
│        │  │  Cancelamento até:                       │   │
│        │  │  [1h antes] [2h antes] [24h antes]       │   │
│        │  │                                          │   │
│        │  │  Máximo de faltas antes de bloquear:     │   │
│        │  │  [2] [3] [5] [Nunca bloquear]            │   │
│        │  │                                          │   │
│        │  │  Confirmar agendamento automaticamente:   │   │
│        │  │  [✓] Sim, confirmar na criação            │   │
│        │  │                                          │   │
│        │  │  [Salvar alterações]                     │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ── ABA NOTIFICAÇÕES ──                         │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │  Lembrete de agendamento:                │   │
│        │  │  [✓] WhatsApp   [24h antes] [2h antes]   │   │
│        │  │                                          │   │
│        │  │  Confirmação de agendamento:             │   │
│        │  │  [✓] WhatsApp                            │   │
│        │  │                                          │   │
│        │  │  Aviso de cancelamento:                  │   │
│        │  │  [✓] WhatsApp   [✓] Push                 │   │
│        │  │                                          │   │
│        │  │  Resumo diário (para o dono):            │   │
│        │  │  [✓] Email   Horário: [08:00]            │   │
│        │  │                                          │   │
│        │  │  [Salvar alterações]                     │   │
│        │  └──────────────────────────────────────────┘   │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Componentes

| Componente        | Tipo          | Detalhes                                    |
|------------------|--------------|---------------------------------------------|
| Abas             | `TabBar`      | Unidade, Horários, Políticas, Notificações  |
| Formulário unidade| Fieldset     | Inputs + FileUpload para logo               |
| Horários         | `DayScheduleRow` x7 | Reutiliza do onboarding               |
| Políticas        | Chip selectors| Opções pré-definidas, seleção exclusiva     |
| Notificações     | Toggle list  | Cada canal com toggles e configurações      |
| Botão salvar     | `Button`      | Fixo no bottom de cada aba                  |

### Estados

| Estado          | Comportamento                                    |
|----------------|--------------------------------------------------|
| Carregando     | `Skeleton` nos campos                             |
| Alteração      | Botão "Salvar" destaca (muda de cinza para azul)  |
| Salvando       | Spinner no botão                                  |
| Salvo          | Toast verde "Configurações salvas com sucesso"    |
| Erro           | Toast vermelho + campos com erro destacados       |

---

## 14. Página Pública de Agendamento

### Layout (Wizard 6 Etapas)

Esta página é acessada pelo cliente via link público (barberflow.com/barbearia-do-joao). Design limpo, sem sidebar, focado na conversão.

#### Estrutura Geral

```
┌──────────────────────────────────────────────┐
│  ✂ Barbearia do João                        │
│  Rua das Flores, 123 · (11) 99876-5432      │
├──────────────────────────────────────────────┤
│                                              │
│  ●───●───○───○───○───○                       │
│  1     2    3    4    5    6                  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │        [CONTEÚDO DA ETAPA]           │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  [← Voltar]                    [Próximo →]   │
│                                              │
├──────────────────────────────────────────────┤
│  Powered by BarberFlow                       │
└──────────────────────────────────────────────┘
```

#### Etapa 1 — Serviço

```
┌──────────────────────────────────────────────┐
│  Escolha o serviço:                          │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  ✂  Corte Masculino                  │    │
│  │     30 min  ·  R$ 45,00              │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  ✂  Barba                            │    │
│  │     20 min  ·  R$ 30,00              │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  ✂  Corte + Barba                    │    │
│  │     45 min  ·  R$ 65,00              │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  ✂  Degradê                          │    │
│  │     40 min  ·  R$ 55,00              │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

Cards grandes, clicáveis, full-width. Seleção exclusiva. Card selecionado com borda primária.

#### Etapa 2 — Profissional

```
┌──────────────────────────────────────────────┐
│  Escolha o profissional:                     │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  🔄  Qualquer disponível             │    │
│  │     (primeira vaga livre)            │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  👤  João Silva                      │    │
│  │     Barbeiro · 4.8 ★                │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  👤  Pedro Costa                     │    │
│  │     Barbeiro · 4.6 ★                │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

Mostra somente profissionais que atendem o serviço selecionado. Opção "Qualquer disponível" sempre no topo.

#### Etapa 3 — Data

```
┌──────────────────────────────────────────────┐
│  Escolha a data:                             │
│                                              │
│     ◀  Março 2026  ▶                         │
│                                              │
│  Dom  Seg  Ter  Qua  Qui  Sex  Sáb          │
│                                              │
│              1    2    3    4    5            │
│   6    7    8    9   10   11   12            │
│  13   14   15   16   17   18   19            │
│  20   21   22   23   24   25   26            │
│  27   28   29   30  [31]                     │
│                                              │
│  Dias sem disponibilidade ficam              │
│  desabilitados (cinza claro).                │
│  Domingos desabilitados se barbearia         │
│  não abre.                                   │
│                                              │
└──────────────────────────────────────────────┘
```

Calendário mensal. Dias passados e sem vaga desabilitados. Dia selecionado com fundo primário.

#### Etapa 4 — Horário

```
┌──────────────────────────────────────────────┐
│  Horários disponíveis para 31/03:            │
│                                              │
│  MANHÃ                                       │
│  [09:00]  [09:30]  [10:00]                   │
│  [10:30]  [11:00]  [11:30]                   │
│                                              │
│  TARDE                                       │
│  [13:00]  [13:30]  [14:00]                   │
│  [14:30]  [15:00]  [15:30]                   │
│  [16:00]  [16:30]  [17:00]                   │
│  [17:30]  [18:00]  [18:30]                   │
│                                              │
│  Horários já ocupados não aparecem.          │
│                                              │
└──────────────────────────────────────────────┘
```

Grid de botões com horários disponíveis. Agrupados por período (Manhã/Tarde). Seleção exclusiva.

#### Etapa 5 — Dados do Cliente

```
┌──────────────────────────────────────────────┐
│  Seus dados:                                 │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │ Nome completo *                    │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │ WhatsApp * (para confirmação)      │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │ Email (opcional)                   │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │ Observações (opcional)             │      │
│  └────────────────────────────────────┘      │
│                                              │
│  Se cliente já cadastrado (telefone          │
│  reconhecido), preenche nome automático.     │
│                                              │
└──────────────────────────────────────────────┘
```

Mínimo de campos. Telefone com máscara. Auto-detect de cliente existente pelo telefone.

#### Etapa 6 — Confirmação

```
┌──────────────────────────────────────────────┐
│  Confirme seu agendamento:                   │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │                                    │      │
│  │  ✂  Corte Masculino               │      │
│  │  👤  João Silva                    │      │
│  │  📅  31/03/2026 (terça-feira)      │      │
│  │  🕐  09:00 — 09:30                 │      │
│  │  💰  R$ 45,00                      │      │
│  │                                    │      │
│  │  📍  Barbearia do João             │      │
│  │      Rua das Flores, 123           │      │
│  │                                    │      │
│  └────────────────────────────────────┘      │
│                                              │
│  [     Confirmar Agendamento     ]           │
│                                              │
│  Ao confirmar, você receberá uma             │
│  mensagem de confirmação no WhatsApp.        │
│                                              │
└──────────────────────────────────────────────┘
```

#### Tela de Sucesso (pós-confirmação)

```
┌──────────────────────────────────────────────┐
│                                              │
│            ✓ Agendamento                     │
│              confirmado!                     │
│                                              │
│     Você receberá um lembrete no             │
│     WhatsApp 24h antes.                      │
│                                              │
│     ┌────────────────────────────┐           │
│     │ Adicionar ao calendário    │           │
│     └────────────────────────────┘           │
│     ┌────────────────────────────┐           │
│     │ Agendar outro horário      │           │
│     └────────────────────────────┘           │
│                                              │
│     Precisa cancelar?                        │
│     Use o link no WhatsApp.                  │
│                                              │
└──────────────────────────────────────────────┘
```

### Componentes da Página Pública

| Componente        | Tipo            | Detalhes                                   |
|------------------|----------------|---------------------------------------------|
| Header público   | Customizado      | Logo, nome, endereço da barbearia          |
| Progress bar     | Steps            | 6 etapas com indicador de progresso        |
| Card serviço     | `ServiceCard`    | Nome, duração, preço — full width, clicável|
| Card profissional| `ProfessionalCard` | Avatar, nome, nota — full width          |
| Calendário       | `CalendarGrid`   | Mensal, dias desabilitados/habilitados     |
| Grid horários    | `TimeSlot` grid  | Botões agrupados por período               |
| Formulário       | Form fields      | Nome, WhatsApp, Email, Obs                 |
| Resumo           | Card destaque    | Todos os dados escolhidos                  |
| Footer           | "Powered by"     | Branding do BarberFlow                     |

### Estados da Página Pública

| Estado             | Comportamento                                        |
|-------------------|-----------------------------------------------------|
| Carregando serviços| `Skeleton` cards                                    |
| Sem disponibilidade| "Sem horários para este dia" + sugestão de outro dia |
| Enviando          | Spinner no botão "Confirmar"                         |
| Sucesso           | Tela de confirmação com CTA                          |
| Erro              | Toast "Erro ao agendar. Tente novamente."            |
| Link inválido     | "Barbearia não encontrada" + link para home          |
| Barbearia fechada | "Não estamos aceitando agendamentos no momento"      |

---

## Resumo de Padrões UX Transversais

### Padrão de Layout

| Viewport     | Sidebar   | Navegação          | Conteúdo          |
|-------------|-----------|--------------------|--------------------|
| Desktop ≥1024| Fixa 240px| Sidebar esquerda   | Área principal     |
| Tablet 768-1023| Recolhível| Hamburger + sidebar overlay | Full width |
| Mobile <768  | Oculta    | Bottom tab bar (5 itens) | Full width    |

### Bottom Tab Bar (Mobile)

```
┌──────────────────────────────────────┐
│  📊       📅       👥       ✂       ⚙  │
│ Painel   Agenda  Clientes Serviços Config│
└──────────────────────────────────────┘
```

### Drawer Lateral Padrão

- Largura: 420px desktop, 100% mobile
- Animação: slide da direita, 200ms ease-out
- Overlay escuro no fundo (clique fora fecha)
- Botão X no topo direito
- Botão primário fixo no bottom

### Empty State Padrão

```
┌──────────────────────────────────────┐
│                                      │
│         [ilustração simples]         │
│                                      │
│     Título descritivo                │
│     "Nenhum {item} ainda"           │
│                                      │
│     Descrição breve                  │
│     "Comece adicionando seu          │
│      primeiro {item}"               │
│                                      │
│     [  CTA Primário  ]              │
│                                      │
└──────────────────────────────────────┘
```

### Padrão de Toast/Notificação

```
┌──────────────────────────────────────┐
│  ✓  Ação realizada com sucesso  [X] │  ← verde, top-right
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ✗  Erro ao processar. Tente de     │  ← vermelho, top-right
│     novo.                    [X]    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ⚠  Atenção: 3 clientes sem         │  ← amarelo, top-right
│     retorno.          [Ver]  [X]    │
└──────────────────────────────────────┘
```

- Auto-dismiss: 5 segundos (sucesso), persistente (erro)
- Empilháveis: máximo 3 visíveis

### Padrão de Confirmação Destrutiva

```
┌──────────────────────────────────────┐
│  Cancelar agendamento?              │
│                                      │
│  Esta ação não pode ser desfeita.    │
│  O cliente será notificado.          │
│                                      │
│  [Manter]         [Sim, cancelar]   │
│   (outline)        (vermelho)       │
└──────────────────────────────────────┘
```

---

*Documento gerado para o projeto BarberFlow. Todos os wireframes seguem os princípios mobile-first, cards grandes e clicáveis, mínimo texto com máximo seleção visual, e 1-3 cliques por ação principal.*
