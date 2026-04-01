# BarberFlow — Backlog Priorizado (MoSCoW + User Stories)

> **Produto:** BarberFlow — SaaS de crescimento para barbearias
> **Método:** MoSCoW (Must / Should / Could / Won't)
> **Estimativas:** P = 1-2 dias | M = 3-4 dias | G = 5+ dias
> **Última atualização:** 31/03/2026

---

## MUST — MVP (Lança ou não lança)

Sem estes itens, o produto não vai ao ar. São o núcleo operacional que resolve o problema central: **organizar a operação da barbearia e preencher a agenda.**

---

### Auth & Onboarding

---

### BF-001 — Registro de conta com criação de tenant

**Prioridade:** Must (MVP)
**Módulo:** Auth
**User Story:** Como dono de barbearia, quero criar minha conta informando e-mail, senha e nome do negócio, para ter meu ambiente isolado no sistema.
**Critérios de aceite:**
- [ ] Formulário com campos: nome completo, e-mail, senha, nome do negócio
- [ ] Validação de e-mail único no banco
- [ ] Senha com mínimo de 8 caracteres, incluindo letra e número
- [ ] Criação automática do tenant (organização) vinculado ao usuário
- [ ] Geração automática de slug único para a página pública (ex: `/agendar/barbearia-do-joao`)
- [ ] Usuário criado com role `owner`
- [ ] Redirecionamento automático para o wizard de onboarding após registro
- [ ] Tratamento de erro para e-mail já cadastrado com mensagem clara
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Um tenant = uma barbearia (na v1, sem multi-unidade)
- O slug é gerado a partir do nome do negócio, com sanitização (lowercase, sem acentos, hifens no lugar de espaços)
- Se o slug já existir, adicionar sufixo numérico incremental (ex: `barbearia-do-joao-2`)
- O owner tem permissão total sobre o tenant

---

### BF-002 — Login/logout com sessão

**Prioridade:** Must (MVP)
**Módulo:** Auth
**User Story:** Como usuário registrado, quero fazer login com e-mail e senha e manter minha sessão ativa, para acessar o sistema sem precisar logar repetidamente.
**Critérios de aceite:**
- [ ] Tela de login com campos e-mail e senha
- [ ] Sessão via cookie HTTP-only com duração de 7 dias
- [ ] Refresh automático de sessão enquanto o usuário estiver ativo
- [ ] Botão de logout visível no menu do usuário
- [ ] Logout limpa a sessão no servidor e redireciona para a tela de login
- [ ] Rotas protegidas retornam 401 e redirecionam para login se sessão expirada
- [ ] Mensagem de erro clara para credenciais inválidas
- [ ] Rate limiting: máximo 5 tentativas de login por minuto por IP
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Sessão expira após 7 dias de inatividade
- Múltiplas sessões simultâneas são permitidas (mesmo usuário em dispositivos diferentes)
- Após logout, qualquer requisição com token antigo deve ser rejeitada
- Senhas armazenadas com bcrypt (cost factor 12)

---

### BF-003 — Wizard de onboarding

**Prioridade:** Must (MVP)
**Módulo:** Onboarding
**User Story:** Como dono que acabou de criar a conta, quero ser guiado passo a passo para configurar minha barbearia, para começar a usar o sistema em menos de 10 minutos.
**Critérios de aceite:**
- [ ] Wizard com 5 etapas sequenciais com barra de progresso visual
- [ ] Etapa 1 — Tipo de negócio: seleção entre Barbearia, Salão, Studio (afeta templates sugeridos)
- [ ] Etapa 2 — Dados da unidade: nome, endereço, telefone, logo (upload opcional)
- [ ] Etapa 3 — Horários de funcionamento: grade por dia da semana com horário de abertura e fechamento
- [ ] Etapa 4 — Profissionais: adicionar ao menos 1 profissional com nome, telefone e foto (opcional)
- [ ] Etapa 5 — Serviços: selecionar de templates pré-prontos ou criar manualmente (ao menos 1 serviço)
- [ ] Botão "Pular etapa" nas etapas 4 e 5 (preenchíveis depois)
- [ ] Botão "Voltar" em todas as etapas exceto a primeira
- [ ] Ao concluir, redirecionar para o Dashboard com mensagem de boas-vindas
- [ ] Salvar progresso parcial — se o usuário sair e voltar, retomar de onde parou
- [ ] Dados salvos incrementalmente a cada etapa (não apenas no final)
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- O onboarding só aparece uma vez (flag `onboarding_completed` no tenant)
- Se o tipo de negócio for "Barbearia", sugerir serviços: Corte, Barba, Corte + Barba, Sobrancelha, Hidratação, Pigmentação
- O owner é automaticamente adicionado como profissional se não adicionar nenhum
- Horários padrão sugeridos: Seg-Sáb 09:00-19:00, Dom fechado
- Ao concluir o wizard, o sistema gera dados de seed mínimos para que o dashboard não fique vazio

---

### Serviços

---

### BF-004 — CRUD de serviços com templates pré-prontos

**Prioridade:** Must (MVP)
**Módulo:** Serviços
**User Story:** Como gestor da barbearia, quero cadastrar meus serviços com nome, duração e preço, para que clientes possam agendar e eu controle o que ofereço.
**Critérios de aceite:**
- [ ] Tela de listagem de serviços em cards ou tabela com busca
- [ ] Formulário de criação com campos: nome, descrição (opcional), duração (em minutos, select com incrementos de 15min), preço (R$), categoria
- [ ] Templates pré-prontos para barbearia carregados na primeira vez: Corte Masculino (45min, R$45), Barba (30min, R$35), Corte + Barba (60min, R$70), Sobrancelha (15min, R$20), Hidratação Capilar (30min, R$40), Pigmentação de Barba (45min, R$60)
- [ ] Edição inline ou via drawer/modal
- [ ] Exclusão lógica (soft delete) com confirmação
- [ ] Toggle de ativo/inativo para cada serviço
- [ ] Serviços inativos não aparecem na página pública
- [ ] Ordenação por nome, preço ou duração
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Duração mínima: 15 minutos; máxima: 240 minutos
- Preço mínimo: R$ 0,00 (permite serviço cortesia); máximo: R$ 9.999,99
- Não é possível excluir serviço que tenha agendamentos futuros — apenas inativar
- Templates são sugeridos mas podem ser editados livremente
- Categorias padrão: Corte, Barba, Tratamento, Coloração, Combo
- Serviço deve ter pelo menos 1 profissional associado para aparecer na página pública

---

### BF-005 — Associação serviço-profissional

**Prioridade:** Must (MVP)
**Módulo:** Serviços / Profissionais
**User Story:** Como gestor, quero definir quais profissionais realizam quais serviços, para que a agenda respeite as competências de cada um.
**Critérios de aceite:**
- [ ] Na tela de serviço: checkbox list para selecionar profissionais que realizam o serviço
- [ ] Na tela de profissional: checkbox list para selecionar serviços que ele realiza
- [ ] Alteração refletida em ambas as direções (bidirecional)
- [ ] Na página pública, ao selecionar um serviço, mostrar apenas profissionais associados
- [ ] No cálculo de disponibilidade, considerar apenas profissionais associados ao serviço escolhido
- [ ] Permitir preço diferenciado por profissional (override opcional)
- [ ] Permitir duração diferenciada por profissional (override opcional)
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Um serviço pode ter N profissionais; um profissional pode ter N serviços (N:N)
- Se nenhum profissional for associado, o serviço fica oculto na página pública
- Override de preço/duração é opcional — se não definido, usa o valor padrão do serviço
- Ao remover um profissional de um serviço, agendamentos futuros desse profissional naquele serviço são mantidos (não cancela automaticamente)

---

### Profissionais

---

### BF-006 — CRUD de profissionais

**Prioridade:** Must (MVP)
**Módulo:** Profissionais
**User Story:** Como gestor da barbearia, quero cadastrar e gerenciar os profissionais da equipe, para organizar a agenda e os atendimentos por pessoa.
**Critérios de aceite:**
- [ ] Tela de listagem de profissionais em cards com foto, nome e status
- [ ] Formulário de criação: nome completo, telefone (com máscara), e-mail (opcional), foto (upload com crop), cor da agenda (color picker com 12 cores pré-definidas)
- [ ] Edição via drawer lateral
- [ ] Toggle ativo/inativo
- [ ] Soft delete com confirmação ("Este profissional tem X agendamentos futuros. Deseja inativar?")
- [ ] Exibição do total de atendimentos do mês ao lado do nome
- [ ] Ordenação por nome ou por número de atendimentos
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Cada profissional tem uma cor única na agenda para diferenciação visual
- Profissional inativo não aparece na página pública e não recebe novos agendamentos
- Profissional inativo mantém agendamentos existentes (para histórico)
- O owner sempre é um profissional (pode se auto-remover da agenda, mas o registro permanece)
- Limite de profissionais conforme o plano contratado (Solo=1, Equipe=5, Premium=15)
- Telefone é obrigatório (usado para notificações)

---

### BF-007 — Configuração de horários de trabalho por dia da semana

**Prioridade:** Must (MVP)
**Módulo:** Profissionais
**User Story:** Como gestor, quero definir os horários de trabalho de cada profissional por dia da semana, para que a agenda mostre apenas horários disponíveis.
**Critérios de aceite:**
- [ ] Grid visual de 7 dias (Seg a Dom) com toggle de dia ativo/inativo
- [ ] Para cada dia ativo: horário de início e fim (selects com incrementos de 15min)
- [ ] Permitir múltiplos turnos por dia (ex: 09:00-12:00 e 14:00-19:00)
- [ ] Botão "Copiar para todos os dias" para facilitar configuração
- [ ] Validação: horário de fim deve ser posterior ao de início
- [ ] Validação: turnos não podem se sobrepor no mesmo dia
- [ ] Preview visual da semana configurada
- [ ] Horários do profissional devem estar dentro do horário de funcionamento da barbearia
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Se o profissional não tiver horários configurados, herda o horário de funcionamento da barbearia
- Alterações nos horários valem para agendamentos futuros (não afeta agendamentos existentes)
- Horários do profissional não podem extrapolar o horário de funcionamento da unidade
- Se a barbearia fecha às 19h, o profissional não pode ter turno até 20h
- O sistema sugere horário padrão baseado no funcionamento da barbearia

---

### BF-008 — Pausas/intervalos

**Prioridade:** Must (MVP)
**Módulo:** Profissionais
**User Story:** Como gestor, quero configurar pausas fixas na agenda dos profissionais (almoço, descanso), para que esses horários não recebam agendamentos.
**Critérios de aceite:**
- [ ] Dentro da configuração de horários, botão "Adicionar pausa" por dia
- [ ] Campos: horário início, horário fim, motivo (opcional, ex: "Almoço")
- [ ] Pausa exibida visualmente na agenda com cor diferenciada (cinza)
- [ ] Pausas bloqueiam automaticamente a criação de agendamentos naquele período
- [ ] Permitir até 3 pausas por dia por profissional
- [ ] Pausa padrão sugerida: 12:00-13:00 (Almoço)
- [ ] Edição e remoção de pausas
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Pausas devem estar dentro do horário de trabalho do profissional
- Pausas não podem se sobrepor entre si
- Ao criar uma pausa, se houver agendamento naquele horário, exibir alerta (mas não impedir — o gestor decide)
- Pausas fixas se repetem semanalmente; pausas pontuais são tratadas via BF-012 (Bloqueio de horários)
- Duração mínima de pausa: 15 minutos

---

### Agenda

---

### BF-009 — Visualização de agenda por dia e por profissional

**Prioridade:** Must (MVP)
**Módulo:** Agenda
**User Story:** Como gestor ou recepcionista, quero visualizar a agenda do dia mostrando todos os profissionais lado a lado, para ter visão completa da operação.
**Critérios de aceite:**
- [ ] Visualização padrão: dia atual com colunas por profissional
- [ ] Cada coluna mostra os slots de tempo do profissional (de acordo com seu horário de trabalho)
- [ ] Agendamentos exibidos como cards no slot correspondente com: nome do cliente, serviço, horário, status (badge colorido)
- [ ] Cores dos cards seguem a cor do profissional
- [ ] Navegação entre dias: setas esquerda/direita + date picker
- [ ] Filtro por profissional específico (mostrar apenas 1)
- [ ] Indicação visual de horários vagos, pausas e bloqueios
- [ ] Horário atual destacado com linha horizontal vermelha (se visualizando o dia de hoje)
- [ ] Responsivo: em mobile, mostrar 1 profissional por vez com swipe entre eles
- [ ] Clicar em um slot vago abre o formulário de agendamento rápido pré-preenchido com profissional e horário
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- A agenda sempre abre no dia atual ao ser acessada
- Profissionais inativos não aparecem na agenda
- Profissionais que não trabalham no dia selecionado aparecem com coluna esmaecida e texto "Folga"
- Slots passados (horário já foi) ficam com opacidade reduzida
- A agenda atualiza a cada 60 segundos automaticamente (polling ou realtime)
- Formato de hora: 24h (padrão brasileiro)

---

### BF-010 — Criação rápida de agendamento (1-3 cliques)

**Prioridade:** Must (MVP)
**Módulo:** Agenda
**User Story:** Como recepcionista, quero criar um agendamento em no máximo 3 passos, para não fazer o cliente esperar no telefone ou no balcão.
**Critérios de aceite:**
- [ ] Clicar em slot vago na agenda abre drawer/modal com profissional e horário pré-preenchidos
- [ ] Campo de cliente com autocomplete por nome ou telefone
- [ ] Se cliente não encontrado, opção inline "Criar novo cliente" com campos mínimos: nome + telefone
- [ ] Select de serviço (filtrado pelos serviços do profissional selecionado)
- [ ] Ao selecionar serviço, calcular e exibir horário de término
- [ ] Botão "Agendar" cria o agendamento com status "pendente"
- [ ] Após criar, o card aparece imediatamente na agenda
- [ ] Atalho de teclado: tecla "N" abre formulário de novo agendamento (com campos vazios)
- [ ] Feedback visual de sucesso (toast notification)
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Não é possível agendar em slot já ocupado (validação server-side)
- Não é possível agendar em horário passado (exceto para hoje, se o horário estiver dentro dos próximos 15min — para walk-ins)
- Não é possível agendar em horário de pausa ou bloqueio
- Se o serviço não couber no tempo restante antes do próximo agendamento, alertar o usuário
- Cliente encontrado por telefone: preencher nome automaticamente
- Agendamento criado internamente tem flag `source: internal` (vs `source: public` para página pública)

---

### BF-011 — Mudança de status (pendente -> confirmado -> concluído / cancelado / faltou)

**Prioridade:** Must (MVP)
**Módulo:** Agenda
**User Story:** Como gestor, quero mudar o status de cada atendimento com um clique, para controlar o fluxo de atendimentos e ter dados precisos.
**Critérios de aceite:**
- [ ] Status possíveis: Pendente (amarelo), Confirmado (azul), Em atendimento (roxo), Concluído (verde), Cancelado (vermelho), Faltou (cinza escuro)
- [ ] Fluxo principal: Pendente → Confirmado → Em atendimento → Concluído
- [ ] De qualquer status (exceto Concluído): pode ir para Cancelado ou Faltou
- [ ] Mudança via clique no badge de status com dropdown das opções válidas
- [ ] Ao marcar "Faltou": registrar no histórico do cliente e incrementar contador de faltas
- [ ] Ao marcar "Cancelado": opção de informar motivo (campo texto opcional)
- [ ] Ao marcar "Concluído": registrar horário real de conclusão
- [ ] Mudanças de status geram log com timestamp e usuário que alterou
- [ ] Indicação visual clara de cada status na agenda (cores consistentes)
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Status "Concluído" é irreversível (não pode voltar)
- Status "Cancelado" e "Faltou" são reversíveis apenas pelo owner
- Atendimentos com status "Faltou" contam para a política de no-show do cliente
- Após 3 faltas em 90 dias, o sistema sugere bloquear agendamentos online daquele cliente
- Status "Em atendimento" é opcional — pode ir direto de Confirmado para Concluído
- Mudança automática: se o horário do agendamento passou e o status ainda é "Pendente", mudar automaticamente para "Faltou" após 30 minutos (configurável)

---

### BF-012 — Bloqueio de horários

**Prioridade:** Must (MVP)
**Módulo:** Agenda
**User Story:** Como gestor, quero bloquear horários ou dias inteiros na agenda de um profissional, para férias, consultas médicas ou imprevistos.
**Critérios de aceite:**
- [ ] Botão "Bloquear horário" na agenda
- [ ] Formulário: profissional, data início, data fim, horário início, horário fim, motivo (opcional)
- [ ] Opção de bloquear dia inteiro (toggle)
- [ ] Bloqueio exibido visualmente na agenda com fundo hachurado e motivo
- [ ] Não é possível criar agendamentos em horários bloqueados
- [ ] Lista de bloqueios futuros visível nas configurações do profissional
- [ ] Edição e remoção de bloqueios
- [ ] Bloqueio não afeta agendamentos já existentes — exibir alerta se houver conflito
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Bloqueio de um dia inteiro = horário de abertura até fechamento da barbearia
- Bloqueios podem abranger múltiplos dias (ex: férias de 1 semana)
- Se houver agendamentos no período bloqueado, exibir lista dos agendamentos conflitantes e sugerir reagendamento
- Bloqueio passado não pode ser editado/removido
- Bloqueios pontuais diferem de pausas recorrentes (BF-008)

---

### BF-013 — Reagendamento (botão + drawer)

**Prioridade:** Must (MVP)
**Módulo:** Agenda
**User Story:** Como recepcionista, quero reagendar um atendimento para outra data/horário de forma rápida, para acomodar mudanças sem cancelar e recriar.
**Critérios de aceite:**
- [ ] Botão "Reagendar" no card do agendamento na agenda
- [ ] Botão "Reagendar" na ficha do cliente
- [ ] Drawer de reagendamento com: data (date picker), profissional (select, pré-selecionado com o atual), horários disponíveis (lista de slots)
- [ ] Apenas horários disponíveis são mostrados (respeita disponibilidade, pausas, bloqueios)
- [ ] Ao confirmar, o agendamento antigo é atualizado (não cria novo)
- [ ] Registro no histórico: "Reagendado de [data/hora antiga] para [data/hora nova] por [usuário]"
- [ ] Notificação para o cliente sobre o reagendamento (se configurado)
- [ ] Manter mesmo serviço e cliente; permitir trocar profissional
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Reagendamento só é possível para agendamentos com status Pendente ou Confirmado
- Não é possível reagendar para o passado
- Não é possível reagendar para um slot já ocupado
- O histórico do agendamento mantém todas as datas anteriores (audit trail)
- Reagendamento não altera o status — se era Confirmado, continua Confirmado
- Limite de 3 reagendamentos por agendamento (após isso, cancelar e criar novo)

---

### BF-014 — Cálculo de disponibilidade

**Prioridade:** Must (MVP)
**Módulo:** Agenda (engine)
**User Story:** Como sistema, quero calcular horários disponíveis com precisão, para que nunca haja conflito de agendamento ou overbooking.
**Critérios de aceite:**
- [ ] Dado: profissional + data + duração do serviço → retorna lista de horários disponíveis
- [ ] Considera: horário de trabalho do profissional no dia
- [ ] Considera: pausas configuradas
- [ ] Considera: bloqueios ativos
- [ ] Considera: agendamentos existentes (com suas durações)
- [ ] Considera: intervalo entre atendimentos (configurável, padrão: 0 min)
- [ ] Considera: horário de funcionamento da barbearia
- [ ] Slots gerados em incrementos de 15 minutos
- [ ] API com tempo de resposta < 200ms para uma data
- [ ] Endpoint: `GET /api/availability?professional_id=X&date=YYYY-MM-DD&service_id=Y`
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Um horário só está disponível se o serviço inteiro couber antes do próximo compromisso
- Se o serviço dura 60min e o próximo agendamento é daqui a 45min, esse slot NÃO está disponível
- Intervalo entre atendimentos é configurável por profissional (0, 5, 10, 15 min)
- Horários passados nunca são retornados como disponíveis (para o dia atual)
- Se o profissional não trabalha no dia solicitado, retornar lista vazia
- O cálculo é determinístico — mesma entrada sempre gera mesma saída
- Proteger contra race condition: ao confirmar agendamento, verificar novamente se o slot está livre

---

### Página Pública

---

### BF-015 — Página de agendamento público (/agendar/:slug)

**Prioridade:** Must (MVP)
**Módulo:** Página Pública
**User Story:** Como cliente da barbearia, quero acessar uma página online para agendar meu horário, sem precisar ligar ou enviar mensagem.
**Critérios de aceite:**
- [ ] URL pública: `barberflow.com.br/agendar/:slug`
- [ ] Página carrega sem necessidade de login
- [ ] Exibe: logo da barbearia, nome, endereço, telefone
- [ ] Design responsivo e mobile-first (80%+ dos acessos serão mobile)
- [ ] Tempo de carregamento < 2 segundos
- [ ] SEO básico: title, description, Open Graph tags
- [ ] Se a barbearia não existir (slug inválido), exibir página 404 amigável
- [ ] Cores seguem a identidade visual padrão do BarberFlow (personalizável futuramente)
- [ ] Footer com "Powered by BarberFlow" e link para o site
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- A página pública não expõe dados internos (faturamento, dados de outros clientes, etc.)
- Apenas serviços ativos e com pelo menos 1 profissional ativo associado são exibidos
- Se a barbearia estiver fora do horário de funcionamento, a página funciona normalmente (agendamento para dias futuros)
- Slug é imutável após a criação (para evitar quebrar links compartilhados)

---

### BF-016 — Wizard de agendamento público: serviço -> profissional -> data -> horário -> dados -> confirmação

**Prioridade:** Must (MVP)
**Módulo:** Página Pública
**User Story:** Como cliente, quero escolher serviço, profissional, data e horário de forma guiada, para agendar meu atendimento em menos de 2 minutos.
**Critérios de aceite:**
- [ ] Passo 1 — Serviço: cards com nome, duração, preço. Seleção única.
- [ ] Passo 2 — Profissional: cards com foto, nome. Opção "Sem preferência" (sistema escolhe com menos agendamentos no dia). Filtrado pelos profissionais que realizam o serviço selecionado.
- [ ] Passo 3 — Data: calendário mensal. Dias sem disponibilidade ficam desabilitados. Máximo de 30 dias no futuro.
- [ ] Passo 4 — Horário: lista de slots disponíveis calculados via BF-014. Se nenhum disponível, mensagem "Sem horários nesta data" com sugestão de datas próximas.
- [ ] Passo 5 — Dados do cliente: nome completo + telefone (com máscara). Se telefone já cadastrado, preencher nome automaticamente.
- [ ] Passo 6 — Confirmação: resumo completo (serviço, profissional, data, horário, preço). Botão "Confirmar agendamento".
- [ ] Barra de progresso visual indicando etapa atual
- [ ] Botão "Voltar" em todas as etapas
- [ ] Após confirmar: tela de sucesso com dados do agendamento e opção de salvar na agenda do celular (arquivo .ics)
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- O agendamento criado via página pública tem status "Pendente" (precisa confirmação do gestor ou automática)
- "Sem preferência" atribui ao profissional com maior disponibilidade no dia/horário
- Máximo de 2 agendamentos futuros por telefone (evitar abuso)
- Não permitir agendar para o mesmo dia/horário se já tem agendamento pendente com o mesmo telefone
- Preço exibido é informativo — pagamento não é processado online na v1
- Após confirmar, o slot é imediatamente reservado (evitar dupla reserva)

---

### BF-017 — Identificação por telefone (retornar dados em visitas futuras)

**Prioridade:** Must (MVP)
**Módulo:** Página Pública / Clientes
**User Story:** Como cliente recorrente, quero que o sistema reconheça meu telefone e preencha meus dados automaticamente, para agendar mais rápido.
**Critérios de aceite:**
- [ ] No passo 5 do wizard público, ao digitar o telefone completo, buscar cliente no banco
- [ ] Se encontrado: preencher nome automaticamente, exibir mensagem "Bem-vindo de volta, [nome]!"
- [ ] Se encontrado: pré-selecionar o último serviço e profissional utilizados (usuário pode alterar)
- [ ] Se não encontrado: manter campos vazios para preenchimento manual
- [ ] Busca realizada em tempo real (debounce de 500ms após digitar o telefone completo)
- [ ] Dados retornados: nome, último serviço, último profissional
- [ ] Não retornar dados sensíveis (histórico completo, valor gasto, etc.)
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Identificação é por telefone (único por tenant)
- O número é normalizado antes da busca (remover formatação, considerar apenas dígitos)
- Se o mesmo telefone existir com nomes diferentes, usar o mais recente
- Dados de outros tenants nunca são retornados (isolamento total)
- A funcionalidade não armazena cookies nem rastreia o cliente — é baseada apenas no telefone informado

---

### Clientes

---

### BF-018 — Lista de clientes com busca e filtros

**Prioridade:** Must (MVP)
**Módulo:** Clientes
**User Story:** Como gestor, quero ver todos os meus clientes em uma lista organizada com busca e filtros, para encontrar qualquer cliente rapidamente.
**Critérios de aceite:**
- [ ] Tabela com colunas: nome, telefone, último atendimento, total de atendimentos, status (ativo/em risco/inativo), ações
- [ ] Busca por nome ou telefone com resultado em tempo real (debounce 300ms)
- [ ] Filtros: por status (ativo, em risco, inativo), por profissional favorito
- [ ] Ordenação por: nome (A-Z), última visita (mais recente primeiro), total de atendimentos
- [ ] Paginação ou scroll infinito (20 itens por página)
- [ ] Badge com contagem por status no topo: "45 ativos | 12 em risco | 8 inativos"
- [ ] Clique no nome abre a ficha do cliente (BF-019)
- [ ] Botão "Novo cliente" para cadastro manual
- [ ] Export CSV da lista filtrada
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Clientes são criados automaticamente no primeiro agendamento (via agenda interna ou página pública)
- Clientes também podem ser cadastrados manualmente
- Telefone é o identificador único do cliente por tenant
- Ao cadastrar cliente com telefone existente, exibir o registro existente (não duplicar)
- Lista mostra apenas clientes do tenant do usuário logado

---

### BF-019 — Ficha do cliente com histórico

**Prioridade:** Must (MVP)
**Módulo:** Clientes
**User Story:** Como gestor, quero ver a ficha completa de um cliente com todo o histórico de atendimentos, para personalizar o atendimento e tomar decisões.
**Critérios de aceite:**
- [ ] Dados do cliente: nome, telefone, e-mail (se tiver), data de cadastro, foto (opcional)
- [ ] Métricas do cliente: total de atendimentos, total gasto (R$), ticket médio, frequência média (dias entre visitas), faltas
- [ ] Timeline de atendimentos: lista cronológica (mais recente primeiro) com data, serviço, profissional, valor, status
- [ ] Último atendimento destacado
- [ ] Próximo agendamento destacado (se houver)
- [ ] Status do cliente com badge visual (ativo/em risco/inativo)
- [ ] Notas/observações: campo de texto livre para registrar preferências do cliente
- [ ] Botões de ação rápida: "Agendar", "Reagendar", "Enviar mensagem"
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Ticket médio = total gasto / total de atendimentos concluídos
- Frequência média = média de dias entre atendimentos concluídos consecutivos
- Apenas atendimentos com status "Concluído" contam para métricas financeiras
- Atendimentos cancelados e faltas são exibidos na timeline mas com indicação visual diferente
- Notas são visíveis apenas para o time interno (nunca para o cliente)

---

### BF-020 — Status automático (ativo/em risco/inativo) baseado em last_visit

**Prioridade:** Must (MVP)
**Módulo:** Clientes
**User Story:** Como gestor, quero que o sistema classifique automaticamente meus clientes com base na última visita, para que eu saiba quem precisa de atenção.
**Critérios de aceite:**
- [ ] Status calculado automaticamente com base na data do último atendimento concluído:
  - Ativo: última visita há menos de 30 dias
  - Em risco: última visita entre 30 e 60 dias
  - Inativo: última visita há mais de 60 dias
- [ ] Badge colorido: verde (ativo), amarelo (em risco), vermelho (inativo)
- [ ] Status recalculado diariamente (job agendado) ou ao abrir a lista de clientes
- [ ] Contadores no dashboard: "X clientes ativos | Y em risco | Z inativos"
- [ ] Transição de status gera notificação no dashboard (ex: "5 clientes passaram para Em Risco esta semana")
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Os intervalos são configuráveis nas configurações (padrão: 30/60 dias)
- Cliente novo sem atendimento concluído é tratado como "Novo" (badge azul)
- O status é calculado, nunca editado manualmente
- Clientes "Em Risco" são o principal público para campanhas de reativação
- O cálculo considera apenas atendimentos com status "Concluído"

---

### BF-021 — Ação rápida de reagendar a partir da ficha

**Prioridade:** Must (MVP)
**Módulo:** Clientes
**User Story:** Como gestor visualizando a ficha de um cliente inativo, quero reagendá-lo com 1 clique, para converter a informação em ação imediata.
**Critérios de aceite:**
- [ ] Botão "Agendar" proeminente na ficha do cliente
- [ ] Ao clicar, abre drawer de agendamento com cliente pré-preenchido
- [ ] Sugere o último serviço e profissional do cliente como padrão
- [ ] Fluxo idêntico ao BF-010 (criação rápida) mas com cliente já selecionado
- [ ] Após agendar, atualizar a ficha do cliente automaticamente (exibir próximo agendamento)
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- A sugestão de serviço/profissional é baseada no último atendimento concluído
- Se o profissional sugerido não estiver mais ativo, sugerir o próximo disponível
- O agendamento criado a partir da ficha tem flag `source: reactivation` para métricas

---

### Confirmação & Lembrete

---

### BF-022 — Envio de confirmação após agendamento (template pronto)

**Prioridade:** Must (MVP)
**Módulo:** Notificações
**User Story:** Como cliente que acabou de agendar, quero receber uma confirmação com os detalhes do meu horário, para ter certeza de que o agendamento foi registrado.
**Critérios de aceite:**
- [ ] Após agendamento (interno ou público), enviar mensagem de confirmação automaticamente
- [ ] Canal de envio na v1: SMS (via Twilio ou similar) ou WhatsApp Business API
- [ ] Template da mensagem: "Olá [nome]! Seu agendamento na [barbearia] está confirmado: [serviço] com [profissional] em [data] às [hora]. Endereço: [endereço]. Até lá!"
- [ ] Template editável pelo gestor nas configurações
- [ ] Log de envio: registrar que a mensagem foi enviada (data, hora, canal, status)
- [ ] Se o envio falhar, registrar o erro mas não impedir o agendamento
- [ ] Toggle para ativar/desativar confirmações automáticas
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Na v1, o envio pode ser via API de SMS ou link de WhatsApp (fallback: apenas registrar a mensagem para envio manual)
- Custo de SMS é repassado ou absorvido conforme o plano
- O envio de confirmação é por agendamento (não agrupar múltiplos)
- Se o número de telefone for inválido, registrar no log e notificar o gestor
- Template suporta variáveis: {nome}, {barbearia}, {servico}, {profissional}, {data}, {hora}, {endereco}

---

### BF-023 — Envio de lembrete antes do horário (configurável)

**Prioridade:** Must (MVP)
**Módulo:** Notificações
**User Story:** Como cliente, quero receber um lembrete antes do meu horário, para não esquecer do agendamento e reduzir faltas.
**Critérios de aceite:**
- [ ] Lembrete enviado X horas antes do agendamento (configurável: 1h, 2h, 4h, 24h — padrão: 2h)
- [ ] Template: "Lembrete: seu horário na [barbearia] é hoje às [hora] com [profissional]. Serviço: [serviço]. Nos vemos em breve!"
- [ ] Template editável nas configurações
- [ ] Job agendado que roda a cada 15 minutos verificando agendamentos que precisam de lembrete
- [ ] Flag `reminder_sent` no agendamento para evitar envio duplicado
- [ ] Toggle para ativar/desativar lembretes
- [ ] Lembrete não é enviado se o agendamento foi cancelado ou se o cliente faltou
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Lembrete é enviado apenas uma vez por agendamento
- Se o agendamento for criado com menos tempo que o período configurado (ex: agendado para daqui a 1h e lembrete configurado para 2h antes), enviar imediatamente
- Lembretes usam o mesmo canal da confirmação (SMS ou WhatsApp)
- O horário de envio é calculado com base no timezone da barbearia
- Não enviar lembretes entre 22:00 e 08:00 — adiar para 08:00

---

### Dashboard

---

### BF-024 — Card atendimentos de hoje

**Prioridade:** Must (MVP)
**Módulo:** Dashboard
**User Story:** Como gestor, quero ver quantos atendimentos tenho hoje ao abrir o sistema, para ter uma visão rápida do volume do dia.
**Critérios de aceite:**
- [ ] Card com número grande: total de agendamentos do dia
- [ ] Subdivisão por status: X confirmados, Y pendentes, Z concluídos
- [ ] Comparação com o mesmo dia da semana anterior: "+3 vs. semana passada" ou "-2 vs. semana passada"
- [ ] Clique no card leva para a agenda do dia
- [ ] Ícone visual representativo (calendário)
- [ ] Atualização em tempo real (ou a cada 60s)
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- "Hoje" é baseado no timezone configurado na barbearia
- Atendimentos cancelados não contam no total principal, mas aparecem na subdivisão
- A comparação semanal considera o mesmo dia da semana (ex: segunda atual vs. segunda anterior)

---

### BF-025 — Card ocupação do dia (%)

**Prioridade:** Must (MVP)
**Módulo:** Dashboard
**User Story:** Como gestor, quero ver a porcentagem de ocupação do dia, para saber se há espaço para mais atendimentos ou se preciso redistribuir.
**Critérios de aceite:**
- [ ] Card com porcentagem em destaque (ex: "75%")
- [ ] Barra de progresso visual colorida: verde (< 70%), amarelo (70-90%), vermelho (> 90%)
- [ ] Cálculo: (slots ocupados / slots totais disponíveis) × 100
- [ ] Tooltip: "X de Y horários preenchidos"
- [ ] Considera todos os profissionais ativos do dia
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Slots ocupados = agendamentos com status Pendente, Confirmado, Em atendimento ou Concluído
- Slots cancelados e faltas não contam como ocupados
- Slots totais = soma de todos os slots de 15min de todos os profissionais ativos no dia, descontando pausas e bloqueios
- Ocupação de 100% = nenhum horário disponível para nenhum profissional

---

### BF-026 — Card faltas da semana

**Prioridade:** Must (MVP)
**Módulo:** Dashboard
**User Story:** Como gestor, quero ver quantas faltas tive na semana, para tomar ações de redução de no-show.
**Critérios de aceite:**
- [ ] Card com número de no-shows da semana atual (segunda a domingo)
- [ ] Comparação com semana anterior: "3 faltas (era 5 semana passada)"
- [ ] Clique abre lista dos clientes que faltaram com opção de ação rápida
- [ ] Indicador visual: seta verde (menos faltas) ou vermelha (mais faltas) vs. semana anterior
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Semana = segunda a domingo
- Falta = agendamento com status "Faltou"
- Métrica inclui todos os profissionais

---

### BF-027 — Card horários vagos hoje

**Prioridade:** Must (MVP)
**Módulo:** Dashboard
**User Story:** Como gestor, quero ver quantos horários vagos tenho hoje, para saber exatamente o potencial de receita que estou perdendo.
**Critérios de aceite:**
- [ ] Card com número de slots vagos de 30min (duração média de serviço) restantes no dia
- [ ] Valor estimado de receita perdida: (slots vagos × ticket médio)
- [ ] Texto: "X horários vagos hoje (~R$ Y não faturados)"
- [ ] Clique leva para ação BF-029 (preencher horários vagos)
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Considerar apenas horários futuros (horários passados já eram)
- Ticket médio calculado com base nos últimos 30 dias de atendimentos concluídos
- Se não houver histórico suficiente, usar R$ 50 como ticket médio padrão
- Slots vagos consideram todos os profissionais ativos que trabalham no dia

---

### BF-028 — Card clientes para retorno

**Prioridade:** Must (MVP)
**Módulo:** Dashboard
**User Story:** Como gestor, quero ver quantos clientes estão em risco de se tornarem inativos, para agir proativamente na retenção.
**Critérios de aceite:**
- [ ] Card com número de clientes com status "Em Risco" (30-60 dias sem visita)
- [ ] Subtexto: "X clientes não voltam há mais de 30 dias"
- [ ] Clique abre lista filtrada desses clientes com ação rápida de agendamento
- [ ] Lista ordenada por urgência (mais tempo sem visita primeiro)
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- "Para retorno" = status "Em Risco" conforme BF-020
- Inclui apenas clientes que tiveram pelo menos 1 atendimento concluído
- Não inclui clientes já inativos (> 60 dias) — esses são tratados em BF-035

---

### BF-029 — Quick action "Preencher horários vagos"

**Prioridade:** Must (MVP)
**Módulo:** Dashboard
**User Story:** Como gestor, quero uma ação rápida que me ajude a preencher os horários vagos do dia, para maximizar minha receita.
**Critérios de aceite:**
- [ ] Botão no dashboard: "Preencher horários vagos"
- [ ] Ao clicar, abre painel com:
  - Lista de horários vagos do dia (hora + profissional)
  - Lista de clientes sugeridos para contato (em risco ou com frequência regular que estão "na hora de voltar")
  - Botão "Agendar" ao lado de cada sugestão
- [ ] Sugestão de clientes baseada em: último serviço compatível com o horário vago + profissional favorito disponível
- [ ] Ao agendar, o horário sai da lista automaticamente
- [ ] Opção de enviar convite ao cliente via mensagem
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Sugestão prioriza: 1) clientes em risco com profissional favorito disponível; 2) clientes em risco com qualquer profissional; 3) clientes ativos cuja frequência média indica que estão perto de precisar de um atendimento
- Máximo de 5 sugestões por horário vago
- Se não houver sugestões suficientes, exibir "Sem sugestões — agendar manualmente"
- A ação é manual (gestor decide) — o sistema apenas sugere

