# BarberFlow — Estrutura de Componentes UI (React)

> Documento 05 | Versao 1.0 | Marco 2026
> Stack: React + TypeScript + Tailwind CSS + Radix UI (primitivos) + Recharts (graficos)

---

## Organizacao de Pastas

```
src/
  components/
    layout/
    navigation/
    data-display/
    forms/
    feedback/
    overlay/
    calendar/
    business/
    actions/
```

---

## 1. Layout

### 1.1 AppShell

O container raiz que orquestra sidebar, topbar e area de conteudo.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `children` | `ReactNode` | Conteudo da pagina |
| `sidebarCollapsed` | `boolean` | Sidebar recolhida ou expandida |
| `onToggleSidebar` | `() => void` | Callback ao alternar sidebar |

**Variantes**: Desktop (sidebar fixa), Tablet (sidebar overlay), Mobile (bottom tab bar).

**Onde e usado**: Wrapper de todas as paginas autenticadas.

```tsx
<AppShell>
  <PageHeader title="Dashboard" />
  <PageContent>
    {/* conteudo da pagina */}
  </PageContent>
</AppShell>
```

---

### 1.2 Sidebar

Navegacao lateral com itens agrupados e indicador de pagina ativa.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `items` | `NavItem[]` | Lista de itens de navegacao |
| `activeRoute` | `string` | Rota ativa atual |
| `collapsed` | `boolean` | Modo recolhido (so icones) |
| `onClose` | `() => void` | Fecha sidebar (mobile/tablet) |
| `userName` | `string` | Nome do usuario logado |
| `unitName` | `string` | Nome da barbearia |

**Variantes**: `expanded` (240px, icone + texto), `collapsed` (64px, so icone), `overlay` (mobile, 100% width com backdrop).

**Onde e usado**: Dentro de `AppShell`, em todas as paginas autenticadas.

```tsx
<Sidebar
  items={navigationItems}
  activeRoute="/dashboard"
  collapsed={false}
  userName="Joao"
  unitName="Barbearia do Joao"
/>
```

---

### 1.3 TopBar

Barra superior com hamburger, logo, notificacoes e avatar do usuario.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `onMenuClick` | `() => void` | Abre/fecha sidebar |
| `notificationCount` | `number` | Quantidade de notificacoes nao lidas |
| `user` | `{ name: string; avatar?: string }` | Dados do usuario |
| `onNotificationClick` | `() => void` | Abre painel de notificacoes |
| `onProfileClick` | `() => void` | Abre menu do perfil |

**Variantes**: Desktop (com breadcrumb), Mobile (simplificado).

**Onde e usado**: Dentro de `AppShell`, topo de todas as paginas.

```tsx
<TopBar
  onMenuClick={toggleSidebar}
  notificationCount={3}
  user={{ name: "Joao", avatar: "/img/joao.jpg" }}
/>
```

---

### 1.4 PageHeader

Cabecalho padrao de cada pagina com titulo, contador opcional e acoes.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `title` | `string` | Titulo da pagina |
| `count` | `number?` | Contador ao lado do titulo (ex: "Clientes (342)") |
| `subtitle` | `string?` | Subtitulo ou descricao |
| `actions` | `ReactNode?` | Botoes de acao (canto direito) |
| `breadcrumb` | `BreadcrumbItem[]?` | Itens do breadcrumb |
| `backTo` | `{ label: string; href: string }?` | Link de voltar |

**Variantes**: Simples (so titulo), completo (titulo + contador + acoes + breadcrumb).

**Onde e usado**: Topo de todas as paginas de conteudo.

```tsx
<PageHeader
  title="Clientes"
  count={342}
  actions={<Button onClick={openNewClient}>+ Novo Cliente</Button>}
  breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]}
/>
```

---

### 1.5 PageContent

Container do conteudo principal com padding e max-width consistentes.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `children` | `ReactNode` | Conteudo da pagina |
| `fullWidth` | `boolean?` | Remove max-width (para agenda, por exemplo) |
| `noPadding` | `boolean?` | Remove padding interno |

**Onde e usado**: Dentro de `AppShell`, envolvendo o conteudo de cada pagina.

```tsx
<PageContent>
  <div className="grid grid-cols-3 gap-4">
    {/* cards */}
  </div>
</PageContent>
```

---

## 2. Navigation

### 2.1 NavItem

Item individual da sidebar de navegacao.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `icon` | `ReactNode` | Icone do item (Lucide icons) |
| `label` | `string` | Texto do item |
| `href` | `string` | Rota de destino |
| `isActive` | `boolean` | Se e a pagina ativa |
| `badge` | `number?` | Badge com contador (ex: notificacoes) |
| `collapsed` | `boolean` | Modo so-icone |

**Variantes**: `default`, `active` (fundo primario + texto branco), `with-badge`.

**Onde e usado**: Dentro de `Sidebar` e `NavGroup`.

```tsx
<NavItem
  icon={<CalendarIcon />}
  label="Agenda"
  href="/agenda"
  isActive={true}
  badge={2}
/>
```

---

### 2.2 NavGroup

Agrupamento logico de itens de navegacao com titulo de secao.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `title` | `string?` | Titulo do grupo (ex: "Principal", "Gestao") |
| `items` | `NavItem[]` | Itens do grupo |
| `collapsible` | `boolean?` | Se o grupo pode ser recolhido |

**Onde e usado**: Dentro de `Sidebar`, para organizar itens por secao.

```tsx
<NavGroup title="Principal">
  <NavItem icon={<LayoutDashboard />} label="Dashboard" href="/dashboard" />
  <NavItem icon={<Calendar />} label="Agenda" href="/agenda" />
</NavGroup>
```

---

### 2.3 Breadcrumb

Navegacao hierarquica mostrando o caminho ate a pagina atual.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `items` | `{ label: string; href?: string }[]` | Lista de niveis |
| `separator` | `string?` | Separador visual (padrao: "/") |

