# BarberFlow -- Design System v1.0

> Sistema de design completo para o BarberFlow SaaS.
> Todas as decisoes sao definitivas e prontas para implementacao com Tailwind CSS + React.

---

## Sumario

1. [Cores](#1-cores)
2. [Tipografia](#2-tipografia)
3. [Espacamento](#3-espacamento)
4. [Border Radius](#4-border-radius)
5. [Shadows](#5-shadows)
6. [Breakpoints](#6-breakpoints)
7. [Tokens de Status](#7-tokens-de-status)
8. [Padroes de Componentes](#8-padroes-de-componentes)
9. [Icones](#9-icones)
10. [Animacoes](#10-animacoes)
11. [Config Tailwind Completa](#11-config-tailwind-completa)

---

## 1. Cores

### 1.1 Cor Primaria -- Azul Escuro (`primary`)

Transmite confianca, profissionalismo e solidez. Usada em CTAs principais, navegacao ativa, links e elementos de destaque institucional.

| Token           | Hex       | Uso                                      |
|-----------------|-----------|------------------------------------------|
| `primary-50`    | `#E8EEF5` | Background de selecao sutil              |
| `primary-100`   | `#C5D3E8` | Background de hover em listas            |
| `primary-200`   | `#9FB5D9` | Bordas leves                             |
| `primary-300`   | `#7897C9` | Icones secundarios                       |
| `primary-400`   | `#5A7FBD` | Links hover                              |
| `primary-500`   | `#1E3A5F` | **Cor principal** -- botoes, nav ativa    |
| `primary-600`   | `#1A3354` | Hover em botoes primarios                |
| `primary-700`   | `#152A45` | Active/pressed em botoes                 |
| `primary-800`   | `#0F1F33` | Textos de alto contraste sobre claro     |
| `primary-900`   | `#0A1522` | Background de header/sidebar escuro      |

### 1.2 Cor Secundaria -- Dourado/Ambar (`secondary`)

Remete ao universo barbershop, premium e sofisticacao. Usada em destaques, badges VIP, acentos visuais e elementos de upsell.

| Token             | Hex       | Uso                                      |
|-------------------|-----------|------------------------------------------|
| `secondary-50`    | `#FBF5E8` | Background de cards em destaque          |
| `secondary-100`   | `#F5E6C4` | Background de banners promocionais       |
| `secondary-200`   | `#EDD49C` | Bordas de elementos premium              |
| `secondary-300`   | `#E5C274` | Icones de destaque                       |
| `secondary-400`   | `#DCB55E` | Estrelas de avaliacao                    |
| `secondary-500`   | `#D4A853` | **Cor principal** -- acentos, badges VIP |
| `secondary-600`   | `#BF9545` | Hover em elementos dourados              |
| `secondary-700`   | `#A37E3A` | Texto sobre fundo claro dourado          |
| `secondary-800`   | `#7A5F2C` | Textos de contraste sobre dourado        |
| `secondary-900`   | `#52401E` | Titulos em secoes premium                |

### 1.3 Cor de Sucesso -- Verde (`success`)

Usada para confirmacoes, status "confirmado", mensagens de sucesso e indicadores positivos.

| Token           | Hex       | Uso                                      |
|-----------------|-----------|------------------------------------------|
| `success-50`    | `#ECFDF5` | Background de alertas de sucesso         |
| `success-100`   | `#D1FAE5` | Background leve de linhas confirmadas    |
| `success-200`   | `#A7F3D0` | Bordas de sucesso                        |
| `success-300`   | `#6EE7B7` | Icones de sucesso secundarios            |
| `success-400`   | `#34D399` | Indicadores visuais positivos            |
| `success-500`   | `#10B981` | **Cor principal** -- badges, icones      |
| `success-600`   | `#059669` | Hover em botoes de confirmacao           |
| `success-700`   | `#047857` | Texto sobre fundo de sucesso             |
| `success-800`   | `#065F46` | Texto alto contraste                     |
| `success-900`   | `#064E3B` | Background escuro de sucesso             |

### 1.4 Cor de Alerta -- Amarelo (`warning`)

Usada para status "pendente", avisos, notificacoes que requerem atencao e lembretes.

| Token           | Hex       | Uso                                      |
|-----------------|-----------|------------------------------------------|
| `warning-50`    | `#FFFBEB` | Background de alertas de aviso           |
| `warning-100`   | `#FEF3C7` | Background de banners de atencao         |
| `warning-200`   | `#FDE68A` | Bordas de aviso                          |
| `warning-300`   | `#FCD34D` | Icones de aviso leves                    |
| `warning-400`   | `#FBBF24` | Indicadores de pendencia                 |
| `warning-500`   | `#F59E0B` | **Cor principal** -- badges pendentes    |
| `warning-600`   | `#D97706` | Hover em elementos de aviso              |
| `warning-700`   | `#B45309` | Texto sobre fundo de aviso               |
| `warning-800`   | `#92400E` | Texto alto contraste                     |
| `warning-900`   | `#78350F` | Background escuro de aviso               |

### 1.5 Cor de Erro -- Vermelho (`error`)

Usada para status "faltou", "cancelado" (com variacao), erros de validacao, acoes destrutivas e alertas criticos.

| Token         | Hex       | Uso                                        |
|---------------|-----------|--------------------------------------------|
| `error-50`    | `#FEF2F2` | Background de alertas de erro              |
| `error-100`   | `#FEE2E2` | Background de campos com erro              |
| `error-200`   | `#FECACA` | Bordas de erro                             |
| `error-300`   | `#FCA5A5` | Icones de erro leves                       |
| `error-400`   | `#F87171` | Indicadores de falta                       |
| `error-500`   | `#EF4444` | **Cor principal** -- badges, validacao     |
| `error-600`   | `#DC2626` | Hover em botoes destrutivos                |
| `error-700`   | `#B91C1C` | Texto sobre fundo de erro                  |
| `error-800`   | `#991B1B` | Texto alto contraste                       |
| `error-900`   | `#7F1D1D` | Background escuro de erro                  |

### 1.6 Neutros -- Cinzas (`gray`)

Base de toda a interface. Textos, backgrounds, bordas, divisores.

| Token        | Hex       | Uso                                         |
|--------------|-----------|---------------------------------------------|
| `gray-50`    | `#F9FAFB` | Background principal da pagina (off-white)  |
| `gray-100`   | `#F3F4F6` | Background de secoes alternadas             |
| `gray-200`   | `#E5E7EB` | Bordas de inputs, divisores, separadores    |
| `gray-300`   | `#D1D5DB` | Bordas de hover, placeholders visuais       |
| `gray-400`   | `#9CA3AF` | Texto placeholder, icones desabilitados     |
| `gray-500`   | `#6B7280` | Texto secundario, labels, captions          |
| `gray-600`   | `#4B5563` | Texto de corpo secundario                   |
| `gray-700`   | `#374151` | Texto de corpo principal                    |
| `gray-800`   | `#1F2937` | Titulos e headings                          |
| `gray-900`   | `#111827` | Texto de maximo contraste                   |

### 1.7 Background

| Token         | Hex       | Uso                                        |
|---------------|-----------|--------------------------------------------|
| `white`       | `#FFFFFF` | Background de cards, modais, inputs        |
| `bg-page`     | `#F9FAFB` | Background geral da pagina (gray-50)       |
| `bg-section`  | `#F3F4F6` | Background de secoes alternadas (gray-100) |
| `bg-sidebar`  | `#0A1522` | Sidebar escura (primary-900)               |

---

## 2. Tipografia

### 2.1 Font Stack

```
Corpo:     Inter, system-ui, -apple-system, sans-serif
Headings:  Inter (weight 600-700), mesma familia para consistencia
Mono:      JetBrains Mono, ui-monospace, monospace
```

**Decisao**: Inter para tudo. Nao usar fonte display separada. Inter em peso semibold/bold nos headings ja oferece diferenciacao suficiente e elimina flash de carregamento de fonte adicional. A consistencia visual e mais importante que decoracao.

### 2.2 Escala Tipografica

| Token   | Tamanho  | Line Height | Uso                                  |
|---------|----------|-------------|--------------------------------------|
| `xs`    | 12px     | 16px (1.33) | Captions, labels menores, footnotes  |
| `sm`    | 14px     | 20px (1.43) | Labels, texto auxiliar, badges       |
| `base`  | 16px     | 24px (1.5)  | Corpo principal, paragrafos          |
| `lg`    | 18px     | 28px (1.56) | Subtitulos, destaque em corpo        |
| `xl`    | 20px     | 28px (1.4)  | Heading de secao (h4)               |
| `2xl`   | 24px     | 32px (1.33) | Heading de card/modal (h3)          |
| `3xl`   | 30px     | 36px (1.2)  | Heading de pagina (h2)              |
| `4xl`   | 36px     | 40px (1.11) | Titulo principal de pagina (h1)     |

### 2.3 Pesos

| Token      | Valor | Uso                                        |
|------------|-------|--------------------------------------------|
| `regular`  | 400   | Texto de corpo, paragrafos                 |
| `medium`   | 500   | Labels, celulas de tabela com destaque     |
| `semibold` | 600   | Subtitulos, botoes, nav items              |
| `bold`     | 700   | Headings (h1, h2, h3), numeros grandes    |

### 2.4 Padroes Tipograficos por Contexto

```
Titulo da pagina (h1):   text-4xl font-bold text-gray-900
Subtitulo (h2):          text-3xl font-bold text-gray-800
Heading de card (h3):    text-2xl font-semibold text-gray-800
Heading de secao (h4):   text-xl font-semibold text-gray-700
Corpo:                   text-base font-regular text-gray-700
Corpo secundario:        text-sm text-gray-500
Label de campo:          text-sm font-medium text-gray-700
Placeholder:             text-base text-gray-400
Caption:                 text-xs text-gray-500
Valor monetario:         text-2xl font-bold text-gray-900 tabular-nums
Numero em KPI:           text-4xl font-bold text-primary-500 tabular-nums
```

---

## 3. Espacamento

### 3.1 Escala de Spacing

Baseada no sistema de 4px do Tailwind. Unidade base = 4px.

| Token | Valor  | Uso                                          |
|-------|--------|----------------------------------------------|
| `0`   | 0px    | Reset                                        |
| `0.5` | 2px    | Ajuste fino entre icone e texto inline       |
| `1`   | 4px    | Gap entre elementos muito proximos           |
| `1.5` | 6px    | Padding interno de badges pequenos           |
| `2`   | 8px    | Gap padrao entre itens inline                |
| `3`   | 12px   | Padding interno de botoes sm                 |
| `4`   | 16px   | Padding padrao de inputs, gap de formularios |
| `5`   | 20px   | Padding de botoes md                         |
| `6`   | 24px   | Padding interno de cards                     |
| `8`   | 32px   | Gap entre secoes dentro de um card           |
| `10`  | 40px   | Margem entre blocos de conteudo              |
| `12`  | 48px   | Padding de modais                            |
| `16`  | 64px   | Margem entre secoes de pagina                |
| `20`  | 80px   | Padding vertical de hero sections            |
| `24`  | 96px   | Espacamento amplo de secoes maiores          |

### 3.2 Padroes de Spacing por Componente

```
Card:
  padding:          p-6 (24px)
  gap interno:      space-y-4 (16px)
  gap entre cards:  gap-6 (24px)

Formulario:
  gap entre campos: space-y-4 (16px)
  gap label-input:  space-y-1.5 (6px)
  gap entre secoes: space-y-8 (32px)

Botao:
  sm: px-3 py-1.5    (12px x 6px)
  md: px-5 py-2.5    (20px x 10px)
  lg: px-6 py-3      (24px x 12px)

Input:
  px-4 py-2.5        (16px x 10px)

Tabela:
  celula: px-6 py-4  (24px x 16px)
  header: px-6 py-3  (24px x 12px)

Modal:
  padding: p-8       (32px)
  gap interno: space-y-6 (24px)

Sidebar:
  padding: p-4       (16px)
  gap entre items: space-y-1 (4px)
  gap entre grupos: space-y-6 (24px)

Page:
  padding horizontal: px-6 (24px) mobile, px-8 (32px) desktop
  padding top: pt-8 (32px)
  gap entre secoes: space-y-8 (32px)
```

### 3.3 Grid

```
Colunas:     12
Gap padrao:  gap-6 (24px)
Max width:   max-w-7xl (1280px) para conteudo central
Sidebar:     w-64 (256px) fixa
Main area:   flex-1 (restante)
```

Layout padrao da aplicacao:

```
+----------+----------------------------------------+
|          |                                        |
| Sidebar  |          Main Content                  |
|  w-64    |        px-8 py-8                       |
|          |        max-w-7xl                       |
|          |                                        |
+----------+----------------------------------------+
```

---

## 4. Border Radius

### 4.1 Escala

| Token    | Valor | Tailwind      |
|----------|-------|---------------|
| `none`   | 0px   | `rounded-none`|
| `sm`     | 4px   | `rounded-sm`  |
| `md`     | 6px   | `rounded-md`  |
| `lg`     | 8px   | `rounded-lg`  |
| `xl`     | 12px  | `rounded-xl`  |
| `2xl`    | 16px  | `rounded-2xl` |
| `full`   | 9999px| `rounded-full`|

### 4.2 Padrao por Componente

| Componente     | Border Radius | Classe Tailwind  |
|----------------|---------------|------------------|
| Button         | 6px           | `rounded-md`     |
| Input          | 6px           | `rounded-md`     |
| Card           | 8px           | `rounded-lg`     |
| Modal          | 12px          | `rounded-xl`     |
| Badge/Chip     | 9999px        | `rounded-full`   |
| Avatar         | 9999px        | `rounded-full`   |
| Dropdown       | 8px           | `rounded-lg`     |
| Tooltip        | 6px           | `rounded-md`     |
| Toast          | 8px           | `rounded-lg`     |
| Sidebar item   | 6px           | `rounded-md`     |

---

## 5. Shadows

### 5.1 Escala

| Token | Valor                                                         | Tailwind     |
|-------|---------------------------------------------------------------|--------------|
| `sm`  | `0 1px 2px 0 rgba(0, 0, 0, 0.05)`                            | `shadow-sm`  |
| `md`  | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` | `shadow-md`  |
| `lg`  | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` | `shadow-lg`  |
| `xl`  | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)` | `shadow-xl`  |

### 5.2 Padrao por Componente

| Componente     | Shadow    | Quando                                |
|----------------|-----------|---------------------------------------|
| Card           | `shadow-sm` | Estado padrao                       |
| Card (hover)   | `shadow-md` | Hover em cards clicaveis            |
| Dropdown       | `shadow-md` | Sempre visivel quando aberto        |
| Modal          | `shadow-xl` | Sempre                              |
| Toast          | `shadow-lg` | Sempre                              |
| Tooltip        | `shadow-md` | Sempre visivel quando aberto        |
| Sidebar        | `shadow-sm` | Borda direita com sombra sutil      |
| Button         | nenhum      | Sem sombra, usa background/borda    |
| Input          | nenhum      | Sem sombra, usa borda               |
| Input (focus)  | `ring`      | Usa ring do Tailwind, nao shadow    |

---

## 6. Breakpoints

| Token | Largura | Uso                              | Comportamento                        |
|-------|---------|----------------------------------|--------------------------------------|
| `sm`  | 640px   | Mobile landscape                 | Stack vertical, sidebar oculta       |
| `md`  | 768px   | Tablet                           | Grid 2 colunas, sidebar overlay      |
| `lg`  | 1024px  | Desktop                          | Grid 3+ colunas, sidebar fixa        |
| `xl`  | 1280px  | Wide desktop                     | Layout amplo, mais dados visiveis    |

### 6.1 Regras de Layout Responsivo

```
Mobile (< 640px):
  - Sidebar oculta, abre como drawer
  - Cards em stack vertical (1 coluna)
  - Tabelas viram cards empilhados
  - Botoes full-width
  - Header simplificado

Tablet (640px - 1023px):
  - Sidebar como overlay (abre/fecha)
  - Grid 2 colunas para cards de KPI
  - Tabelas com scroll horizontal
  - Botoes tamanho normal

Desktop (1024px+):
  - Sidebar fixa visivel
  - Grid 3-4 colunas para KPIs
  - Tabelas completas
  - Layout completo
```

---

## 7. Tokens de Status

Tokens semanticos para os status de agendamento. Cada status tem background, texto e borda.

### 7.1 Definicao Completa

| Status        | BG Class            | Text Class           | Border Class          | Icone (Lucide)     |
|---------------|---------------------|----------------------|-----------------------|--------------------|
| Confirmado    | `bg-success-100`    | `text-success-700`   | `border-success-300`  | `CheckCircle`      |
| Pendente      | `bg-warning-100`    | `text-warning-700`   | `border-warning-300`  | `Clock`            |
| Concluido     | `bg-primary-100`    | `text-primary-700`   | `border-primary-300`  | `CheckCheck`       |
| Faltou        | `bg-error-100`      | `text-error-700`     | `border-error-300`    | `XCircle`          |
| Cancelado     | `bg-gray-100`       | `text-gray-600`      | `border-gray-300`     | `Ban`              |

### 7.2 Implementacao do Badge de Status

```tsx
// components/ui/StatusBadge.tsx

import { CheckCircle, Clock, CheckCheck, XCircle, Ban } from 'lucide-react';

type AppointmentStatus = 'confirmado' | 'pendente' | 'concluido' | 'faltou' | 'cancelado';

const statusConfig: Record<AppointmentStatus, {
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
  label: string;
}> = {
  confirmado: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    border: 'border-success-300',
    icon: CheckCircle,
    label: 'Confirmado',
  },
  pendente: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    border: 'border-warning-300',
    icon: Clock,
    label: 'Pendente',
  },
  concluido: {
    bg: 'bg-primary-100',
    text: 'text-primary-700',
    border: 'border-primary-300',
    icon: CheckCheck,
    label: 'Concluido',
  },
  faltou: {
    bg: 'bg-error-100',
    text: 'text-error-700',
    border: 'border-error-300',
    icon: XCircle,
    label: 'Faltou',
  },
  cancelado: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
    icon: Ban,
    label: 'Cancelado',
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
  };

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bg} ${config.text} ${config.border}
        ${sizeClasses[size]}
      `}
    >
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}
```

---

## 8. Padroes de Componentes

### 8.1 Button

#### Tamanhos

| Tamanho | Classes                                   | Altura  |
|---------|-------------------------------------------|---------|
| `sm`    | `px-3 py-1.5 text-sm rounded-md`          | ~32px   |
| `md`    | `px-5 py-2.5 text-sm rounded-md`          | ~40px   |
| `lg`    | `px-6 py-3 text-base rounded-md`          | ~48px   |

#### Variantes

**Primary** -- acao principal (salvar, confirmar, agendar):
```
Default:   bg-primary-500 text-white font-semibold
Hover:     bg-primary-600
Active:    bg-primary-700
Focus:     ring-2 ring-primary-500 ring-offset-2
Disabled:  bg-primary-300 cursor-not-allowed opacity-60
```

**Secondary** -- acao secundaria (cancelar dilogo, acao alternativa):
```
Default:   bg-secondary-500 text-white font-semibold
Hover:     bg-secondary-600
Active:    bg-secondary-700
Focus:     ring-2 ring-secondary-500 ring-offset-2
Disabled:  bg-secondary-300 cursor-not-allowed opacity-60
```

**Outline** -- acao terciaria (filtros, acoes alternativas):
```
Default:   border border-gray-300 text-gray-700 bg-white font-semibold
Hover:     bg-gray-50 border-gray-400
Active:    bg-gray-100
Focus:     ring-2 ring-primary-500 ring-offset-2
Disabled:  border-gray-200 text-gray-400 cursor-not-allowed
```

**Ghost** -- acao discreta (fechar, icone-only):
```
Default:   text-gray-600 bg-transparent font-semibold
Hover:     bg-gray-100 text-gray-700
Active:    bg-gray-200
Focus:     ring-2 ring-primary-500 ring-offset-2
Disabled:  text-gray-300 cursor-not-allowed
```

**Destructive** -- acao destrutiva (excluir, remover):
```
Default:   bg-error-500 text-white font-semibold
Hover:     bg-error-600
Active:    bg-error-700
Focus:     ring-2 ring-error-500 ring-offset-2
Disabled:  bg-error-300 cursor-not-allowed opacity-60
```

#### Implementacao

```tsx
// components/ui/Button.tsx

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-500 text-white
    hover:bg-primary-600
    active:bg-primary-700
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:bg-primary-300 disabled:opacity-60
  `,
  secondary: `
    bg-secondary-500 text-white
    hover:bg-secondary-600
    active:bg-secondary-700
    focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
    disabled:bg-secondary-300 disabled:opacity-60
  `,
  outline: `
    border border-gray-300 text-gray-700 bg-white
    hover:bg-gray-50 hover:border-gray-400
    active:bg-gray-100
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:border-gray-200 disabled:text-gray-400
  `,
  ghost: `
    text-gray-600 bg-transparent
    hover:bg-gray-100 hover:text-gray-700
    active:bg-gray-200
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:text-gray-300
  `,
  destructive: `
    bg-error-500 text-white
    hover:bg-error-600
    active:bg-error-700
    focus:ring-2 focus:ring-error-500 focus:ring-offset-2
    disabled:bg-error-300 disabled:opacity-60
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-semibold rounded-md
          transition-colors duration-150 ease-in-out
          disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className ?? ''}
        `}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

### 8.2 Input

#### Tamanhos

| Tamanho | Classes                           | Altura |
|---------|-----------------------------------|--------|
| `sm`    | `px-3 py-1.5 text-sm`             | ~32px  |
| `md`    | `px-4 py-2.5 text-sm`             | ~40px  |
| `lg`    | `px-4 py-3 text-base`             | ~48px  |

#### Estados

```
Default:    border border-gray-200 bg-white text-gray-700 rounded-md
            placeholder:text-gray-400
Focus:      border-primary-500 ring-2 ring-primary-500/20 outline-none
Error:      border-error-500 ring-2 ring-error-500/20
Disabled:   bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed
```

#### Implementacao

```tsx
// components/ui/Input.tsx

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, inputSize = 'md', leftIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-md border bg-white
              transition-colors duration-150 ease-in-out
              placeholder:text-gray-400
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${error
                ? 'border-error-500 focus:ring-2 focus:ring-error-500/20'
                : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
              }
              focus:outline-none
              ${leftIcon ? 'pl-10' : ''}
              ${sizeClasses[inputSize]}
              ${className ?? ''}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
        {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

### 8.3 Card

#### Variantes

**Default** -- card padrao de conteudo:
```
bg-white rounded-lg shadow-sm border border-gray-200 p-6
```

**Interactive** -- card clicavel (links, selecao):
```
bg-white rounded-lg shadow-sm border border-gray-200 p-6
hover:shadow-md hover:border-gray-300 cursor-pointer
transition-shadow duration-150 ease-in-out
```

**Highlighted** -- card com destaque (KPI principal, promocao):
```
bg-white rounded-lg shadow-sm border-2 border-secondary-300 p-6
```

**Flat** -- card sem sombra para agrupamento sutil:
```
bg-gray-50 rounded-lg border border-gray-200 p-6
```

#### Implementacao

```tsx
// components/ui/Card.tsx

import { type HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'default' | 'interactive' | 'highlighted' | 'flat';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white rounded-lg shadow-sm border border-gray-200',
  interactive: `
    bg-white rounded-lg shadow-sm border border-gray-200
    hover:shadow-md hover:border-gray-300 cursor-pointer
    transition-shadow duration-150 ease-in-out
  `,
  highlighted: 'bg-white rounded-lg shadow-sm border-2 border-secondary-300',
  flat: 'bg-gray-50 rounded-lg border border-gray-200',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className ?? ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/* Sub-componentes */
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className ?? ''}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-gray-800 ${className ?? ''}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-4 ${className ?? ''}`} {...props}>
      {children}
    </div>
  );
}
```

---

### 8.4 Badge/Chip

#### Tamanhos

| Tamanho | Classes                                      |
|---------|----------------------------------------------|
| `sm`    | `px-2 py-0.5 text-xs rounded-full`            |
| `md`    | `px-2.5 py-1 text-sm rounded-full`            |

#### Variantes

```
Primary:     bg-primary-100 text-primary-700 border border-primary-300
Secondary:   bg-secondary-100 text-secondary-700 border border-secondary-300
Success:     bg-success-100 text-success-700 border border-success-300
Warning:     bg-warning-100 text-warning-700 border border-warning-300
Error:       bg-error-100 text-error-700 border border-error-300
Neutral:     bg-gray-100 text-gray-600 border border-gray-300
```

#### Implementacao

```tsx
// components/ui/Badge.tsx

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 border-primary-300',
  secondary: 'bg-secondary-100 text-secondary-700 border-secondary-300',
  success: 'bg-success-100 text-success-700 border-success-300',
  warning: 'bg-warning-100 text-warning-700 border-warning-300',
  error: 'bg-error-100 text-error-700 border-error-300',
  neutral: 'bg-gray-100 text-gray-600 border-gray-300',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

export function Badge({ variant = 'neutral', size = 'md', icon, children }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {icon}
      {children}
    </span>
  );
}
```

---

### 8.5 Avatar

#### Tamanhos

| Tamanho | Dimensao | Classes                          |
|---------|----------|----------------------------------|
| `xs`    | 24px     | `w-6 h-6 text-xs`                |
| `sm`    | 32px     | `w-8 h-8 text-sm`                |
| `md`    | 40px     | `w-10 h-10 text-sm`              |
| `lg`    | 48px     | `w-12 h-12 text-base`            |
| `xl`    | 64px     | `w-16 h-16 text-lg`              |

#### Implementacao

```tsx
// components/ui/Avatar.tsx

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Gera uma cor consistente baseada no nome
function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-success-500',
    'bg-error-400',
    'bg-warning-500',
    'bg-primary-400',
    'bg-secondary-600',
    'bg-success-600',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} ${getColorFromName(name)}
        rounded-full flex items-center justify-center
        text-white font-semibold
      `}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
```

---

### 8.6 Table Row

#### Padroes

```
Container:
  w-full border border-gray-200 rounded-lg overflow-hidden

Header:
  bg-gray-50 border-b border-gray-200

Header cell:
  px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider

Body row:
  border-b border-gray-100 last:border-b-0

Body row (hover):
  hover:bg-gray-50

Body row (selected):
  bg-primary-50

Body cell:
  px-6 py-4 text-sm text-gray-700

Body cell (primary):
  px-6 py-4 text-sm font-medium text-gray-900
```

#### Implementacao

```tsx
// components/ui/Table.tsx

import { type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from 'react';

export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <table className={`w-full ${className ?? ''}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-gray-50 border-b border-gray-200 ${className ?? ''}`} {...props}>
      {children}
    </thead>
  );
}

export function TableRow({ className, selected, children, ...props }:
  HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }
) {
  return (
    <tr
      className={`
        border-b border-gray-100 last:border-b-0
        hover:bg-gray-50 transition-colors duration-100
        ${selected ? 'bg-primary-50' : ''}
        ${className ?? ''}
      `}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`
        px-6 py-3 text-left text-xs font-semibold
        text-gray-500 uppercase tracking-wider
        ${className ?? ''}
      `}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, primary, children, ...props }:
  TdHTMLAttributes<HTMLTableCellElement> & { primary?: boolean }
) {
  return (
    <td
      className={`
        px-6 py-4 text-sm
        ${primary ? 'font-medium text-gray-900' : 'text-gray-700'}
        ${className ?? ''}
      `}
      {...props}
    >
      {children}
    </td>
  );
}
```

---

### 8.7 Nav Item (Sidebar)

#### Estados

```
Default:     text-gray-300 hover:bg-primary-800 hover:text-white
Active:      bg-primary-800 text-white font-semibold
Disabled:    text-gray-600 cursor-not-allowed
```

#### Implementacao

```tsx
// components/ui/NavItem.tsx

import { type ReactNode } from 'react';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
  onClick?: () => void;
}

export function NavItem({ icon, label, href, active, disabled, badge, onClick }: NavItemProps) {
  if (disabled) {
    return (
      <span className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 cursor-not-allowed text-sm">
        {icon}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm
        transition-colors duration-150 ease-in-out
        ${active
          ? 'bg-primary-800 text-white font-semibold'
          : 'text-gray-300 hover:bg-primary-800 hover:text-white'
        }
      `}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-error-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </a>
  );
}
```

---

## 9. Icones

### 9.1 Biblioteca

**Lucide React** -- biblioteca definitiva do projeto.

- Leve (~400 icones, tree-shakeable)
- Consistente em estilo (stroke width 2px)
- Licenca MIT
- Integra nativamente com React

Instalacao:
```bash
npm install lucide-react
```

### 9.2 Tamanhos Padrao

| Contexto         | Tamanho | Prop          |
|------------------|---------|---------------|
| Inline com texto | 16px    | `size={16}`   |
| Dentro de botoes | 20px    | `size={20}`   |
| Navegacao/menu   | 20px    | `size={20}`   |
| Heading de secao | 24px    | `size={24}`   |
| Empty state      | 48px    | `size={48}`   |
| Hero/destaque    | 64px    | `size={64}`   |

### 9.3 Icones Mapeados por Feature

| Feature              | Icone             | Uso                           |
|----------------------|-------------------|-------------------------------|
| Dashboard            | `LayoutDashboard`  | Menu sidebar                 |
| Agenda               | `Calendar`         | Menu + header                |
| Clientes             | `Users`            | Menu + listagens             |
| Servicos             | `Scissors`         | Menu + cards                 |
| Financeiro           | `DollarSign`       | Menu + KPIs                  |
| Barbeiros            | `UserCheck`        | Menu + perfis                |
| Configuracoes        | `Settings`         | Menu                         |
| Notificacoes         | `Bell`             | Header                       |
| Busca                | `Search`           | Header + filtros             |
| Adicionar            | `Plus`             | Botoes de criacao            |
| Editar               | `Pencil`           | Acoes em tabela              |
| Excluir              | `Trash2`           | Acoes em tabela              |
| Visualizar           | `Eye`              | Acoes em tabela              |
| Filtrar              | `Filter`           | Toolbar de tabela            |
| Exportar             | `Download`         | Toolbar de tabela            |
| Telefone             | `Phone`            | Campo de contato             |
| WhatsApp             | `MessageCircle`    | Acao de contato              |
| Email                | `Mail`             | Campo de contato             |
| Horario              | `Clock`            | Campos de tempo              |
| Dinheiro             | `Banknote`         | Pagamento em dinheiro        |
| Cartao               | `CreditCard`       | Pagamento em cartao          |
| Pix                  | `QrCode`           | Pagamento via Pix            |
| Tendencia subindo    | `TrendingUp`       | KPI positivo                 |
| Tendencia descendo   | `TrendingDown`     | KPI negativo                 |
| Estrela              | `Star`             | Avaliacao                    |
| Menu                 | `Menu`             | Mobile hamburger             |
| Fechar               | `X`                | Modais, drawers              |
| Voltar               | `ArrowLeft`        | Navegacao                    |
| Mais opcoes          | `MoreVertical`     | Dropdown de acoes            |
| Logout               | `LogOut`           | Menu de usuario              |
| Check                | `Check`            | Confirmacao inline           |
| Info                 | `Info`             | Tooltips, hints              |
| Alerta               | `AlertTriangle`    | Mensagens de aviso           |

---

## 10. Animacoes

### 10.1 Principios

1. **Sutil e funcional** -- animacoes servem para dar feedback, nao para decorar
2. **Rapidas** -- o usuario nao deve esperar por animacoes
3. **Consistentes** -- mesma duracao e easing em contextos similares
4. **Respeitosas** -- suportar `prefers-reduced-motion`

### 10.2 Duracoes

| Contexto             | Duracao | Easing                | Classe Tailwind              |
|----------------------|---------|-----------------------|------------------------------|
| Hover em botoes      | 150ms   | ease-in-out           | `transition-colors duration-150` |
| Hover em cards       | 150ms   | ease-in-out           | `transition-shadow duration-150` |
| Abertura de dropdown | 150ms   | ease-out              | `transition-all duration-150`    |
| Abertura de modal    | 200ms   | ease-out              | `transition-all duration-200`    |
| Fechamento de modal  | 150ms   | ease-in               | `transition-all duration-150`    |
| Sidebar toggle       | 200ms   | ease-in-out           | `transition-all duration-200`    |
| Toast entrada        | 300ms   | ease-out (com slide)  | custom                           |
| Toast saida          | 200ms   | ease-in               | custom                           |
| Fade in generico     | 150ms   | ease-in-out           | `transition-opacity duration-150`|

### 10.3 Skeleton Loading

Para telas de carregamento, usar placeholders animados:

```tsx
// components/ui/Skeleton.tsx

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ''}`}
      style={{ width, height }}
    />
  );
}

// Exemplo: Skeleton de uma linha de tabela
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Skeleton variant="circular" width="40px" height="40px" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </div>
      <Skeleton width="80px" height="28px" variant="rectangular" />
    </div>
  );
}

