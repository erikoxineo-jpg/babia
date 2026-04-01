# BarberFlow - Lista Completa de Paginas

> Versao: 1.0 | Data: 2026-03-31
> Especificacao de todas as paginas do sistema com componentes, prioridade e permissoes.

---

## Legenda de Prioridade

| Prioridade | Significado | Prazo |
|-----------|------------|-------|
| **P0** | Lancamento (MVP) | Dia 1 |
| **P1** | Semana seguinte ao lancamento | Semana 2 |
| **P2** | Fase 2 | Mes 2-3 |

## Legenda de Perfis

| Sigla | Perfil |
|-------|--------|
| **O** | Owner (Dono) |
| **M** | Manager (Gerente) |
| **S** | Staff (Profissional) |
| **R** | Receptionist (Recepcao) |
| **C** | Client (Cliente) |
| **V** | Visitante (sem conta) |

---

## 1. Area Publica

### 1.1 Landing Page

| Campo | Valor |
|-------|-------|
| **Pagina** | Landing Page |
| **Rota** | `/` |
| **Objetivo** | Apresentar o BarberFlow e converter visitantes em cadastros. |
| **Prioridade** | P0 |
| **Perfis** | V, C |
| **Componentes** | Hero com CTA principal ("Teste gratis"), secao de beneficios (4 cards), secao de funcionalidades com screenshots, secao de depoimentos, secao de precos (planos do BarberFlow), FAQ accordion, footer com links legais. |

---

### 1.2 Login

| Campo | Valor |
|-------|-------|
| **Pagina** | Login |
| **Rota** | `/login` |
| **Objetivo** | Autenticar usuarios do painel administrativo. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | Formulario de login (email + senha), link "Esqueci minha senha", link "Criar conta", logo BarberFlow. |

---

### 1.3 Recuperar Senha

| Campo | Valor |
|-------|-------|
| **Pagina** | Recuperar Senha |
| **Rota** | `/login/recuperar-senha` |
| **Objetivo** | Enviar email de redefinicao de senha. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | Campo de email, botao "Enviar link", mensagem de confirmacao de envio, link para voltar ao login. |

---

### 1.4 Nova Senha

| Campo | Valor |
|-------|-------|
| **Pagina** | Definir Nova Senha |
| **Rota** | `/login/nova-senha/:token` |
| **Objetivo** | Permitir que o usuario crie uma nova senha usando token valido. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | Campo nova senha, campo confirmar senha, indicador de forca da senha, botao "Salvar nova senha". |

---

### 1.5 Cadastro

| Campo | Valor |
|-------|-------|
| **Pagina** | Cadastro de Barbearia |
| **Rota** | `/cadastro` |
| **Objetivo** | Registrar nova barbearia e criar conta do proprietario. |
| **Prioridade** | P0 |
| **Perfis** | V |
| **Componentes** | Formulario: nome do dono, email, telefone (WhatsApp), senha, nome da barbearia. Checkbox de termos de uso. Botao "Criar minha barbearia". |

---

### 1.6 Onboarding - Dados da Barbearia

| Campo | Valor |
|-------|-------|
| **Pagina** | Onboarding - Barbearia |
| **Rota** | `/onboarding/barbearia` |
| **Objetivo** | Coletar dados basicos da barbearia no primeiro acesso. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Stepper de progresso (passo 1/5), campos: nome fantasia, CNPJ (opcional), endereco completo (CEP com autocomplete), telefone, upload de logo, slug para agendamento (auto-sugerido). Botao "Proximo". |

---

### 1.7 Onboarding - Horarios

| Campo | Valor |
|-------|-------|
| **Pagina** | Onboarding - Horarios |
| **Rota** | `/onboarding/horarios` |
| **Objetivo** | Definir dias e horarios de funcionamento da barbearia. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Stepper (passo 2/5), grade semanal (seg-dom) com toggle ativo/inativo, horario de abertura e fechamento por dia, opcao de intervalo (almoco). Botoes "Voltar" e "Proximo". |

---

### 1.8 Onboarding - Servicos

| Campo | Valor |
|-------|-------|
| **Pagina** | Onboarding - Servicos |
| **Rota** | `/onboarding/servicos` |
| **Objetivo** | Cadastrar servicos oferecidos pela barbearia. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Stepper (passo 3/5), lista de servicos sugeridos (corte, barba, corte+barba, sobrancelha, pigmentacao) com preco e duracao editaveis, botao "Adicionar servico customizado", lista dos servicos adicionados. Botoes "Voltar" e "Proximo". |

---

### 1.9 Onboarding - Equipe

| Campo | Valor |
|-------|-------|
| **Pagina** | Onboarding - Equipe |
| **Rota** | `/onboarding/equipe` |
| **Objetivo** | Adicionar os profissionais da barbearia. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Stepper (passo 4/5), formulario rapido por profissional (nome, telefone, servicos que realiza via checkbox), lista de profissionais adicionados, opcao "Pular - adicionar depois". Botoes "Voltar" e "Proximo". |

---

### 1.10 Onboarding - Concluido

| Campo | Valor |
|-------|-------|
| **Pagina** | Onboarding - Concluido |
| **Rota** | `/onboarding/concluido` |
| **Objetivo** | Confirmar que a barbearia esta pronta para operar. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Stepper (passo 5/5), resumo do que foi configurado (barbearia, X servicos, X profissionais), link da pagina publica de agendamento (com botao copiar), botao "Ir para o Dashboard", dicas iniciais (3 cards: "Agende seu primeiro cliente", "Compartilhe seu link", "Configure notificacoes WhatsApp"). |

---

### 1.11 Agendamento Publico - Servico