---

### BF-030 — Quick action "Reativar clientes"

**Prioridade:** Must (MVP)
**Módulo:** Dashboard
**User Story:** Como gestor, quero uma ação rápida para ver e contatar clientes que estão sumindo, para recuperá-los antes que virem inativos.
**Critérios de aceite:**
- [ ] Botão no dashboard: "Reativar clientes"
- [ ] Abre painel com lista de clientes "Em Risco" ordenados por dias desde a última visita
- [ ] Para cada cliente: nome, telefone, dias sem visita, último serviço, profissional favorito
- [ ] Botão "Agendar" — abre drawer de agendamento rápido pré-preenchido
- [ ] Botão "Enviar mensagem" — abre template de mensagem de retorno (BF-036, se disponível; senão, link direto para WhatsApp)
- [ ] Contador: "X clientes reativados este mês"
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- "Reativar" = agendar um cliente que estava em risco ou inativo
- O contador de reativações é calculado: clientes que tinham status Em Risco ou Inativo e agora têm agendamento futuro ou atendimento recente
- A lista exibe máximo de 20 clientes por vez com paginação
- Clientes que já têm agendamento futuro não aparecem na lista

---

### Configurações

---

### BF-031 — Dados da unidade (nome, endereço, telefone, logo)

**Prioridade:** Must (MVP)
**Módulo:** Configurações
**User Story:** Como gestor, quero editar os dados da minha barbearia, para que as informações corretas apareçam na página pública e nas notificações.
**Critérios de aceite:**
- [ ] Formulário com: nome do negócio, endereço completo (rua, número, bairro, cidade, estado, CEP), telefone (com máscara), e-mail de contato, logo (upload com preview e crop)
- [ ] Validação de CEP com preenchimento automático de endereço (via API ViaCEP)
- [ ] Preview de como os dados aparecem na página pública
- [ ] Salvamento com feedback visual (toast de sucesso)
- [ ] Logo aceita formatos: JPG, PNG, WebP. Tamanho máximo: 2MB. Redimensionada para 400x400px
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Nome do negócio é obrigatório; demais campos são opcionais mas recomendados
- Alterações refletem imediatamente na página pública
- O slug da URL NÃO muda ao alterar o nome (evitar quebrar links)
- Se não houver logo, usar inicial do nome em fundo colorido

