import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  numeric?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  caption?: string;
  emptyMessage?: string;
  footer?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  emptyMessage,
  footer,
}: DataTableProps<T>): JSX.Element {
  return (
    <table className="data-grid" role="grid">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              scope="col"
              className={col.numeric ? 'cell-numeric' : col.className}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center text-text-secondary">
              {emptyMessage ?? ''}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={col.numeric ? 'cell-numeric' : col.className}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
      {footer ? <tfoot>{footer}</tfoot> : null}
    </table>
  );
}
