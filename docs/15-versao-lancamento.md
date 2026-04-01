# BarberFlow — Versão de Lançamento (v1.0)

> **Produto:** BarberFlow — SaaS de crescimento para barbearias
> **Data prevista de lançamento:** 30 dias a partir do início do desenvolvimento
> **Versão:** 1.0.0
> **Última atualização:** 31/03/2026

---

## 1. Escopo fechado — Lista exata de funcionalidades

### DENTRO do lançamento (IN)

| # | Funcionalidade | Status | Sprint |
|---|---|---|---|
| BF-001 | Registro de conta com criação de tenant | IN | 0 |
| BF-002 | Login/logout com sessão | IN | 0 |
| BF-003 | Wizard de onboarding (5 etapas) | IN | 1 |
| BF-004 | CRUD de serviços + templates de barbearia | IN | 1 |
| BF-005 | Associação serviço-profissional | IN | 1 |
| BF-006 | CRUD de profissionais | IN | 1 |
| BF-007 | Horários de trabalho por dia da semana | IN | 1 |
| BF-008 | Pausas/intervalos | IN | 1 |
| BF-009 | Agenda visual por dia/profissional | IN | 1 |
| BF-010 | Criação rápida de agendamento | IN | 1 |
| BF-011 | Mudança de status de atendimento | IN | 2 |
| BF-012 | Bloqueio de horários | IN | 2 |
| BF-013 | Reagendamento | IN | 2 |
| BF-014 | Cálculo de disponibilidade | IN | 1 |
| BF-015 | Página pública de agendamento | IN | 2 |
| BF-016 | Wizard público de agendamento (6 etapas) | IN | 2 |
| BF-017 | Identificação por telefone | IN | 2 |
| BF-018 | Lista de clientes com busca e filtros | IN | 2 |
| BF-019 | Ficha do cliente com histórico | IN | 2 |
| BF-020 | Status automático de cliente | IN | 2 |
| BF-021 | Reagendar a partir da ficha | IN | 2 |
| BF-022 | Confirmação após agendamento | IN | 3 |
| BF-023 | Lembrete antes do horário | IN | 3 |
| BF-024 | Card atendimentos de hoje | IN | 3 |
| BF-025 | Card ocupação do dia | IN | 3 |
| BF-026 | Card faltas da semana | IN | 3 |
| BF-027 | Card horários vagos hoje | IN | 3 |
| BF-028 | Card clientes para retorno | IN | 3 |
| BF-029 | Quick action "Preencher horários vagos" | IN | 3 |
| BF-030 | Quick action "Reativar clientes" | IN | 3 |
| BF-031 | Dados da unidade | IN | 3 |
| BF-032 | Horários de funcionamento | IN | 3 |
| BF-033 | Política de cancelamento e no-show | IN | 3 |
| BF-034 | Configuração de notificações | IN | 3 |
| BF-035 | Clientes inativos com lista e ação | IN | 4 |
| BF-036 | Templates de campanhas | IN | 4 |
| BF-037 | Disparo de campanha para lista | IN | 4 |
| BF-038 | Planos/combos simples | IN | 4 |
| BF-039 | Vínculo plano-cliente | IN | 4 |
| BF-044 | Perfis de acesso básicos | IN | 4 |

**Total: 40 funcionalidades no lançamento.**

### FORA do lançamento (OUT)

| # | Funcionalidade | Motivo | Quando |
|---|---|---|---|
| BF-040 | Lista de espera | Baixo impacto vs. esforço no MVP | Semana 7-8 |
| BF-041 | Financeiro simplificado | Valor alto mas não bloqueia lançamento | Semana 7-8 |
| BF-042 | Relatório de ocupação | Precisa de dados históricos para ter valor | Semana 8-10 |
| BF-043 | Relatório de retorno de clientes | Idem | Semana 8-10 |
| BF-045 | Convite de membro da equipe | Perfis de acesso entram; convite por e-mail pode ser manual no início | Semana 7 |
| BF-046 | Drag-and-drop na agenda | Nice-to-have visual; reagendamento por drawer resolve | Fase 2 |
| BF-047 | WhatsApp API | Custo e complexidade; link wa.me resolve 80% | Fase 2 |
| BF-048 | Cobrança recorrente | Exige gateway; planos manuais resolvem | Fase 2 |
| BF-049 | Comissões | Financeiro básico resolve a maioria | Fase 2 |
| BF-050 | Relatórios avançados | Precisa de base de dados madura | Fase 2 |
| BF-051 | Multi-unidade | Complexidade arquitetural | Fase 2 |
| BF-052 | PWA mobile | Web responsivo resolve 90% | Fase 2 |
| BF-053-060 | Gateway, sinal, IA, chatbot, white-label, marketplace, fiscal, ERP | Fora de escopo | Fase 3+ |