---

### BF-032 — Horários de funcionamento

**Prioridade:** Must (MVP)
**Módulo:** Configurações
**User Story:** Como gestor, quero definir os horários de funcionamento da barbearia, para que o sistema respeite esses limites na agenda e página pública.
**Critérios de aceite:**
- [ ] Grid de 7 dias com toggle ativo/inativo por dia
- [ ] Horário de abertura e fechamento por dia (selects com incremento de 15min)
- [ ] Interface idêntica à de horários do profissional (BF-007) para consistência
- [ ] Botão "Copiar para todos os dias"
- [ ] Exibição do horário na página pública: "Seg-Sex: 09:00-19:00 | Sáb: 09:00-17:00 | Dom: Fechado"
- [ ] Validação: horário de fechamento posterior ao de abertura
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Horários da barbearia são o limite superior — profissionais não podem trabalhar fora deles
- Ao alterar horário da barbearia para um intervalo menor, alertar se houver profissionais com horários fora do novo intervalo
- Alterações valem para datas futuras; agendamentos existentes são mantidos
- Feriados são tratados via BF-012 (bloqueio de horários) — não há calendário de feriados automático na v1

---

### BF-033 — Política de cancelamento e no-show

**Prioridade:** Must (MVP)
**Módulo:** Configurações
**User Story:** Como gestor, quero definir regras de cancelamento e tratamento de faltas, para proteger minha agenda e educar os clientes.
**Critérios de aceite:**
- [ ] Configuração de antecedência mínima para cancelamento: 1h, 2h, 4h, 12h, 24h (padrão: 2h)
- [ ] Configuração de limite de no-shows antes de ação: 2, 3, 5 faltas em 90 dias (padrão: 3)
- [ ] Ação ao atingir limite: notificar gestor / bloquear agendamento online / ambos (padrão: notificar)
- [ ] Texto da política visível na página pública (editável)
- [ ] Texto padrão: "Cancelamentos devem ser feitos com pelo menos [X]h de antecedência. Após [Y] faltas, o agendamento online pode ser restrito."
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Cancelamento dentro do prazo mínimo: o sistema permite mas registra como "cancelamento tardio"
- O bloqueio de agendamento online não impede agendamento interno (gestor ainda pode agendar o cliente)
- A contagem de faltas é contínua em janela de 90 dias (rolling window)
- O bloqueio é reversível pelo gestor a qualquer momento

