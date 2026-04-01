# BarberFlow - Fluxos de Navegacao

> Versao: 1.0 | Data: 2026-03-31
> Documento de referencia para navegacao por perfil e fluxos criticos do sistema.

---

## Parte 1 - Navegacao por Perfil

---

## 1. Owner (Dono da Barbearia)

### 1.1 Menu de Navegacao

Sidebar fixa com os seguintes itens:

```
[Logo BarberFlow]

- Dashboard          (icone: grid)
- Agenda             (icone: calendar)
- Clientes           (icone: users)
- Campanhas          (icone: megaphone)
- Planos             (icone: package)         [P2]
- Equipe             (icone: user-group)
- Servicos           (icone: scissors)
- Financeiro         (icone: dollar)
- Relatorios         (icone: bar-chart)
- Configuracoes      (icone: settings)

[Separador]

- Meu Perfil         (icone: user)
- Sair               (icone: log-out)
```

**Header:** Nome da barbearia, nome do usuario, foto, notificacoes (sino com badge).

### 1.2 Tela Inicial

`/app/dashboard`

Ao fazer login, o Owner ve o Dashboard com:
- 4 cards de metricas: faturamento do dia, agendamentos do dia, novos clientes no mes, taxa de retorno
- Grafico de faturamento da semana (barras)
- Proximos 5 agendamentos do dia (lista)
- Alertas: clientes inativos ha 30+ dias (quantidade + link para lista), horarios vagos restantes no dia

### 1.3 Acoes Permitidas

- **Tudo.** O Owner tem acesso irrestrito a todos os modulos e funcionalidades.
- Criar, editar e excluir qualquer recurso (clientes, servicos, profissionais, campanhas, planos)
- Acessar dados financeiros completos (faturamento, lancamentos, comissoes)
- Configurar a barbearia, notificacoes, integracoes e assinatura do BarberFlow
- Gerenciar permissoes da equipe
- Ver todos os relatorios

### 1.4 Acoes Bloqueadas

- Nenhuma. Acesso total.

### 1.5 Fluxos Principais

**Fluxo: Verificar desempenho do dia**
1. Acessar Dashboard (`/app/dashboard`)
2. Verificar cards de metricas
3. Clicar em "Faturamento" para ir ao relatorio detalhado
4. Filtrar por periodo desejado

**Fluxo: Gerenciar equipe**
1. Menu > Equipe (`/app/equipe`)
2. Clicar no profissional desejado
3. Verificar abas (agenda, servicos, comissoes, desempenho)
4. Clicar "Editar" para alterar dados ou permissoes

**Fluxo: Verificar comissoes do mes**
1. Menu > Financeiro > Comissoes (`/app/financeiro/comissoes`)
2. Selecionar mes/ano
3. Verificar valores por profissional
4. Marcar como pago

---

## 2. Manager (Gerente)

### 2.1 Menu de Navegacao

```
[Logo BarberFlow]

- Dashboard          (icone: grid)
- Agenda             (icone: calendar)
- Clientes           (icone: users)
- Campanhas          (icone: megaphone)
- Planos             (icone: package)         [P2]
- Equipe             (icone: user-group)
- Servicos           (icone: scissors)
- Financeiro         (icone: dollar)          [apenas Caixa]
- Relatorios         (icone: bar-chart)       [parcial]

[Separador]

- Meu Perfil         (icone: user)
- Sair               (icone: log-out)
```

**Ausente do menu:** Configuracoes (exceto "Horarios" e "Perfil pessoal").

### 2.2 Tela Inicial

`/app/dashboard`

Dashboard com:
- Cards: agendamentos do dia, taxa de ocupacao, atendimentos concluidos, proximos horarios vagos
- Lista completa de agendamentos do dia com status
- Alertas operacionais (profissional ausente, conflito de horario)

### 2.3 Acoes Permitidas

- Criar e gerenciar agendamentos
- Cadastrar e editar clientes
- Criar e gerenciar campanhas
- Visualizar e editar equipe (dados basicos, horarios, servicos)
- Criar e editar servicos e categorias
- Abrir e fechar caixa diario
- Ver relatorios: servicos, clientes, agendamentos, campanhas
- Editar horarios de funcionamento
- Gerenciar planos e combos (P2)

### 2.4 Acoes Bloqueadas

- Acessar lancamentos financeiros (entradas/saidas manuais)
- Ver ou alterar comissoes
- Ver relatorio de faturamento e relatorio de equipe (financeiro)
- Adicionar ou remover profissionais do sistema
- Alterar permissoes/perfil de acesso de profissionais
- Acessar configuracoes de barbearia, notificacoes, integracoes, assinatura
- Alterar regras de agendamento online

