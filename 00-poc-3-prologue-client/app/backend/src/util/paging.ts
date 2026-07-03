import { Buffer } from 'node:buffer';

export interface CursorPage<T> {
  items: T[];
  firstCursor: string | null;
  lastCursor: string | null;
  nextCursor: string | null;
  prevCursor: string | null;
  totalCount: number;
  isFirst: boolean;
  isLast: boolean;
}

function encodeCursor(index: number): string {
  return Buffer.from(String(index)).toString('base64');
}

function decodeCursor(cursor: string): number {
  return parseInt(Buffer.from(cursor, 'base64').toString('utf8'), 10);
}

export function cursorPage<T>(
  all: T[],
  cursor: string | undefined,
  direction: 'next' | 'prev',
  pageSize: number,
): CursorPage<T> {
  const total = all.length;
  if (total === 0) {
    return {
      items: [],
      firstCursor: null,
      lastCursor: null,
      nextCursor: null,
      prevCursor: null,
      totalCount: 0,
      isFirst: true,
      isLast: true,
    };
  }

  let startIndex = 0;
  if (cursor) {
    const decoded = decodeCursor(cursor);
    startIndex = direction === 'next' ? decoded : Math.max(0, decoded - pageSize);
  }
  startIndex = Math.max(0, Math.min(startIndex, total - 1));

  const endIndex = Math.min(startIndex + pageSize, total);
  const items = all.slice(startIndex, endIndex);

  return {
    items,
    firstCursor: encodeCursor(0),
    lastCursor: encodeCursor(Math.max(0, total - pageSize)),
    nextCursor: endIndex < total ? encodeCursor(endIndex) : null,
    prevCursor: startIndex > 0 ? encodeCursor(Math.max(0, startIndex - pageSize)) : null,
    totalCount: total,
    isFirst: startIndex === 0,
    isLast: endIndex >= total,
  };
}

export function offsetPage<T>(all: T[], page: number, pageSize: number): { items: T[]; totalCount: number; page: number; pageSize: number } {
  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    totalCount: all.length,
    page,
    pageSize,
  };
}