---

### BF-034 — Configuração de notificações

**Prioridade:** Must (MVP)
**Módulo:** Configurações
**User Story:** Como gestor, quero controlar quais notificações são enviadas e quando, para personalizar a comunicação sem exagerar no contato.
**Critérios de aceite:**
- [ ] Toggle para cada tipo de notificação:
  - Confirmação de agendamento (on/off, padrão: on)
  - Lembrete antes do atendimento (on/off + seleção de antecedência, padrão: on / 2h)
  - Notificação de cancelamento (on/off, padrão: on)
- [ ] Edição de templates de mensagem para cada tipo
- [ ] Variáveis disponíveis listadas abaixo do editor: {nome}, {barbearia}, {servico}, {profissional}, {data}, {hora}, {endereco}
- [ ] Preview da mensagem com dados de exemplo
- [ ] Botão "Restaurar padrão" para cada template
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Templates têm limite de 160 caracteres (limite SMS) com contador visual
- Se o template exceder 160 caracteres, avisar que pode ser cobrado como 2 SMS
- Variáveis não reconhecidas são mantidas literalmente na mensagem (não quebrar)
- Templates devem ter pelo menos o nome do cliente e a data/hora do agendamento

---

## SHOULD — Logo após MVP (Semanas 5-6)

Itens que agregam valor significativo mas não impedem o lançamento. Prioridade alta para as primeiras iterações pós-MVP.