| Campo | Valor |
|-------|-------|
| **Pagina** | Agendamento - Selecao de Servico |
| **Rota** | `/agendar/:slug/servico` |
| **Objetivo** | Permitir que o cliente escolha o(s) servico(s) desejado(s). |
| **Prioridade** | P0 |
| **Perfis** | C, V |
| **Componentes** | Header com logo e nome da barbearia, stepper (passo 1/4), lista de servicos agrupados por categoria (card com nome, duracao, preco), selecao multipla permitida, resumo parcial (total de tempo e preco), botao "Continuar". |

---

### 1.12 Agendamento Publico - Profissional

| Campo | Valor |
|-------|-------|
| **Pagina** | Agendamento - Selecao de Profissional |
| **Rota** | `/agendar/:slug/profissional` |
| **Objetivo** | Permitir que o cliente escolha o profissional de preferencia. |
| **Prioridade** | P0 |
| **Perfis** | C, V |
| **Componentes** | Stepper (passo 2/4), lista de profissionais disponiveis para o(s) servico(s) selecionado(s) (foto, nome, avaliacao), opcao "Sem preferencia" (primeiro disponivel), botoes "Voltar" e "Continuar". |

---

### 1.13 Agendamento Publico - Horario

| Campo | Valor |
|-------|-------|
| **Pagina** | Agendamento - Selecao de Horario |
| **Rota** | `/agendar/:slug/horario` |
| **Objetivo** | Permitir que o cliente escolha data e horario disponiveis. |
| **Prioridade** | P0 |
| **Perfis** | C, V |
| **Componentes** | Stepper (passo 3/4), calendario mensal (dias sem vaga ficam desabilitados), lista de horarios disponiveis no dia selecionado (slots de acordo com duracao), botoes "Voltar" e "Continuar". |

---

### 1.14 Agendamento Publico - Dados

| Campo | Valor |
|-------|-------|
| **Pagina** | Agendamento - Dados do Cliente |
| **Rota** | `/agendar/:slug/dados` |
| **Objetivo** | Coletar informacoes do cliente para confirmar o agendamento. |
| **Prioridade** | P0 |
| **Perfis** | C, V |
| **Componentes** | Stepper (passo 4/4), campos: nome completo, telefone (WhatsApp), email (opcional), campo de observacao (opcional), resumo do agendamento (servico, profissional, data, horario, preco), botoes "Voltar" e "Confirmar agendamento". |

---

### 1.15 Agendamento Publico - Confirmacao

| Campo | Valor |
|-------|-------|
| **Pagina** | Agendamento - Confirmacao |
| **Rota** | `/agendar/:slug/confirmacao` |
| **Objetivo** | Confirmar ao cliente que o agendamento foi realizado com sucesso. |
| **Prioridade** | P0 |
| **Perfis** | C, V |
| **Componentes** | Icone de sucesso, resumo completo do agendamento, informacao "Voce recebera uma confirmacao por WhatsApp", botao "Adicionar ao Google Calendar", botao "Agendar outro horario", link para cancelamento. |

---

### 1.16 Cancelamento de Agendamento

| Campo | Valor |
|-------|-------|
| **Pagina** | Cancelar Agendamento |
| **Rota** | `/agendamento/:id/cancelar` |
| **Objetivo** | Permitir que o cliente cancele seu agendamento via link. |
| **Prioridade** | P0 |
| **Perfis** | C |
| **Componentes** | Resumo do agendamento, motivo do cancelamento (select com opcoes), botao "Confirmar cancelamento", mensagem de cancelamento confirmado, sugestao de reagendamento. |

---

### 1.17 Confirmacao de Agendamento

| Campo | Valor |
|-------|-------|
| **Pagina** | Confirmar Agendamento |
| **Rota** | `/agendamento/:id/confirmar` |
| **Objetivo** | Permitir que o cliente confirme presenca via link (enviado por WhatsApp). |
| **Prioridade** | P1 |
| **Perfis** | C |
| **Componentes** | Resumo do agendamento, botao "Confirmar presenca", mensagem de confirmacao, endereco da barbearia com link para mapa. |

---

## 2. Area Autenticada - Dashboard

### 2.1 Dashboard

| Campo | Valor |
|-------|-------|
| **Pagina** | Dashboard |
| **Rota** | `/app/dashboard` |
| **Objetivo** | Apresentar visao geral da operacao do dia e metricas chave. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | **Owner/Manager:** 4 cards de metricas (faturamento do dia, agendamentos do dia, novos clientes no mes, taxa de retorno), grafico de faturamento semanal (bar chart), lista dos proximos 5 agendamentos, alertas (clientes inativos ha 30+ dias, horarios vagos do dia). **Staff:** card "Proximo cliente" com timer, lista de agendamentos do dia, contadores pessoais (atendimentos do dia, do mes). **Recepcao:** lista completa de agendamentos do dia com status (confirmado, aguardando, em atendimento, concluido), botao rapido "Novo agendamento". |

---

## 3. Area Autenticada - Agenda

### 3.1 Agenda

| Campo | Valor |
|-------|-------|
| **Pagina** | Agenda |
| **Rota** | `/app/agenda` |
| **Objetivo** | Visualizar e gerenciar todos os agendamentos do dia ou semana. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | Navegador de datas (anterior/proximo dia), toggle dia/semana, filtro por profissional (dropdown), grade horaria em colunas (uma coluna por profissional), cards de agendamento na grade (nome do cliente, servico, status por cor), botao flutuante "+ Novo agendamento", indicador de horario atual (linha vermelha). |

---

### 3.2 Novo Agendamento (interno)

| Campo | Valor |
|-------|-------|
| **Pagina** | Novo Agendamento |
| **Rota** | `/app/agenda/novo` |
| **Objetivo** | Criar agendamento manualmente pelo painel. |
| **Prioridade** | P0 |
| **Perfis** | O, M, R |
| **Componentes** | Drawer lateral com: busca de cliente (autocomplete por nome/telefone), botao "Novo cliente", selecao de servico(s), selecao de profissional, selecao de data e horario (mostra apenas disponiveis), campo observacao, botao "Agendar". |

