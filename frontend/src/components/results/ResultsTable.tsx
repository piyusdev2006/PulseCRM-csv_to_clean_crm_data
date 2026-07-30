/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  FileJson,
  FileSpreadsheet,
  FilterX,
} from 'lucide-react';
import type { CRMRecord, SkippedRecord } from '@/types';
import { formatStatus } from '@/components/ui/Badge';
import { downloadCSV } from '@/lib/utils';
import { ResendBadge, ResendButton, ResendTabs } from '@/components/ui/ResendComponents';

interface ResultsTableProps {
  records: CRMRecord[];
  skipped: SkippedRecord[];
}

type ActiveTab = 'imported' | 'skipped';

export function ResultsTable({ records, skipped }: ResultsTableProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('imported');
  const [searchTerm, setSearchTerm] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (records.length === 0 && skipped.length > 0) {
      setActiveTab('skipped');
    } else {
      setActiveTab('imported');
    }
  }, [records, skipped]);

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
  }, [records, searchTerm]);

  const filteredSkipped = useMemo(() => {
    if (!searchTerm.trim()) return skipped;
    const term = searchTerm.toLowerCase();
    return skipped.filter(
      (s) =>
        s.reason.toLowerCase().includes(term) ||
        Object.values(s.originalData).some((val) =>
          String(val ?? '').toLowerCase().includes(term)
        )
    );
  }, [skipped, searchTerm]);

  // Imported records columns
  const importedColumns = useMemo<ColumnDef<CRMRecord>[]>(
    () => [
      {
        id: '_row',
        header: '#',
        size: 50,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Lead Name',
        size: 160,
        cell: ({ getValue }) => (
          <span className="font-semibold text-[var(--text-main)] truncate block" title={String(getValue() || '')}>
            {String(getValue() || '-')}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        size: 190,
        cell: ({ getValue }) => (
          <span className="truncate block font-mono text-xs text-emerald-600 dark:text-emerald-400" title={String(getValue() || '')}>
            {String(getValue() || '-')}
          </span>
        ),
      },
      {
        accessorKey: 'crm_status',
        header: 'CRM Status',
        size: 170,
        cell: ({ getValue }) => {
          const status = String(getValue());
          const variant =
            status === 'GOOD_LEAD_FOLLOW_UP'
              ? 'emerald'
              : status === 'SALE_DONE'
              ? 'purple'
              : status === 'DID_NOT_CONNECT'
              ? 'warning'
              : 'error';
          return (
            <ResendBadge variant={variant}>
              {formatStatus(status)}
            </ResendBadge>
          );
        },
      },
      {
        accessorKey: 'company',
        header: 'Company',
        size: 140,
        cell: ({ getValue }) => (
          <span className="truncate block text-[var(--text-main)]" title={String(getValue() || '')}>
            {String(getValue() || '-')}
          </span>
        ),
      },
      {
        accessorKey: 'city',
        header: 'City',
        size: 110,
        cell: ({ getValue }) => <span className="text-[var(--text-main)]">{String(getValue() || '-')}</span>,
      },
      {
        accessorKey: 'country',
        header: 'Country',
        size: 110,
        cell: ({ getValue }) => <span className="text-[var(--text-main)]">{String(getValue() || '-')}</span>,
      },
      {
        accessorKey: 'crm_note',
        header: 'AI CRM Notes',
        size: 220,
        cell: ({ getValue }) => (
          <span className="truncate block text-xs text-[var(--text-muted)]" title={String(getValue() || '')}>
            {String(getValue() || '-')}
          </span>
        ),
      },
      {
        accessorKey: 'data_source',
        header: 'Data Source',
        size: 130,
        cell: ({ getValue }) => (
          <ResendBadge variant="zinc">
            {String(getValue() || 'AI Parsed')}
          </ResendBadge>
        ),
      },
      {
        accessorKey: 'mobile_without_country_code',
        header: 'Mobile Phone',
        size: 140,
        cell: ({ row }) => {
          const code = row.original.country_code || '';
          const num = row.original.mobile_without_country_code || '';
          if (!num) return <span className="text-[var(--text-muted)]">-</span>;
          return <span className="font-mono text-xs text-[var(--text-main)]">{code} {num}</span>;
        },
      },
    ],
    []
  );

  // Skipped records columns
  const skippedColumns = useMemo<ColumnDef<SkippedRecord>[]>(
    () => [
      {
        id: '_index',
        header: '#',
        size: 50,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: 'rowIndex',
        header: 'Row Index',
        size: 90,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            Row #{Number(getValue()) + 1}
          </span>
        ),
      },
      {
        accessorKey: 'reason',
        header: 'Skip Reason',
        size: 260,
        cell: ({ getValue }) => (
          <ResendBadge variant="warning">
            <AlertTriangle size={12} />
            {String(getValue())}
          </ResendBadge>
        ),
      },
      {
        id: 'original_data',
        header: 'Raw Row Context',
        size: 450,
        cell: ({ row }) => {
          const data = row.original.originalData;
          const jsonStr = JSON.stringify(data);
          return (
            <span
              className="font-mono text-[11px] truncate block text-[var(--text-muted)]"
              title={JSON.stringify(data, null, 2)}
            >
              {jsonStr}
            </span>
          );
        },
      },
    ],
    []
  );

  const importedTable = useReactTable({
    data: filteredRecords,
    columns: importedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const skippedTable = useReactTable({
    data: filteredSkipped,
    columns: skippedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentTable = activeTab === 'imported' ? importedTable : skippedTable;
  const { rows } = currentTable.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 20,
  });

  const handleExportCSV = () => {
    if (activeTab === 'imported') {
      downloadCSV(
        records as unknown as Record<string, string>[],
        `groweasy-crm-imported-${new Date().toISOString().slice(0, 10)}.csv`
      );
    } else {
      const exportData = skipped.map((s) => ({
        row_index: String(s.rowIndex + 1),
        reason: s.reason,
        ...s.originalData,
      }));
      downloadCSV(
        exportData,
        `groweasy-crm-skipped-${new Date().toISOString().slice(0, 10)}.csv`
      );
    }
  };

  const handleExportJSON = () => {
    const dataToExport = activeTab === 'imported' ? records : skipped;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groweasy-crm-${activeTab}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabOptions = [
    {
      id: 'imported',
      label: 'Imported Records',
      count: records.length,
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    },
    {
      id: 'skipped',
      label: 'Skipped Rows',
      count: skipped.length,
      icon: <AlertTriangle size={14} className="text-amber-500" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-4"
    >
      {/* Controls Header: Resend Tabs + Filter + Exports */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <ResendTabs
          tabs={tabOptions}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as ActiveTab)}
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder={`Filter ${activeTab}...`}
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

          <ResendButton
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            disabled={rows.length === 0}
            icon={<FileSpreadsheet size={14} />}
          >
            Export CSV
          </ResendButton>

          <ResendButton
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
            disabled={rows.length === 0}
            icon={<FileJson size={14} />}
          >
            JSON
          </ResendButton>
        </div>
      </div>

      {/* Table Container */}
      <div className="resend-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto space-y-3">
            {activeTab === 'skipped' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-main)]">
                    100% Clean Data Import!
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    Zero records skipped. Every single lead from your CSV was successfully extracted into GrowEasy CRM format.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle size={28} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-main)]">
                    No matching records found
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    {searchTerm
                      ? `No records match "${searchTerm}". Clear your search input to see all records.`
                      : 'No records were successfully imported from this CSV.'}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            ref={parentRef}
            className="overflow-auto max-h-[500px]"
          >
            <table className="w-full border-collapse min-w-full">
              <thead className="sticky top-0 z-10 bg-[var(--bg-table-header)] border-b border-[var(--border-subtle)] shadow-sm">
                {currentTable.getHeaderGroups().map((headerGroup) => (
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
                              header.column.columnDef.header as any,
                              header.getContext() as any
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
                          className="px-4 py-2.5 text-xs truncate whitespace-nowrap"
                          style={{
                            maxWidth: cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell as any,
                            cell.getContext() as any
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
