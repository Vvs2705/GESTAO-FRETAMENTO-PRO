# 05 — UX, UI, Design System e Dashboards

## Objetivo

Definir o padrão visual e de experiência da plataforma para evitar aparência genérica, confusa ou amadora.

## Direção estética

O produto deve transmitir:

- controle;
- clareza;
- tecnologia;
- confiança;
- gestão empresarial;
- agilidade operacional;
- precisão;
- elegância.

## Referências visuais desejadas

Não copiar, mas buscar nível de qualidade inspirado em:

- sistemas de gestão premium;
- fintechs B2B;
- plataformas de logística;
- painéis de BI executivos;
- command centers operacionais;
- produtos SaaS enterprise.

## Princípios visuais

### 1. Hierarquia acima de quantidade

Não encher tela de cards. Cada tela deve mostrar:

- 3 a 5 indicadores principais;
- alertas realmente importantes;
- tabela ou mapa central;
- filtros objetivos;
- ações rápidas.

### 2. Dashboard por intenção

Cada dashboard deve ser desenhado para uma decisão.

Exemplo:

- dashboard do operador: agir agora;
- dashboard do gerente: corrigir gargalos;
- dashboard do dono: decidir prioridade e risco;
- dashboard financeiro: entender margem;
- dashboard de abastecimento: encontrar desperdício.

### 3. Dados com contexto

Um número isolado é fraco.

Ruim:

- “12 ocorrências”

Melhor:

- “12 ocorrências abertas, 4 críticas, 3 do mesmo cliente, 2 repetidas no mesmo veículo.”

### 4. Interface com profundidade progressiva

Primeiro nível:

- resumo;
- alertas;
- status.

Segundo nível:

- ranking;
- tabela;
- filtros.

Terceiro nível:

- detalhe do registro;
- histórico;
- anexos;
- decisões;
- auditoria.

## Design system

### Componentes essenciais

- botão primário;
- botão secundário;
- botão destrutivo;
- card KPI;
- card de alerta;
- tabela avançada;
- filtro de período;
- filtro por cliente;
- filtro por veículo;
- filtro por motorista;
- seletor de filial;
- badge de status;
- timeline;
- drawer lateral;
- modal de confirmação;
- formulário com etapas;
- mapa;
- gráfico de linha;
- gráfico de barras;
- gráfico de ranking;
- gráfico de rosca apenas quando necessário;
- alerta toast;
- central de notificações;
- avatar de usuário;
- breadcrumb;
- command palette.

### Status padronizados

#### Viagem

- planejada;
- confirmada;
- em preparação;
- em andamento;
- atrasada;
- concluída;
- cancelada;
- com ocorrência.

#### Veículo

- disponível;
- em operação;
- em manutenção;
- indisponível;
- documento pendente;
- crítico.

#### Ocorrência

- aberta;
- em análise;
- aguardando responsável;
- resolvida;
- reaberta;
- crítica.

#### Documento

- válido;
- vencendo;
- vencido;
- pendente;
- reprovado.

## Layout base da aplicação

### Desktop

- menu lateral por módulo;
- topo com tenant/filial, busca, notificações e perfil;
- área central com conteúdo;
- painel lateral para contexto quando necessário.

### Mobile web

- navegação inferior para funções operacionais;
- telas simplificadas;
- ações rápidas;
- foco em motorista, abastecimento e ocorrência.

## Dashboards prioritários

### 1. Cockpit Executivo

Público: CEO, dono, diretoria.

Blocos:

- operação agora;
- risco;
- financeiro resumido;
- frota;
- clientes;
- pessoas;
- alertas críticos.

Indicadores:

- viagens hoje;
- viagens atrasadas;
- ocorrências críticas;
- veículos parados;
- custo combustível mês;
- custo manutenção mês;
- receita estimada;
- clientes em risco.

### 2. Torre Operacional

Público: operador, supervisor.

Blocos:

- viagens do dia;
- mapa/lista operacional;
- atrasos;
- substituições;
- ocorrências;
- disponibilidade.

Indicadores:

- viagens em andamento;
- próximas viagens;
- motoristas disponíveis;
- veículos disponíveis;
- ocorrências abertas;
- SLA do dia.

### 3. Frota

Público: frota, manutenção, gestão.

Blocos:

- disponibilidade;
- manutenção;
- documentos;
- consumo;
- ranking de custo.

Indicadores:

- veículos disponíveis;
- veículos parados;
- manutenção vencendo;
- documentos vencendo;
- custo por veículo;
- consumo médio.

### 4. Abastecimento

Público: abastecimento, frota, financeiro, dono.

Blocos:

- custo total;
- consumo por veículo;
- divergências;
- postos;
- motoristas;
- comprovantes.

Indicadores:

- litros abastecidos;
- valor total;
- preço médio;
- km/l;
- custo/km;
- abastecimentos sem cupom;
- consumo fora da média.

### 5. Manutenção

Público: manutenção, frota, gerência.

Blocos:

- OS abertas;
- preventivas;
- corretivas;
- veículos críticos;
- custo por fornecedor;
- reincidências.

### 6. Financeiro

Público: financeiro, gerência, dono.

Blocos:

- receita;
- despesas;
- margem;
- clientes;
- centro de custo;
- fluxo previsto.

## Experiência de cadastro

Cadastros não devem ser telas frias. Devem ser orientados à operação.

### Cadastro de veículo

Etapas:

1. Dados principais
2. Documentos
3. Capacidade e características
4. Vínculos
5. Status inicial

### Cadastro de colaborador

Etapas:

1. Dados pessoais essenciais
2. Cargo e setor
3. Permissões geradas automaticamente
4. Documentos
5. Jornada ou disponibilidade
6. Revisão final

### Cadastro de viagem

Etapas:

1. Cliente
2. Rota
3. Data/hora
4. Veículo
5. Motorista
6. Passageiros, se aplicável
7. Observações
8. Confirmação

## Microinterações importantes

- alertas de erro claros;
- loading skeleton;
- confirmação para ação crítica;
- feedback visual após salvar;
- histórico lateral;
- atalhos de teclado para operação;
- busca global;
- filtros persistentes por usuário.

## Acessibilidade

O produto deve ter:

- contraste adequado;
- navegação por teclado;
- labels em campos;
- foco visível;
- textos legíveis;
- tabelas acessíveis;
- responsividade real.

## Core Web Vitals — Metas de Performance

O sistema opera em dispositivos variados e conexões móveis. Performance é funcionalidade.

Metas obrigatórias (mensuradas em campo via RUM, não apenas em lab):

| Métrica | Target | Descrição |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Tempo até o maior elemento visível carregar |
| INP (Interaction to Next Paint) | < 200ms | Tempo de resposta a qualquer interação |
| CLS (Cumulative Layout Shift) | < 0.1 | Estabilidade visual — sem elementos que “pulam” |
| FID / TBT | < 200ms | Responsividade à interação do usuário |

Como atingir:
- Componentes de servidor (React Server Components) para dados sem interatividade.
- Code splitting por rota — nunca carregar todo o bundle na primeira tela.
- Imagens com `next/image` e lazy loading nativo.
- Skeleton loading em todos os dados assíncronos.
- Evitar layout shifts: reservar espaço para imagens e tabelas antes do load.
- Fontes com `display: swap` e preload das fontes críticas.

Monitorar em produção com RUM (Real User Monitoring): Sentry Performance, Grafana Faro ou Datadog RUM.

## Design Tokens — Fonte Única de Verdade

Design tokens garantem consistência entre design, web e futuro mobile.

Estrutura de tokens:

```css
/* tokens/colors.css */
:root {
  /* Primitivas */
  --color-blue-500: #3B82F6;
  --color-red-500: #EF4444;
  --color-green-500: #22C55E;
  --color-amber-500: #F59E0B;
  --color-gray-900: #111827;

  /* Semânticas */
  --color-primary: var(--color-blue-500);
  --color-danger: var(--color-red-500);
  --color-success: var(--color-green-500);
  --color-warning: var(--color-amber-500);
  --color-text-primary: var(--color-gray-900);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}
```

Tokens de status operacional:

```css
:root {
  --status-trip-in-progress: #3B82F6;
  --status-trip-delayed: #F59E0B;
  --status-trip-completed: #22C55E;
  --status-trip-canceled: #6B7280;
  --status-occurrence-critical: #EF4444;
  --status-vehicle-maintenance: #F97316;
}
```

## Rendering Strategy por Tipo de Tela

Next.js App Router permite misturar estratégias por rota. Usar criteriosamente.