---

### 3.3 Detalhes do Agendamento

| Campo | Valor |
|-------|-------|
| **Pagina** | Detalhes do Agendamento |
| **Rota** | `/app/agenda/:id` |
| **Objetivo** | Visualizar detalhes e gerenciar status do agendamento. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | Drawer lateral com: dados do cliente (link para ficha), servico(s), profissional, data/hora, status atual, botoes de acao por status: **Agendado** -> Confirmar / Cancelar, **Confirmado** -> Iniciar Atendimento / Cancelar / Reagendar, **Em Atendimento** -> Concluir (abre formulario de pagamento), **Concluido** -> dados do pagamento. Historico de alteracoes do agendamento. |

---

### 3.4 Bloqueio de Horario

| Campo | Valor |
|-------|-------|
| **Pagina** | Bloquear Horario |
| **Rota** | `/app/agenda/bloqueio` |
| **Objetivo** | Bloquear horarios para impedir agendamentos (folga, almoco, manutencao). |
| **Prioridade** | P1 |
| **Perfis** | O, M, S |
| **Componentes** | Modal com: selecao de profissional (Staff ve apenas o proprio), data inicio, hora inicio, hora fim, motivo (select: almoco, folga, compromisso pessoal, outro), opcao de recorrencia (unico, diario, semanal), botao "Bloquear". |

---

## 4. Area Autenticada - Clientes

### 4.1 Lista de Clientes

| Campo | Valor |
|-------|-------|
| **Pagina** | Clientes |
| **Rota** | `/app/clientes` |
| **Objetivo** | Listar, buscar e filtrar todos os clientes da barbearia. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | Campo de busca (nome ou telefone), filtros: status (ativo, inativo 30d, inativo 60d+), profissional preferido, ultimo atendimento. Tabela com colunas: nome, telefone, ultimo atendimento, total de visitas, status. Botao "+ Novo cliente". Paginacao. Badge de contagem total. |

---

### 4.2 Novo Cliente

| Campo | Valor |
|-------|-------|
| **Pagina** | Cadastrar Cliente |
| **Rota** | `/app/clientes/novo` |
| **Objetivo** | Cadastrar um novo cliente manualmente. |
| **Prioridade** | P0 |
| **Perfis** | O, M, R |
| **Componentes** | Formulario: nome completo, telefone (WhatsApp, obrigatorio), email (opcional), data de nascimento (opcional), como conheceu a barbearia (select), observacoes gerais, botoes "Cancelar" e "Salvar". |

---

### 4.3 Ficha do Cliente

| Campo | Valor |
|-------|-------|
| **Pagina** | Ficha do Cliente |
| **Rota** | `/app/clientes/:id` |
| **Objetivo** | Exibir todas as informacoes e historico do cliente em um unico lugar. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | **Cabecalho:** nome, telefone (link WhatsApp), email, status (ativo/inativo), botao "Editar", botao "Novo agendamento". **Metricas do cliente:** total de visitas, ticket medio, frequencia media (dias entre visitas), ultimo atendimento. **Abas:** - **Historico:** timeline de atendimentos (data, servico, profissional, valor). - **Agendamentos:** proximos agendamentos com acoes. - **Financeiro (O, M):** historico de pagamentos, total gasto. - **Observacoes (O, M, S):** notas internas sobre preferencias (ex: "gosta do degrade alto", "alergia a produto X"). - **Fotos (O, M, S):** galeria antes/depois com upload. |

---

### 4.4 Editar Cliente

| Campo | Valor |
|-------|-------|
| **Pagina** | Editar Cliente |
| **Rota** | `/app/clientes/:id/editar` |
| **Objetivo** | Atualizar dados cadastrais do cliente. |
| **Prioridade** | P0 |
| **Perfis** | O, M, R |
| **Componentes** | Mesmo formulario do cadastro, preenchido com dados atuais, botoes "Cancelar" e "Salvar alteracoes". |

---

## 5. Area Autenticada - Campanhas

### 5.1 Lista de Campanhas

| Campo | Valor |
|-------|-------|
| **Pagina** | Campanhas |
| **Rota** | `/app/campanhas` |
| **Objetivo** | Listar todas as campanhas de marketing e reativacao. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Tabs: Ativas / Agendadas / Encerradas. Cards de campanha com: nome, publico-alvo resumido, data de envio, status, metricas (enviados, entregues, cliques). Botao "+ Nova campanha". |

---

### 5.2 Nova Campanha - Publico

| Campo | Valor |
|-------|-------|
| **Pagina** | Nova Campanha - Publico |
| **Rota** | `/app/campanhas/nova?etapa=publico` |
| **Objetivo** | Definir o publico-alvo da campanha com filtros. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Stepper (passo 1/4), nome da campanha, filtros de publico: ultimo atendimento (ha X dias), servico realizado, profissional, quantidade de visitas, aniversariantes do mes. Preview da quantidade de clientes selecionados (atualiza em tempo real). Botoes "Cancelar" e "Proximo". |

---

### 5.3 Nova Campanha - Mensagem

| Campo | Valor |
|-------|-------|
| **Pagina** | Nova Campanha - Mensagem |
| **Rota** | `/app/campanhas/nova?etapa=mensagem` |
| **Objetivo** | Compor a mensagem que sera enviada via WhatsApp. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Stepper (passo 2/4), area de texto com variaveis ({{nome}}, {{ultimo_servico}}, {{dias_sem_vir}}), preview da mensagem renderizada com dados de exemplo, selecao de template salvo (opcional), contador de caracteres. Botoes "Voltar" e "Proximo". |