**Onde e usado**: Dentro de `PageHeader`, em paginas com profundidade (ex: Clientes > Ficha do Cliente).

```tsx
<Breadcrumb items={[
  { label: "Clientes", href: "/clientes" },
  { label: "Carlos Mendes" }
]} />
```

---

### 2.4 TabBar

Barra de abas para alternar entre visoes ou secoes na mesma pagina.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `tabs` | `{ id: string; label: string; count?: number }[]` | Lista de abas |
| `activeTab` | `string` | ID da aba ativa |
| `onChange` | `(tabId: string) => void` | Callback ao trocar aba |
| `variant` | `"underline" \| "pills" \| "toggle"` | Estilo visual |
| `fullWidth` | `boolean?` | Abas ocupam 100% da largura |

**Variantes**: `underline` (linha inferior, para secoes), `pills` (botoes arredondados, para filtros), `toggle` (grupo de botoes, para Dia/Semana).

**Onde e usado**: Configuracoes (abas), Agenda (Dia/Semana), Ficha do cliente (Historico/Planos/Notas), Financeiro (periodo).

```tsx
<TabBar
  tabs={[
    { id: "historico", label: "Historico", count: 12 },
    { id: "planos", label: "Planos", count: 2 },
    { id: "notas", label: "Notas" }
  ]}
  activeTab="historico"
  onChange={setActiveTab}
  variant="underline"
/>
```

---

## 3. Data Display

### 3.1 StatCard

Card de metrica com valor numerico, label e variacao percentual.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `value` | `string \| number` | Valor principal (ex: "12", "R$1.240", "78%") |
| `label` | `string` | Descricao da metrica |
| `icon` | `ReactNode?` | Icone opcional |
| `trend` | `{ value: number; direction: "up" \| "down" }?` | Variacao percentual |
| `color` | `"default" \| "success" \| "warning" \| "danger"?` | Cor do destaque |
| `onClick` | `() => void?` | Torna o card clicavel |
| `loading` | `boolean?` | Exibe skeleton |

**Variantes**: `default` (fundo branco, borda), `colored` (fundo colorido leve), `compact` (menor, para mobile).

**Onde e usado**: Dashboard (6 cards), Financeiro (6 cards), Relatorios (6 cards), Ficha do cliente (3 mini stats).

```tsx
<StatCard
  value="12"
  label="Atendimentos hoje"
  icon={<Scissors />}
  trend={{ value: 15, direction: "up" }}
  color="success"
  onClick={() => navigate("/relatorios/atendimentos")}
/>
```

---

### 3.2 DataTable

Tabela de dados com ordenacao, selecao e acoes por linha.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `columns` | `Column[]` | Definicao das colunas (label, key, sortable, render) |
| `data` | `T[]` | Array de dados |
| `onRowClick` | `(row: T) => void?` | Acao ao clicar na linha |
| `sortBy` | `string?` | Coluna de ordenacao ativa |
| `sortDirection` | `"asc" \| "desc"?` | Direcao da ordenacao |
| `onSort` | `(column: string) => void?` | Callback ao ordenar |
| `selectable` | `boolean?` | Checkboxes de selecao |
| `pagination` | `{ page: number; total: number; pageSize: number }?` | Config de paginacao |
| `loading` | `boolean?` | Exibe skeleton de linhas |
| `emptyState` | `ReactNode?` | Conteudo quando sem dados |

**Variantes**: `default` (com bordas), `striped` (listras zebra), `compact` (menos padding).

**Onde e usado**: Lista de clientes (visao tabela), Relatorios (tabelas de ranking).

```tsx
<DataTable
  columns={[
    { key: "name", label: "Nome", sortable: true },
    { key: "phone", label: "Telefone" },
    { key: "lastVisit", label: "Ultima visita", sortable: true },
    { key: "visits", label: "Visitas", sortable: true }
  ]}
  data={clients}
  onRowClick={(client) => navigate(`/clientes/${client.id}`)}
  pagination={{ page: 1, total: 342, pageSize: 20 }}
  loading={isLoading}
/>
```

---

### 3.3 Timeline

Linha do tempo vertical para historico de eventos.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `items` | `TimelineItem[]` | Lista de eventos (date, title, description, status, icon) |
| `onItemClick` | `(item: TimelineItem) => void?` | Acao ao clicar num item |
| `loading` | `boolean?` | Skeleton de itens |
| `hasMore` | `boolean?` | Mostra botao "Carregar mais" |
| `onLoadMore` | `() => void?` | Callback para paginacao |

**Onde e usado**: Ficha do cliente (historico de atendimentos).

```tsx
<Timeline
  items={[
    {
      date: "28/03/2026",
      title: "Corte Masculino",
      description: "Joao · R$ 45,00",
      status: "completed",
      icon: <CheckCircle />
    },
    {
      date: "05/01/2026",
      title: "Corte Masculino",
      description: "Joao · R$ 45,00",
      status: "missed",
      icon: <XCircle />
    }
  ]}
  onItemClick={(item) => openDetail(item)}
  hasMore={true}
  onLoadMore={loadMoreHistory}
/>
```

---

### 3.4 Badge

Etiqueta pequena para categorizar ou destacar informacoes.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string` | Texto da badge |
| `variant` | `"default" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | Cor |
| `size` | `"sm" \| "md"` | Tamanho |
| `removable` | `boolean?` | Exibe botao X para remover |
| `onRemove` | `() => void?` | Callback ao remover |
| `dot` | `boolean?` | Exibe bolinha de cor antes do texto |

**Variantes**: Cores por contexto (`success` = verde/frequente, `warning` = amarelo/pendente, `danger` = vermelho/faltou, `neutral` = cinza/cancelado, `info` = azul/novo).

**Onde e usado**: Tags de clientes, status de agendamentos, cards de profissionais.

```tsx
<Badge label="Frequente" variant="success" />
<Badge label="VIP" variant="info" removable onRemove={removeTag} />
<Badge label="Sem retorno" variant="warning" dot />
```

---

### 3.5 StatusChip

