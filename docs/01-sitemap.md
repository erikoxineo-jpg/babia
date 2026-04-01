# BarberFlow - Sitemap Completo

> Versao: 1.0 | Data: 2026-03-31
> Documento de referencia para estrutura de rotas e navegacao do sistema.

---

## Perfis do Sistema

| Codigo | Perfil | Descricao |
|--------|--------|-----------|
| **O** | Owner (Dono) | Proprietario da barbearia. Acesso total. |
| **M** | Manager (Gerente) | Gestao operacional. Sem acesso a plano/billing. |
| **S** | Staff (Profissional) | Barbeiro/profissional. Ve apenas propria agenda. |
| **R** | Receptionist (Recepcao) | Atendimento e agenda. Sem relatorios. |
| **C** | Client (Cliente) | Acesso publico. Agendamento e historico proprio. |

---

## 1. Area Publica (sem autenticacao)

```
/                                         [C, Visitante]
  Landing page institucional do BarberFlow

/login                                    [O, M, S, R]
  Tela de login (email + senha)

/login/recuperar-senha                    [O, M, S, R]
  Solicitar reset de senha por email

/login/nova-senha/:token                  [O, M, S, R]
  Definir nova senha via token

/cadastro                                 [Visitante]
  Registro de nova barbearia (cria conta Owner)

/onboarding                               [O]
  Wizard de configuracao inicial (pos-cadastro)
    /onboarding/barbearia                 [O]
      Passo 1 - Dados da barbearia (nome, endereco, telefone)
    /onboarding/horarios                  [O]
      Passo 2 - Horarios de funcionamento
    /onboarding/servicos                  [O]
      Passo 3 - Cadastro dos servicos principais
    /onboarding/equipe                    [O]
      Passo 4 - Adicionar profissionais
    /onboarding/concluido                 [O]
      Passo 5 - Resumo e ativacao

/agendar/:slug                            [C, Visitante]
  Pagina publica de agendamento da barbearia
    /agendar/:slug/servico                [C, Visitante]
      Selecao de servico(s)
    /agendar/:slug/profissional           [C, Visitante]
      Selecao de profissional
    /agendar/:slug/horario                [C, Visitante]
      Selecao de data e horario
    /agendar/:slug/dados                  [C, Visitante]
      Dados do cliente (nome, telefone, email)
    /agendar/:slug/confirmacao            [C, Visitante]
      Resumo e confirmacao do agendamento

/agendamento/:id/cancelar                 [C]
  Cancelamento de agendamento pelo cliente (via link)

/agendamento/:id/confirmar                [C]
  Confirmacao de agendamento pelo cliente (via link)
```

---

## 2. Area Autenticada (`/app`)

### 2.1 Dashboard

```
/app/dashboard                            [O, M, S, R]
  Painel principal (conteudo varia por perfil)
```

**Conteudo por perfil:**
- **Owner**: faturamento, agendamentos do dia, taxa de retorno, alertas
- **Manager**: agendamentos do dia, ocupacao da equipe, alertas
- **Staff**: proprios agendamentos do dia, proximo cliente
- **Receptionist**: agendamentos do dia, chegadas, fila de espera

---

### 2.2 Agenda

```
/app/agenda                               [O, M, S, R]
  Visualizacao da agenda (dia/semana)
    /app/agenda?view=dia                  [O, M, S, R]
      Visao diaria (padrao)
    /app/agenda?view=semana               [O, M, S, R]
      Visao semanal
    /app/agenda?profissional=:id          [O, M, R]
      Filtro por profissional

/app/agenda/novo                          [O, M, R]
  Modal/drawer - Criar novo agendamento

/app/agenda/:id                           [O, M, S, R]
  Modal/drawer - Detalhes do agendamento
    Acoes: confirmar, iniciar, concluir, cancelar, reagendar

/app/agenda/bloqueio                      [O, M, S]
  Bloquear horario (almoco, folga, manutencao)
```

**Restricoes por perfil:**
- **Staff**: ve apenas a propria coluna na agenda
- **Receptionist**: nao pode excluir agendamentos, apenas reagendar

---

### 2.3 Clientes

```
/app/clientes                             [O, M, S, R]
  Lista de clientes com busca e filtros

/app/clientes/novo                        [O, M, R]
  Formulario de cadastro de cliente

/app/clientes/:id                         [O, M, S, R]
  Ficha completa do cliente
    /app/clientes/:id?tab=historico       [O, M, S, R]
      Historico de atendimentos
    /app/clientes/:id?tab=agendamentos    [O, M, S, R]
      Agendamentos futuros
    /app/clientes/:id?tab=financeiro      [O, M]
      Historico de pagamentos
    /app/clientes/:id?tab=observacoes     [O, M, S]
      Notas e preferencias do cliente
    /app/clientes/:id?tab=fotos           [O, M, S]
      Galeria de fotos (antes/depois)

/app/clientes/:id/editar                  [O, M, R]
  Editar dados do cliente
```