---

### 5.4 Nova Campanha - Agendamento de Envio

| Campo | Valor |
|-------|-------|
| **Pagina** | Nova Campanha - Agendamento |
| **Rota** | `/app/campanhas/nova?etapa=agenda` |
| **Objetivo** | Definir quando a campanha sera enviada. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Stepper (passo 3/4), opcoes: "Enviar agora" ou "Agendar para", seletor de data e hora (se agendado), informacao sobre melhor horario de envio (sugestao baseada em dados). Botoes "Voltar" e "Proximo". |

---

### 5.5 Nova Campanha - Revisao

| Campo | Valor |
|-------|-------|
| **Pagina** | Nova Campanha - Revisao |
| **Rota** | `/app/campanhas/nova?etapa=revisao` |
| **Objetivo** | Revisar todos os detalhes antes de confirmar o envio. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Stepper (passo 4/4), resumo: publico (quantidade), mensagem (preview), data de envio. Botao "Enviar teste para meu numero" (envia para o WhatsApp do usuario logado). Botoes "Voltar" e "Confirmar envio". |

---

### 5.6 Detalhes da Campanha

| Campo | Valor |
|-------|-------|
| **Pagina** | Detalhes da Campanha |
| **Rota** | `/app/campanhas/:id` |
| **Objetivo** | Visualizar resultados e metricas de uma campanha. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Dados da campanha (nome, publico, mensagem, data), metricas: total enviados, entregues, lidos, respostas, agendamentos gerados a partir da campanha, taxa de conversao. Lista de destinatarios com status individual. |

---

### 5.7 Editar Campanha

| Campo | Valor |
|-------|-------|
| **Pagina** | Editar Campanha |
| **Rota** | `/app/campanhas/:id/editar` |
| **Objetivo** | Editar campanha que ainda nao foi enviada. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Mesmo fluxo da criacao, preenchido com dados atuais. So editavel se status for "Agendada". |

---

### 5.8 Templates de Mensagem

| Campo | Valor |
|-------|-------|
| **Pagina** | Templates de Mensagem |
| **Rota** | `/app/campanhas/templates` |
| **Objetivo** | Gerenciar modelos de mensagem reutilizaveis. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Lista de templates (nome, preview, data de criacao), botao "+ Novo template", acoes: editar, duplicar, excluir. |

---

### 5.9 Novo Template

| Campo | Valor |
|-------|-------|
| **Pagina** | Novo Template |
| **Rota** | `/app/campanhas/templates/novo` |
| **Objetivo** | Criar um modelo de mensagem para reutilizacao em campanhas. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Nome do template, categoria (reativacao, promocao, aniversario, lembrete), area de texto com variaveis, preview, botoes "Cancelar" e "Salvar". |

---

## 6. Area Autenticada - Planos e Combos

### 6.1 Lista de Planos

| Campo | Valor |
|-------|-------|
| **Pagina** | Planos e Combos |
| **Rota** | `/app/planos` |
| **Objetivo** | Listar todos os planos e combos oferecidos pela barbearia. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Tabs: Planos Mensais / Pacotes / Combos. Cards com: nome, descricao, preco, quantidade de assinantes ativos, status (ativo/inativo). Botao "+ Novo plano". |

---

### 6.2 Novo Plano

| Campo | Valor |
|-------|-------|
| **Pagina** | Criar Plano/Combo |
| **Rota** | `/app/planos/novo` |
| **Objetivo** | Criar um novo plano, pacote ou combo de servicos. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Tipo (radio: plano mensal / pacote de sessoes / combo de servicos), nome, descricao, servicos incluidos (multi-select), quantidade de sessoes (se pacote), validade (se pacote), preco, preco original (para mostrar desconto), status ativo/inativo. Botoes "Cancelar" e "Salvar". |

---

### 6.3 Detalhes do Plano

| Campo | Valor |
|-------|-------|
| **Pagina** | Detalhes do Plano |
| **Rota** | `/app/planos/:id` |
| **Objetivo** | Visualizar informacoes e assinantes de um plano. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Dados do plano, metricas (assinantes ativos, receita recorrente, taxa de renovacao), lista de assinantes com status, botao "Editar plano". |

---

### 6.4 Editar Plano

| Campo | Valor |
|-------|-------|
| **Pagina** | Editar Plano |
| **Rota** | `/app/planos/:id/editar` |
| **Objetivo** | Alterar dados de um plano existente. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Mesmo formulario da criacao, preenchido. Aviso de que alteracoes de preco so afetam novos assinantes. |

---

### 6.5 Assinantes do Plano

| Campo | Valor |
|-------|-------|
| **Pagina** | Assinantes |
| **Rota** | `/app/planos/:id/assinantes` |
| **Objetivo** | Gerenciar clientes vinculados a um plano. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Lista de assinantes (nome, data de inicio, sessoes usadas/total, status), botao "+ Vincular cliente", acoes por assinante: pausar, cancelar, renovar. |

---

## 7. Area Autenticada - Equipe

### 7.1 Lista de Profissionais

| Campo | Valor |
|-------|-------|
| **Pagina** | Equipe |
| **Rota** | `/app/equipe` |
| **Objetivo** | Listar todos os profissionais da barbearia. |
| **Prioridade** | P0 |
| **Perfis** | O, M |
| **Componentes** | Cards por profissional (foto, nome, funcao, status ativo/inativo, servicos principais), indicador de disponibilidade hoje, botao "+ Adicionar profissional". |

---

### 7.2 Adicionar Profissional