Chip de status com cor e texto padronizado para agendamentos.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `status` | `"confirmed" \| "pending" \| "missed" \| "cancelled" \| "in_progress" \| "completed"` | Status |
| `size` | `"sm" \| "md"` | Tamanho |
| `showDot` | `boolean?` | Exibe bolinha de cor (padrao: true) |

**Mapeamento fixo de cores**:
- `confirmed` = verde, texto "Confirmado"
- `pending` = amarelo, texto "Pendente"
- `missed` = vermelho, texto "Faltou"
- `cancelled` = cinza, texto "Cancelado"
- `in_progress` = azul, texto "Em andamento"
- `completed` = verde escuro, texto "Concluido"

**Onde e usado**: Agenda (cards de agendamento), Drawer de detalhes, Timeline.

```tsx
<StatusChip status="confirmed" />
<StatusChip status="pending" size="sm" />
```

---

### 3.6 Avatar

Imagem circular do usuario/profissional com fallback para iniciais.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `src` | `string?` | URL da imagem |
| `name` | `string` | Nome (para gerar iniciais como fallback) |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | Tamanho (24/32/40/56/80px) |
| `status` | `"online" \| "offline" \| "busy"?` | Indicador de status (bolinha) |

**Variantes**: Com imagem, com iniciais (fundo colorido gerado pelo nome), com status indicator.

**Onde e usado**: TopBar, Sidebar, cards de profissionais, cards de clientes, timeline.

```tsx
<Avatar name="Joao Silva" size="md" src="/img/joao.jpg" status="online" />
<Avatar name="Pedro Costa" size="sm" /> {/* sem imagem, mostra "PC" */}
```

---

## 4. Forms

### 4.1 Input

Campo de texto padrao com label, validacao e estados.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string` | Label do campo |
| `placeholder` | `string?` | Texto placeholder |
| `value` | `string` | Valor controlado |
| `onChange` | `(value: string) => void` | Callback de alteracao |
| `error` | `string?` | Mensagem de erro (exibe borda vermelha) |
| `disabled` | `boolean?` | Campo desabilitado |
| `required` | `boolean?` | Campo obrigatorio (exibe *) |
| `type` | `"text" \| "email" \| "password" \| "number"` | Tipo HTML |
| `leftIcon` | `ReactNode?` | Icone a esquerda |
| `rightIcon` | `ReactNode?` | Icone/botao a direita |
| `helperText` | `string?` | Texto de ajuda abaixo do campo |
| `mask` | `string?` | Mascara de formatacao (CEP, monetario) |

**Variantes**: `default`, `error` (borda vermelha + mensagem), `disabled` (fundo cinza), `with-icon`.

**Onde e usado**: Todos os formularios do sistema.

```tsx
<Input
  label="Nome completo"
  placeholder="Digite seu nome"
  value={name}
  onChange={setName}
  required
  error={errors.name}
/>
```

---

### 4.2 Select

Campo de selecao com dropdown, busca opcional e multi-selecao.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string` | Label do campo |
| `options` | `{ value: string; label: string; icon?: ReactNode }[]` | Opcoes |
| `value` | `string \| string[]` | Valor selecionado |
| `onChange` | `(value: string \| string[]) => void` | Callback |
| `placeholder` | `string?` | Texto quando nada selecionado |
| `searchable` | `boolean?` | Habilita busca nas opcoes |
| `multiple` | `boolean?` | Permite selecao multipla |
| `error` | `string?` | Mensagem de erro |
| `disabled` | `boolean?` | Campo desabilitado |

**Variantes**: `single` (dropdown simples), `searchable` (com input de busca), `multiple` (checkboxes).

**Onde e usado**: Selecao de servico, profissional, filtros de periodo.

```tsx
<Select
  label="Servico"
  options={[
    { value: "corte", label: "Corte Masculino" },
    { value: "barba", label: "Barba" },
    { value: "corte-barba", label: "Corte + Barba" }
  ]}
  value={selectedService}
  onChange={setSelectedService}
  placeholder="Selecione um servico"
/>
```

---

### 4.3 DatePicker

Seletor de data com calendario visual.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string?` | Label do campo |
| `value` | `Date \| null` | Data selecionada |
| `onChange` | `(date: Date) => void` | Callback |
| `minDate` | `Date?` | Data minima permitida |
| `maxDate` | `Date?` | Data maxima permitida |
| `disabledDates` | `Date[]?` | Datas especificas desabilitadas |
| `disabledDaysOfWeek` | `number[]?` | Dias da semana desabilitados (0=Dom) |
| `placeholder` | `string?` | Placeholder |

**Variantes**: `input` (abre popup ao clicar), `inline` (calendario sempre visivel — usado na pagina publica).

**Onde e usado**: Agenda (navegacao de data), Pagina publica (etapa 3), Drawer de agendamento.

```tsx
<DatePicker
  label="Data"
  value={selectedDate}
  onChange={setSelectedDate}
  minDate={new Date()}
  disabledDaysOfWeek={[0]} // desabilita domingos
/>
```

---

### 4.4 TimePicker

Seletor de horario.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string?` | Label |
| `value` | `string` | Horario no formato "HH:mm" |
| `onChange` | `(time: string) => void` | Callback |
| `minTime` | `string?` | Horario minimo |
| `maxTime` | `string?` | Horario maximo |
| `interval` | `number?` | Intervalo em minutos (padrao: 30) |
| `disabled` | `boolean?` | Desabilitado |

**Variantes**: `dropdown` (lista de horarios), `input` (digitacao direta com mascara).

**Onde e usado**: Configuracao de horarios (abertura/fechamento), onboarding (horarios de funcionamento).

```tsx
<TimePicker
  label="Abertura"
  value="08:00"
  onChange={setOpenTime}
  minTime="06:00"
  maxTime="22:00"
  interval={30}
/>
```

---

### 4.5 Toggle