**Restricoes por perfil:**
- **Staff**: ve apenas clientes que ja atendeu
- **Receptionist**: nao ve aba financeira

---

### 2.4 Campanhas

```
/app/campanhas                            [O, M]
  Lista de campanhas ativas, pausadas e encerradas

/app/campanhas/nova                       [O, M]
  Criar nova campanha
    /app/campanhas/nova?etapa=publico     [O, M]
      Passo 1 - Definir publico-alvo (filtros)
    /app/campanhas/nova?etapa=mensagem    [O, M]
      Passo 2 - Compor mensagem (WhatsApp)
    /app/campanhas/nova?etapa=agenda      [O, M]
      Passo 3 - Definir data/hora de envio
    /app/campanhas/nova?etapa=revisao     [O, M]
      Passo 4 - Revisar e confirmar

/app/campanhas/:id                        [O, M]
  Detalhes da campanha (metricas de envio)

/app/campanhas/:id/editar                 [O, M]
  Editar campanha (apenas se nao enviada)

/app/campanhas/templates                  [O, M]
  Modelos de mensagem reutilizaveis

/app/campanhas/templates/novo             [O, M]
  Criar modelo de mensagem
```

---

### 2.5 Planos e Combos

```
/app/planos                               [O, M]
  Lista de planos e combos oferecidos

/app/planos/novo                          [O, M]
  Criar plano ou combo
    Tipo: plano mensal | pacote de sessoes | combo de servicos

/app/planos/:id                           [O, M]
  Detalhes do plano (assinantes, receita)

/app/planos/:id/editar                    [O, M]
  Editar plano

/app/planos/:id/assinantes               [O, M]
  Lista de clientes vinculados ao plano
```

---

### 2.6 Equipe

```
/app/equipe                               [O, M]
  Lista de profissionais

/app/equipe/novo                          [O]
  Adicionar profissional (envia convite)

/app/equipe/:id                           [O, M]
  Perfil do profissional
    /app/equipe/:id?tab=agenda            [O, M]
      Horarios e disponibilidade
    /app/equipe/:id?tab=servicos          [O, M]
      Servicos que realiza
    /app/equipe/:id?tab=comissoes         [O]
      Regras de comissao
    /app/equipe/:id?tab=desempenho        [O, M]
      Metricas de atendimento

/app/equipe/:id/editar                    [O]
  Editar dados e permissoes do profissional

/app/equipe/:id/horarios                  [O, M]
  Configurar grade de horarios do profissional
```

**Restricoes por perfil:**
- **Manager**: nao pode alterar comissoes nem excluir profissionais

---

### 2.7 Servicos

```
/app/servicos                             [O, M]
  Lista de servicos oferecidos

/app/servicos/novo                        [O, M]
  Criar servico (nome, duracao, preco, categoria)

/app/servicos/:id/editar                  [O, M]
  Editar servico

/app/servicos/categorias                  [O, M]
  Gerenciar categorias de servico
```

---

### 2.8 Financeiro

```
/app/financeiro                           [O]
  Visao geral financeira (receita, despesas, lucro)

/app/financeiro/caixa                     [O, M]
  Controle de caixa diario
    /app/financeiro/caixa/abrir           [O, M]
      Abrir caixa do dia
    /app/financeiro/caixa/fechar          [O, M]
      Fechar caixa do dia

/app/financeiro/lancamentos               [O]
  Historico de lancamentos (entradas e saidas)

/app/financeiro/lancamentos/novo          [O]
  Registrar lancamento manual

/app/financeiro/comissoes                 [O]
  Relatorio de comissoes por profissional

/app/financeiro/comissoes?periodo=:mes    [O]
  Comissoes filtradas por periodo
```

**Restricoes por perfil:**
- **Manager**: acessa apenas caixa diario. Sem acesso a lancamentos e comissoes.

---

### 2.9 Relatorios

```
/app/relatorios                           [O, M]
  Central de relatorios

/app/relatorios/faturamento               [O]
  Faturamento por periodo

/app/relatorios/servicos                  [O, M]
  Servicos mais realizados

/app/relatorios/clientes                  [O, M]
  Retencao, novos clientes, inativos

/app/relatorios/equipe                    [O]
  Desempenho por profissional

/app/relatorios/agendamentos              [O, M]
  Taxa de ocupacao, cancelamentos, no-shows

/app/relatorios/campanhas                 [O, M]
  Performance das campanhas (envios, retorno)
```

