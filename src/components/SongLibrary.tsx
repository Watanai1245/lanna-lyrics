"use client";

import { useMemo, useState } from "react";
import SongCard from "@/components/SongCard";
import { CATEGORY_OPTIONS } from "@/lib/notation";
import type { SongCategory } from "@prisma/client";
import type { SongListItem } from "@/lib/types";

export default function SongLibrary({ songs, initialQuery }: { songs: SongListItem[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SongCategory | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs
      .filter((s) => (category ? s.category === category : true))
      .filter((s) => (q ? s.title.toLowerCase().includes(q) : true))
      .sort((a, b) => a.title.localeCompare(b.title, "th"));
  }, [songs, query, category]);

  return (
    <>
      <div className="search-row">
        <input
          type="text"
          className="search-input"
          placeholder="ค้นหาชื่อเพลง เช่น “ปราสาทไหว”, “มอญเชียงแสน”…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="ค้นหาโน้ตเพลง"
        />
      </div>

      <div className="cats">
        <button type="button" className={`chip ${category === null ? "active" : ""}`} onClick={() => setCategory(null)}>
          ทั้งหมด · {songs.length} เพลง
        </button>
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`chip ${category === opt.value ? "active" : ""}`}
            onClick={() => setCategory(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "26px 0 0" }}>
        {filtered.length === 0 ? (
          <p className="empty-state">
            {songs.length === 0 ? "ยังไม่มีเพลงในคลัง" : <>ไม่พบเพลงที่ตรงกับ &ldquo;{query}&rdquo;</>}
          </p>
        ) : (
          <div className="song-grid" style={{ marginTop: 24 }}>
            {filtered.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
