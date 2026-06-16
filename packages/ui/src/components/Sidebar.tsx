import * as React from "react";
import { cn } from "../utils/cn";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  MapPin,
  Route,
  Truck,
  Users,
  Settings,
  AlertTriangle,
  FolderOpen,
  DollarSign,
  UserPlus,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {

  currentPath: string;
  role: string;
  /**
   * Componente de link usado para renderizar cada item do menu. Recebe `href`
   * e renderiza uma âncora `<a>`. Por padrão usa `"a"` (semântica + Ctrl+clique
   * + abrir em nova aba). No Next.js, injete o `Link` para manter o roteamento
   * client-side (SPA). Corrige C4 (navegação só com `<button>`).
   */
  LinkComponent?: React.ElementType;
  onNavigate?: (path: string) => void;
  /** Controle do drawer em telas pequenas (< lg). */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  currentPath,
  role,
  LinkComponent = "a",
  onNavigate,
  mobileOpen = false,
  onMobileClose,
  className,
  ...props
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = React.useMemo(() => {
    const items = [
      {
        category: "DASHBOARDS",
        items: [
          {
            label: "Executivo",
            path: "/executive",
            icon: <LayoutDashboard className="w-4 h-4" />,
            roles: ["admin", "ceo"],
          },
          {
            label: "Torre Operacional",
            path: "/operations",
            icon: <MapPin className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Frota",
            path: "/fleet",
            icon: <Truck className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Abastecimento",
            path: "/fuel",
            icon: <DollarSign className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Manutenção",
            path: "/maintenance",
            icon: <Settings className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
        ],
      },
      {
        category: "OPERACIONAL",
        items: [
          {
            label: "Viagens",
            path: "/trips",
            icon: <MapPin className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Rotas",
            path: "/routes",
            icon: <Route className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Veículos",
            path: "/vehicles",
            icon: <Truck className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Motoristas",
            path: "/drivers",
            icon: <Users className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Clientes",
            path: "/clients",
            icon: <FileText className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
          {
            label: "Ocorrências",
            path: "/occurrences",
            icon: <AlertTriangle className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor", "driver"],
          },
          {
            label: "Documentos",
            path: "/documents",
            icon: <FolderOpen className="w-4 h-4" />,
            roles: ["admin", "ceo", "operator", "supervisor"],
          },
        ],
      },
      {
        category: "SUPORTE",
        items: [
          {
            label: "Financeiro",
            path: "/finance",
            icon: <DollarSign className="w-4 h-4" />,
            roles: ["admin", "ceo", "finance"],
          },
          {
            label: "Usuários",
            path: "/users",
            icon: <UserPlus className="w-4 h-4" />,
            roles: ["admin", "ceo"],
          },
          {
            label: "Configurações",
            path: "/settings",
            icon: <Settings className="w-4 h-4" />,
            roles: ["admin", "ceo"],
          },
        ],
      },
    ];

    return items
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.roles.includes(role)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [role]);

  // No mobile o menu nunca aparece "colapsado" (largura cheia do drawer).
  const isCollapsed = collapsed;

  return (
    <>
      {/* Backdrop do drawer no mobile */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "bg-card text-card-foreground border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen select-none",
          // Mobile: drawer off-canvas; Desktop: estático
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          className
        )}
        {...props}
      >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 h-16">
        {!isCollapsed ? (
          <Logo size="sm" variant="horizontal" />
        ) : (
          <Logo size="sm" variant="symbol" className="mx-auto" />
        )}
        {/* Recolher (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Fechar drawer (mobile) */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Fechar menu"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-grow overflow-y-auto py-4 space-y-4 px-3 scrollbar-thin">
        {menuItems.map((cat) => (
          <div key={cat.category} className="space-y-1">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-3 select-none">
                {cat.category}
              </span>
            )}
            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const isActive = currentPath.startsWith(item.path);
                return (
                  <LinkComponent
                    key={item.path}
                    href={item.path}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      onNavigate && onNavigate(item.path);
                      onMobileClose && onMobileClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 select-none min-h-[44px]",
                      isCollapsed && "justify-center",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 scale-[0.99] font-bold"
                        : "text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 font-medium"
                    )}
                  >
                    <div className={cn("flex-shrink-0", isActive ? "text-primary scale-110" : "")}>
                      {item.icon}
                    </div>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </LinkComponent>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      </aside>
    </>
  );
}