| Campo | Valor |
|-------|-------|
| **Pagina** | Adicionar Profissional |
| **Rota** | `/app/equipe/novo` |
| **Objetivo** | Cadastrar novo profissional e enviar convite de acesso. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Formulario: nome, telefone (WhatsApp), email, funcao (select: barbeiro, auxiliar), perfil de acesso (select: Staff, Manager, Receptionist), servicos que realiza (checkbox), percentual de comissao, upload de foto. Checkbox "Enviar convite de acesso por WhatsApp". Botoes "Cancelar" e "Salvar". |

---

### 7.3 Perfil do Profissional

| Campo | Valor |
|-------|-------|
| **Pagina** | Perfil do Profissional |
| **Rota** | `/app/equipe/:id` |
| **Objetivo** | Visualizar informacoes completas e desempenho do profissional. |
| **Prioridade** | P0 |
| **Perfis** | O, M |
| **Componentes** | **Cabecalho:** foto, nome, funcao, status, botao "Editar". **Abas:** - **Agenda:** grade de horarios configurados (disponibilidade semanal). - **Servicos:** lista de servicos que realiza com precos individuais (se diferente do padrao). - **Comissoes (apenas O):** regra de comissao (% por servico ou fixo), historico de pagamentos. - **Desempenho:** atendimentos no mes, faturamento gerado, ticket medio, avaliacao media, taxa de retorno dos clientes. |

---

### 7.4 Editar Profissional

| Campo | Valor |
|-------|-------|
| **Pagina** | Editar Profissional |
| **Rota** | `/app/equipe/:id/editar` |
| **Objetivo** | Alterar dados e permissoes de um profissional. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Mesmo formulario do cadastro preenchido, opcao de desativar (nao excluir), opcao de revogar acesso ao sistema. |

---

### 7.5 Horarios do Profissional

| Campo | Valor |
|-------|-------|
| **Pagina** | Horarios do Profissional |
| **Rota** | `/app/equipe/:id/horarios` |
| **Objetivo** | Configurar a grade de disponibilidade semanal do profissional. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Grade semanal (seg-dom) com horario de inicio e fim por dia, intervalo (almoco), toggle ativo/inativo por dia, lista de excecoes (folgas pontuais). |

---

## 8. Area Autenticada - Servicos

### 8.1 Lista de Servicos

| Campo | Valor |
|-------|-------|
| **Pagina** | Servicos |
| **Rota** | `/app/servicos` |
| **Objetivo** | Listar e gerenciar todos os servicos da barbearia. |
| **Prioridade** | P0 |
| **Perfis** | O, M |
| **Componentes** | Lista agrupada por categoria, cada servico mostra: nome, duracao, preco, status (ativo/inativo), acoes (editar, desativar). Botao "+ Novo servico", link "Gerenciar categorias". Drag-and-drop para reordenar. |

---

### 8.2 Novo Servico

| Campo | Valor |
|-------|-------|
| **Pagina** | Novo Servico |
| **Rota** | `/app/servicos/novo` |
| **Objetivo** | Cadastrar um novo servico. |
| **Prioridade** | P0 |
| **Perfis** | O, M |
| **Componentes** | Formulario: nome, descricao (opcional, aparece no agendamento publico), categoria (select), duracao (em minutos, select com opcoes comuns: 30, 45, 60, 90), preco, preco promocional (opcional), status ativo/inativo, visivel no agendamento online (toggle). Botoes "Cancelar" e "Salvar". |

---

### 8.3 Editar Servico

| Campo | Valor |
|-------|-------|
| **Pagina** | Editar Servico |
| **Rota** | `/app/servicos/:id/editar` |
| **Objetivo** | Alterar dados de um servico existente. |
| **Prioridade** | P0 |
| **Perfis** | O, M |
| **Componentes** | Mesmo formulario da criacao preenchido, opcao de desativar (nao exclui, mantem historico). |

---

### 8.4 Categorias de Servico

| Campo | Valor |
|-------|-------|
| **Pagina** | Categorias |
| **Rota** | `/app/servicos/categorias` |
| **Objetivo** | Gerenciar categorias para organizacao dos servicos. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Lista de categorias (nome, quantidade de servicos vinculados), botao "+ Nova categoria", edicao inline, drag-and-drop para reordenar, acao excluir (so se nao houver servicos vinculados). |

---

## 9. Area Autenticada - Financeiro

### 9.1 Visao Geral Financeira

| Campo | Valor |
|-------|-------|
| **Pagina** | Financeiro |
| **Rota** | `/app/financeiro` |
| **Objetivo** | Apresentar visao consolidada das financas da barbearia. |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Cards de metricas: faturamento do mes, faturamento do mes anterior, ticket medio, total de despesas. Grafico de faturamento mensal (ultimos 6 meses). Grafico de receita por servico (pizza). Links rapidos: Caixa do dia, Lancamentos, Comissoes. |

---

### 9.2 Caixa Diario

| Campo | Valor |
|-------|-------|
| **Pagina** | Caixa |
| **Rota** | `/app/financeiro/caixa` |
| **Objetivo** | Controlar o fluxo de caixa diario. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Seletor de data, status do caixa (aberto/fechado), valor de abertura, lista de movimentacoes do dia (automaticas dos atendimentos + manuais), totalizadores por forma de pagamento (dinheiro, pix, cartao debito, cartao credito), saldo esperado vs saldo real (no fechamento), botoes "Abrir caixa" e "Fechar caixa". |

---

### 9.3 Abrir Caixa

| Campo | Valor |
|-------|-------|
| **Pagina** | Abrir Caixa |
| **Rota** | `/app/financeiro/caixa/abrir` |
| **Objetivo** | Registrar abertura do caixa do dia com valor inicial. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Modal com: data (preenchida com hoje), valor em dinheiro no caixa, observacao (opcional), botoes "Cancelar" e "Abrir caixa". |

---

### 9.4 Fechar Caixa

