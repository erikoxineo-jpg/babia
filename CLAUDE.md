## Stack atual
- Front-end: Next.js 15.3 + React 19 + TypeScript 5.8 + Tailwind CSS 3.4 + Lucide React (ícones)
- Back-end: Next.js API Routes (App Router) + Prisma 6.5 ORM
- Banco de dados: PostgreSQL 15 (Alpine, via Docker)
- N8N: Webhooks fire-and-forget para automações (boas-vindas, confirmação, lembretes 24h/4h)
- WhatsApp API: Evolution API (instância própria via Docker)
- VPS: Docker Compose + Traefik (reverse proxy + TLS) — domínio babia.oxineo.com.br
- Deploy: Docker standalone (Next.js) + rede compartilhada com N8N (n8n_default)
- Autenticação: NextAuth v4 (credentials) + bcryptjs

## O que já está funcionando
- cadastro
- geração de link
- dashboard
- fluxo inicial de agendamento
- etc.

## Problemas atuais
- confusão entre profissional e cliente final
- mensagens ambíguas
- automações que não disparam corretamente
- agenda não sincroniza como deveria
- dashboard não reflete eventos em tempo real
- etc.
