import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BaseButton } from './BaseButton';
import { BaseInput } from './BaseInput';
import { BaseSelect } from './BaseSelect';

export interface TableColumn<T extends object> {
  key: keyof T | string;
  title: string;
  render?: (value: unknown, row: T) => ReactNode;
}

interface BaseTableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: keyof T | string;
  loading?: boolean;
  emptyText?: string;
}

export function BaseTable<T extends object>({
  columns,
  data,
  rowKey = 'id',
  loading = false,
  emptyText = 'No records found',
}: BaseTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterHint, setShowFilterHint] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const statusOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        (data || [])
          .map((row) => (row as Record<string, unknown>).status)
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
      ),
    );

    return [{ label: 'All', value: '' }, ...values.map((value) => ({ value, label: value.replaceAll('_', ' ') }))];
  }, [data]);

  const hasStatusColumn = columns.some((column) => String(column.key) === 'status');
  const showStatusFilter = hasStatusColumn && statusOptions.length > 1;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const filtered = useMemo(() => {
    let rows = [...(data || [])];

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(term));
    }

    if (statusFilter) {
      rows = rows.filter((row) => String((row as Record<string, unknown>).status ?? '') === statusFilter);
    }

    if (sortKey) {
      rows.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey] ?? '';
        const bVal = (b as Record<string, unknown>)[sortKey] ?? '';
        const result = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDirection === 'asc' ? result : -result;
      });
    }

    return rows;
  }, [data, searchQuery, statusFilter, sortDirection, sortKey]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const onSort = (key: string) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className='rounded-xl border border-slate-200 bg-white shadow-sm'>
      <div className='border-b border-slate-200 p-3'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
            <div className='w-full sm:w-[280px]'>
              <BaseInput
                placeholder='Search'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className='h-10'
              />
            </div>
            {showStatusFilter && (
              <div className='w-full sm:w-[180px]'>
                <BaseSelect
                  label='Status'
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className='h-10'
                  options={statusOptions}
                />
              </div>
            )}
          </div>
          <button
            type='button'
            onClick={() => setShowFilterHint((prev) => !prev)}
            className='inline-flex items-center justify-center gap-2 self-start px-1 py-1 text-sm font-semibold uppercase tracking-wide text-blue-700 hover:text-blue-800 sm:self-end'
          >
            <svg viewBox='0 0 20 20' className='h-5 w-5' fill='currentColor' aria-hidden='true'>
              <path d='M3 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm3 5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm3 5a1 1 0 0 1 1-1h0a1 1 0 1 1 0 2h0a1 1 0 0 1-1-1Z' />
            </svg>
            Filter
          </button>
        </div>
        {showFilterHint && (
          <div className='mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700'>
            Use search and status to filter table rows.
          </div>
        )}
      </div>
      <div className='overflow-auto'>
        <table className='min-w-full text-left text-sm'>
          <thead className='bg-slate-50 text-slate-600'>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className='px-4 py-3 font-semibold'>
                  <button type='button' className='inline-flex items-center gap-1' onClick={() => onSort(String(column.key))}>
                    {column.title}
                    {sortKey === column.key ? (sortDirection === 'asc' ? '?' : '?') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className='px-4 py-8 text-center text-slate-500'>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={columns.length} className='px-4 py-8 text-center text-slate-500'>
                  {emptyText}
                </td>
              </tr>
            )}
            {!loading &&
              paged.map((row, rowIndex) => {
                const resolvedRowKey = (row as Record<string, unknown>)[String(rowKey)];
                const rowId = resolvedRowKey ? String(resolvedRowKey) : `${page}-${rowIndex}`;
                return (
                  <tr key={rowId} className='border-t border-slate-100'>
                    {columns.map((column) => {
                      const value = (row as Record<string, unknown>)[String(column.key)];
                      return (
                        <td key={`${rowId}-${String(column.key)}`} className='px-4 py-3 text-slate-700'>
                          {column.render ? column.render(value, row) : String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className='flex items-center justify-between border-t border-slate-200 p-3'>
        <span className='text-xs text-slate-500'>
          Page {page} of {totalPages} ({filtered.length} records)
        </span>
        <div className='flex gap-2'>
          <BaseButton variant='secondary' disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            Prev
          </BaseButton>
          <BaseButton variant='secondary' disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
            Next
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