---

## 2. O que o cliente vai ver — Experiência do usuário final

### Jornada do cliente (quem agenda)

**Passo 1 — Descoberta:**
O cliente recebe um link da barbearia (via WhatsApp, Instagram bio, ou cartão de visita): `barberflow.com.br/agendar/barbearia-do-joao`. Abre no celular.

**Passo 2 — Página da barbearia:**
Vê o logo, nome, endereço e telefone da barbearia. Abaixo, os serviços disponíveis em cards visuais com nome, duração e preço. O cliente toca em "Corte + Barba — 60min — R$ 70".

**Passo 3 — Escolha de profissional:**
Vê os barbeiros que fazem o serviço selecionado, com foto e nome. Pode escolher um específico ou tocar em "Sem preferência" para o sistema sugerir.

**Passo 4 — Escolha de data:**
Calendário mensal limpo. Dias sem disponibilidade estão esmaecidos. O cliente toca em "Quinta-feira, 15 de maio".

**Passo 5 — Escolha de horário:**
Lista de horários disponíveis: 09:00, 09:45, 10:30, 14:00, 15:00, 16:00. O cliente toca em "14:00".

**Passo 6 — Dados pessoais:**
Campo de telefone + nome. Se o cliente já agendou antes, ao digitar o telefone o sistema reconhece: "Bem-vindo de volta, Carlos!" e preenche o nome automaticamente.

**Passo 7 — Confirmação:**
Resumo: "Corte + Barba com Rafael, quinta 15/05 às 14:00 — R$ 70,00. Barbearia do João." Botão grande: "Confirmar agendamento".

**Passo 8 — Sucesso:**
Tela com check verde: "Agendamento confirmado! Até lá, Carlos." Opção de salvar na agenda do celular (arquivo .ics). Link do WhatsApp da barbearia.

**Tempo total: menos de 2 minutos.** O cliente nunca precisa criar conta, baixar app, ou ligar para a barbearia.

---

## 3. O que o dono vai ver — Experiência do gestor

### Primeiro acesso (onboarding)

O dono cria a conta em 30 segundos (nome, e-mail, senha, nome da barbearia). Imediatamente entra no wizard de onboarding:

1. **Tipo de negócio:** Seleciona "Barbearia" — o sistema já sugere serviços e configurações específicas.
2. **Dados da barbearia:** Preenche endereço, telefone, faz upload do logo.
3. **Horários:** Configura Seg-Sáb 09:00-19:00, Dom fechado. O sistema já sugere esse padrão.
4. **Profissionais:** Adiciona os barbeiros — nome, telefone, foto. Define horários de cada um.
5. **Serviços:** Aceita os 6 templates sugeridos (Corte, Barba, Corte+Barba, Sobrancelha, Hidratação, Pigmentação) e ajusta preços.

**Tempo total do onboarding: 8-10 minutos.** Ao finalizar, o sistema está 100% funcional.

### Dia a dia

**Ao abrir o sistema (Dashboard):**
Vê 5 cards com as métricas do dia: 12 atendimentos hoje, 78% de ocupação, 2 faltas na semana, 3 horários vagos (R$ 150 não faturados), 8 clientes para retorno. Dois botões de ação rápida: "Preencher horários vagos" e "Reativar clientes".

**Na Agenda:**
Visualização por dia com colunas por barbeiro. Cada agendamento é um card colorido com nome do cliente, serviço e horário. Clica em um slot vago e agenda em 3 cliques. Altera status com 1 clique: pendente → confirmado → concluído.

