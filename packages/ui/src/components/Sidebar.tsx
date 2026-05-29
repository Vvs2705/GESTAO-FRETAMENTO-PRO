import * as React from "react";
import { cn } from "../utils/cn";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  MapPin,
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
  onNavigate?: (path: string) => void;
}

export function Sidebar({ currentPath, role, onNavigate, className, ...props }: SidebarProps) {
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

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen transition-all duration-300 relative select-none",
        collapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 h-16">
        {!collapsed ? (
          <Logo size="sm" variant="horizontal" />
        ) : (
          <Logo size="sm" variant="symbol" className="mx-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-grow overflow-y-auto py-4 space-y-4 px-3 scrollbar-thin">
        {menuItems.map((cat) => (
          <div key={cat.category} className="space-y-1">
            {!collapsed && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-3 select-none">
                {cat.category}
              </span>
            )}
            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const isActive = currentPath.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate && onNavigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 select-none",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 scale-[0.99] font-bold"
                        : "text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 font-medium"
                    )}
                  >
                    <div className={cn("flex-shrink-0", isActive ? "text-primary scale-110" : "")}>
                      {item.icon}
                    </div>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
