import type { SongCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<SongCategory, string> = {
  PHLENG: "เพลง",
  SAW: "ซอ",
  RAMWONG: "ฟ้อน / รำวง",
};

export const CATEGORY_OPTIONS: { value: SongCategory; label: string }[] = [
  { value: "PHLENG", label: CATEGORY_LABELS.PHLENG },
  { value: "SAW", label: CATEGORY_LABELS.SAW },
  { value: "RAMWONG", label: CATEGORY_LABELS.RAMWONG },
];

export const CELLS_PER_ROW = 8;

export const COLOR_PRESETS: { value: string; label: string }[] = [
  { value: "", label: "ปกติ" },
  { value: "#C1352B", label: "แดง" },
  { value: "#1B6B3F", label: "เขียว" },
  { value: "#24396B", label: "น้ำเงิน" },
  { value: "#B8901E", label: "ทอง" },
  { value: "#7B3F9E", label: "ม่วง" },
];

/** Splits a flat list into fixed-size chunks, e.g. for laying out an 8-cell-per-row grid. */
export function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export type CellGroup = { start: number; items: string[] };

/** Splits a flat cell list into groups at the given break points (a break point is the index of the last cell in its group). */
export function groupCells(cells: string[], breaks: number[]): CellGroup[] {
  const breakSet = new Set(breaks);
  const groups: CellGroup[] = [];
  let current: string[] = [];
  let groupStart = 0;
  cells.forEach((c, i) => {
    current.push(c);
    if (breakSet.has(i)) {
      groups.push({ start: groupStart, items: current });
      current = [];
      groupStart = i + 1;
    }
  });
  if (current.length > 0 || groups.length === 0) {
    groups.push({ start: groupStart, items: current });
  }
  return groups;
}

/** Turns a Thai/English song title into a URL-friendly slug (keeps Thai script — browsers percent-encode it fine). */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/["'"()]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
