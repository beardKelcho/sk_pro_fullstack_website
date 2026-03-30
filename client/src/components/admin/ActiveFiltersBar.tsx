'use client';

interface ActiveFilterItem {
  key: string;
  label: string;
  onRemove?: () => void;
}

interface ActiveFiltersBarProps {
  filters: ActiveFilterItem[];
  totalCount: number;
  visibleCount: number;
  itemLabel: string;
  onClearAll: () => void;
}

export default function ActiveFiltersBar({
  filters,
  totalCount,
  visibleCount,
  itemLabel,
  onClearAll,
}: ActiveFiltersBarProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {visibleCount} {itemLabel} gösteriliyor, toplam {totalCount} kayıt içinde aktif filtreler uygulanmış durumda.
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.onRemove}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-900/40"
              >
                <span>{filter.label}</span>
                {filter.onRemove && <span aria-hidden="true">x</span>}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-primary-light dark:hover:bg-primary"
        >
          Tüm filtreleri temizle
        </button>
      </div>
    </div>
  );
}