### 2.5 Fluxos Principais

**Fluxo: Gerenciar agenda do dia**
1. Menu > Agenda (`/app/agenda`)
2. Verificar status dos agendamentos (confirmados, pendentes)
3. Clicar em agendamento para ver detalhes
4. Alterar status conforme necessario (confirmar, iniciar, concluir)

**Fluxo: Operar caixa**
1. Menu > Financeiro > Caixa (`/app/financeiro/caixa`)
2. Abrir caixa no inicio do dia (informar valor em dinheiro)
3. Ao longo do dia, pagamentos sao registrados automaticamente via atendimentos
4. No final do dia, fechar caixa (contar dinheiro, registrar valor)

**Fluxo: Lidar com cliente sem agendamento (encaixe)**
1. Menu > Agenda (`/app/agenda`)
2. Clicar "+ Novo agendamento"
3. Buscar cliente (ou criar novo)
4. Selecionar servico, profissional e proximo horario disponivel
5. Confirmar agendamento

---

## 3. Staff (Profissional/Barbeiro)

### 3.1 Menu de Navegacao

```
[Logo BarberFlow]

- Dashboard          (icone: grid)
- Minha Agenda       (icone: calendar)
- Clientes           (icone: users)           [apenas atendidos por ele]

[Separador]

- Meu Perfil         (icone: user)
- Sair               (icone: log-out)
```

**Menu reduzido.** Sem acesso a: Campanhas, Planos, Equipe, Servicos, Financeiro, Relatorios, Configuracoes.

### 3.2 Tela Inicial

`/app/dashboard`

Dashboard simplificado:
- Card "Proximo cliente" em destaque (nome, servico, horario, tempo restante)
- Lista de agendamentos do dia (apenas os proprios), com status
- Contadores pessoais: atendimentos do dia, atendimentos do mes

### 3.3 Acoes Permitidas

- Visualizar propria agenda (nao ve agenda de outros profissionais)
- Alterar status dos proprios atendimentos (iniciar, concluir)
- Visualizar ficha de clientes que ja atendeu
- Adicionar observacoes e fotos na ficha do cliente
- Bloquear horarios na propria agenda (folga, compromisso)
- Editar proprio perfil (nome, foto, senha)

### 3.4 Acoes Bloqueadas

- Criar agendamentos (quem agenda e a recepcao ou o cliente)
- Cancelar ou reagendar atendimentos (deve solicitar a recepcao/gerente)
- Ver agenda de outros profissionais
- Acessar clientes que nunca atendeu
- Acessar qualquer modulo financeiro
- Acessar campanhas, planos, equipe, servicos, relatorios, configuracoes
- Editar dados de clientes (apenas adicionar observacoes)

### 3.5 Fluxos Principais

**Fluxo: Iniciar dia de trabalho**
1. Fazer login
2. Dashboard mostra lista de atendimentos do dia
3. Ver proximo cliente em destaque

**Fluxo: Atender cliente**
1. Dashboard ou Minha Agenda mostra proximo agendamento
2. Clicar no agendamento
3. Clicar "Iniciar Atendimento" (status muda para "Em Atendimento")
4. Realizar o servico
5. Clicar "Concluir" (abre formulario de pagamento para recepcao/gerente)
6. Sistema mostra o proximo cliente

**Fluxo: Registrar preferencia do cliente**
1. No agendamento concluido, clicar no nome do cliente
2. Ir para aba "Observacoes"
3. Adicionar nota (ex: "Prefere degrade medio, maquina 2")
4. Salvar

---

## 4. Receptionist (Recepcao)

### 4.1 Menu de Navegacao

```
[Logo BarberFlow]

- Dashboard          (icone: grid)
- Agenda             (icone: calendar)
- Clientes           (icone: users)

[Separador]

- Meu Perfil         (icone: user)
- Sair               (icone: log-out)
```

**Menu reduzido.** Sem acesso a: Campanhas, Planos, Equipe, Servicos, Financeiro, Relatorios, Configuracoes.

### 4.2 Tela Inicial

`/app/dashboard`

Dashboard operacional:
- Lista completa de agendamentos do dia com status (confirmado, aguardando, em atendimento, concluido)
- Filtro rapido por status
- Botao destaque "+ Novo agendamento"
- Indicador de clientes esperando (chegaram mas nao foram atendidos ainda)

