import * as React from "react";
import { cn } from "../utils/cn";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Nome da seção — renderizado como o único `<h1>` da página (acessibilidade). */
  title: string;
  /** Subtítulo curto explicando o contexto da tela. */
  description?: string | undefined;
  /** Ícone opcional antes do título. */
  icon?: React.ReactNode;
  /** Ações alinhadas à direita (botões, filtros). */
  actions?: React.ReactNode;
}

/**
 * Cabeçalho de página padronizado. Garante exatamente um `<h1>` por tela com o
 * nome da seção — corrige o gap de hierarquia/acessibilidade apontado na
 * auditoria (C1): leitores de tela passam a anunciar o título da página.
 */
export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    >
      <div className="space-y-1 min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
          <span className="truncate">{title}</span>
        </h1>
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
