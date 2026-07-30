'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { Table, Columns3, Search, FilterX } from 'lucide-react';
import type { CSVPreviewData } from '@/types';
import { ResendBadge } from '@/components/ui/ResendComponents';

interface PreviewTableProps {
  data: CSVPreviewData;
}

export function PreviewTable({ data }: PreviewTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return data.rows;
    const term = searchTerm.toLowerCase();
    return data.rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
  }, [data.rows, searchTerm]);

  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    return [
      {
        id: '_row_number',
        header: '#',
        size: 55,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {row.index + 1}
          </span>
        ),
      },
      ...data.headers.map((header) => ({
        id: header,
        accessorKey: header,
        header: header,
        size: Math.max(120, Math.min(260, header.length * 10 + 50)),
        cell: ({ getValue }: { getValue: () => unknown }) => {
          const value = String(getValue() ?? '');
          return (
            <span
              title={value}
              className={`block truncate ${
                !value ? 'text-[var(--text-muted)] italic text-xs' : 'text-[var(--text-main)]'
              }`}
            >
              {value || '(empty)'}
            </span>
          );
        },
      })),
    ];
  }, [data.headers]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 20,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-4"
    >
      {/* Search & Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ResendBadge variant="emerald">
            <Table size={13} />
            <span className="font-mono font-semibold">{filteredRows.length.toLocaleString()}</span> / {data.totalRows.toLocaleString()} rows
          </ResendBadge>
          <ResendBadge variant="purple">
            <Columns3 size={13} />
            <span className="font-mono font-semibold">{data.headers.length}</span> columns
          </ResendBadge>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search preview records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              <FilterX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Virtualized Table Container */}
      <div className="resend-card overflow-hidden">
        <div
          ref={parentRef}
          className="overflow-auto max-h-[480px]"
        >
          <table className="w-full border-collapse min-w-full">
            <thead className="sticky top-0 z-10 bg-[var(--bg-table-header)] border-b border-[var(--border-subtle)] shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left text-[11px] font-mono font-semibold uppercase tracking-wider px-4 py-3 border-b border-[var(--border-subtle)] whitespace-nowrap text-[var(--text-muted)]"
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    className="transition-colors duration-150 border-b border-[var(--border-subtle)] hover:bg-emerald-500/10"
                    style={{
                      height: `${virtualRow.size}px`,
                      background:
                        virtualRow.index % 2 === 0
                          ? 'transparent'
                          : 'var(--border-subtle)',
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-2 text-xs truncate whitespace-nowrap"
                        style={{
                          maxWidth: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