### 4.3 Acoes Permitidas

- Visualizar agenda completa (todos os profissionais)
- Criar agendamentos
- Confirmar e reagendar atendimentos
- Cadastrar novos clientes
- Editar dados de clientes
- Buscar clientes por nome ou telefone
- Registrar chegada do cliente (marcar como "presente")
- Visualizar historico de atendimentos do cliente
- Editar proprio perfil

### 4.4 Acoes Bloqueadas

- Excluir agendamentos (apenas cancelar com motivo)
- Iniciar ou concluir atendimentos (isso e do profissional)
- Ver aba financeira na ficha do cliente
- Acessar campanhas, planos, equipe, servicos, financeiro, relatorios, configuracoes
- Adicionar observacoes tecnicas sobre o cliente (campo restrito a Staff)
- Excluir clientes

### 4.5 Fluxos Principais

**Fluxo: Receber cliente com agendamento**
1. Dashboard mostra lista do dia
2. Cliente chega, recepcao localiza o agendamento (busca por nome)
3. Clicar no agendamento > "Confirmar presenca"
4. Status muda para "Aguardando atendimento"
5. Profissional ve na sua agenda que o cliente chegou

**Fluxo: Receber cliente sem agendamento (walk-in)**
1. Clicar "+ Novo agendamento" no Dashboard ou Agenda
2. Buscar cliente por telefone
3. Se nao encontrar, clicar "Novo cliente" e preencher dados basicos
4. Selecionar servico e profissional disponivel
5. Selecionar proximo horario livre (ou "agora")
6. Confirmar agendamento

**Fluxo: Reagendar atendimento**
1. Agenda > clicar no agendamento
2. Clicar "Reagendar"
3. Selecionar nova data/horario
4. Confirmar
5. Sistema envia notificacao de reagendamento ao cliente via WhatsApp

**Fluxo: Registrar pagamento (apos atendimento concluido pelo profissional)**
1. Agendamento muda para status "Concluido"
2. Sistema abre formulario de pagamento
3. Recepcao seleciona forma de pagamento (dinheiro, pix, cartao)
4. Registrar valor recebido
5. Agendamento muda para "Pago"

---

## 5. Client (Cliente Final)

### 5.1 Navegacao

O cliente nao tem acesso ao painel `/app`. Sua interacao e feita atraves de:
- Pagina publica de agendamento (`/agendar/:slug`)
- Links recebidos por WhatsApp (confirmacao, cancelamento)
- Mensagens automaticas do sistema

Nao ha menu de navegacao. A interface e linear (wizard de agendamento).

### 5.2 Tela Inicial

`/agendar/:slug`

Pagina da barbearia com:
- Logo e nome da barbearia
- Endereco e horario de funcionamento
- Botao "Agendar horario" (inicia wizard)

### 5.3 Acoes Permitidas

- Agendar horario (selecionar servico, profissional, data/hora)
- Informar seus dados (nome, telefone, email)
- Confirmar presenca via link recebido por WhatsApp
- Cancelar agendamento via link recebido por WhatsApp
- Visualizar detalhes do seu agendamento

### 5.4 Acoes Bloqueadas

- Acessar painel administrativo
- Ver agenda de outros clientes
- Ver informacoes de profissionais alem de nome e foto
- Editar agendamento (deve cancelar e reagendar)
- Ver precos de servicos que nao selecionou

### 5.5 Fluxos Principais

**Fluxo: Agendar pelo link**
1. Acessar `barberflow.com/agendar/barbearia-do-ze` (link compartilhado)
2. Selecionar servico(s) desejado(s)
3. Selecionar profissional (ou "sem preferencia")
4. Selecionar data e horario disponivel
5. Preencher dados pessoais (nome, WhatsApp)
6. Confirmar agendamento
7. Tela de confirmacao com resumo
8. Receber mensagem de confirmacao por WhatsApp

**Fluxo: Confirmar presenca (via WhatsApp)**
1. Receber mensagem de lembrete (ex: 24h antes)
2. Mensagem contem link de confirmacao
3. Clicar no link
4. Pagina mostra resumo do agendamento
5. Clicar "Confirmar presenca"
6. Receber confirmacao

**Fluxo: Cancelar agendamento**
1. Receber mensagem de confirmacao no momento do agendamento
2. Mensagem contem link de cancelamento
3. Clicar no link
4. Pagina mostra resumo do agendamento
5. Selecionar motivo do cancelamento
6. Confirmar cancelamento
7. Receber confirmacao + sugestao de reagendamento

