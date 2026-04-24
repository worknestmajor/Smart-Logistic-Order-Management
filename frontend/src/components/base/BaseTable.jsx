import { useMemo, useState } from 'react';
import { BaseButton } from './BaseButton';

export function BaseTable({
  columns,
  data,
  rowKey = 'id',
  loading,
  emptyText = 'No records found',
  searchable = true,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
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
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        const result = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDirection === 'asc' ? result : -result;
      });
    }

    return rows;
  }, [data, search, searchable, sortDirection, sortKey]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const onSort = (key) => {
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
                <th key={column.key} className='px-4 py-3 font-semibold'>
                  <button type='button' className='inline-flex items-center gap-1' onClick={() => onSort(column.key)}>
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
              paged.map((row) => (
                <tr key={row[rowKey]} className='border-t border-slate-100'>
                  {columns.map((column) => (
                    <td key={`${row[rowKey]}-${column.key}`} className='px-4 py-3 text-slate-700'>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
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
