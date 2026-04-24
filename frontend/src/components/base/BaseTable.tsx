import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BaseButton } from './BaseButton';

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
  searchable?: boolean;
}

export function BaseTable<T extends object>({
  columns,
  data,
  rowKey = 'id',
  loading = false,
  emptyText = 'No records found',
  searchable = true,
}: BaseTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let rows = [...(data || [])];

    if (searchable && search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(term));
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
  }, [data, search, searchable, sortDirection, sortKey]);

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
      {searchable && (
        <div className='border-b border-slate-200 p-3'>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'
            placeholder='Search...'
          />
        </div>
      )}

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