Interruptor booleano (on/off).

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string?` | Label ao lado do toggle |
| `checked` | `boolean` | Estado atual |
| `onChange` | `(checked: boolean) => void` | Callback |
| `disabled` | `boolean?` | Desabilitado |
| `size` | `"sm" \| "md"` | Tamanho |
| `description` | `string?` | Texto de descricao abaixo do label |

**Onde e usado**: Configuracoes (notificacoes, dias da semana), Onboarding (dias ativos).

```tsx
<Toggle
  label="Lembrete por WhatsApp"
  description="Envia lembrete 24h antes do agendamento"
  checked={whatsappReminder}
  onChange={setWhatsappReminder}
/>
```

---

### 4.6 SearchInput

Campo de busca com icone, debounce e botao de limpar.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `value` | `string` | Termo de busca |
| `onChange` | `(value: string) => void` | Callback (ja com debounce interno) |
| `placeholder` | `string?` | Placeholder (padrao: "Buscar...") |
| `debounceMs` | `number?` | Tempo de debounce em ms (padrao: 300) |
| `loading` | `boolean?` | Exibe spinner durante busca |
| `onClear` | `() => void?` | Callback ao limpar |

**Onde e usado**: Lista de clientes (busca), Drawer de novo agendamento (buscar cliente).

```tsx
<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Buscar por nome ou telefone"
  loading={isSearching}
/>
```

---

### 4.7 PhoneInput

Campo de telefone com mascara brasileira e validacao.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string?` | Label |
| `value` | `string` | Valor (somente digitos) |
| `onChange` | `(value: string) => void` | Callback |
| `error` | `string?` | Mensagem de erro |
| `required` | `boolean?` | Obrigatorio |
| `countryCode` | `string?` | Codigo do pais (padrao: "+55") |

Formatacao automatica: `(11) 99876-5432`. Valida quantidade de digitos (10 ou 11).

**Onde e usado**: Cadastro de cliente, onboarding, pagina publica, cadastro de profissional.

```tsx
<PhoneInput
  label="WhatsApp"
  value={phone}
  onChange={setPhone}
  required
  error={errors.phone}
/>
```

---

## 5. Feedback

### 5.1 Alert

Mensagem contextual inline com icone, texto e acao opcional.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `variant` | `"info" \| "success" \| "warning" \| "error"` | Tipo/cor do alerta |
| `title` | `string?` | Titulo (negrito) |
| `message` | `string` | Texto do alerta |
| `action` | `{ label: string; onClick: () => void }?` | Botao de acao |
| `dismissible` | `boolean?` | Exibe botao X para fechar |
| `icon` | `ReactNode?` | Icone customizado |

**Variantes**: `info` (azul), `success` (verde), `warning` (amarelo), `error` (vermelho).

**Onde e usado**: Dashboard (alertas), formularios (erros de validacao), avisos em paginas.

```tsx
<Alert
  variant="warning"
  title="Clientes sem retorno"
  message="3 clientes nao voltam ha mais de 30 dias"
  action={{ label: "Ver lista", onClick: openReturnList }}
  dismissible
/>
```

---

### 5.2 Toast

Notificacao temporaria que aparece no canto superior direito.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `variant` | `"success" \| "error" \| "warning" \| "info"` | Tipo/cor |
| `message` | `string` | Texto da notificacao |
| `duration` | `number?` | Duracao em ms (padrao: 5000, 0 = persistente) |
| `action` | `{ label: string; onClick: () => void }?` | Acao opcional |

**Comportamento**: Auto-dismiss apos `duration`. Erros sao persistentes (duration=0). Maximo 3 toasts visiveis empilhados. Animacao slide-in da direita.

**Onde e usado**: Todas as acoes de CRUD (salvar, editar, excluir), erros de rede, confirmacoes.

```tsx
// via hook
const { toast } = useToast();
toast({ variant: "success", message: "Agendamento confirmado!" });
toast({ variant: "error", message: "Erro ao salvar. Tente novamente.", duration: 0 });
```

---

### 5.3 EmptyState

Componente para quando nao ha dados a exibir — sempre com CTA.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `icon` | `ReactNode?` | Ilustracao ou icone grande |
| `title` | `string` | Titulo (ex: "Nenhum cliente ainda") |
| `description` | `string?` | Texto explicativo |
| `action` | `{ label: string; onClick: () => void }` | Botao CTA primario |
| `secondaryAction` | `{ label: string; onClick: () => void }?` | Acao secundaria |

**Onde e usado**: Todas as listas vazias (clientes, servicos, profissionais, campanhas, agenda vazia).

```tsx
<EmptyState
  icon={<Users className="w-16 h-16 text-gray-300" />}
  title="Nenhum cliente cadastrado"
  description="Comece adicionando seu primeiro cliente"
  action={{ label: "+ Cadastrar cliente", onClick: openNewClient }}
/>
```

---

### 5.4 LoadingSpinner

Indicador de carregamento circular.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | Tamanho (16/24/40px) |
| `color` | `"primary" \| "white" \| "gray"` | Cor do spinner |
| `label` | `string?` | Texto acessivel (sr-only) |

**Onde e usado**: Dentro de botoes durante submit, loading de pagina, buscas.

```tsx
<Button disabled>
  <LoadingSpinner size="sm" color="white" /> Salvando...
</Button>
```

---

### 5.5 Skeleton

Placeholder animado que simula o layout do conteudo enquanto carrega.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `variant` | `"text" \| "circular" \| "rectangular" \| "card"` | Formato |
| `width` | `string \| number?` | Largura |
| `height` | `string \| number?` | Altura |
| `count` | `number?` | Quantidade de linhas (para variant="text") |
| `className` | `string?` | Classes CSS adicionais |

**Variantes**: `text` (linhas de texto), `circular` (avatar), `rectangular` (imagem/card), `card` (card completo com titulo + linhas).

**Onde e usado**: Todas as telas durante carregamento inicial.

```tsx
{isLoading ? (
  <div className="grid grid-cols-3 gap-4">
    <Skeleton variant="card" height={120} />
    <Skeleton variant="card" height={120} />
    <Skeleton variant="card" height={120} />
  </div>
) : (
  <StatCards data={metrics} />
)}
```

