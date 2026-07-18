import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/notation";
import type { SongListItem } from "@/lib/types";

export default function SongCard({ song }: { song: SongListItem }) {
  return (
    <Link href={`/songs/${song.slug}`} className="song-card">
      <span className={`tag tag-${song.category}`}>{CATEGORY_LABELS[song.category]}</span>
      <h3>{song.title}</h3>
      <div className="meta">
        <span>ดูโน้ตเพลง</span>
        <span>↓</span>
      </div>
    </Link>
  );
}
