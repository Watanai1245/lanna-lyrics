"use client";

import { useRef, useState } from "react";
import SongPoster from "./SongPoster";
import type { SongData } from "@/lib/types";

export default function DownloadAllButton({ songs }: { songs: SongData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleDownloadAll() {
    if (!containerRef.current || songs.length === 0) return;
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const { toPng } = await import("html-to-image");
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const nodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>("[data-song-slug]"));

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const slug = node.dataset.songSlug || `song-${i + 1}`;
        const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });
        const base64 = dataUrl.split(",")[1] ?? "";
        zip.file(`${slug}.png`, base64, { base64: true });
        setProgress(Math.round(((i + 1) / nodes.length) * 100));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "โน้ตเพลงล้านนา-ทั้งหมด.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("ดาวน์โหลดทั้งหมดไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: 36 }}>
      {error ? <div className="error-banner">{error}</div> : null}
      <button className="btn btn-outline" onClick={handleDownloadAll} disabled={busy || songs.length === 0}>
        {busy ? `กำลังสร้างไฟล์… ${progress}%` : `↓ ดาวน์โหลดโน้ตทั้งหมด (.zip) · ${songs.length} เพลง`}
      </button>

      {/* Off-screen render target used only as the source for image capture. */}
      <div ref={containerRef} aria-hidden="true" style={{ position: "fixed", top: 0, left: -99999, width: 900 }}>
        {songs.map((song) => (
          <div key={song.id} data-song-slug={song.slug} style={{ marginBottom: 40 }}>
            <SongPoster song={song} />
          </div>
        ))}
      </div>
    </div>
  );
}