---

## 6. Overlay

### 6.1 Modal

Dialogo centralizado para acoes que requerem atencao total.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `isOpen` | `boolean` | Controle de visibilidade |
| `onClose` | `() => void` | Callback ao fechar |
| `title` | `string` | Titulo do modal |
| `children` | `ReactNode` | Conteudo |
| `size` | `"sm" \| "md" \| "lg"` | Largura (400/560/720px) |
| `footer` | `ReactNode?` | Area de botoes no rodape |
| `closeOnOverlay` | `boolean?` | Fecha ao clicar no overlay (padrao: true) |
| `closeOnEsc` | `boolean?` | Fecha ao pressionar Esc (padrao: true) |

**Onde e usado**: Recuperacao de senha (Login), QR Code (Configuracoes), confirmacoes gerais.

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Recuperar senha"
  size="sm"
  footer={
    <>
      <Button variant="outline" onClick={close}>Cancelar</Button>
      <Button onClick={sendRecovery}>Enviar</Button>
    </>
  }
>
  <Input label="Email" value={email} onChange={setEmail} />
</Modal>
```

---

### 6.2 Drawer

Painel lateral deslizante para edicoes rapidas sem sair da pagina.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `isOpen` | `boolean` | Controle de visibilidade |
| `onClose` | `() => void` | Callback ao fechar |
| `title` | `string` | Titulo do drawer |
| `children` | `ReactNode` | Conteudo |
| `side` | `"right" \| "left"` | Lado de abertura (padrao: "right") |
| `width` | `string?` | Largura (padrao: "420px", mobile: "100%") |
| `footer` | `ReactNode?` | Botoes de acao fixos no rodape |
| `showOverlay` | `boolean?` | Exibe backdrop escuro (padrao: true) |

**Comportamento**: Slide da direita (200ms ease-out). Overlay escuro clicavel para fechar. Botao X no topo. Footer fixo no bottom do drawer. No mobile, ocupa 100% da largura.

**Onde e usado**: Novo agendamento, detalhes do agendamento, novo cliente, edicao de servico, edicao de profissional, novo plano, criacao de campanha. E o componente de overlay mais usado do sistema.

```tsx
<Drawer
  isOpen={showNewAppointment}
  onClose={() => setShowNewAppointment(false)}
  title="Novo Agendamento"
  footer={<Button fullWidth onClick={save}>Agendar</Button>}
>
  <SearchInput placeholder="Buscar cliente" />
  <Select label="Servico" options={services} />
  {/* ... */}
</Drawer>
```

---

### 6.3 ConfirmDialog

Dialogo de confirmacao para acoes destrutivas.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `isOpen` | `boolean` | Controle de visibilidade |
| `onClose` | `() => void` | Callback ao fechar (cancelar) |
| `onConfirm` | `() => void` | Callback ao confirmar |
| `title` | `string` | Titulo (ex: "Cancelar agendamento?") |
| `message` | `string` | Mensagem explicativa |
| `confirmLabel` | `string?` | Texto do botao de confirmar (padrao: "Confirmar") |
| `cancelLabel` | `string?` | Texto do botao de cancelar (padrao: "Cancelar") |
| `variant` | `"danger" \| "warning" \| "info"` | Cor do botao de confirmar |
| `loading` | `boolean?` | Spinner no botao de confirmar |

**Onde e usado**: Cancelar agendamento, excluir servico, desativar profissional, excluir plano.

```tsx
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={cancelAppointment}
  title="Cancelar agendamento?"
  message="Esta acao nao pode ser desfeita. O cliente sera notificado."
  confirmLabel="Sim, cancelar"
  variant="danger"
  loading={isCancelling}
/>
```

---

### 6.4 Dropdown

Menu suspenso com lista de opcoes/acoes.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `trigger` | `ReactNode` | Elemento que abre o dropdown (botao) |
| `items` | `DropdownItem[]` | Lista de itens (label, icon, onClick, variant, divider) |
| `align` | `"start" \| "end"` | Alinhamento horizontal (padrao: "end") |
| `side` | `"top" \| "bottom"` | Direcao de abertura (padrao: "bottom") |

**Tipo DropdownItem**:
```ts
type DropdownItem = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
} | { divider: true };
```

**Onde e usado**: Menu do usuario (TopBar), Menu de acoes (···) em cards.

```tsx
<Dropdown
  trigger={<Button variant="ghost" icon={<MoreHorizontal />} />}
  items={[
    { label: "Editar", icon: <Edit />, onClick: edit },
    { label: "Duplicar", icon: <Copy />, onClick: duplicate },
    { divider: true },
    { label: "Excluir", icon: <Trash />, onClick: remove, variant: "danger" }
  ]}
/>
```

---

## 7. Calendar

### 7.1 CalendarGrid

Calendario mensal com dias clicaveis e indicadores de disponibilidade.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `currentMonth` | `Date` | Mes exibido |
| `selectedDate` | `Date \| null` | Data selecionada |
| `onDateSelect` | `(date: Date) => void` | Callback ao selecionar data |
| `onMonthChange` | `(date: Date) => void` | Callback ao navegar entre meses |
| `disabledDates` | `Date[]?` | Datas desabilitadas |
| `disabledDaysOfWeek` | `number[]?` | Dias da semana desabilitados |
| `minDate` | `Date?` | Data minima |
| `indicators` | `Record<string, "available" \| "partial" \| "full">?` | Indicadores por dia |

**Variantes**: `inline` (sempre visivel, pagina publica), `popup` (abre ao clicar no input).

**Onde e usado**: Pagina publica de agendamento (etapa 3), DatePicker interno, Agenda (navegacao).

```tsx
<CalendarGrid
  currentMonth={currentMonth}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  onMonthChange={setCurrentMonth}
  disabledDaysOfWeek={[0]} // sem domingo
  minDate={new Date()}
  indicators={{
    "2026-03-31": "available",
    "2026-04-01": "partial",
    "2026-04-02": "full"
  }}