---

## Parte 2 - Fluxos Criticos Detalhados

---

## Fluxo 1: Onboarding do Dono

**Gatilho:** Dono cria conta no BarberFlow.
**Objetivo:** Configurar a barbearia para comecar a receber agendamentos online.
**Tempo estimado:** 5-8 minutos.

### Passo a passo

```
1. CADASTRO
   Rota: /cadastro
   - Dono preenche: nome, email, telefone, senha, nome da barbearia
   - Clica "Criar minha barbearia"
   - Sistema cria a conta e faz login automatico
   - Redireciona para /onboarding/barbearia

2. DADOS DA BARBEARIA
   Rota: /onboarding/barbearia
   - Preenche: nome fantasia, endereco (CEP autocomplete), telefone
   - Upload de logo (opcional, pode pular)
   - Slug e gerado automaticamente (ex: "barbearia-do-ze"), editavel
   - Clica "Proximo"
   - Redireciona para /onboarding/horarios

3. HORARIOS DE FUNCIONAMENTO
   Rota: /onboarding/horarios
   - Grade semanal pre-preenchida (seg-sab 9h-19h, dom fechado)
   - Dono ajusta conforme sua realidade
   - Define intervalo de almoco (opcional)
   - Clica "Proximo"
   - Redireciona para /onboarding/servicos

4. SERVICOS
   Rota: /onboarding/servicos
   - Lista de servicos sugeridos ja aparece:
     * Corte masculino - 30min - R$ 40
     * Barba - 20min - R$ 25
     * Corte + Barba - 45min - R$ 55
     * Sobrancelha - 10min - R$ 15
     * Pigmentacao - 60min - R$ 80
   - Dono ajusta precos e duracoes
   - Pode remover servicos que nao oferece
   - Pode adicionar servicos customizados
   - Clica "Proximo"
   - Redireciona para /onboarding/equipe

5. EQUIPE
   Rota: /onboarding/equipe
   - Dono ja aparece como profissional (pode se remover se nao atende)
   - Formulario rapido para adicionar profissional:
     * Nome, telefone
     * Servicos que realiza (checkbox dos servicos cadastrados)
   - Pode adicionar quantos quiser
   - Opcao "Pular - adicionar depois"
   - Clica "Proximo"
   - Redireciona para /onboarding/concluido

6. CONCLUSAO
   Rota: /onboarding/concluido
   - Resumo: "Sua barbearia esta pronta!"
   - Mostra o que foi configurado (X servicos, X profissionais)
   - Link de agendamento publico em destaque com botao "Copiar"
   - 3 cards com proximos passos:
     * "Compartilhe seu link no Instagram e WhatsApp"
     * "Configure notificacoes automaticas"
     * "Baixe o app no celular" [futuro]
   - Botao principal "Ir para o Dashboard"
   - Redireciona para /app/dashboard
```

### Regras de negocio

- O onboarding so aparece uma vez (na primeira vez apos cadastro)
- Se o dono sair no meio, ao logar novamente, retorna para a etapa onde parou
- O onboarding pode ser pulado (botao "Configurar depois"), mas um banner no Dashboard lembra de completar
- Apos concluir, o sistema marca `onboarding_completed = true`
- O slug e validado em tempo real (unicidade)
- Minimo obrigatorio para funcionar: 1 servico e horarios definidos

---

## Fluxo 2: Agendamento pelo Cliente

**Gatilho:** Cliente acessa o link publico da barbearia.
**Objetivo:** Agendar um horario e receber confirmacao.
**Tempo estimado:** 1-2 minutos.

### Passo a passo