---

### BF-035 — Clientes inativos com lista segmentada e ação rápida

**Prioridade:** Should
**Módulo:** Clientes / Campanhas
**User Story:** Como gestor, quero ver uma lista dos clientes que pararam de vir (inativos há mais de 60 dias), para tentar recuperá-los com ações direcionadas.
**Critérios de aceite:**
- [ ] Tela dedicada "Clientes Inativos" acessível pelo menu e pelo dashboard
- [ ] Lista com: nome, telefone, dias desde a última visita, total de visitas anteriores, ticket médio do cliente
- [ ] Ordenação padrão: mais visitas anteriores primeiro (maior potencial de recuperação)
- [ ] Filtros: por período de inatividade (60-90 dias, 90-180 dias, 180+ dias)
- [ ] Ação rápida individual: "Convidar" (envia mensagem) ou "Agendar" (abre drawer)
- [ ] Ação em lote: selecionar múltiplos clientes + "Enviar campanha"
- [ ] Contador: "X clientes inativos | R$ Y de receita mensal potencial perdida"
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Receita potencial = ticket médio do cliente × frequência estimada mensal
- Frequência estimada = 30 / frequência média em dias do cliente
- Clientes com apenas 1 visita anterior têm menor prioridade (podem ter sido one-time)
- Clientes com 5+ visitas anteriores que ficaram inativos são flag "Alto valor" (destaque visual)