/>
```

---

### 7.2 TimeSlot

Bloco de horario individual na grade da agenda.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `time` | `string` | Horario (ex: "09:00") |
| `status` | `"available" \| "booked" \| "blocked" \| "break"` | Estado do slot |
| `onClick` | `() => void?` | Acao ao clicar (se disponivel) |
| `height` | `number?` | Altura em pixels (proporcional a duracao) |

**Variantes por status**:
- `available`: fundo pontilhado cinza claro, clicavel, hover com destaque
- `booked`: ocupado (nao clicavel, mostra AppointmentCard)
- `blocked`: fundo cinza escuro hachurado
- `break`: fundo listrado, label "Almoco"

**Onde e usado**: Agenda (grade de horarios por profissional).

```tsx
<TimeSlot
  time="09:00"
  status="available"
  onClick={() => openNewAppointment("09:00")}
/>
```

---

### 7.3 AppointmentCard

Card de agendamento exibido na grade da agenda.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `clientName` | `string` | Nome do cliente |
| `serviceName` | `string` | Nome do servico |
| `startTime` | `string` | Horario de inicio |
| `endTime` | `string` | Horario de termino |
| `status` | `AppointmentStatus` | Status do agendamento |
| `professional` | `string?` | Nome do profissional |
| `onClick` | `() => void` | Abre drawer de detalhes |
| `durationMinutes` | `number` | Duracao em minutos (define altura do card) |

**Cores por status**: Borda esquerda colorida (4px) + fundo levemente tintado com a cor do status.

**Onde e usado**: Agenda (dentro de DayColumn), Dashboard (proximos atendimentos).

```tsx
<AppointmentCard
  clientName="Carlos M."
  serviceName="Corte"
  startTime="09:00"
  endTime="09:30"
  status="confirmed"
  professional="Joao"
  onClick={() => openDetail(appointment)}
  durationMinutes={30}
/>
```

---

### 7.4 DayColumn

Coluna de um profissional na visao de dia da agenda.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `professional` | `{ id: string; name: string; avatar?: string }` | Dados do profissional |
| `date` | `Date` | Data exibida |
| `appointments` | `Appointment[]` | Agendamentos do dia |
| `workingHours` | `{ start: string; end: string }` | Horario de trabalho |
| `breakTime` | `{ start: string; end: string }?` | Intervalo |
| `slotInterval` | `number` | Intervalo de slots em minutos |
| `onSlotClick` | `(time: string) => void` | Clique em slot livre |
| `onAppointmentClick` | `(appointment: Appointment) => void` | Clique em agendamento |

**Onde e usado**: Agenda (uma coluna por profissional na visao dia).

```tsx
<DayColumn
  professional={{ id: "1", name: "Joao", avatar: "/img/joao.jpg" }}
  date={selectedDate}
  appointments={joaoAppointments}
  workingHours={{ start: "08:00", end: "19:00" }}
  breakTime={{ start: "12:00", end: "13:00" }}
  slotInterval={30}
  onSlotClick={(time) => openNewAppointment("1", time)}
  onAppointmentClick={openDetail}
/>
```

---

## 8. Business

### 8.1 ClientCard

Card de cliente para listagem e selecao.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `name` | `string` | Nome do cliente |
| `phone` | `string` | Telefone |
| `lastVisit` | `string?` | Data da ultima visita |
| `totalVisits` | `number` | Total de visitas |
| `tags` | `string[]?` | Tags (Frequente, VIP, Novo, etc.) |
| `avatar` | `string?` | URL do avatar |
| `onClick` | `() => void` | Acao ao clicar (abrir ficha) |
| `alertMessage` | `string?` | Alerta (ex: "Sem retorno ha 30 dias") |

**Variantes**: `default` (para listagem), `compact` (para selecao em drawer), `highlight` (borda colorida para alertas).

**Onde e usado**: Lista de clientes, Drawer de selecao de cliente (novo agendamento), Drawer de planos (clientes vinculados).

```tsx
<ClientCard
  name="Carlos Mendes"
  phone="(11) 99876-5432"
  lastVisit="15/03/2026"
  totalVisits={12}
  tags={["Frequente", "VIP"]}
  onClick={() => navigate(`/clientes/${id}`)}
/>
```

---

### 8.2 ServiceCard

Card de servico com informacoes e acoes.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `name` | `string` | Nome do servico |
| `duration` | `number` | Duracao em minutos |
| `price` | `number` | Preco em reais |
| `commission` | `number?` | Percentual de comissao |
| `professionals` | `string[]?` | Nomes dos profissionais habilitados |
| `isActive` | `boolean?` | Se o servico esta ativo |
| `onEdit` | `() => void?` | Acao ao clicar em editar |
| `onMenuAction` | `(action: string) => void?` | Acoes do menu ··· |
| `draggable` | `boolean?` | Permite arrastar para reordenar |
| `onClick` | `() => void?` | Acao ao clicar (pagina publica: selecionar) |
| `selected` | `boolean?` | Se esta selecionado (pagina publica) |

**Variantes**: `admin` (com acoes editar/menu/drag), `public` (so informacoes, clicavel para selecao), `compact` (para listagem dentro de drawers).

**Onde e usado**: Tela de servicos (admin), Pagina publica (etapa 1), Drawer de edicao de profissional (servicos habilitados).

```tsx
{/* Admin */}
<ServiceCard
  name="Corte Masculino"
  duration={30}
  price={45}
  commission={40}
  professionals={["Joao", "Pedro"]}
  onEdit={openEdit}
  onMenuAction={handleAction}
  draggable
/>

{/* Pagina publica */}
<ServiceCard
  name="Corte Masculino"
  duration={30}
  price={45}
  onClick={() => selectService("corte")}
  selected={selectedService === "corte"}