```
1. SELECAO DE SERVICO
   Rota: /agendar/:slug/servico
   - Cliente ve servicos agrupados por categoria
   - Cada servico mostra: nome, duracao, preco
   - Seleciona um ou mais servicos (selecao multipla)
   - Resumo parcial atualiza (tempo total, preco total)
   - Clica "Continuar"

2. SELECAO DE PROFISSIONAL
   Rota: /agendar/:slug/profissional
   - Lista profissionais que realizam o(s) servico(s) selecionado(s)
   - Cada profissional mostra: foto, nome
   - Opcao "Sem preferencia" (sistema escolhe o primeiro disponivel)
   - Seleciona profissional
   - Clica "Continuar"

3. SELECAO DE HORARIO
   Rota: /agendar/:slug/horario
   - Calendario mostra proximos 30 dias
   - Dias sem disponibilidade ficam cinza (desabilitados)
   - Ao selecionar um dia, lista de horarios disponiveis aparece
   - Horarios sao slots calculados: horarios livres do profissional menos
     agendamentos existentes, considerando duracao do servico
   - Seleciona horario
   - Clica "Continuar"

4. DADOS DO CLIENTE
   Rota: /agendar/:slug/dados
   - Campos: nome completo (obrigatorio), telefone WhatsApp (obrigatorio),
     email (opcional), observacao (opcional)
   - Se o telefone ja existe na base, sistema associa ao cliente existente
     (nao cria duplicata)
   - Resumo completo do agendamento ao lado/abaixo
   - Clica "Confirmar agendamento"

5. CONFIRMACAO
   Rota: /agendar/:slug/confirmacao
   - Tela de sucesso com resumo:
     * Servico, profissional, data, horario, preco
   - Mensagem: "Voce recebera uma confirmacao por WhatsApp"
   - Botao "Adicionar ao Google Calendar" (gera link .ics)
   - Botao "Agendar outro horario"
   - Link para cancelamento

   [Em paralelo]
   - Sistema envia WhatsApp de confirmacao ao cliente
   - Sistema cria notificacao no painel para recepcao/profissional
   - Se confirmacao automatica estiver desligada, status = "Pendente"
   - Se confirmacao automatica estiver ligada, status = "Confirmado"
```

### Regras de negocio

- Antecedencia minima configuravel (padrao: 2 horas)
- Antecedencia maxima configuravel (padrao: 30 dias)
- Intervalo entre atendimentos configuravel (padrao: 10 minutos)
- Se o servico exige 45min e o intervalo e 10min, o slot ocupa 55min na agenda
- Cliente nao ve preco se a barbearia desabilitar (configuracao)
- Cliente com telefone repetido nao e duplicado - sistema vincula ao existente
- Agendamento no mesmo horario e profissional e bloqueado (409 Conflict)
- Links de confirmacao e cancelamento sao enviados via WhatsApp

---

## Fluxo 3: Atendimento Diario

**Gatilho:** Inicio do dia de trabalho na barbearia.
**Objetivo:** Gerenciar o fluxo de atendimentos do dia de abertura a fechamento.

### Passo a passo

```
ABERTURA DO DIA (Gerente ou Dono)

1. Login no sistema
2. Financeiro > Caixa > Abrir Caixa
   - Informar valor em dinheiro no caixa
   - Clicar "Abrir caixa"
3. Dashboard mostra agendamentos do dia

---

RECEPCAO DE CLIENTES (Recepcao)

4. Cliente chega na barbearia
5. Recepcao abre Dashboard ou Agenda
6. Localiza agendamento do cliente (busca por nome)
7. Clica no agendamento > "Cliente chegou"
   - Status muda de "Confirmado" para "Aguardando"
   - Profissional ve notificacao na propria agenda

[Se cliente sem agendamento]
8. Recepcao clica "+ Novo agendamento"
9. Busca cliente por telefone
   - Se nao existe, clica "Novo cliente" > preenche nome e telefone
10. Seleciona servico, profissional, horario "agora" ou proximo disponivel
11. Confirma agendamento (status ja inicia como "Aguardando")

---

ATENDIMENTO (Profissional)

12. Profissional ve na Minha Agenda ou Dashboard: proximo cliente
13. Clica no agendamento > "Iniciar Atendimento"
    - Status muda para "Em Atendimento"
    - Timer inicia (controle de duracao)
14. Realiza o servico
15. Clica "Concluir Atendimento"
    - Modal de conclusao abre com:
      * Servico(s) realizado(s) (pre-preenchido, editavel se mudou)
      * Valor total
      * Forma de pagamento (dinheiro, pix, cartao debito, cartao credito)
      * Observacao (opcional)
    - Se profissional nao lida com pagamento, modal simplificado
      (apenas "Concluir" e recepcao registra pagamento)
16. Confirma conclusao
    - Status muda para "Concluido"
    - Valor e registrado no caixa diario
    - Comissao do profissional e calculada automaticamente

---

FECHAMENTO DO DIA (Gerente ou Dono)

17. Financeiro > Caixa > Fechar Caixa
18. Sistema mostra resumo:
    - Total de atendimentos
    - Faturamento por forma de pagamento
    - Valor esperado em dinheiro no caixa
19. Gerente conta o dinheiro e informa valor real
20. Sistema calcula diferenca (sobra/falta)
21. Gerente adiciona observacao se houver diferenca
22. Clica "Fechar caixa"
23. Registro salvo para consulta posterior
```

