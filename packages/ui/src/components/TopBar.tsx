import * as React from "react";
import { cn } from "../utils/cn";
import { Bell, LogOut, User, Globe } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
}

export interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  userName: string;
  userRole: string;
  filiais?: { id: string; name: string }[];
  selectedFilial?: string;
  onFilialChange?: (id: string) => void;
  notifications?: NotificationItem[];
  onNotificationClick?: (id: string) => void;
  onLogout?: () => void;
}

export function TopBar({
  userName,
  userRole,
  filiais = [],
  selectedFilial = "",
  onFilialChange,
  notifications = [],
  onNotificationClick,
  onLogout,
  className,
  ...props
}: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        "bg-card text-card-foreground border-b border-slate-200 dark:border-slate-800 h-16 px-6 flex items-center justify-between w-full relative select-none z-30",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {onFilialChange && filiais.length > 0 && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFilial}
              onChange={(e) => onFilialChange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-1 focus:ring-primary"
            >
              {filiais.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notificações"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-bold">
                  Notificações
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-primary font-semibold">
                    {unreadCount} não lidas
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    Nenhuma notificação encontrada
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (onNotificationClick) onNotificationClick(n.id);
                        setShowNotifications(false);
                      }}
                      className={cn(
                        "px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors",
                        !n.read && "bg-blue-500/5 font-semibold"
                      )}
                    >
                      <div className="text-xs text-slate-800 dark:text-slate-200">{n.title}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {n.message}
                      </div>
                      <div className="text-[9px] text-slate-400/80 font-mono mt-1">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{userName}</div>
              <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                {userRole}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900 md:hidden">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {userName}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                  {userRole}
                </div>
              </div>
              <button
                onClick={() => alert("Perfil")}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-left font-medium transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" /> Meu Perfil
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left font-semibold border-t border-slate-100 dark:border-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sair / Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