/>
```

---

### 8.3 ProfessionalCard

Card de profissional com informacoes e acoes.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `name` | `string` | Nome do profissional |
| `nickname` | `string?` | Apelido |
| `role` | `string?` | Cargo (Barbeiro, Dono) |
| `avatar` | `string?` | URL da foto |
| `workingDays` | `string` | Dias de trabalho (ex: "Seg a Sex") |
| `workingHours` | `string` | Horario (ex: "08:00-19:00") |
| `services` | `string[]` | Servicos habilitados |
| `occupancyToday` | `{ filled: number; total: number }?` | Ocupacao do dia |
| `isActive` | `boolean` | Se esta ativo |
| `isOwner` | `boolean?` | Se e o dono da barbearia |
| `onEdit` | `() => void?` | Acao ao clicar em editar |
| `onViewAgenda` | `() => void?` | Acao para ver agenda |
| `onMenuAction` | `(action: string) => void?` | Acoes do menu |
| `onClick` | `() => void?` | Clique no card (pagina publica: selecionar) |
| `selected` | `boolean?` | Se esta selecionado |
| `rating` | `number?` | Nota (1-5 estrelas, pagina publica) |

**Variantes**: `admin` (completo, com acoes), `public` (nome, avatar, nota — para selecao), `compact` (para drawer/onboarding).

**Onde e usado**: Tela de profissionais (admin), Pagina publica (etapa 2), Onboarding (etapa 4).

```tsx
<ProfessionalCard
  name="Joao Silva"
  role="Barbeiro"
  avatar="/img/joao.jpg"
  workingDays="Seg a Sex"
  workingHours="08:00-19:00"
  services={["Corte", "Barba", "C+B", "Degrade"]}
  occupancyToday={{ filled: 8, total: 12 }}
  isActive={true}
  isOwner={true}
  onEdit={openEdit}
  onViewAgenda={() => navigate("/agenda?prof=joao")}
/>
```

---

### 8.4 PlanCard

Card de plano/combo com metricas de uso.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `name` | `string` | Nome do plano |
| `description` | `string` | Descricao (ex: "4 cortes por R$ 150,00") |
| `price` | `number` | Preco |
| `savings` | `number?` | Economia em reais |
| `validity` | `string?` | Validade (ex: "60 dias") |
| `type` | `"package" \| "subscription"` | Tipo do plano |
| `metrics` | `{ sold: number; active: number; revenue: number }` | Metricas |
| `onViewClients` | `() => void` | Abre drawer de clientes vinculados |
| `onEdit` | `() => void` | Abre drawer de edicao |
| `onMenuAction` | `(action: string) => void` | Acoes do menu |

**Onde e usado**: Tela de planos e combos.

```tsx
<PlanCard
  name="Plano Fidelidade"
  description="4 cortes por R$ 150,00"
  price={150}
  savings={30}
  validity="60 dias"
  type="package"
  metrics={{ sold: 12, active: 8, revenue: 1800 }}
  onViewClients={openClientsDrawer}
  onEdit={openEditDrawer}
/>
```

---

### 8.5 CampaignCard

Card de template ou campanha criada.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `name` | `string` | Nome da campanha |
| `icon` | `ReactNode` | Icone representativo |
| `previewText` | `string` | Preview da mensagem |
| `segment` | `string?` | Segmentacao (ex: "Sem retorno > 30 dias") |
| `reach` | `number?` | Alcance estimado (numero de clientes) |
| `channel` | `"whatsapp" \| "sms"?` | Canal de envio |
| `status` | `"draft" \| "sent" \| "scheduled"?` | Status da campanha |
| `sentDate` | `string?` | Data de envio |
| `result` | `{ conversions: number; rate: number }?` | Resultado (se enviada) |
| `isTemplate` | `boolean?` | Se e um template (vs. campanha criada) |
| `onUse` | `() => void?` | Acao "Usar" (para templates) |
| `onEdit` | `() => void?` | Acao editar (para rascunhos) |
| `onSend` | `() => void?` | Acao enviar |
| `onViewDetails` | `() => void?` | Ver detalhes (para campanhas enviadas) |

**Variantes**: `template` (card de sugestao), `draft` (rascunho editavel), `sent` (campanha enviada com resultados).

**Onde e usado**: Tela de campanhas (templates + lista de campanhas).

```tsx
{/* Template */}
<CampaignCard
  name="Retorno"
  icon={<Megaphone />}
  previewText="Faz tempo que nao te vemos..."
  isTemplate
  onUse={useTemplate}
/>

{/* Campanha enviada */}
<CampaignCard
  name="Campanha Retorno Marco"
  segment="Sem retorno > 30 dias"
  reach={23}
  channel="whatsapp"
  status="sent"
  sentDate="18/03/2026"
  result={{ conversions: 8, rate: 35 }}
  onViewDetails={openDetails}
/>
```

---

## 9. Actions

### 9.1 QuickActionBar

Barra horizontal de acoes rapidas com botoes proeminentes.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `actions` | `QuickAction[]` | Lista de acoes (label, icon, onClick, variant) |
| `direction` | `"horizontal" \| "vertical"?` | Direcao (padrao: horizontal) |

**Tipo QuickAction**:
```ts
type QuickAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
};
```

**Onde e usado**: Dashboard (acoes rapidas), Ficha do cliente (WhatsApp, Agendar, Editar).

```tsx
<QuickActionBar
  actions={[
    { label: "+ Agendar", icon: <Plus />, onClick: openNewAppointment, variant: "primary" },
    { label: "+ Cliente", icon: <UserPlus />, onClick: openNewClient, variant: "secondary" },
    { label: "Caixa", icon: <DollarSign />, onClick: openCashRegister, variant: "outline" }
  ]}