### Regras de negocio

- O caixa so pode ser aberto uma vez por dia
- Atendimentos so registram valor no caixa do dia correspondente
- Se o caixa nao for aberto, atendimentos seguem normalmente mas sem controle de caixa
- O profissional so pode iniciar um atendimento por vez
- O timer de atendimento e informativo (nao bloqueia a conclusao)
- Ao concluir, sistema dispara notificacao pos-atendimento (se configurado) apos X horas
- No-show: se o cliente nao aparece, recepcao marca como "Nao compareceu" - dado entra nas metricas
- Cancelamento no dia: recepcao cancela com motivo, horario fica liberado na agenda

---

## Fluxo 4: Reativacao de Clientes

**Gatilho:** Existem clientes que nao voltam ha 30+ dias.
**Objetivo:** Identificar clientes inativos e enviar campanha de retorno.

### Passo a passo

```
IDENTIFICACAO (Automatica + Dashboard)

1. Dashboard do Owner/Manager mostra alerta:
   "32 clientes nao voltam ha 30+ dias"
   Botao: "Ver lista"

2. Clicar leva para Relatorios > Clientes (/app/relatorios/clientes)
   - Filtro pre-aplicado: "Inativos 30d+"
   - Lista mostra: nome, ultimo atendimento, dias sem vir, servico favorito
   - Botao "Enviar campanha para estes clientes"

---

CRIACAO DA CAMPANHA

3. Clicar "Enviar campanha" redireciona para /app/campanhas/nova?etapa=publico
   - Filtro de publico ja vem preenchido (inativos 30d+)
   - Preview mostra quantidade de clientes
   - Clicar "Proximo"

4. Compor mensagem (/app/campanhas/nova?etapa=mensagem)
   - Sistema sugere template de reativacao:
     "Oi {{nome}}, faz {{dias_sem_vir}} dias que voce nao aparece
      na [nome da barbearia]! Sentimos sua falta.
      Que tal agendar seu proximo corte? E so clicar:
      {{link_agendamento}}"
   - Dono pode editar a mensagem
   - Preview mostra mensagem renderizada com dados de exemplo
   - Clicar "Proximo"

5. Agendar envio (/app/campanhas/nova?etapa=agenda)
   - Opcoes: "Enviar agora" ou agendar data/hora
   - Sugestao: "Terca e quinta entre 10h-12h tem melhor taxa de abertura"
   - Clicar "Proximo"

6. Revisar (/app/campanhas/nova?etapa=revisao)
   - Resumo: 32 clientes, mensagem (preview), data de envio
   - Botao "Enviar teste para meu numero"
   - Apos verificar teste, clicar "Confirmar envio"

---

ACOMPANHAMENTO

7. Campanhas > clicar na campanha criada (/app/campanhas/:id)
   - Metricas em tempo real:
     * Enviados: 32
     * Entregues: 30
     * Lidos: 22
     * Cliques no link: 8
     * Agendamentos gerados: 5
     * Taxa de conversao: 15.6%
   - Lista de destinatarios com status individual

8. Agendamentos gerados pela campanha aparecem na Agenda
   com tag "via campanha" para rastreabilidade
```

### Regras de negocio

- "Inativo" = sem atendimento concluido ha X dias (padrao: 30, configuravel)
- O sistema nao envia campanha para clientes que pediram para nao receber mensagens (opt-out)
- Limite de envio: depende do plano do BarberFlow
- O link de agendamento na campanha ja direciona para `/agendar/:slug` da barbearia
- Clientes que agendam via link da campanha sao rastreados (campo `origem = campanha_id`)
- O alerta no Dashboard aparece apenas se ha 10+ clientes inativos
- Campanha de reativacao pode ser agendada como recorrente (ex: toda segunda-feira, enviar para inativos da semana)

---

## Fluxo 5: Criacao de Campanha (Generico)

**Gatilho:** Dono ou Gerente decide enviar comunicacao para clientes.
**Objetivo:** Criar e enviar uma campanha segmentada via WhatsApp.

### Passo a passo