**Em Clientes:**
Lista com busca instantânea. Ao abrir a ficha do Carlos: 15 atendimentos, ticket médio R$ 65, frequência a cada 25 dias, status "Ativo". Última visita: há 18 dias. Sem ação necessária.

Ao abrir a ficha do Lucas: 8 atendimentos, ticket médio R$ 55, última visita há 42 dias, status "Em Risco". Botão "Agendar" já sugere o último serviço e barbeiro favorito. O dono agenda o Lucas em 10 segundos.

**Nos clientes inativos:**
Lista de 12 clientes que não voltam há mais de 60 dias. O dono seleciona 8 deles, escolhe o template "Sentimos sua falta" e dispara a campanha. O sistema gera links de WhatsApp personalizados para cada um.

**Nas Configurações:**
Edita horários da barbearia, adiciona um novo serviço, configura lembretes para 2h antes, define política de 3 faltas como limite.

---

## 4. Limitações aceitas — O que deliberadamente NÃO faz

Estas limitações são conscientes e comunicadas. Não são bugs — são decisões de escopo.

| Limitação | Por quê | Solução alternativa |
|---|---|---|
| **Notificações não são automáticas via WhatsApp API** | Custo e complexidade da integração com Meta Business API no MVP | O sistema gera links `wa.me` com mensagem pré-preenchida. O gestor clica para enviar via seu WhatsApp pessoal/business. O log registra que foi gerado. |
| **Não processa pagamentos online** | Exige gateway, KYC, compliance financeira | Pagamento é feito presencialmente na barbearia. O sistema informa o preço mas não cobra. |
| **Não há cobrança recorrente de planos** | Depende de gateway de pagamento | Planos são controlados manualmente. O gestor marca sessões usadas. Cobrança é feita fora do sistema. |
| **Não envia SMS automaticamente** | Custo por mensagem precisa de modelo de pricing validado | Usar WhatsApp links como canal primário. SMS é funcionalidade futura com custo repassado. |
| **Agenda sem drag-and-drop** | Complexidade de implementação para o prazo | Reagendamento via botão + drawer — funcional, apenas menos visual. |
| **Sem relatórios financeiros** | O MVP foca em operação e retenção, não em gestão financeira | O gestor pode exportar dados em CSV e analisar em planilha. Relatórios entram nas semanas 7-8. |
| **Sem multi-unidade** | Arquitetura simplificada para 1 barbearia por conta | Redes de barbearias criam contas separadas. Multi-unidade entra na Fase 2. |
| **Convite de equipe é manual** | Implementar fluxo de e-mail de convite é possível mas não prioritário | O owner cria as contas dos membros diretamente. Convite por e-mail entra na semana 7. |
| **Sem app mobile nativo** | PWA exige service worker e cache offline | O sistema é responsivo e funciona no navegador do celular. A experiência é equivalente a 90% de um app. |
| **Calendário de feriados não automático** | Varia por região e município | O gestor bloqueia feriados manualmente na agenda (BF-012). |

---

## 5. Proposta de pricing para lançamento

### Planos

| Plano | Preço mensal | Profissionais | Funcionalidades |
|---|---|---|---|
| **Solo** | R$ 49/mês | 1 profissional | Tudo do MVP: agenda, página pública, clientes, dashboard, notificações (links WhatsApp), configurações |
| **Equipe** | R$ 97/mês | Até 5 profissionais | Tudo do Solo + perfis de acesso + campanhas de reativação + planos/combos |
| **Premium** | R$ 197/mês | Até 15 profissionais | Tudo do Equipe + multi-unidade (quando disponível) + suporte prioritário + relatórios avançados (quando disponível) |

### Oferta de lançamento

**30% de desconto nos 3 primeiros meses:**

| Plano | Preço normal | Preço de lançamento (3 meses) | Economia |
|---|---|---|---|
| Solo | R$ 49/mês | **R$ 34/mês** | R$ 45 em 3 meses |
| Equipe | R$ 97/mês | **R$ 68/mês** | R$ 87 em 3 meses |
| Premium | R$ 197/mês | **R$ 138/mês** | R$ 177 em 3 meses |

