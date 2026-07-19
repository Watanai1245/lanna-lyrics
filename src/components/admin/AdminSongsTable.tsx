"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DeleteSongButton from "@/components/admin/DeleteSongButton";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import { CATEGORY_LABELS } from "@/lib/notation";
import type { SongListItem } from "@/lib/types";

type SortKey = "title" | "category";

export default function AdminSongsTable({ songs }: { songs: SongListItem[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? songs.filter(
          (s) => s.title.toLowerCase().includes(q) || CATEGORY_LABELS[s.category].toLowerCase().includes(q)
        )
      : songs;

    const sorted = [...filtered].sort((a, b) => {
      const cmp =
        sortKey === "title"
          ? a.title.localeCompare(b.title, "th")
          : CATEGORY_LABELS[a.category].localeCompare(CATEGORY_LABELS[b.category], "th");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [songs, query, sortKey, sortDir]);

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  return (
    <>
      <div className="field" style={{ maxWidth: 340, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="ค้นหาชื่อเพลงหรือหมวดหมู่..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="ค้นหาโน้ตเพลง"
        />
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {rows.length === 0 ? (
          <p className="empty-state">
            {songs.length === 0 ? (
              <>ยังไม่มีเพลงในคลัง กด &ldquo;เพิ่มเพลงใหม่&rdquo; เพื่อเริ่มต้น</>
            ) : (
              <>ไม่พบเพลงที่ตรงกับ &ldquo;{query}&rdquo;</>
            )}
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <button type="button" className="th-sort" onClick={() => toggleSort("title")}>
                    ชื่อเพลง{sortIndicator("title")}
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort" onClick={() => toggleSort("category")}>
                    หมวดหมู่{sortIndicator("category")}
                  </button>
                </th>
                <th>Note</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((song) => (
                <tr key={song.id} className={song.active ? undefined : "row-inactive"}>
                  <td>{song.title}</td>
                  <td>{CATEGORY_LABELS[song.category]}</td>
                  <td className="admin-table-note" title={song.note || undefined}>
                    {song.note || <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                  <td>
                    <ToggleActiveButton id={song.id} active={song.active} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 14, justifyContent: "flex-end" }}>
                      <Link href={`/songs/${song.slug}`} className="link-btn" target="_blank">
                        ดู
                      </Link>
                      <Link href={`/admin/songs/${song.id}`} className="link-btn">
                        แก้ไข
                      </Link>
                      <DeleteSongButton id={song.id} title={song.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
