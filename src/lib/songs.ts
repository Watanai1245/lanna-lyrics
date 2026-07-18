import type { Prisma, SongCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/notation";
import type { ColorMap, SectionData, SectionInput, SongData, SongInput, SongListItem } from "@/lib/types";

type SongWithSections = Prisma.SongGetPayload<{ include: { sections: true } }>;

function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asNumberArray(value: Prisma.JsonValue | null | undefined): number[] {
  return Array.isArray(value) ? value.filter((v): v is number => typeof v === "number") : [];
}

function asColorMap(value: Prisma.JsonValue | null | undefined): ColorMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const map: ColorMap = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") map[k] = v;
  }
  return map;
}

function mapSong(song: SongWithSections): SongData {
  const sections: SectionData[] = [...song.sections]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      id: s.id,
      name: s.name,
      order: s.order,
      introCells: asStringArray(s.introCells),
      introNote: s.introNote ?? "",
      introColors: asColorMap(s.introColors),
      cells: asStringArray(s.cells),
      cellColors: asColorMap(s.cellColors),
      lineBreaks: asNumberArray(s.lineBreaks),
      freeText: s.freeText ?? "",
    }));

  return {
    id: song.id,
    title: song.title,
    slug: song.slug,
    category: song.category,
    note: song.note ?? "",
    sections,
  };
}

export async function getAllSongs(category?: SongCategory): Promise<SongListItem[]> {
  const songs = await prisma.song.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ title: "asc" }],
  });
  return songs.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    category: s.category,
    note: s.note ?? "",
  }));
}

export async function getFeaturedSongs(limit = 4): Promise<SongListItem[]> {
  const songs = await getAllSongs();
  return songs.slice(0, limit);
}

/** Full song + section data for every song, used to build the "download all" zip. */
export async function getAllSongsFull(): Promise<SongData[]> {
  const songs = await prisma.song.findMany({
    orderBy: [{ title: "asc" }],
    include: { sections: true },
  });
  return songs.map(mapSong);
}

export async function getSongBySlug(slug: string): Promise<SongData | null> {
  const song = await prisma.song.findUnique({
    where: { slug },
    include: { sections: true },
  });
  return song ? mapSong(song) : null;
}

export async function getSongById(id: string): Promise<SongData | null> {
  const song = await prisma.song.findUnique({
    where: { id },
    include: { sections: true },
  });
  return song ? mapSong(song) : null;
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "song";
  let candidate = root;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.song.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${n}`;
    n += 1;
  }
}

function sectionCreateData(sections: SectionInput[]) {
  return sections.map((s, i) => ({
    name: s.name,
    order: s.order ?? i,
    introCells: s.introCells.length ? s.introCells : undefined,
    introNote: s.introNote || undefined,
    introColors: Object.keys(s.introColors ?? {}).length ? s.introColors : undefined,
    cells: s.cells,
    cellColors: Object.keys(s.cellColors ?? {}).length ? s.cellColors : undefined,
    lineBreaks: s.lineBreaks?.length ? s.lineBreaks : undefined,
    freeText: s.freeText || undefined,
  }));
}

export async function createSong(input: SongInput): Promise<SongData> {
  const slug = input.slug ? await uniqueSlug(input.slug) : await uniqueSlug(input.title);
  const song = await prisma.song.create({
    data: {
      title: input.title,
      slug,
      category: input.category,
      note: input.note || null,
      sections: { create: sectionCreateData(input.sections) },
    },
    include: { sections: true },
  });
  return mapSong(song);
}

export async function updateSong(id: string, input: SongInput): Promise<SongData> {
  const slug = await uniqueSlug(input.slug || input.title, id);
  const song = await prisma.$transaction(async (tx) => {
    await tx.section.deleteMany({ where: { songId: id } });
    return tx.song.update({
      where: { id },
      data: {
        title: input.title,
        slug,
        category: input.category,
        note: input.note || null,
        sections: { create: sectionCreateData(input.sections) },
      },
      include: { sections: true },
    });
  });
  return mapSong(song);
}

export async function deleteSong(id: string): Promise<void> {
  await prisma.song.delete({ where: { id } });
}
