import type { SongCategory } from "@prisma/client";

/** Whole-cell color overrides, keyed by cell index (as a string) -> CSS color. */
export type ColorMap = Record<string, string>;

export type SectionInput = {
  name: string;
  order: number;
  introCells: string[];
  introNote: string;
  introColors: ColorMap;
  cells: string[];
  cellColors: ColorMap;
  /** Cell indexes after which an extra visual gap is inserted, without starting a new ท่อน. */
  lineBreaks: number[];
  freeText: string;
};

export type SectionData = SectionInput & { id: string };

export type SongInput = {
  title: string;
  slug: string;
  category: SongCategory;
  note: string;
  sections: SectionInput[];
};

export type SongData = Omit<SongInput, "sections"> & { id: string; sections: SectionData[] };

export type SongListItem = {
  id: string;
  slug: string;
  title: string;
  category: SongCategory;
  note: string;
};