```
1. INICIO
   Menu > Campanhas (/app/campanhas)
   - Clicar "+ Nova campanha"
   - Redireciona para /app/campanhas/nova?etapa=publico

2. DEFINIR PUBLICO (/app/campanhas/nova?etapa=publico)
   - Nome da campanha (ex: "Promocao de Verao", "Aniversariantes de Marco")
   - Filtros de segmentacao:
     * Ultimo atendimento: ha mais de X dias / ha menos de X dias / entre X e Y dias
     * Servico realizado: [select multiplo]
     * Profissional: [select]
     * Quantidade de visitas: mais de X / menos de X
     * Aniversariantes: este mes / proximo mes / data especifica
     * Sexo: todos / masculino / feminino [se cadastrado]
   - Preview: "142 clientes correspondem aos filtros"
   - Lista preview (primeiros 10 nomes para validacao)
   - Clicar "Proximo"

3. COMPOR MENSAGEM (/app/campanhas/nova?etapa=mensagem)
   - Opcao: selecionar template existente ou escrever do zero
   - Area de texto com suporte a variaveis:
     * {{nome}} - nome do cliente
     * {{primeiro_nome}} - primeiro nome
     * {{ultimo_servico}} - nome do ultimo servico
     * {{dias_sem_vir}} - dias desde ultimo atendimento
     * {{link_agendamento}} - link para agendar
     * {{nome_barbearia}} - nome da barbearia
   - Botao "Inserir variavel" (dropdown com as opcoes)
   - Preview ao lado: mensagem renderizada com dados de um cliente real
   - Contador de caracteres
   - Toggle "Salvar como template" (se marcado, pede nome do template)
   - Clicar "Proximo"

4. AGENDAR ENVIO (/app/campanhas/nova?etapa=agenda)
   - Radio: "Enviar agora" / "Agendar para data especifica"
   - Se agendado: seletor de data e hora
   - Informacao: "Evite enviar em horarios noturnos (apos 20h)"
   - Clicar "Proximo"

5. REVISAR E CONFIRMAR (/app/campanhas/nova?etapa=revisao)
   - Resumo completo:
     * Nome da campanha
     * Publico: X clientes
     * Mensagem: preview completa
     * Envio: agora / data agendada
   - Botao "Enviar teste para meu numero"
     * Envia a mensagem real para o WhatsApp do usuario logado
     * Permite validar antes de enviar para todos
   - Botao "Voltar" e "Confirmar envio"
   - Ao confirmar:
     * Se "Enviar agora": mensagens entram na fila de envio imediatamente
     * Se agendado: campanha fica com status "Agendada"
   - Redireciona para /app/campanhas/:id (detalhes da campanha)

6. MONITORAR (/app/campanhas/:id)
   - Metricas atualizadas em tempo real:
     * Total de destinatarios
     * Enviados (progresso)
     * Entregues
     * Lidos
     * Responderam
     * Clicaram no link
     * Agendaram (conversao final)
   - Lista de destinatarios com status individual:
     * Enviado / Entregue / Lido / Erro
   - Se erro em algum envio, mostra motivo (numero invalido, bloqueado, etc.)
```

### Regras de negocio

- Uma campanha nao pode ser editada apos inicio do envio
- Campanhas agendadas podem ser editadas ou canceladas ate o horario de envio
- O envio e feito em lotes para nao sobrecarregar a API do WhatsApp (ex: 50 por minuto)
- Clientes com opt-out sao automaticamente excluidos do publico
- O sistema registra a origem de agendamentos vindos do link da campanha
- Templates salvos ficam disponiveis para campanhas futuras
- Limite de campanhas por mes depende do plano do BarberFlow
- Mensagens com erro de envio podem ser reenviadas individualmente

---

## Parte 3 - Matriz de Permissoes Consolidada