### Justificativa de preço

- **Solo a R$ 49/mês:** Uma falta evitada por mês (ticket médio de R$ 50) já paga o sistema. O dono sozinho precisa de agenda organizada e página de agendamento — o sistema se paga no dia 1.
- **Equipe a R$ 97/mês:** Para barbearias com 2-5 profissionais, a operação diária sem sistema custa horas de trabalho manual. R$ 97 é menos que 2 cortes por mês — representa 0,5% do faturamento médio de uma barbearia com 3 profissionais (R$ 20.000/mês).
- **Premium a R$ 197/mês:** Para barbearias maiores, o ganho em produtividade e retenção de clientes justifica facilmente. Um cliente inativo reativado por mês (R$ 200/mês de receita recorrente) paga o plano.

### Modelo de cobrança

- Cobrança mensal via Pix ou cartão de crédito (gerenciado por Stripe ou Asaas)
- Trial grátis de 14 dias (sem cartão) para todos os planos
- Cancelamento a qualquer momento, sem fidelidade
- Upgrade/downgrade de plano imediato, com pro-rata

---

## 6. Checklist de go-live

### Infraestrutura

- [ ] Domínio `barberflow.com.br` registrado e apontando para Vercel
- [ ] SSL ativo (automático via Vercel)
- [ ] Banco de dados de produção no Neon com backup automático
- [ ] Variáveis de ambiente de produção configuradas na Vercel
- [ ] Monitoramento de erros ativo (Sentry)
- [ ] Analytics ativo (Vercel Analytics)
- [ ] Cron job de lembretes funcionando (Vercel Cron ou externo)

### Funcionalidades

- [ ] Registro de conta funcional
- [ ] Onboarding completo (5 etapas)
- [ ] CRUD de serviços com templates carregados
- [ ] CRUD de profissionais com horários e pausas
- [ ] Agenda visual funcional com criação rápida
- [ ] Fluxo de status de atendimento
- [ ] Bloqueio de horários
- [ ] Reagendamento
- [ ] Página pública acessível por slug
- [ ] Wizard público de agendamento funcional
- [ ] Identificação por telefone
- [ ] Lista e ficha de clientes
- [ ] Status automático de cliente
- [ ] Confirmação e lembrete (via link WhatsApp + log)
- [ ] Dashboard com 5 cards e 2 quick actions
- [ ] Configurações completas
- [ ] Clientes inativos e campanhas
- [ ] Planos e vínculos
- [ ] Perfis de acesso

### Qualidade

- [ ] Zero bugs críticos nos 6 fluxos E2E testados
- [ ] Tempo de carregamento < 2s em todas as páginas
- [ ] Página pública funcional em iOS Safari e Android Chrome
- [ ] Responsividade verificada: iPhone SE, iPhone 14, Samsung Galaxy, iPad, desktop 1920px
- [ ] Loading states em todas as operações assíncronas
- [ ] Empty states com CTA em todas as listas
- [ ] Error states com mensagens claras
- [ ] 404 amigável para slugs inválidos

### Comercial

- [ ] Landing page ou site institucional simples (pode ser 1 página)
- [ ] Formulário de contato ou link de WhatsApp para interessados
- [ ] Planos e preços definidos
- [ ] Processo de pagamento configurado (Stripe/Asaas para cobrança recorrente)
- [ ] Termos de uso redigidos (mesmo que simples)
- [ ] Política de privacidade (LGPD)
- [ ] E-mail de boas-vindas configurado (após registro)

### Demonstração

- [ ] Ambiente demo com dados realistas (barbearia fictícia completa)
- [ ] URL demo acessível: `demo.barberflow.com.br`
- [ ] Credenciais demo: demo@barberflow.com.br / demo123
- [ ] Roteiro de demonstração documentado (5 minutos)
- [ ] Screenshots/gravação para materiais de marketing

---

## 7. Estratégia de lançamento — Primeiros 10 clientes