---

### BF-036 — Templates de campanhas de reativação

**Prioridade:** Should
**Módulo:** Campanhas
**User Story:** Como gestor, quero ter templates prontos de mensagens para convidar clientes a voltarem, para não perder tempo criando textos do zero.
**Critérios de aceite:**
- [ ] Biblioteca com 5+ templates prontos:
  1. "Sentimos sua falta" — mensagem carinhosa de retorno
  2. "Desconto especial" — oferta de % off para retorno
  3. "Novidade" — comunicar novo serviço/profissional
  4. "Aniversário" — parabéns + oferta (se tiver data de nascimento)
  5. "Última chance" — urgência para clientes inativos há muito tempo
- [ ] Editor de template com variáveis
- [ ] Preview com dados de exemplo
- [ ] Salvar templates customizados
- [ ] Duplicar e editar templates existentes
**Estimativa:** P (1-2 dias)
**Regras de negócio:**
- Templates respeitam limite de 160 caracteres (SMS)
- Cada template tem um tom indicado: formal, casual, urgente
- Templates com oferta de desconto são informativos — o desconto é aplicado manualmente no atendimento

---

### BF-037 — Disparo de campanha para lista

**Prioridade:** Should
**Módulo:** Campanhas
**User Story:** Como gestor, quero enviar uma mensagem para uma lista de clientes selecionados, para fazer uma ação de reativação em escala.
**Critérios de aceite:**
- [ ] Selecionar lista de clientes (da tela de inativos ou da lista geral com filtro)
- [ ] Escolher template de mensagem
- [ ] Preview da mensagem personalizada para 3 clientes de amostra
- [ ] Confirmar envio com contagem: "Enviar para X clientes?"
- [ ] Envio assíncrono com barra de progresso
- [ ] Relatório de envio: enviados, falhas, pendentes
- [ ] Histórico de campanhas enviadas com data, template, quantidade, taxa de retorno
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Limite de 100 clientes por campanha na v1
- Intervalo mínimo entre campanhas para o mesmo cliente: 7 dias (anti-spam)
- Taxa de retorno = clientes da campanha que agendaram nos 14 dias seguintes / total enviado
- O envio respeita horário comercial (08:00-20:00)
- Se houver falha no envio, retry automático 1 vez após 30 minutos

---

### BF-038 — Planos/combos simples (cadastro)

**Prioridade:** Should
**Módulo:** Planos
**User Story:** Como gestor, quero criar planos mensais para clientes frequentes (ex: 4 cortes por mês), para fidelizar e garantir receita recorrente.
**Critérios de aceite:**
- [ ] CRUD de planos com: nome, descrição, serviços incluídos (multi-select), quantidade de sessões por mês, preço mensal (R$), validade (dias)
- [ ] Templates sugeridos: "Plano Corte Mensal" (4 cortes/mês, R$150), "Plano Barba Semanal" (4 barbas/mês, R$120), "Plano Completo" (4 cortes + 4 barbas, R$240)
- [ ] Toggle ativo/inativo
- [ ] Listagem com contagem de clientes vinculados a cada plano
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Preço do plano deve representar desconto vs. compra avulsa (sistema calcula e exibe: "Economia de X%")
- Plano pode incluir 1 ou mais serviços diferentes
- Sessões não utilizadas no mês não acumulam para o próximo
- Validade mínima: 30 dias; máxima: 365 dias

---

### BF-039 — Vínculo plano-cliente com controle de sessões

**Prioridade:** Should
**Módulo:** Planos / Clientes
**User Story:** Como gestor, quero vincular um plano a um cliente e controlar quantas sessões ele já usou no mês, para gerenciar os benefícios corretamente.
**Critérios de aceite:**
- [ ] Na ficha do cliente: botão "Vincular plano" com select do plano + data de início
- [ ] Exibição na ficha: plano ativo, sessões usadas/total no mês, data de renovação
- [ ] Ao criar agendamento de cliente com plano: marcar o atendimento como "incluído no plano" automaticamente se o serviço está coberto
- [ ] Controle de sessões: ao concluir atendimento de plano, decrementar contador
- [ ] Alerta quando sessões acabarem antes do fim do mês
- [ ] Alerta quando o plano estiver próximo do vencimento (7 dias antes)
- [ ] Histórico de planos do cliente (ativos e expirados)
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Um cliente pode ter apenas 1 plano ativo por vez
- Se o cliente agendar serviço coberto pelo plano e tiver sessões disponíveis, o sistema marca automaticamente
- Se as sessões acabarem, atendimentos adicionais são cobrados avulso
- Renovação é manual na v1 (sem cobrança automática)
- Ao cancelar um plano, sessões restantes são perdidas

---

### BF-040 — Lista de espera manual assistida