| Tela | Estratégia | Justificativa |
|---|---|---|
| Dashboard executivo | SSR + streaming | Dados em tempo real, sem cache global |
| Lista de viagens | SSR + ISR (60s) | Alta frequência de acesso, dados quase-real-time |
| Detalhes de veículo | SSR | Dados por entidade, sem cache |
| Configurações e cadastros | CSR | Interatividade alta, dados do usuário |
| Relatórios exportáveis | Server Action | Processamento no servidor, sem estado no cliente |
| Telas de login/onboarding | SSG | Estático, sem dados de usuário |

Regra: Server Components por padrão; Client Components apenas quando há estado, eventos de browser, ou hooks de React.

## Storybook — Documentação Viva de Componentes

Todos os componentes do design system devem ter histórias no Storybook.

Estrutura mínima por componente:

```tsx
// KpiCard.stories.tsx
export default {
  title: 'Dashboard/KpiCard',
  component: KpiCard,
};

export const Default = { args: { label: 'Viagens hoje', value: 42, trend: '+12%', status: 'normal' } };
export const Critical = { args: { label: 'Ocorrências críticas', value: 5, status: 'critical' } };
export const Loading = { args: { label: 'Veículos disponíveis', loading: true } };
export const Empty = { args: { label: 'Abastecimentos suspeitos', value: 0, status: 'empty' } };
```

Benefícios:
- Desenvolver e revisar componentes sem subir o sistema completo.
- Documentação viva que não fica desatualizada.
- Base para testes visuais com Chromatic.
- Referência de uso para toda a equipe.

## WCAG 2.2 AA — Checklist de Acessibilidade

O sistema será usado por operadores em situações de pressão. Acessibilidade não é opcional.

Checklist mínimo:

- [ ] Todos os campos de formulário têm `<label>` associado.
- [ ] Mensagens de erro têm `aria-live=”assertive”` e `aria-describedby`.
- [ ] Tabelas têm `<th scope=”col”>` e `<caption>`.
- [ ] Modais têm `role=”dialog”`, `aria-modal=”true”` e gerenciam foco.
- [ ] Toasts têm `role=”status”` ou `role=”alert”`.
- [ ] Ícones sem texto têm `aria-label` ou `title`.
- [ ] Navegação por teclado funciona em toda a aplicação (Tab, Shift+Tab, Enter, Escape, Arrows).
- [ ] Foco visível em todos os elementos interativos (não remover `outline` sem substituto).
- [ ] Contraste de texto ≥ 4.5:1 para texto normal e 3:1 para texto grande.
- [ ] Nenhuma informação transmitida apenas por cor.
- [ ] Zoom até 200% sem perda de funcionalidade.

Validar automaticamente com axe-core nos testes E2E.

## Error Boundaries e Estados de Erro

Todo módulo deve ter estado de erro desenhado, não apenas o estado de sucesso.

Estados obrigatórios em toda tela:
- **Loading**: skeleton com formato aproximado do conteúdo real.
- **Empty**: mensagem contextual com ação sugerida (“Nenhuma viagem hoje. Criar viagem?”).
- **Error**: mensagem amigável + botão de retry + ID de correlação para suporte.
- **Offline/Partial**: aviso de dados desatualizados com timestamp da última atualização.

Implementação com Error Boundary no React:

```tsx
<ErrorBoundary fallback={<DashboardError onRetry={refetch} />}>
  <Suspense fallback={<DashboardSkeleton />}>
    <ExecutiveDashboard tenantId={tenantId} />
  </Suspense>
</ErrorBoundary>
```

## Command Palette e Atalhos de Teclado

Operadores de central trabalham em alta velocidade. Atalhos reduzem fricção.

Atalhos mínimos obrigatórios:
- `Ctrl+K` / `Cmd+K`: abrir command palette (busca global).
- `Ctrl+N` / `Cmd+N`: criar novo registro no contexto atual.
- `Escape`: fechar modal ou drawer.
- `Ctrl+S` / `Cmd+S`: salvar formulário ativo.
- `?`: exibir lista de atalhos disponíveis.

Command palette deve permitir: buscar viagem por número, motorista por nome, veículo por placa, cliente por nome.

## Conclusão

A interface deve ser vendável em apresentação e útil em operação. O dono precisa olhar e pensar: “agora eu consigo enxergar minha empresa”. Design tokens, Core Web Vitals mensurados em campo, Storybook, WCAG 2.2 AA automatizado e error boundaries são o que separa um painel profissional de um painel que parece profissional.