### Fase 1: Validação (Semana 1 pós-lançamento) — 3 clientes

**Canal:** Prospecção direta presencial.

**Ação:** Visitar 10 barbearias na região. Não vender — oferecer valor gratuito.

**Script de abordagem:**
"Bom dia, tudo bem? Meu nome é [nome], estou desenvolvendo um sistema de agendamento feito especificamente para barbearias. Estou procurando 3 barbearias para usar gratuitamente por 30 dias e me dar feedback. Vocês teriam uma página de agendamento online pra clientes e um sistema pra controlar a agenda dos barbeiros. Posso mostrar em 5 minutos no celular?"

**Critério de seleção das 3 barbearias:**
1. Pelo menos 2 profissionais (para validar multi-profissional)
2. Já usam WhatsApp para agendar (dor real)
3. Dono presente e acessível para feedback

**Entrega:**
- Configurar o sistema presencialmente com o dono (30 minutos)
- Suporte direto via WhatsApp por 30 dias
- Coleta de feedback semanal (5 perguntas por WhatsApp)

### Fase 2: Conversão (Semana 2-3) — 5 clientes

**Canal:** Indicação dos 3 primeiros + Instagram Ads localizado.

**Ação 1 — Indicação:** Pedir para os 3 primeiros clientes indicarem 2 barbearias cada. Oferecer 1 mês grátis adicional por indicação convertida.

**Ação 2 — Instagram Ads:**
- Público: donos de barbearias, 25-50 anos, raio de 30km
- Orçamento: R$ 20/dia (R$ 600/mês)
- Criativo: vídeo de 30s mostrando agendamento pelo celular
- Copy: "Sua barbearia ainda agenda por WhatsApp? Seus clientes merecem agendar em 2 minutos. Teste grátis por 14 dias."
- CTA: "Criar conta grátis" → landing page → registro

**Ação 3 — Google Meu Negócio:**
- Listar barbearias da região no Google Maps
- Enviar mensagem personalizada via perfil do Google com oferta

### Fase 3: Escala inicial (Semana 4) — 2 clientes

**Canal:** Conteúdo + comunidade.

**Ação 1 — Conteúdo:** Publicar 3 posts no Instagram do BarberFlow:
1. "5 sinais de que sua barbearia está perdendo clientes por falta de organização"
2. "Como uma barbearia aumentou a ocupação em 30% com agendamento online"
3. "O custo real de cada falta na sua barbearia (faça o cálculo)"

**Ação 2 — Grupos de WhatsApp / Facebook:**
- Participar de grupos de barbeiros/donos de barbearia
- Oferecer valor (não vender): "Fiz uma calculadora de quanto sua barbearia perde com faltas. Quer que eu envie?"
- A calculadora pede e-mail → lead → follow-up

### Meta: 10 clientes pagantes em 30 dias pós-lançamento

| Semana | Canal | Meta | Acumulado |
|---|---|---|---|
| 1 | Prospecção presencial | 3 clientes (grátis → converter em 30 dias) | 3 |
| 2-3 | Indicação + Instagram Ads | 5 clientes | 8 |
| 4 | Conteúdo + comunidade | 2 clientes | 10 |

### MRR projetado com 10 clientes

| Cenário | Mix de planos | MRR |
|---|---|---|
| Conservador | 7 Solo + 3 Equipe | R$ 343 + R$ 291 = R$ 634/mês (com desconto de lançamento) |
| Realista | 5 Solo + 4 Equipe + 1 Premium | R$ 170 + R$ 272 + R$ 138 = R$ 580/mês (com desconto) → R$ 782/mês (preço cheio após 3 meses) |
| Otimista | 3 Solo + 5 Equipe + 2 Premium | R$ 102 + R$ 340 + R$ 276 = R$ 718/mês → R$ 1.025/mês |

---

## 8. Pitch comercial em 1 parágrafo

