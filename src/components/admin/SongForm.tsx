"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SongCategory } from "@prisma/client";
import { chunk, groupCells, slugify, CATEGORY_OPTIONS, COLOR_PRESETS } from "@/lib/notation";
import { createSongAction, updateSongAction } from "@/app/admin/actions";
import type { ColorMap, SongData, SongInput, SectionInput } from "@/lib/types";

type RowItem = { type: "row"; id: string; cells: string[] };
type BreakItem = { type: "break"; id: string };
type LineItem = RowItem | BreakItem;

type SectionState = {
  key: string;
  name: string;
  hasIntro: boolean;
  introCell1: string;
  introCell2: string;
  introNote: string;
  introColors: ColorMap;
  isFreeText: boolean;
  freeText: string;
  lines: LineItem[];
  cellColors: ColorMap;
};

function emptyRow(): string[] {
  return Array(8).fill("");
}

function newRow(): RowItem {
  return { type: "row", id: crypto.randomUUID(), cells: emptyRow() };
}

function newSection(): SectionState {
  return {
    key: crypto.randomUUID(),
    name: "",
    hasIntro: false,
    introCell1: "",
    introCell2: "",
    introNote: "( เล่นแค่รอบแรก )",
    introColors: {},
    isFreeText: false,
    freeText: "",
    lines: [newRow()],
    cellColors: {},
  };
}

function sectionToState(s: SongData["sections"][number]): SectionState {
  const groups = groupCells(s.cells, s.lineBreaks);
  const lines: LineItem[] = [];
  groups.forEach((group, gi) => {
    const rowsInGroup = group.items.length ? chunk(group.items, 8) : [[]];
    rowsInGroup.forEach((r) => {
      const row = [...r];
      while (row.length < 8) row.push("");
      lines.push({ type: "row", id: crypto.randomUUID(), cells: row });
    });
    if (gi < groups.length - 1) {
      lines.push({ type: "break", id: crypto.randomUUID() });
    }
  });
  if (lines.length === 0) lines.push(newRow());

  return {
    key: s.id,
    name: s.name,
    hasIntro: s.introCells.length > 0,
    introCell1: s.introCells[0] ?? "",
    introCell2: s.introCells[1] ?? "",
    introNote: s.introNote || "( เล่นแค่รอบแรก )",
    introColors: s.introColors ?? {},
    isFreeText: Boolean(s.freeText),
    freeText: s.freeText ?? "",
    lines,
    cellColors: s.cellColors ?? {},
  };
}

function trimTrailingEmpty(cells: string[]): string[] {
  const copy = [...cells];
  while (copy.length > 0 && copy[copy.length - 1] === "") copy.pop();
  return copy;
}

/** Flattens the editor's row/break line list into a storable flat cell array + break positions. */
function flattenLines(lines: LineItem[]): { cells: string[]; lineBreaks: number[] } {
  const cells: string[] = [];
  const lineBreaks: number[] = [];
  for (let idx = 0; idx < lines.length; idx++) {
    const item = lines[idx];
    if (item.type === "break") {
      if (cells.length > 0) lineBreaks.push(cells.length - 1);
      continue;
    }
    const next = lines[idx + 1];
    const isLastOfGroup = !next || next.type === "break";
    const rowCells = isLastOfGroup ? trimTrailingEmpty(item.cells) : item.cells;
    cells.push(...rowCells);
  }
  return { cells, lineBreaks };
}

function pruneColors(colors: ColorMap, cellCount: number): ColorMap {
  const next: ColorMap = {};
  for (const [key, color] of Object.entries(colors)) {
    if (Number(key) < cellCount) next[key] = color;
  }
  return next;
}

function setColorAt(colors: ColorMap, key: string, color: string): ColorMap {
  const next = { ...colors };
  if (color) next[key] = color;
  else delete next[key];
  return next;
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="8" cy="5" r="1.7" />
      <circle cx="16" cy="5" r="1.7" />
      <circle cx="8" cy="12" r="1.7" />
      <circle cx="16" cy="12" r="1.7" />
      <circle cx="8" cy="19" r="1.7" />
      <circle cx="16" cy="19" r="1.7" />
    </svg>
  );
}

