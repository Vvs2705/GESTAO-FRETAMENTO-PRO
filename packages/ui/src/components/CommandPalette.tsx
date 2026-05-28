import * as React from "react";
import { cn } from "../utils/cn";
import { Search, MapPin, Truck, Users, Settings, Plus, Terminal } from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "viagens" | "veiculos" | "motoristas" | "acoes" | "atalhos";
  action: () => void;
  icon?: React.ReactNode;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
}

export function CommandPalette({ isOpen, onClose, items }: CommandPaletteProps) {
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lower)) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [search, items]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length)
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: CommandItem["category"], customIcon?: React.ReactNode) => {
    if (customIcon) return customIcon;
    switch (category) {
      case "viagens":
        return <MapPin className="w-4 h-4 text-indigo-500" />;
      case "veiculos":
        return <Truck className="w-4 h-4 text-emerald-500" />;
      case "motoristas":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "acoes":
        return <Plus className="w-4 h-4 text-amber-500" />;
      default:
        return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  const grouped = filteredItems.reduce(
    (acc, item, index) => {
      const cat = item.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat]!.push({ ...item, originalIndex: index });
      return acc;
    },
    {} as Record<CommandItem["category"], Array<CommandItem & { originalIndex: number }>>
  );

  const categories = Object.keys(grouped) as CommandItem["category"][];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 pt-[10vh]">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Palette Body */}
      <div
        className="relative bg-card text-card-foreground border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl flex flex-col overflow-hidden max-h-[60vh] animate-in slide-in-from-top-4 duration-200"
        role="combobox"
        aria-expanded="true"
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite um comando ou faça uma busca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-4 text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 outline-none text-slate-800 dark:text-slate-200"
          />
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono border border-slate-200/50 dark:border-slate-700/50">
            ESC
          </div>
        </div>

        {/* Results list */}
        <div className="flex-grow overflow-y-auto p-2 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
              <Terminal className="w-8 h-8 opacity-40 mb-2" />
              <span className="text-xs font-semibold">Nenhum resultado para "{search}"</span>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 select-none">
                    {cat === "viagens" && "Viagens"}
                    {cat === "veiculos" && "Veículos"}
                    {cat === "motoristas" && "Motoristas"}
                    {cat === "acoes" && "Ações rápidas"}
                    {cat === "atalhos" && "Configurações & Atalhos"}
                  </span>

                  <div className="space-y-0.5">
                    {grouped[cat]?.map((item) => {
                      const isSelected = item.originalIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            item.action();
                            onClose();
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 select-none",
                            isSelected
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 scale-[0.99] font-semibold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {getCategoryIcon(item.category, item.icon)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="text-xs truncate font-medium">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-relaxed">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                              ENTER
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