> **BarberFlow é o sistema de crescimento feito para barbearias.** Em menos de 10 minutos, você configura sua barbearia e ganha uma página de agendamento online onde seus clientes marcam horário em 2 minutos, sem ligar nem mandar mensagem. O sistema organiza a agenda de todos os barbeiros, envia lembretes automáticos para reduzir faltas, e o mais importante: identifica clientes que estão sumindo e te ajuda a trazê-los de volta com ações de 1 clique. Barbearias que usam o BarberFlow reduzem faltas, preenchem horários vagos e aumentam o retorno de clientes — o que significa mais cadeiras ocupadas e mais dinheiro no caixa. Comece grátis por 14 dias, sem cartão de crédito, e veja a diferença na sua operação já na primeira semana.

---

## 9. Demo script — Roteiro de demonstração em 5 minutos

### Setup prévio
- Abrir o ambiente demo no celular (página pública) e no notebook (painel admin)
- Ter a demo já configurada com: 3 profissionais, 6 serviços, 15 clientes, 8 agendamentos de hoje, 5 clientes em risco

### Minuto 0-1: O problema

**Falar:**
"Deixa eu te fazer uma pergunta: quantos clientes você perde por mês porque esqueceram do horário, ou porque não conseguiram agendar porque o WhatsApp estava lotado? E quantos clientes bons pararam de vir e você nem percebeu? O BarberFlow resolve exatamente isso."

### Minuto 1-2: Página de agendamento (mostrar no celular)

**Mostrar:**
1. Abrir `barberflow.com.br/agendar/barbearia-demo` no celular
2. Selecionar "Corte + Barba"
3. Selecionar profissional "Rafael"
4. Escolher uma data da semana seguinte
5. Tocar em um horário disponível
6. Digitar telefone — sistema reconhece: "Bem-vindo de volta, Carlos!"
7. Confirmar agendamento

**Falar:**
"Isso é o que seu cliente vê. Ele recebe o link pelo WhatsApp, Instagram, ou cartão de visita. Em menos de 2 minutos, agendou sozinho. Sem ligar, sem esperar resposta. E olha — ele já agendou antes, o sistema lembrou dele."

### Minuto 2-3: Agenda do gestor (mostrar no notebook)

**Mostrar:**
1. Abrir a agenda no painel admin — o agendamento do Carlos apareceu automaticamente
2. Mostrar as colunas por barbeiro com os agendamentos do dia
3. Clicar em um agendamento → mudar status para "Confirmado" com 1 clique
4. Clicar em um slot vago → criar agendamento em 3 cliques (autocomplete do cliente + serviço)

**Falar:**
"Aqui é o que você vê. Toda a agenda do dia, de todos os barbeiros, numa tela. O agendamento do site já apareceu aqui. Você confirma com 1 clique. E se quiser agendar alguém que ligou, são 3 cliques."

### Minuto 3-4: Dashboard e retenção (a estrela do show)

**Mostrar:**
1. Abrir o Dashboard — mostrar os 5 cards
2. Apontar: "3 horários vagos hoje — R$ 150 que poderiam estar no caixa"
3. Clicar em "Preencher horários vagos" — mostrar as sugestões de clientes
4. Apontar: "8 clientes para retorno — não voltam há mais de 30 dias"
5. Clicar em "Reativar clientes" — mostrar a lista com ação rápida
6. Clicar em "Agendar" ao lado de um cliente em risco — agendamento criado

**Falar:**
"Esse é o diferencial do BarberFlow. O sistema sabe quem está sumindo. Ele te mostra: 'Ó, o Lucas não volta há 42 dias, ele costumava vir todo mês. Quer agendar ele?' Um clique e o Lucas está de volta na sua agenda. Isso é dinheiro que estava saindo pela porta e agora volta."

### Minuto 4-5: Fechamento

**Mostrar:**
1. Rapidamente passar pela ficha do cliente (histórico, métricas)
2. Mostrar os planos e preço: "A partir de R$ 34/mês no lançamento"

**Falar:**
"Tudo isso por menos que o preço de 1 corte por mês. E o retorno? Uma falta evitada por mês já paga o sistema. Um cliente reativado por mês já te dá 3x o investimento. Você pode testar grátis por 14 dias, sem cartão. Quer que eu configure pra sua barbearia agora?"

---

## 10. Métricas de sucesso para os primeiros 30 dias pós-lançamento