| Campo | Valor |
|-------|-------|
| **Pagina** | Fechar Caixa |
| **Rota** | `/app/financeiro/caixa/fechar` |
| **Objetivo** | Registrar fechamento do caixa com conferencia de valores. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Modal com: resumo do dia (total de atendimentos, faturamento por forma de pagamento), campo "Valor em dinheiro contado", diferenca calculada (sobra/falta), observacao, botoes "Cancelar" e "Fechar caixa". |

---

### 9.5 Lancamentos

| Campo | Valor |
|-------|-------|
| **Pagina** | Lancamentos |
| **Rota** | `/app/financeiro/lancamentos` |
| **Objetivo** | Historico de todas as entradas e saidas financeiras. |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Filtros: periodo, tipo (entrada/saida), categoria, forma de pagamento. Tabela: data, descricao, categoria, valor, tipo (entrada/saida), forma de pagamento. Totalizadores no topo: total entradas, total saidas, saldo. Botao "+ Novo lancamento". Exportar CSV. |

---

### 9.6 Novo Lancamento

| Campo | Valor |
|-------|-------|
| **Pagina** | Novo Lancamento |
| **Rota** | `/app/financeiro/lancamentos/novo` |
| **Objetivo** | Registrar entrada ou saida manual (fora dos atendimentos). |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Modal com: tipo (entrada/saida), descricao, valor, data, categoria (select: aluguel, produtos, manutencao, marketing, outros), forma de pagamento, recorrente (toggle - se sim: frequencia e data fim). Botoes "Cancelar" e "Salvar". |

---

### 9.7 Comissoes

| Campo | Valor |
|-------|-------|
| **Pagina** | Comissoes |
| **Rota** | `/app/financeiro/comissoes` |
| **Objetivo** | Calcular e visualizar comissoes devidas a cada profissional. |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Filtro de periodo (mes/ano), tabela por profissional: nome, total de atendimentos, faturamento gerado, percentual de comissao, valor da comissao, status (pendente/pago). Acao "Marcar como pago" por profissional. Totalizador geral de comissoes. |

---

## 10. Area Autenticada - Relatorios

### 10.1 Central de Relatorios

| Campo | Valor |
|-------|-------|
| **Pagina** | Relatorios |
| **Rota** | `/app/relatorios` |
| **Objetivo** | Hub central para acesso a todos os relatorios do sistema. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Grid de cards, cada card sendo um relatorio: icone, titulo, descricao curta, link para o relatorio. Cards: Faturamento, Servicos, Clientes, Equipe, Agendamentos, Campanhas. |

---

### 10.2 Relatorio de Faturamento

| Campo | Valor |
|-------|-------|
| **Pagina** | Relatorio - Faturamento |
| **Rota** | `/app/relatorios/faturamento` |
| **Objetivo** | Analisar a receita da barbearia por periodo. |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Filtro de periodo (7d, 30d, 90d, custom), metricas: faturamento total, ticket medio, comparativo com periodo anterior (%). Grafico de linha (faturamento diario). Tabela: faturamento por servico, por profissional, por forma de pagamento. Exportar CSV/PDF. |

---

### 10.3 Relatorio de Servicos

| Campo | Valor |
|-------|-------|
| **Pagina** | Relatorio - Servicos |
| **Rota** | `/app/relatorios/servicos` |
| **Objetivo** | Analisar quais servicos sao mais realizados e rentaveis. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Filtro de periodo, grafico de pizza (distribuicao por servico), tabela: servico, quantidade realizada, receita gerada, ticket medio, ranking. |

---

### 10.4 Relatorio de Clientes

| Campo | Valor |
|-------|-------|
| **Pagina** | Relatorio - Clientes |
| **Rota** | `/app/relatorios/clientes` |
| **Objetivo** | Analisar base de clientes: retencao, novos e inativos. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Filtro de periodo, metricas: total de clientes, novos no periodo, inativos (30d+), taxa de retorno. Grafico de novos clientes por semana. Lista de clientes inativos com botao "Enviar campanha de reativacao". Distribuicao de frequencia (clientes por faixa de visitas). |

---

### 10.5 Relatorio de Equipe

| Campo | Valor |
|-------|-------|
| **Pagina** | Relatorio - Equipe |
| **Rota** | `/app/relatorios/equipe` |
| **Objetivo** | Comparar desempenho entre profissionais. |
| **Prioridade** | P2 |
| **Perfis** | O |
| **Componentes** | Filtro de periodo, tabela comparativa: profissional, atendimentos, faturamento, ticket medio, taxa de ocupacao, avaliacao media, taxa de retorno dos clientes. Grafico de barras comparativo. |

---

### 10.6 Relatorio de Agendamentos

| Campo | Valor |
|-------|-------|
| **Pagina** | Relatorio - Agendamentos |
| **Rota** | `/app/relatorios/agendamentos` |
| **Objetivo** | Analisar padroes de agendamento, cancelamentos e no-shows. |
| **Prioridade** | P1 |
| **Perfis** | O, M |
| **Componentes** | Filtro de periodo, metricas: total agendamentos, concluidos, cancelados, no-shows, taxa de ocupacao. Grafico de heatmap (dia da semana x horario - quais slots sao mais ocupados). Distribuicao por origem (online vs manual). |

---

### 10.7 Relatorio de Campanhas

| Campo | Valor |
|-------|-------|
| **Pagina** | Relatorio - Campanhas |
| **Rota** | `/app/relatorios/campanhas` |
| **Objetivo** | Avaliar efetividade das campanhas de marketing. |
| **Prioridade** | P2 |
| **Perfis** | O, M |
| **Componentes** | Lista de campanhas com metricas: enviados, entregues, lidos, agendamentos gerados, ROI estimado. Comparativo entre campanhas. Melhor dia/horario de envio (baseado em dados). |

