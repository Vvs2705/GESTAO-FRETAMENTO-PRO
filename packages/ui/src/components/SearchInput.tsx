import * as React from "react";
import { cn } from "../utils/cn";
import { Search, X } from "lucide-react";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, debounceMs = 300, ...props }, ref) => {
    const [value, setValue] = React.useState("");
    const timerRef = React.useRef<any>(null);

    const handleClear = () => {
      setValue("");
      if (onSearch) onSearch("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValue(val);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(val);
        }
      }, debounceMs);
    };

    React.useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    return (
      <div className="relative flex items-center w-full">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all duration-200",
            className
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