**Prioridade:** Should
**Módulo:** Agenda
**User Story:** Como recepcionista, quero registrar clientes que querem horário mas não encontraram vaga, para avisá-los quando surgir disponibilidade.
**Critérios de aceite:**
- [ ] Botão "Lista de espera" na agenda e no formulário de agendamento
- [ ] Formulário: cliente + serviço + profissional (opcional) + data desejada (opcional) + período preferido (manhã/tarde)
- [ ] Lista visível no painel lateral da agenda
- [ ] Quando um horário é cancelado ou liberado, o sistema sugere clientes da lista de espera compatíveis
- [ ] Botão "Convidar" envia mensagem ao cliente com o horário disponível
- [ ] Botão "Agendar" converte a espera em agendamento
- [ ] Status da espera: Aguardando / Convidado / Agendado / Expirado
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Lista de espera não garante o horário — é apenas um registro de interesse
- Itens expiram automaticamente após a data desejada passar
- Prioridade na lista: quem registrou primeiro
- Máximo de 20 itens ativos na lista de espera por vez (na v1)

---

### BF-041 — Financeiro simplificado (receita por período/profissional/serviço)

**Prioridade:** Should
**Módulo:** Financeiro / Relatórios
**User Story:** Como gestor, quero ver a receita da barbearia por período, profissional e serviço, para entender de onde vem meu faturamento.
**Critérios de aceite:**
- [ ] Tela de relatório financeiro com filtros: período (hoje, semana, mês, personalizado), profissional, serviço
- [ ] Cards resumo: receita total, ticket médio, total de atendimentos, receita média por dia
- [ ] Gráfico de barras: receita por dia no período selecionado
- [ ] Tabela: ranking de serviços por receita
- [ ] Tabela: ranking de profissionais por receita
- [ ] Comparação com período anterior: "+15% vs. mês passado"
- [ ] Export CSV dos dados
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Receita = soma dos preços dos atendimentos com status "Concluído"
- Atendimentos incluídos em planos são contabilizados pelo valor do plano dividido pelas sessões (pro-rata)
- Ticket médio = receita total / número de atendimentos concluídos
- Receita é informativa — não há integração com gateway de pagamento na v1

---

### BF-042 — Relatório de ocupação

**Prioridade:** Should
**Módulo:** Relatórios
**User Story:** Como gestor, quero ver a taxa de ocupação por dia e horário, para identificar padrões e otimizar minha operação.
**Critérios de aceite:**
- [ ] Heatmap semanal: dias da semana × horários (ex: segunda 09:00 = 85% ocupação média)
- [ ] Filtro por período (última semana, último mês, últimos 3 meses)
- [ ] Filtro por profissional
- [ ] Identificação de horários "pico" e "vale"
- [ ] Sugestão: "Seus horários mais vazios são terça 14:00-16:00 — considere promoções"
- [ ] Ocupação média geral do período
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Ocupação = agendamentos (exceto cancelados e faltas) / slots totais disponíveis
- Dados insuficientes (< 4 semanas): exibir aviso "Dados parciais — o relatório será mais preciso com mais histórico"
- Não considerar dias de bloqueio total (férias) no cálculo de média

---

### BF-043 — Relatório de retorno de clientes

**Prioridade:** Should
**Módulo:** Relatórios
**User Story:** Como gestor, quero ver a taxa de retorno dos meus clientes, para medir a fidelização e o impacto das ações de reativação.
**Critérios de aceite:**
- [ ] Métricas principais: taxa de retorno em 30 dias (% de clientes que voltam em até 30 dias), taxa de retorno em 60 dias, taxa de churn (% que não voltou em 60+ dias)
- [ ] Gráfico de tendência: taxa de retorno mês a mês
- [ ] Comparativo: taxa de retorno por profissional
- [ ] Análise de coorte simplificada: dos clientes do mês X, quantos % voltaram no mês X+1
- [ ] Destaque: "Sua taxa de retorno é 65% — a média do setor é 55%"
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Taxa de retorno = clientes que tiveram atendimento no período E voltaram dentro de 30 dias / total de clientes atendidos no período
- Considerar apenas clientes com pelo menos 2 atendimentos (novos clientes com 1 visita não entram)
- Benchmark do setor (55%) é um valor fixo na v1 (não calculado dinamicamente)

---

### BF-044 — Perfis de acesso (manager, staff, receptionist)

**Prioridade:** Should
**Módulo:** Auth / Configurações
**User Story:** Como dono da barbearia, quero atribuir diferentes níveis de acesso aos membros da equipe, para que cada um veja apenas o que precisa.
**Critérios de aceite:**
- [ ] 4 perfis: Owner (tudo), Manager (tudo exceto billing e exclusão de conta), Staff (agenda própria + clientes), Receptionist (agenda de todos + clientes, sem configurações/financeiro)
- [ ] Atribuição de perfil ao cadastrar ou editar membro da equipe
- [ ] Menu e funcionalidades filtrados conforme o perfil
- [ ] Tentativa de acesso a rota não autorizada redireciona para dashboard com mensagem
- [ ] Owner não pode ter seu perfil rebaixado (proteção)
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Apenas Owner e Manager podem alterar perfis de outros usuários
- Staff só vê sua própria agenda e seus próprios clientes
- Receptionist vê toda a agenda mas não acessa financeiro nem configurações avançadas
- Deve haver pelo menos 1 Owner por tenant (não pode remover o último)

---

### BF-045 — Convite de membro da equipe

**Prioridade:** Should
**Módulo:** Configurações
**User Story:** Como gestor, quero convidar membros da equipe para acessarem o sistema com suas próprias credenciais, para que cada um gerencie seu trabalho.
**Critérios de aceite:**
- [ ] Botão "Convidar membro" na tela de equipe
- [ ] Formulário: nome, e-mail, perfil de acesso, profissional vinculado (opcional)
- [ ] Envio de e-mail de convite com link de ativação (validade: 72h)
- [ ] Tela de ativação: criar senha + aceitar termos
- [ ] Lista de convites pendentes com opção de reenviar ou cancelar
- [ ] Ao aceitar, o membro aparece na lista de equipe com status "Ativo"
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- E-mail do convite deve ser único no tenant
- Convite expirado pode ser reenviado (gera novo link)
- Ao vincular a um profissional, o membro vê automaticamente sua agenda ao logar
- O limite de membros depende do plano (Solo: 1, Equipe: 5, Premium: 15 — inclui o owner)

---

## COULD — Fase 2 (Após validação do MVP)

Itens que tornam o produto mais competitivo mas dependem de validação de mercado.

---

### BF-046 — Agenda visual com drag-and-drop

**Prioridade:** Could (Fase 2)
**Módulo:** Agenda
**User Story:** Como recepcionista, quero arrastar e soltar agendamentos na agenda para reagendar visualmente, para agilizar mudanças na operação do dia.
**Critérios de aceite:**
- [ ] Drag-and-drop de cards de agendamento entre slots e profissionais
- [ ] Ao soltar, confirmar reagendamento com preview das informações atualizadas
- [ ] Validação de conflito em tempo real durante o arraste (slot de destino fica vermelho se ocupado)
- [ ] Desfazer última ação (Ctrl+Z)
- [ ] Funciona apenas em desktop (em mobile, manter fluxo via botão)
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Drag-and-drop respeita todas as regras de disponibilidade (BF-014)
- Gera registro de reagendamento no histórico (como BF-013)
- Não é possível arrastar agendamentos concluídos ou cancelados

---

### BF-047 — Notificações via WhatsApp API

**Prioridade:** Could (Fase 2)
**Módulo:** Notificações
**User Story:** Como gestor, quero enviar confirmações e lembretes via WhatsApp, para ter maior taxa de leitura do que SMS.
**Critérios de aceite:**
- [ ] Integração com WhatsApp Business API (via provedor: Twilio, 360dialog ou similar)
- [ ] Envio de templates aprovados pelo Meta (confirmação, lembrete, campanha)
- [ ] Fallback para SMS se WhatsApp não disponível
- [ ] Dashboard de entregas: enviados, entregues, lidos, falhas
- [ ] Configuração do número de WhatsApp Business da barbearia
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Templates precisam de aprovação prévia pelo Meta (processo de 24-48h)
- Custo por mensagem varia por provedor — repassado no plano Premium ou como add-on
- Na v1 (COULD), usar link de WhatsApp como workaround (abre chat pré-preenchido)

---

### BF-048 — Cobrança recorrente de planos

**Prioridade:** Could (Fase 2)
**Módulo:** Planos / Financeiro
**User Story:** Como gestor, quero que os planos dos clientes sejam cobrados automaticamente, para reduzir inadimplência e trabalho manual.
**Critérios de aceite:**
- [ ] Integração com gateway de pagamento (Stripe ou Asaas)
- [ ] Cobrança recorrente mensal para planos ativos
- [ ] Gestão de inadimplência: alerta, suspensão, cancelamento
- [ ] Dashboard de cobranças: pagas, pendentes, atrasadas
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Exige integração com gateway e conta bancária da barbearia
- Plano suspenso por inadimplência bloqueia novas sessões mas não cancela agendamentos existentes