### Métricas de aquisição

| Métrica | Meta (30 dias) | Como medir |
|---|---|---|
| Contas criadas (registros) | 30 | Contagem no banco de dados |
| Onboarding completo (terminaram o wizard) | 20 (67% de conversão) | Flag `onboarding_completed = true` |
| Trial ativo (usaram na primeira semana) | 15 (50% dos registros) | Pelo menos 5 agendamentos criados nos primeiros 7 dias |
| Conversão para pagante | 10 (33% dos registros) | Assinatura ativa no Stripe/Asaas |

### Métricas de engajamento

| Métrica | Meta (30 dias) | Como medir |
|---|---|---|
| Agendamentos criados (total, todas as barbearias) | 500+ | Contagem no banco (appointments com status != cancelado) |
| Agendamentos via página pública | 30% do total | Filter por `source = public` |
| DAU (usuários ativos diários, média) | 8 | Sessões únicas por dia |
| Sessões por usuário por semana | 5+ (uso diário) | Analytics |
| Feature mais usada (esperado: agenda) | Confirmação via dados | Eventos de uso por módulo |

### Métricas de valor (o produto resolve o problema?)

| Métrica | Meta (30 dias) | Como medir |
|---|---|---|
| Taxa de faltas (no-show) das barbearias | < 15% (vs. média de 20-25% do setor) | Agendamentos com status "Faltou" / total |
| Clientes reativados (eram Em Risco/Inativo e agendaram) | 20+ no total | Filter por `source = reactivation` |
| Taxa de ocupação média das barbearias | > 65% | Cálculo de slots ocupados / disponíveis |
| NPS dos donos de barbearia | > 40 | Pesquisa manual via WhatsApp (pergunta 1-10) |

### Métricas financeiras

| Métrica | Meta (30 dias) | Como medir |
|---|---|---|
| MRR (receita recorrente mensal) | R$ 580+ | Soma das assinaturas ativas |
| CAC (custo de aquisição de cliente) | < R$ 100 | (Custo de ads + tempo de prospecção) / clientes pagantes |
| LTV projetado (12 meses) | R$ 700+ (Solo) / R$ 1.160+ (Equipe) | Preço mensal × 12 × taxa de retenção estimada (90%) |
| Churn rate | < 10% no primeiro mês | Cancelamentos / total de pagantes |

### Métricas de qualidade

| Métrica | Meta (30 dias) | Como medir |
|---|---|---|
| Uptime | > 99.5% | Vercel status + monitoramento externo (UptimeRobot) |
| Erros em produção (P0/P1) | < 5 total | Sentry |
| Tempo médio de carregamento | < 2s | Vercel Analytics |
| Tickets de suporte | < 20 total | WhatsApp de suporte / e-mail |
| Tempo médio de resolução de suporte | < 4h | Timestamp de abertura → resolução |

### Ritual de acompanhamento

**Diário (5 minutos):**
- Verificar Sentry — algum erro novo?
- Verificar novas contas criadas
- Responder tickets de suporte pendentes

**Semanal (30 minutos):**
- Revisar todas as métricas acima
- Ligar para 2 clientes pagantes pedindo feedback
- Ajustar prioridades do backlog com base no feedback

**Ao final dos 30 dias:**
- Documento de retrospectiva: o que funcionou, o que não funcionou, o que mudar
- Decisão de go/no-go para investir em crescimento (ads, conteúdo, sales)
- Planejamento do próximo trimestre com base nos dados reais

---

## Decisão final

O BarberFlow v1.0 lança com 40 funcionalidades em 30 dias. O produto resolve 3 problemas concretos de qualquer barbearia:

1. **Clientes agendando sozinhos** — página pública em 2 minutos, sem ligar.
2. **Agenda organizada** — visualização clara, status, bloqueios, reagendamento.
3. **Clientes voltando** — identificação automática de risco, ações de 1 clique.

O preço se paga com 1 falta evitada por mês. O diferencial não é ser "mais um sistema de agendamento" — é ser o sistema que faz a barbearia crescer, trazendo clientes de volta.

Hora de construir.