| Funcionalidade | Owner | Manager | Staff | Recepcao |
|----------------|-------|---------|-------|----------|
| **Dashboard** | Completo | Operacional | Simplificado | Operacional |
| **Agenda - Visualizar** | Todos | Todos | Propria | Todos |
| **Agenda - Criar agendamento** | Sim | Sim | Nao | Sim |
| **Agenda - Cancelar** | Sim | Sim | Nao | Sim (com motivo) |
| **Agenda - Iniciar atendimento** | Sim | Sim | Proprio | Nao |
| **Agenda - Concluir atendimento** | Sim | Sim | Proprio | Nao |
| **Agenda - Reagendar** | Sim | Sim | Nao | Sim |
| **Agenda - Bloquear horario** | Sim | Sim | Proprio | Nao |
| **Clientes - Listar** | Todos | Todos | Atendidos por ele | Todos |
| **Clientes - Criar** | Sim | Sim | Nao | Sim |
| **Clientes - Editar** | Sim | Sim | Nao | Sim |
| **Clientes - Excluir** | Sim | Nao | Nao | Nao |
| **Clientes - Observacoes** | Sim | Sim | Sim | Nao |
| **Clientes - Fotos** | Sim | Sim | Sim | Nao |
| **Clientes - Aba financeira** | Sim | Sim | Nao | Nao |
| **Campanhas - Gerenciar** | Sim | Sim | Nao | Nao |
| **Planos - Gerenciar** | Sim | Sim | Nao | Nao |
| **Equipe - Listar** | Sim | Sim | Nao | Nao |
| **Equipe - Adicionar** | Sim | Nao | Nao | Nao |
| **Equipe - Editar** | Sim | Nao | Nao | Nao |
| **Equipe - Ver comissoes** | Sim | Nao | Nao | Nao |
| **Equipe - Ver desempenho** | Sim | Sim | Nao | Nao |
| **Servicos - Gerenciar** | Sim | Sim | Nao | Nao |
| **Financeiro - Visao geral** | Sim | Nao | Nao | Nao |
| **Financeiro - Caixa** | Sim | Sim | Nao | Nao |
| **Financeiro - Lancamentos** | Sim | Nao | Nao | Nao |
| **Financeiro - Comissoes** | Sim | Nao | Nao | Nao |
| **Relatorios - Faturamento** | Sim | Nao | Nao | Nao |
| **Relatorios - Servicos** | Sim | Sim | Nao | Nao |
| **Relatorios - Clientes** | Sim | Sim | Nao | Nao |
| **Relatorios - Equipe** | Sim | Nao | Nao | Nao |
| **Relatorios - Agendamentos** | Sim | Sim | Nao | Nao |
| **Relatorios - Campanhas** | Sim | Sim | Nao | Nao |
| **Config - Barbearia** | Sim | Nao | Nao | Nao |
| **Config - Horarios** | Sim | Sim | Nao | Nao |
| **Config - Agendamento** | Sim | Nao | Nao | Nao |
| **Config - Notificacoes** | Sim | Nao | Nao | Nao |
| **Config - Integracoes** | Sim | Nao | Nao | Nao |
| **Config - Assinatura** | Sim | Nao | Nao | Nao |
| **Config - Perfil pessoal** | Sim | Sim | Sim | Sim |

---

## Parte 4 - Navegacao Global (Componentes Compartilhados)

### Sidebar (Desktop)

- Fixa a esquerda, largura 240px (expandida) ou 64px (colapsada)
- Toggle de colapsar no topo
- Itens variam conforme perfil (detalhado acima)
- Item ativo destacado com background e barra lateral colorida
- Badge de notificacao no item "Agenda" (quantidade de agendamentos pendentes)

### Header (Desktop e Mobile)

- Nome da barbearia (esquerda)
- Barra de busca global: busca clientes por nome ou telefone (centro)
- Sino de notificacoes com badge (direita)
- Avatar do usuario com dropdown: Meu Perfil, Sair (direita)

### Mobile

- Header com hamburger menu (esquerda), nome da barbearia (centro), avatar (direita)
- Menu mobile: drawer lateral que abre por cima com os mesmos itens da sidebar
- Botao flutuante "+ Novo agendamento" nas telas de Agenda e Dashboard (para Recepcao)
- Bottom tab bar **nao e usada** - o drawer e suficiente e mantem consistencia

### Notificacoes (Sino)

Dropdown com lista de notificacoes recentes:
- "Novo agendamento: Joao Silva - Corte - 14:30" (para Recepcao/Profissional)
- "Cliente chegou: Pedro Souza" (para Profissional)
- "Campanha 'Reativacao Marzo' concluida" (para Owner/Manager)
- "Caixa nao foi aberto hoje" (para Owner/Manager)
- Cada notificacao com timestamp ("ha 5 min", "ha 1h")
- Link "Ver todas" no footer do dropdown

### Breadcrumbs

Exibidos em todas as paginas internas do `/app`, exceto Dashboard:
```
Dashboard > Clientes > Joao Silva
Dashboard > Financeiro > Caixa
Dashboard > Configuracoes > Notificacoes
```
Cada nivel e clicavel para navegacao regressiva.

### Empty States

Toda listagem vazia exibe:
- Ilustracao contextual
- Titulo explicativo (ex: "Nenhum cliente cadastrado")
- Descricao com orientacao (ex: "Cadastre seu primeiro cliente ou compartilhe o link de agendamento")
- CTA principal (botao que leva a acao de criacao)

### Loading States

- Skeleton screens em todas as listagens e cards durante carregamento
- Spinner em botoes de acao durante processamento
- Nao usar telas em branco - sempre skeleton