---

## 11. Area Autenticada - Configuracoes

### 11.1 Configuracoes Gerais

| Campo | Valor |
|-------|-------|
| **Pagina** | Configuracoes |
| **Rota** | `/app/configuracoes` |
| **Objetivo** | Hub central para todas as configuracoes do sistema. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Menu lateral ou lista de secoes: Barbearia, Horarios, Agendamento, Notificacoes, Integracoes, Assinatura, Perfil. |

---

### 11.2 Dados da Barbearia

| Campo | Valor |
|-------|-------|
| **Pagina** | Config - Barbearia |
| **Rota** | `/app/configuracoes/barbearia` |
| **Objetivo** | Gerenciar dados institucionais da barbearia. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Formulario: nome fantasia, CNPJ, endereco completo, telefone, email, upload de logo, slug do agendamento (editavel com validacao de unicidade), descricao (aparece na pagina de agendamento), redes sociais (Instagram, Facebook). Botao "Salvar". |

---

### 11.3 Horarios de Funcionamento

| Campo | Valor |
|-------|-------|
| **Pagina** | Config - Horarios |
| **Rota** | `/app/configuracoes/horarios` |
| **Objetivo** | Definir dias e horarios de funcionamento. |
| **Prioridade** | P0 |
| **Perfis** | O, M |
| **Componentes** | Grade semanal com toggle por dia, horario de abertura e fechamento, intervalo, feriados e excecoes (lista de datas fechadas). Botao "Salvar". |

---

### 11.4 Regras de Agendamento

| Campo | Valor |
|-------|-------|
| **Pagina** | Config - Agendamento |
| **Rota** | `/app/configuracoes/agendamento` |
| **Objetivo** | Configurar regras e restricoes do agendamento online. |
| **Prioridade** | P0 |
| **Perfis** | O |
| **Componentes** | Agendamento online ativo (toggle), antecedencia minima para agendar (ex: 2h), antecedencia maxima (ex: 30 dias), prazo para cancelamento (ex: 4h antes), confirmacao automatica (toggle - se desligado, agendamentos ficam "pendente"), permitir selecao de profissional (toggle), intervalo entre atendimentos (em minutos, ex: 10min). Botao "Salvar". |

---

### 11.5 Notificacoes

| Campo | Valor |
|-------|-------|
| **Pagina** | Config - Notificacoes |
| **Rota** | `/app/configuracoes/notificacoes` |
| **Objetivo** | Configurar mensagens automaticas enviadas por WhatsApp/email. |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Lista de notificacoes configuraveis, cada uma com toggle ativo/inativo e preview da mensagem: - Confirmacao de agendamento (WhatsApp, imediato). - Lembrete de agendamento (WhatsApp, X horas antes - configuravel). - Pos-atendimento / pedido de avaliacao (WhatsApp, X horas depois). - Aniversario do cliente (WhatsApp, no dia). - Cliente inativo (WhatsApp, apos X dias). Botao "Editar mensagem" em cada item. |

---

### 11.6 Integracoes

| Campo | Valor |
|-------|-------|
| **Pagina** | Config - Integracoes |
| **Rota** | `/app/configuracoes/integracao` |
| **Objetivo** | Conectar servicos externos ao BarberFlow. |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Cards de integracao: - **WhatsApp Business API:** status (conectado/desconectado), botao conectar, numero vinculado. - **Google Calendar:** status, botao conectar, sincronizacao automatica dos agendamentos. Cada card com toggle ativo/inativo e botao de configuracao. |

---

### 11.7 Assinatura do BarberFlow

| Campo | Valor |
|-------|-------|
| **Pagina** | Config - Assinatura |
| **Rota** | `/app/configuracoes/assinatura` |
| **Objetivo** | Gerenciar o plano do BarberFlow contratado pela barbearia. |
| **Prioridade** | P1 |
| **Perfis** | O |
| **Componentes** | Plano atual (nome, preco, recursos inclusos), data de renovacao, historico de faturas (lista com status pago/pendente), botao "Alterar plano" (abre comparativo de planos), botao "Cancelar assinatura", dados de pagamento (cartao final XXXX, botao trocar). |

---

### 11.8 Perfil Pessoal

| Campo | Valor |
|-------|-------|
| **Pagina** | Meu Perfil |
| **Rota** | `/app/configuracoes/perfil` |
| **Objetivo** | Permitir que o usuario edite seus dados pessoais e senha. |
| **Prioridade** | P0 |
| **Perfis** | O, M, S, R |
| **Componentes** | Formulario: nome, email, telefone, upload de foto. Secao separada: alterar senha (senha atual + nova senha + confirmar). Botao "Salvar". |

---

## 12. Paginas de Sistema

### 12.1 Pagina 404

| Campo | Valor |
|-------|-------|
| **Pagina** | Nao Encontrada |
| **Rota** | `/404` |
| **Objetivo** | Informar que a pagina solicitada nao existe. |
| **Prioridade** | P0 |
| **Perfis** | Todos |
| **Componentes** | Ilustracao, titulo "Pagina nao encontrada", texto de orientacao, botao "Voltar ao inicio". |

---

### 12.2 Pagina 500

| Campo | Valor |
|-------|-------|
| **Pagina** | Erro do Servidor |
| **Rota** | `/500` |
| **Objetivo** | Informar que ocorreu um erro interno. |
| **Prioridade** | P0 |
| **Perfis** | Todos |
| **Componentes** | Ilustracao, titulo "Algo deu errado", texto pedindo para tentar novamente, botao "Tentar novamente", link "Falar com suporte". |

---

### 12.3 Manutencao