---

### BF-049 — Comissões por profissional

**Prioridade:** Could (Fase 2)
**Módulo:** Financeiro
**User Story:** Como gestor, quero configurar e calcular comissões por profissional, para facilitar o acerto financeiro.
**Critérios de aceite:**
- [ ] Configuração de % de comissão por profissional (global ou por serviço)
- [ ] Relatório de comissões por período
- [ ] Comparativo entre profissionais
- [ ] Export para pagamento
**Estimativa:** M (3-4 dias)
**Regras de negócio:**
- Comissão calculada sobre atendimentos concluídos
- Atendimentos de plano usam valor pro-rata para cálculo de comissão

---

### BF-050 — Relatórios avançados (ticket médio, tendências)

**Prioridade:** Could (Fase 2)
**Módulo:** Relatórios
**User Story:** Como gestor, quero relatórios avançados com tendências e insights, para tomar decisões estratégicas baseadas em dados.
**Critérios de aceite:**
- [ ] Dashboard analítico com gráficos interativos
- [ ] Ticket médio por período, profissional, serviço, dia da semana
- [ ] Tendências: crescimento mensal de clientes, receita, ocupação
- [ ] Previsão simples: receita estimada para o próximo mês baseada na tendência
- [ ] Top 10 clientes por receita
- [ ] Serviços mais e menos populares
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Previsão usa média móvel simples (3 meses)
- Dados insuficientes: exibir aviso e omitir previsão

---

### BF-051 — Multi-unidade

**Prioridade:** Could (Fase 2)
**Módulo:** Configurações / Geral
**User Story:** Como dono de rede de barbearias, quero gerenciar múltiplas unidades em uma única conta, para ter visão consolidada do negócio.
**Critérios de aceite:**
- [ ] Criação de múltiplas unidades dentro do mesmo tenant
- [ ] Alternância entre unidades no menu
- [ ] Dashboard consolidado (todas as unidades) e individual (por unidade)
- [ ] Profissionais vinculados a unidade específica
- [ ] Relatórios comparativos entre unidades
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Multi-unidade disponível apenas no plano Premium
- Cada unidade tem seu próprio slug, horários, profissionais e agenda
- Clientes podem ser compartilhados entre unidades (mesmo telefone)

---

### BF-052 — App mobile (PWA)

**Prioridade:** Could (Fase 2)
**Módulo:** Geral
**User Story:** Como gestor, quero acessar o sistema pelo celular como um app, para gerenciar a barbearia de qualquer lugar.
**Critérios de aceite:**
- [ ] Progressive Web App instalável (add to home screen)
- [ ] Funciona offline para consulta (agenda do dia cached)
- [ ] Push notifications para novos agendamentos e lembretes
- [ ] Interface otimizada para telas pequenas
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- PWA é complementar ao web, não substituto
- Offline mode é read-only (agenda do dia)
- Sincronização ao reconectar

---

### BF-053 — Integração gateway de pagamento

**Prioridade:** Could (Fase 2)
**Módulo:** Financeiro
**User Story:** Como gestor, quero receber pagamentos online dos clientes, para facilitar cobranças e reduzir inadimplência.
**Critérios de aceite:**
- [ ] Integração com Stripe ou Asaas
- [ ] Cobrança na confirmação do agendamento (opcional)
- [ ] Cobrança de planos recorrentes
- [ ] Dashboard de pagamentos
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Taxa do gateway repassada ao cliente ou absorvida pela barbearia (configurável)
- Pagamento online é opcional — barbearia pode operar sem

---

### BF-054 — Sinal/entrada para reserva

**Prioridade:** Could (Fase 2)
**Módulo:** Agenda / Financeiro
**User Story:** Como gestor, quero cobrar um sinal no agendamento online, para reduzir faltas e garantir comprometimento do cliente.
**Critérios de aceite:**
- [ ] Configuração de valor do sinal: fixo (R$) ou percentual (% do serviço)
- [ ] Cobrança via gateway no momento do agendamento público
- [ ] Desconto do sinal no valor total do atendimento
- [ ] Política de devolução configurável (cancelamento dentro do prazo = devolve)
**Estimativa:** G (5+ dias)
**Regras de negócio:**
- Sinal é opcional (configurável pela barbearia)
- Depende de BF-053 (gateway de pagamento)
- Devolução em caso de cancelamento dentro do prazo configurado

---

## WON'T — Não faz agora (conscientemente descartado)

Itens que foram avaliados e deliberadamente excluídos do roadmap atual. Podem ser reconsiderados no futuro com base em demanda do mercado.

---

### BF-055 — IA generativa

**Prioridade:** Won't (não faz agora)
**Módulo:** —
**User Story:** Como gestor, quero que o sistema use IA para gerar insights e recomendações automaticamente.
**Critérios de aceite:** N/A
**Estimativa:** N/A
**Regras de negócio:**
- Excluído por complexidade técnica e custo de infraestrutura incompatíveis com a fase atual
- Pode ser explorado como diferencial competitivo na Fase 3+

---

### BF-056 — Chatbot NLU

**Prioridade:** Won't (não faz agora)
**Módulo:** —
**User Story:** Como cliente, quero agendar por conversa natural via chat/WhatsApp.
**Critérios de aceite:** N/A
**Estimativa:** N/A
**Regras de negócio:**
- Exige NLU + integração conversacional + tratamento de ambiguidades
- Custo-benefício não justifica na Fase 1

---

### BF-057 — White-label completo

**Prioridade:** Won't (não faz agora)
**Módulo:** —
**User Story:** Como parceiro/revendedor, quero usar o BarberFlow com minha marca.
**Critérios de aceite:** N/A
**Estimativa:** N/A
**Regras de negócio:**
- Exige infraestrutura multi-tenant com personalização profunda de branding
- Complexidade de suporte e manutenção inviável na fase atual

---

### BF-058 — Marketplace

**Prioridade:** Won't (não faz agora)
**Módulo:** —
**User Story:** Como cliente, quero descobrir barbearias na minha região pelo BarberFlow.
**Critérios de aceite:** N/A
**Estimativa:** N/A
**Regras de negócio:**
- Exige massa crítica de barbearias cadastradas para ter valor
- Modelo de negócio diferente (plataforma vs. SaaS)
- Pode ser explorado como estratégia de aquisição na Fase 3+

---

### BF-059 — Emissão fiscal

**Prioridade:** Won't (não faz agora)
**Módulo:** —
**User Story:** Como gestor, quero emitir nota fiscal diretamente pelo sistema.
**Critérios de aceite:** N/A
**Estimativa:** N/A
**Regras de negócio:**
- Regulamentação fiscal varia por município e regime tributário
- Complexidade jurídica e técnica desproporcional ao benefício na fase atual
- Barbearias geralmente usam contador externo

---

### BF-060 — ERP completo

**Prioridade:** Won't (não faz agora)
**Módulo:** —
**User Story:** Como gestor, quero controle completo de estoque, folha de pagamento e contabilidade.
**Critérios de aceite:** N/A
**Estimativa:** N/A
**Regras de negócio:**
- Foge do escopo e da proposta do BarberFlow (crescimento, não gestão administrativa pesada)
- Integrações com ERPs existentes podem ser exploradas no futuro

---

## Resumo quantitativo

| Prioridade | Qtd | % do Backlog |
|---|---|---|
| Must (MVP) | 34 itens | 57% |
| Should (pós-MVP) | 11 itens | 18% |
| Could (Fase 2) | 9 itens | 15% |
| Won't | 6 itens | 10% |
| **Total** | **60 itens** | **100%** |

### Estimativas do MVP (Must):

| Tamanho | Qtd | Dias estimados |
|---|---|---|
| Pequeno (P) | 16 itens | 16-32 dias-dev |
| Médio (M) | 13 itens | 39-52 dias-dev |
| Grande (G) | 5 itens | 25+ dias-dev |
| **Total MVP** | **34 itens** | **~80-109 dias-dev** |

> **Nota:** Com um dev senior full-stack trabalhando em stack moderna (Next.js + Prisma), sobreposição de tarefas e reutilização de componentes, o MVP é viável em 30 dias calendário (22 dias úteis) priorizando o caminho crítico: Auth → Profissionais/Serviços → Agenda → Página Pública → Dashboard → Configurações.