function RowColorEditor({
  cells,
  colors,
  rowStart,
  onChange,
}: {
  cells: string[];
  colors: ColorMap;
  rowStart: number;
  onChange: (colors: ColorMap) => void;
}) {
  const hasContent = cells.some((c) => c.trim() !== "");
  if (!hasContent) return null;

  return (
    <details className="row-color-editor">
      <summary className="row-icon-btn" title="ใส่สีแต่ละห้องในแถวนี้">
        🎨
      </summary>
      <div className="row-color-panel">
        {cells.map((c, i) => {
          if (!c.trim()) return null;
          const key = String(rowStart + i);
          return (
            <label key={i} className="row-color-item">
              <span>{c}</span>
              <select value={colors[key] ?? ""} onChange={(e) => onChange(setColorAt(colors, key, e.target.value))}>
                {COLOR_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </details>
  );
}

function IntroCellColorPicker({
  text,
  colors,
  cellIndex,
  onChange,
}: {
  text: string;
  colors: ColorMap;
  cellIndex: number;
  onChange: (colors: ColorMap) => void;
}) {
  if (!text.trim()) return null;
  const key = String(cellIndex);
  return (
    <select
      className="intro-color-select"
      value={colors[key] ?? ""}
      onChange={(e) => onChange(setColorAt(colors, key, e.target.value))}
      title="สีห้องนี้"
    >
      {COLOR_PRESETS.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}

export default function SongForm({ initialSong }: { initialSong?: SongData }) {
  const router = useRouter();
  const isEdit = Boolean(initialSong);

  const [title, setTitle] = useState(initialSong?.title ?? "");
  const [slug, setSlug] = useState(initialSong?.slug ?? "");
  const [category, setCategory] = useState<SongCategory>(initialSong?.category ?? "PHLENG");
  const [note, setNote] = useState(initialSong?.note ?? "");
  const [sections, setSections] = useState<SectionState[]>(
    initialSong?.sections.length ? initialSong.sections.map(sectionToState) : [newSection()]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragLine, setDragLine] = useState<{ sectionKey: string; lineId: string } | null>(null);

  function updateSection(key: string, patch: Partial<SectionState>) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function handleLineDrop(sectionKey: string, targetLineId: string) {
    setDragLine((current) => {
      if (!current || current.sectionKey !== sectionKey || current.lineId === targetLineId) return null;
      setSections((prev) =>
        prev.map((s) => {
          if (s.key !== sectionKey) return s;
          const lines = [...s.lines];
          const fromIdx = lines.findIndex((l) => l.id === current.lineId);
          const toIdx = lines.findIndex((l) => l.id === targetLineId);
          if (fromIdx === -1 || toIdx === -1) return s;
          const [moved] = lines.splice(fromIdx, 1);
          lines.splice(toIdx, 0, moved);
          return { ...s, lines };
        })
      );
      return null;
    });
  }

  function updateCell(sectionKey: string, rowId: string, cellIndex: number, value: string) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        const lines = s.lines.map((line) =>
          line.type === "row" && line.id === rowId
            ? { ...line, cells: line.cells.map((c, ci) => (ci === cellIndex ? value : c)) }
            : line
        );
        return { ...s, lines };
      })
    );
  }

  function addRow(sectionKey: string) {
    setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, lines: [...s.lines, newRow()] } : s)));
  }

  function addBreak(sectionKey: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.key === sectionKey ? { ...s, lines: [...s.lines, { type: "break", id: crypto.randomUUID() }] } : s
      )
    );
  }

  function removeLine(sectionKey: string, lineId: string) {
    setSections((prev) =>
      prev.map((s) => (s.key === sectionKey ? { ...s, lines: s.lines.filter((l) => l.id !== lineId) } : s))
    );
  }

  function addSection() {
    setSections((prev) => [...prev, newSection()]);
  }

  function removeSection(key: string) {
    setSections((prev) => prev.filter((s) => s.key !== key));
  }

  function moveSection(key: string, dir: -1 | 1) {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("กรุณาใส่ชื่อเพลง");
      return;
    }

    const sectionInputs: SectionInput[] = sections.map((s, i) => {
      if (s.isFreeText) {
        return {
          name: s.name.trim(),
          order: i,
          introCells: [],
          introNote: "",
          introColors: {},
          cells: [],
          cellColors: {},
          lineBreaks: [],
          freeText: s.freeText.trim(),
        };
      }
      const { cells, lineBreaks } = flattenLines(s.lines);
      const introCells = s.hasIntro ? [s.introCell1, s.introCell2].filter((c) => c !== "") : [];
      return {
        name: s.name.trim(),
        order: i,
        introCells,
        introNote: s.hasIntro ? s.introNote.trim() : "",
        introColors: s.hasIntro ? pruneColors(s.introColors, introCells.length) : {},
        cells,
        cellColors: pruneColors(s.cellColors, cells.length),
        lineBreaks,
        freeText: "",
      };
    });

    const input: SongInput = {
      title: title.trim(),
      slug: slug.trim(),
      category,
      note: note.trim(),
      sections: sectionInputs,
    };

    setBusy(true);
    try {
      const result =
        isEdit && initialSong ? await updateSongAction(initialSong.id, input) : await createSongAction(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/songs");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error ? <div className="error-banner">{error}</div> : null}

      <div className="field-row" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="field">
          <label htmlFor="title">ชื่อเพลง</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (!slug) setSlug(slugify(title));
            }}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="category">หมวดหมู่</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value as SongCategory)}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row" style={{ gridTemplateColumns: "1fr" }}>
        <div className="field">
          <label htmlFor="slug">Slug (สำหรับ URL)</label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="สร้างอัตโนมัติจากชื่อเพลงถ้าเว้นว่าง"
          />
        </div>
      </div>

      <h2 style={{ fontSize: 19, margin: "26px 0 6px" }}>ท่อน / เนื้อโน้ต</h2>
      <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 16 }}>
        แต่ละแถวคือ 8 ห้อง เหมือนต้นฉบับ พิมพ์ตัวโน้ตในแต่ละห้อง เช่น &ldquo;ซ ดํ ท ซ&rdquo; — ใช้ 🎨 ใส่สีทั้งห้องในแถวนั้น และ 🗑️ ลบแถว
      </p>

      {sections.map((section, sIndex) => {
        let rowCounter = 0;
        const rowItemCount = section.lines.filter((l) => l.type === "row").length;

        return (
          <div className="section-editor" key={section.key}>
            <div className="section-editor-head">
              <div className="field" style={{ margin: 0, flex: 1 }}>
                <label>ชื่อท่อน (เว้นว่างได้ถ้าเพลงมีท่อนเดียว)</label>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => updateSection(section.key, { name: e.target.value })}
                  placeholder="เช่น ท่อน ซอล"
                />
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => moveSection(section.key, -1)}
                  disabled={sIndex === 0}
                >
                  ขึ้น
                </button>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => moveSection(section.key, 1)}
                  disabled={sIndex === sections.length - 1}
                >
                  ลง
                </button>
                <button
                  type="button"
                  className="link-btn danger"
                  onClick={() => removeSection(section.key)}
                  disabled={sections.length === 1}
                >
                  ลบท่อนนี้
                </button>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={section.isFreeText}
                onChange={(e) => updateSection(section.key, { isFreeText: e.target.checked })}
              />
              ท่อนนี้เป็นบรรทัดอิสระ ไม่แบ่งห้อง (เช่น แนวเสียงเริ่มต้นของเพลงหมอกมุงเมือง)
            </label>

            {section.isFreeText ? (
              <div className="field" style={{ marginBottom: 4 }}>
                <label>ข้อความโน้ตอิสระ (ขึ้นบรรทัดใหม่ได้)</label>
                <textarea
                  value={section.freeText}
                  onChange={(e) => updateSection(section.key, { freeText: e.target.value })}
                  rows={3}
                  placeholder="เช่น ด ร ม ซ ล ดํ ซ ล ดํ รํ ล ดํ รํ ม ด ร ม ซ ร ม ซ"
                />
              </div>
            ) : (
              <>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={section.hasIntro}
                    onChange={(e) => updateSection(section.key, { hasIntro: e.target.checked })}
                  />
                  มีท่อนขึ้นต้น (pickup line) เช่น &ldquo;- - - ซ / - ซ ซ ซ (เล่นแค่รอบแรก)&rdquo;
                </label>

                {section.hasIntro ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <input
                        type="text"
                        value={section.introCell1}
                        onChange={(e) => updateSection(section.key, { introCell1: e.target.value })}
                        placeholder="ห้องที่ 1"
                        style={{ width: 100, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 6 }}
                      />
                      <IntroCellColorPicker
                        text={section.introCell1}
                        colors={section.introColors}
                        cellIndex={0}
                        onChange={(c) => updateSection(section.key, { introColors: c })}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <input
                        type="text"
                        value={section.introCell2}
                        onChange={(e) => updateSection(section.key, { introCell2: e.target.value })}
                        placeholder="ห้องที่ 2"
                        style={{ width: 100, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 6 }}
                      />
                      <IntroCellColorPicker
                        text={section.introCell2}
                        colors={section.introColors}
                        cellIndex={1}
                        onChange={(c) => updateSection(section.key, { introColors: c })}
                      />
                    </div>
                    <input
                      type="text"
                      value={section.introNote}
                      onChange={(e) => updateSection(section.key, { introNote: e.target.value })}
                      placeholder="หมายเหตุ เช่น ( เล่นแค่รอบแรก )"
                      style={{ flex: 1, minWidth: 200, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 6 }}
                    />
                  </div>
                ) : null}

                {section.lines.map((line) => {
                  const isDragging = dragLine?.sectionKey === section.key && dragLine.lineId === line.id;
                  const dragHandle = (
                    <span
                      className="row-icon-btn row-drag-handle"
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={() => setDragLine({ sectionKey: section.key, lineId: line.id })}
                      onDragEnd={() => setDragLine(null)}
                      title="ลากเพื่อสลับตำแหน่ง"
                      aria-label="ลากเพื่อสลับตำแหน่ง"
                    >
                      <DragHandleIcon />
                    </span>
                  );

                  if (line.type === "break") {
                    return (
                      <div
                        key={line.id}
                        className="line-break-row"
                        style={isDragging ? { opacity: 0.4 } : undefined}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleLineDrop(section.key, line.id)}
                      >
                        {dragHandle}
                        <span className="line-break-label">เว้นบรรทัด</span>
                        <button
                          type="button"
                          className="row-icon-btn row-trash"
                          onClick={() => removeLine(section.key, line.id)}
                          title="ลบการเว้นบรรทัดนี้"
                          aria-label="ลบการเว้นบรรทัดนี้"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    );
                  }

                  const rowStart = rowCounter * 8;
                  rowCounter += 1;

                  return (
                    <div
                      key={line.id}
                      className="notation-row"
                      style={isDragging ? { opacity: 0.4 } : undefined}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleLineDrop(section.key, line.id)}
                    >
                      {dragHandle}
                      <div className="cell-grid-editor">
                        {line.cells.map((cell, ci) => (
                          <input
                            key={ci}
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(section.key, line.id, ci, e.target.value)}
                            placeholder="- - - -"
                          />
                        ))}
                      </div>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="row-icon-btn row-trash"
                          onClick={() => removeLine(section.key, line.id)}
                          disabled={rowItemCount === 1}
                          title="ลบแถวนี้"
                          aria-label="ลบแถวนี้"
                        >
                          <TrashIcon />
                        </button>
                        <RowColorEditor
                          cells={line.cells}
                          colors={section.cellColors}
                          rowStart={rowStart}
                          onChange={(c) => updateSection(section.key, { cellColors: c })}
                        />
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button type="button" className="btn btn-outline" onClick={() => addRow(section.key)}>
                    + เพิ่มแถว (8 ห้อง)
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => addBreak(section.key)}>
                    + เว้นบรรทัด
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <button type="button" className="btn btn-outline" onClick={addSection} style={{ marginBottom: 26 }}>
        + เพิ่มท่อนใหม่
      </button>

      <div className="field">
        <label htmlFor="note">หมายเหตุ (แสดงท้ายหน้าโน้ตเพลง)</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="เช่น ถ้าบรรเลงจะเล่น 2 รอบ แต่ถ้าเป็นการซอจะเล่นรอบเดียว"
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button type="submit" className="btn btn-green" disabled={busy}>
          {busy ? "กำลังบันทึก…" : isEdit ? "บันทึกการแก้ไข" : "บันทึกเพลงใหม่"}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => router.push("/admin/songs")}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