| Campo | Valor |
|-------|-------|
| **Pagina** | Manutencao |
| **Rota** | `/manutencao` |
| **Objetivo** | Informar que o sistema esta em manutencao programada. |
| **Prioridade** | P2 |
| **Perfis** | Todos |
| **Componentes** | Ilustracao, titulo "Estamos melhorando o BarberFlow", previsao de retorno, link para status page. |

---

## Resumo de Priorizacao

### P0 - Lancamento (25 paginas)

| # | Pagina | Rota |
|---|--------|------|
| 1 | Landing Page | `/` |
| 2 | Login | `/login` |
| 3 | Recuperar Senha | `/login/recuperar-senha` |
| 4 | Nova Senha | `/login/nova-senha/:token` |
| 5 | Cadastro | `/cadastro` |
| 6 | Onboarding - Barbearia | `/onboarding/barbearia` |
| 7 | Onboarding - Horarios | `/onboarding/horarios` |
| 8 | Onboarding - Servicos | `/onboarding/servicos` |
| 9 | Onboarding - Equipe | `/onboarding/equipe` |
| 10 | Onboarding - Concluido | `/onboarding/concluido` |
| 11 | Agendamento - Servico | `/agendar/:slug/servico` |
| 12 | Agendamento - Profissional | `/agendar/:slug/profissional` |
| 13 | Agendamento - Horario | `/agendar/:slug/horario` |
| 14 | Agendamento - Dados | `/agendar/:slug/dados` |
| 15 | Agendamento - Confirmacao | `/agendar/:slug/confirmacao` |
| 16 | Cancelar Agendamento | `/agendamento/:id/cancelar` |
| 17 | Dashboard | `/app/dashboard` |
| 18 | Agenda | `/app/agenda` |
| 19 | Novo Agendamento | `/app/agenda/novo` |
| 20 | Detalhes Agendamento | `/app/agenda/:id` |
| 21 | Clientes | `/app/clientes` |
| 22 | Novo Cliente | `/app/clientes/novo` |
| 23 | Ficha do Cliente | `/app/clientes/:id` |
| 24 | Editar Cliente | `/app/clientes/:id/editar` |
| 25 | Equipe | `/app/equipe` |
| 26 | Adicionar Profissional | `/app/equipe/novo` |
| 27 | Perfil Profissional | `/app/equipe/:id` |
| 28 | Editar Profissional | `/app/equipe/:id/editar` |
| 29 | Servicos | `/app/servicos` |
| 30 | Novo Servico | `/app/servicos/novo` |
| 31 | Editar Servico | `/app/servicos/:id/editar` |
| 32 | Configuracoes | `/app/configuracoes` |
| 33 | Config - Barbearia | `/app/configuracoes/barbearia` |
| 34 | Config - Horarios | `/app/configuracoes/horarios` |
| 35 | Config - Agendamento | `/app/configuracoes/agendamento` |
| 36 | Meu Perfil | `/app/configuracoes/perfil` |
| 37 | 404 | `/404` |
| 38 | 500 | `/500` |

### P1 - Semana Seguinte (19 paginas)

| # | Pagina | Rota |
|---|--------|------|
| 1 | Confirmar Agendamento | `/agendamento/:id/confirmar` |
| 2 | Bloqueio de Horario | `/app/agenda/bloqueio` |
| 3 | Horarios Profissional | `/app/equipe/:id/horarios` |
| 4 | Categorias Servico | `/app/servicos/categorias` |
| 5 | Campanhas | `/app/campanhas` |
| 6 | Nova Campanha - Publico | `/app/campanhas/nova?etapa=publico` |
| 7 | Nova Campanha - Mensagem | `/app/campanhas/nova?etapa=mensagem` |
| 8 | Nova Campanha - Agendamento | `/app/campanhas/nova?etapa=agenda` |
| 9 | Nova Campanha - Revisao | `/app/campanhas/nova?etapa=revisao` |
| 10 | Detalhes Campanha | `/app/campanhas/:id` |
| 11 | Financeiro | `/app/financeiro` |
| 12 | Caixa | `/app/financeiro/caixa` |
| 13 | Abrir Caixa | `/app/financeiro/caixa/abrir` |
| 14 | Fechar Caixa | `/app/financeiro/caixa/fechar` |
| 15 | Lancamentos | `/app/financeiro/lancamentos` |
| 16 | Novo Lancamento | `/app/financeiro/lancamentos/novo` |
| 17 | Comissoes | `/app/financeiro/comissoes` |
| 18 | Relatorios - Hub | `/app/relatorios` |
| 19 | Relatorio Faturamento | `/app/relatorios/faturamento` |
| 20 | Relatorio Clientes | `/app/relatorios/clientes` |
| 21 | Relatorio Agendamentos | `/app/relatorios/agendamentos` |
| 22 | Config - Notificacoes | `/app/configuracoes/notificacoes` |
| 23 | Config - Integracoes | `/app/configuracoes/integracao` |
| 24 | Config - Assinatura | `/app/configuracoes/assinatura` |

### P2 - Fase 2 (10 paginas)

| # | Pagina | Rota |
|---|--------|------|
| 1 | Editar Campanha | `/app/campanhas/:id/editar` |
| 2 | Templates | `/app/campanhas/templates` |
| 3 | Novo Template | `/app/campanhas/templates/novo` |
| 4 | Planos e Combos | `/app/planos` |
| 5 | Novo Plano | `/app/planos/novo` |
| 6 | Detalhes Plano | `/app/planos/:id` |
| 7 | Editar Plano | `/app/planos/:id/editar` |
| 8 | Assinantes | `/app/planos/:id/assinantes` |
| 9 | Relatorio Servicos | `/app/relatorios/servicos` |
| 10 | Relatorio Equipe | `/app/relatorios/equipe` |
| 11 | Relatorio Campanhas | `/app/relatorios/campanhas` |
| 12 | Manutencao | `/manutencao` |
