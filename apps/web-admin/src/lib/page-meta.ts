export interface PageMeta {
  /** Nome da seção (renderizado como `<h1>` da página). */
  title: string;
  /** Subtítulo curto exibido sob o título. */
  description?: string;
  /** Trilha de navegação até a página (breadcrumb). */
  breadcrumb: { label: string; path?: string }[];
}

/**
 * Fonte única de verdade para título (`<h1>`), descrição e breadcrumb de cada
 * rota do painel. Consumida pelo layout do dashboard para renderizar um
 * cabeçalho acessível e uma trilha de navegação correta por rota (corrige C1
 * — h1 ausente — e o breadcrumb estático "Dashboard / Visão Geral").
 */
const ROUTES: Array<{ match: string; meta: PageMeta }> = [
  {
    match: "/executive",
    meta: {
      title: "Cockpit Executivo",
      description: "Receita, custo, margem e risco consolidados das filiais.",
      breadcrumb: [{ label: "Dashboards" }, { label: "Cockpit Executivo" }],
    },
  },
  {
    match: "/operations",
    meta: {
      title: "Torre Operacional",
      description: "Viagens ativas, ocorrências e status da frota em tempo real.",
      breadcrumb: [{ label: "Dashboards" }, { label: "Torre Operacional" }],
    },
  },
  {
    match: "/fleet",
    meta: {
      title: "Frota",
      description: "Disponibilidade, manutenção e indicadores dos veículos.",
      breadcrumb: [{ label: "Dashboards" }, { label: "Frota" }],
    },
  },
  {
    match: "/fuel",
    meta: {
      title: "Abastecimento",
      description: "Consumo, custo por km e anomalias de combustível.",
      breadcrumb: [{ label: "Dashboards" }, { label: "Abastecimento" }],
    },
  },
  {
    match: "/maintenance",
    meta: {
      title: "Manutenção",
      description: "Ordens de serviço, revisões e disponibilidade da oficina.",
      breadcrumb: [{ label: "Dashboards" }, { label: "Manutenção" }],
    },
  },
  {
    match: "/trips/new",
    meta: {
      title: "Nova Viagem",
      description: "Assistente de criação de viagem em 8 etapas.",
      breadcrumb: [{ label: "Viagens", path: "/trips" }, { label: "Nova Viagem" }],
    },
  },
  {
    match: "/trips",
    meta: {
      title: "Viagens",
      description: "Programação, status e histórico das viagens.",
      breadcrumb: [{ label: "Operacional" }, { label: "Viagens" }],
    },
  },
  {
    match: "/vehicles",
    meta: {
      title: "Veículos",
      description: "Cadastro e situação operacional dos veículos.",
      breadcrumb: [{ label: "Operacional" }, { label: "Veículos" }],
    },
  },
  {
    match: "/routes",
    meta: {
      title: "Rotas",
      description: "Itinerários e trajetos usados nas viagens.",
      breadcrumb: [{ label: "Operacional" }, { label: "Rotas" }],
    },
  },
  {
    match: "/drivers",
    meta: {
      title: "Motoristas",
      description: "Cadastro, CNH e disponibilidade dos motoristas.",
      breadcrumb: [{ label: "Operacional" }, { label: "Motoristas" }],
    },
  },
  {
    match: "/clients",
    meta: {
      title: "Clientes",
      description: "Contratos, faturamento e relacionamento com clientes.",
      breadcrumb: [{ label: "Operacional" }, { label: "Clientes" }],
    },
  },
  {
    match: "/occurrences",
    meta: {
      title: "Ocorrências",
      description: "Atrasos, acidentes e reclamações da operação.",
      breadcrumb: [{ label: "Operacional" }, { label: "Ocorrências" }],
    },
  },
  {
    match: "/documents",
    meta: {
      title: "Documentos",
      description: "Licenças, seguros e vencimentos da frota.",
      breadcrumb: [{ label: "Operacional" }, { label: "Documentos" }],
    },
  },
  {
    match: "/finance",
    meta: {
      title: "Financeiro",
      description: "Centros de custo, receitas e despesas.",
      breadcrumb: [{ label: "Suporte" }, { label: "Financeiro" }],
    },
  },
  {
    match: "/users",
    meta: {
      title: "Usuários",
      description: "Contas, cargos e permissões de acesso.",
      breadcrumb: [{ label: "Suporte" }, { label: "Usuários" }],
    },
  },
  {
    match: "/settings",
    meta: {
      title: "Configurações",
      description: "Parametrizações gerais do sistema.",
      breadcrumb: [{ label: "Suporte" }, { label: "Configurações" }],
    },
  },
  {
    match: "/notifications",
    meta: {
      title: "Notificações",
      description: "Alertas e atualizações recentes da operação.",
      breadcrumb: [{ label: "Suporte" }, { label: "Notificações" }],
    },
  },
];

const FALLBACK: PageMeta = {
  title: "Gestão Fretamento Pro",
  breadcrumb: [{ label: "Início" }],
};

/**
 * Resolve a metadata da página pelo prefixo de rota mais específico
 * (ex.: `/trips/new` tem prioridade sobre `/trips`).
 */
export function resolvePageMeta(pathname: string): PageMeta {
  const normalized = pathname || "/";
  const match = ROUTES
    .filter((r) => normalized === r.match || normalized.startsWith(`${r.match}/`) || normalized.startsWith(r.match))
    .sort((a, b) => b.match.length - a.match.length)[0];
  return match?.meta ?? FALLBACK;
}