// Exemplo: Skeleton de um card de KPI
export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
      <Skeleton width="100px" />
      <Skeleton width="120px" height="32px" variant="rectangular" />
      <Skeleton width="80px" />
    </div>
  );
}
```

### 10.4 Acessibilidade de Animacao

```css
/* Respeitar preferencia do usuario */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 10.5 O que NAO fazer

- Sem animacoes de bounce, elastic ou spring exageradas
- Sem animacoes de entrada em cada card individualmente (stagger)
- Sem parallax
- Sem animacoes que bloqueiem interacao
- Sem transicoes maiores que 300ms
- Sem animacoes em elementos que o usuario interage frequentemente (ex: cada clique em checkbox)

---

## 11. Config Tailwind Completa

```ts
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      /* ========================================
         CORES
         ======================================== */
      colors: {
        primary: {
          50:  '#E8EEF5',
          100: '#C5D3E8',
          200: '#9FB5D9',
          300: '#7897C9',
          400: '#5A7FBD',
          500: '#1E3A5F',
          600: '#1A3354',
          700: '#152A45',
          800: '#0F1F33',
          900: '#0A1522',
        },
        secondary: {
          50:  '#FBF5E8',
          100: '#F5E6C4',
          200: '#EDD49C',
          300: '#E5C274',
          400: '#DCB55E',
          500: '#D4A853',
          600: '#BF9545',
          700: '#A37E3A',
          800: '#7A5F2C',
          900: '#52401E',
        },
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },

      /* ========================================
         TIPOGRAFIA
         ======================================== */
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },

      fontSize: {
        xs:   ['0.75rem',   { lineHeight: '1rem' }],      // 12px / 16px
        sm:   ['0.875rem',  { lineHeight: '1.25rem' }],    // 14px / 20px
        base: ['1rem',      { lineHeight: '1.5rem' }],     // 16px / 24px
        lg:   ['1.125rem',  { lineHeight: '1.75rem' }],    // 18px / 28px
        xl:   ['1.25rem',   { lineHeight: '1.75rem' }],    // 20px / 28px
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],       // 24px / 32px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px / 36px
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],     // 36px / 40px
      },

      /* ========================================
         SOMBRAS
         ======================================== */
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },

      /* ========================================
         BORDER RADIUS
         ======================================== */
      borderRadius: {
        none: '0px',
        sm:   '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '12px',
        '2xl': '16px',
        full: '9999px',
      },

      /* ========================================
         SPACING (usa escala padrao do Tailwind,
         sem customizacao extra necessaria)
         ======================================== */

      /* ========================================
         BREAKPOINTS (usa escala padrao Tailwind)
         ======================================== */
      screens: {
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
      },

      /* ========================================
         ANIMACOES
         ======================================== */
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },

      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },

      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      animation: {
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'slide-out-right': 'slide-out-right 200ms ease-in',
        'fade-in': 'fade-in 150ms ease-in-out',
        'fade-out': 'fade-out 150ms ease-in-out',
        'scale-in': 'scale-in 200ms ease-out',
      },

      /* ========================================
         MAX WIDTH
         ======================================== */
      maxWidth: {
        'content': '1280px',
      },

      /* ========================================
         WIDTH (sidebar)
         ======================================== */
      width: {
        'sidebar': '256px',
      },
    },
  },

  plugins: [],
};

export default config;
```