**Restricoes por perfil:**
- **Manager**: nao ve relatorios de faturamento nem equipe (financeiro)

---

### 2.10 Configuracoes

```
/app/configuracoes                        [O]
  Pagina de configuracoes gerais

/app/configuracoes/barbearia              [O]
  Dados da barbearia (nome, logo, endereco, contato)

/app/configuracoes/horarios               [O, M]
  Horarios de funcionamento

/app/configuracoes/agendamento            [O]
  Regras de agendamento online
    Antecedencia minima, cancelamento, confirmacao automatica

/app/configuracoes/notificacoes           [O]
  Configurar notificacoes (WhatsApp, email)
    Lembretes, confirmacoes, pos-atendimento

/app/configuracoes/integracao             [O]
  Integracoes (WhatsApp Business, Google Calendar)

/app/configuracoes/assinatura             [O]
  Plano do BarberFlow (billing, upgrade, faturas)

/app/configuracoes/perfil                 [O, M, S, R]
  Perfil pessoal do usuario logado
```

---

## 3. Paginas de Erro e Sistema

```
/404                                      [Todos]
  Pagina nao encontrada

/500                                      [Todos]
  Erro interno do servidor

/manutencao                               [Todos]
  Pagina de manutencao programada
```

---

## 4. Mapa Visual de Hierarquia

```
BarberFlow
|
|-- [PUBLICO]
|   |-- / (Landing)
|   |-- /login
|   |   |-- /recuperar-senha
|   |   |-- /nova-senha/:token
|   |-- /cadastro
|   |-- /onboarding
|   |   |-- /barbearia
|   |   |-- /horarios
|   |   |-- /servicos
|   |   |-- /equipe
|   |   |-- /concluido
|   |-- /agendar/:slug
|   |   |-- /servico
|   |   |-- /profissional
|   |   |-- /horario
|   |   |-- /dados
|   |   |-- /confirmacao
|   |-- /agendamento/:id/cancelar
|   |-- /agendamento/:id/confirmar
|
|-- [APP - AUTENTICADO]
|   |-- /app/dashboard
|   |-- /app/agenda
|   |   |-- /novo
|   |   |-- /:id
|   |   |-- /bloqueio
|   |-- /app/clientes
|   |   |-- /novo
|   |   |-- /:id (tabs: historico, agendamentos, financeiro, observacoes, fotos)
|   |   |-- /:id/editar
|   |-- /app/campanhas
|   |   |-- /nova (etapas: publico, mensagem, agenda, revisao)
|   |   |-- /:id
|   |   |-- /:id/editar
|   |   |-- /templates
|   |   |-- /templates/novo
|   |-- /app/planos
|   |   |-- /novo
|   |   |-- /:id
|   |   |-- /:id/editar
|   |   |-- /:id/assinantes
|   |-- /app/equipe
|   |   |-- /novo
|   |   |-- /:id (tabs: agenda, servicos, comissoes, desempenho)
|   |   |-- /:id/editar
|   |   |-- /:id/horarios
|   |-- /app/servicos
|   |   |-- /novo
|   |   |-- /:id/editar
|   |   |-- /categorias
|   |-- /app/financeiro
|   |   |-- /caixa
|   |   |   |-- /abrir
|   |   |   |-- /fechar
|   |   |-- /lancamentos
|   |   |   |-- /novo
|   |   |-- /comissoes
|   |-- /app/relatorios
|   |   |-- /faturamento
|   |   |-- /servicos
|   |   |-- /clientes
|   |   |-- /equipe
|   |   |-- /agendamentos
|   |   |-- /campanhas
|   |-- /app/configuracoes
|       |-- /barbearia
|       |-- /horarios
|       |-- /agendamento
|       |-- /notificacoes
|       |-- /integracao
|       |-- /assinatura
|       |-- /perfil
|
|-- [SISTEMA]
    |-- /404
    |-- /500
    |-- /manutencao
```

---

## 5. Contagem de Rotas

| Area | Quantidade |
|------|-----------|
| Publica | 14 |
| Dashboard | 1 |
| Agenda | 4 |
| Clientes | 4 |
| Campanhas | 6 |
| Planos | 5 |
| Equipe | 5 |
| Servicos | 4 |
| Financeiro | 6 |
| Relatorios | 7 |
| Configuracoes | 8 |
| Sistema | 3 |
| **Total** | **67** |
