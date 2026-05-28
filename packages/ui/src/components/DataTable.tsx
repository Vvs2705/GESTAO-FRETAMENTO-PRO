import * as React from "react";
import { cn } from "../utils/cn";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  pagination?: {
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    onNextPage?: () => void;
    onPreviousPage?: () => void;
    onFirstPage?: () => void;
    onLastPage?: () => void;
    pageIndex?: number;
    totalPages?: number;
  };
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  onRowClick,
  pagination,
  emptyTitle = "Nenhum resultado encontrado",
  emptyDescription = "Tente alterar os filtros ou pesquisar por outro termo.",
  emptyActionLabel,
  onEmptyAction,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-card overflow-hidden shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 select-none uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-slate-100 dark:border-slate-900/40"
                  >
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <LoadingSkeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                      className="border-none bg-transparent py-4 shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      "border-b border-slate-100 dark:border-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-200",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-3.5 align-middle text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2 py-0.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {pagination.pageIndex !== undefined && pagination.totalPages !== undefined && (
              <span>
                Página {pagination.pageIndex + 1} de {pagination.totalPages}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {pagination.onFirstPage && (
              <button
                onClick={pagination.onFirstPage}
                disabled={!pagination.hasPreviousPage || loading}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                aria-label="Primeira página"
              >
                <ChevronsLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <button
              onClick={pagination.onPreviousPage}
              disabled={!pagination.hasPreviousPage || loading}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={pagination.onNextPage}
              disabled={!pagination.hasNextPage || loading}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            {pagination.onLastPage && (
              <button
                onClick={pagination.onLastPage}
                disabled={!pagination.hasNextPage || loading}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                aria-label="Última página"
              >
                <ChevronsRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