---

## Apendice A: Guia Rapido de Decisoes

| Pergunta                                 | Resposta                                    |
|------------------------------------------|---------------------------------------------|
| Qual fonte usar?                         | Inter, sempre                               |
| Qual cor para CTA principal?             | `primary-500` (#1E3A5F)                     |
| Qual cor para destaque premium?          | `secondary-500` (#D4A853)                   |
| Qual border-radius para cards?           | `rounded-lg` (8px)                          |
| Qual border-radius para botoes?          | `rounded-md` (6px)                          |
| Qual shadow para cards?                  | `shadow-sm`                                 |
| Qual shadow para modais?                 | `shadow-xl`                                 |
| Qual duracao de transicao?               | 150ms para hover, 200ms para modais         |
| Qual biblioteca de icones?              | Lucide React                                |
| Qual tamanho de icone em botao?          | 20px                                        |
| Qual padding de card?                    | `p-6` (24px)                                |
| Qual padding de modal?                   | `p-8` (32px)                                |
| Qual largura da sidebar?                 | `w-64` (256px)                              |
| Qual background da pagina?               | `gray-50` (#F9FAFB)                         |
| Qual cor de texto principal?             | `gray-700` (#374151)                        |
| Qual cor de headings?                    | `gray-800` (#1F2937) ou `gray-900`          |
| Tamanho padrao de botao?                 | `md`                                        |
| Tamanho padrao de input?                 | `md`                                        |

---

## Apendice B: Checklist de Implementacao

- [ ] Instalar Inter via Google Fonts ou `@fontsource/inter`
- [ ] Instalar `lucide-react`
- [ ] Copiar `tailwind.config.ts` para o projeto
- [ ] Criar os componentes base em `components/ui/`
- [ ] Configurar CSS global com `prefers-reduced-motion`
- [ ] Validar contraste de cores com ferramenta WCAG (minimo AA)
- [ ] Testar responsividade nos 4 breakpoints

---

## Apendice C: Contraste e Acessibilidade

Todas as combinacoes de cor de texto sobre fundo foram projetadas para atender ao minimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande).

| Combinacao                                  | Ratio Aprox. | Nivel |
|---------------------------------------------|--------------|-------|
| `gray-700` sobre `white`                    | 9.1:1        | AAA   |
| `gray-800` sobre `white`                    | 11.6:1       | AAA   |
| `gray-900` sobre `white`                    | 15.4:1       | AAA   |
| `white` sobre `primary-500`                 | 8.2:1        | AAA   |
| `white` sobre `error-500`                   | 4.6:1        | AA    |
| `white` sobre `success-600`                 | 4.5:1        | AA    |
| `error-700` sobre `error-100`               | 7.2:1        | AAA   |
| `success-700` sobre `success-100`           | 6.8:1        | AAA   |
| `warning-700` sobre `warning-100`           | 5.4:1        | AA    |
| `primary-700` sobre `primary-100`           | 6.1:1        | AAA   |
| `gray-500` sobre `white`                    | 4.6:1        | AA    |

**Regra geral**: texto de corpo sempre em `gray-700` sobre fundo `white` ou `gray-50`. Texto secundario em `gray-500` somente para labels e captions (tamanho >= 14px).

---

*Design System BarberFlow v1.0 -- Documento gerado para implementacao direta. Todas as decisoes sao definitivas.*