/>
```

---

### 9.2 FloatingButton

Botao de acao flutuante (FAB) fixo no canto inferior direito.

| Propriedade | Tipo | Descricao |
|---|---|---|
| `label` | `string` | Texto do botao |
| `icon` | `ReactNode` | Icone (padrao: Plus) |
| `onClick` | `() => void` | Acao ao clicar |
| `extended` | `boolean?` | Se mostra texto (true) ou so icone (false) |
| `position` | `"bottom-right" \| "bottom-center"?` | Posicao (padrao: bottom-right) |

**Comportamento**: Fixo na tela (position: fixed). No scroll para baixo, retrai para so icone. No scroll para cima, expande com texto. Sombra elevada. Z-index alto (acima do conteudo, abaixo de overlays).

**Onde e usado**: Agenda (+ Novo Agendamento), qualquer tela com acao principal de criacao no mobile.

```tsx
<FloatingButton
  label="+ Agendar"
  icon={<Plus />}
  onClick={openNewAppointment}
  extended
/>
```

---

### 9.3 ActionMenu

Menu de acoes contextuais acessado via botao "···" (tres pontos).

| Propriedade | Tipo | Descricao |
|---|---|---|
| `items` | `ActionMenuItem[]` | Lista de acoes |
| `triggerIcon` | `ReactNode?` | Icone do botao trigger (padrao: MoreHorizontal) |
| `triggerLabel` | `string?` | Label acessivel |

**Tipo ActionMenuItem**:
```ts
type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
} | { divider: true };
```

**Onde e usado**: Cards de servicos (Desativar, Duplicar, Excluir), Cards de profissionais (Desativar, Folga, Ferias, Excluir), Cards de planos.

```tsx
<ActionMenu
  items={[
    { label: "Desativar", icon: <EyeOff />, onClick: deactivate },
    { label: "Duplicar", icon: <Copy />, onClick: duplicate },
    { divider: true },
    { label: "Excluir", icon: <Trash />, onClick: remove, variant: "danger" }
  ]}
/>
```

---

## Resumo: Componente por Tela

| Tela | Componentes principais utilizados |
|---|---|
| Login | `Input`, `Button`, `LoadingSpinner`, `Toast` |
| Onboarding | `Input`, `PhoneInput`, `TimePicker`, `Toggle`, `ServiceCard`, `ProfessionalCard`, `Chip` |
| Dashboard | `StatCard`, `QuickActionBar`, `Alert`, `AppointmentCard`, `Skeleton` |
| Agenda | `CalendarGrid`, `DayColumn`, `TimeSlot`, `AppointmentCard`, `FloatingButton`, `Drawer`, `TabBar` |
| Lista de clientes | `SearchInput`, `ClientCard`, `DataTable`, `TabBar`, `EmptyState`, `Skeleton` |
| Ficha do cliente | `Avatar`, `StatCard`, `Badge`, `TabBar`, `Timeline`, `QuickActionBar`, `Drawer` |
| Servicos | `ServiceCard`, `ActionMenu`, `Drawer`, `Input`, `Select`, `EmptyState` |
| Profissionais | `ProfessionalCard`, `ActionMenu`, `Drawer`, `Toggle`, `TimePicker`, `PhoneInput` |
| Campanhas | `CampaignCard`, `StatusChip`, `Drawer`, `Select`, `Input`, `Badge` |
| Planos e combos | `PlanCard`, `ClientCard`, `Drawer`, `Input`, `Select`, `ActionMenu` |
| Financeiro | `StatCard`, `TabBar`, Charts (Recharts) |
| Relatorios | `StatCard`, `TabBar`, `DataTable`, Charts (Recharts), `Button` (export) |
| Configuracoes | `TabBar`, `Input`, `PhoneInput`, `Toggle`, `TimePicker`, `Select`, `Toast` |
| Pagina publica | `ServiceCard`, `ProfessionalCard`, `CalendarGrid`, `TimeSlot`, `Input`, `PhoneInput` |

---

## Tema e Design Tokens

### Cores

```ts
const colors = {
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    500: "#3B82F6",  // cor principal
    600: "#2563EB",  // hover
    700: "#1D4ED8",  // active
  },
  success: {
    50: "#F0FDF4",
    500: "#22C55E",  // confirmado
    700: "#15803D",
  },
  warning: {
    50: "#FFFBEB",
    500: "#EAB308",  // pendente
    700: "#A16207",
  },
  danger: {
    50: "#FEF2F2",
    500: "#EF4444",  // faltou/erro
    700: "#B91C1C",
  },
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",  // cancelado
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};
```

### Tipografia

```ts
const typography = {
  fontFamily: "'Inter', sans-serif",
  sizes: {
    xs: "0.75rem",    // 12px - badges, labels menores
    sm: "0.875rem",   // 14px - texto secundario, inputs
    base: "1rem",     // 16px - texto principal
    lg: "1.125rem",   // 18px - subtitulos
    xl: "1.25rem",    // 20px - titulos de secao
    "2xl": "1.5rem",  // 24px - titulos de pagina
    "3xl": "1.875rem",// 30px - valores grandes nos StatCards
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

### Espacamento

```ts
const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
};
```

### Bordas e Sombras

```ts
const borders = {
  radius: {
    sm: "4px",    // inputs, badges
    md: "8px",    // cards, botoes
    lg: "12px",   // modals, drawers
    xl: "16px",   // cards de destaque
    full: "9999px", // avatares, chips
  },
};

const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",           // cards
  md: "0 4px 6px -1px rgba(0,0,0,0.1)",       // dropdowns
  lg: "0 10px 15px -3px rgba(0,0,0,0.1)",     // modals, drawers
  xl: "0 20px 25px -5px rgba(0,0,0,0.1)",     // FAB, card arrastando
};
```

### Breakpoints

```ts
const breakpoints = {
  sm: "640px",   // mobile landscape
  md: "768px",   // tablet
  lg: "1024px",  // desktop
  xl: "1280px",  // desktop grande
};
```

### Transicoes

```ts
const transitions = {
  fast: "150ms ease",       // hover, focus
  normal: "200ms ease-out", // drawer, modal
  slow: "300ms ease-out",   // page transitions
};
```

---

*Documento gerado para o projeto BarberFlow. Todos os componentes seguem os principios de reutilizacao, consistencia visual e acessibilidade basica (labels, contraste, foco visivel, aria-labels).*
