"use client";

import { useRef, useState } from "react";
import SongPoster from "./SongPoster";
import type { SongData } from "@/lib/types";

function isNoCapture(node: unknown): boolean {
  return node instanceof HTMLElement && node.classList.contains("poster-actions");
}

export default function PosterActions({ song }: { song: SongData }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function capture(): Promise<string | null> {
    if (!posterRef.current) return null;
    const { toPng } = await import("html-to-image");
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--paper-raised").trim() || "#ffffff";
    return toPng(posterRef.current, {
      pixelRatio: 2,
      backgroundColor: bg,
      filter: (node) => !isNoCapture(node),
    });
  }

  async function handleDownload() {
    setError(null);
    setBusy("download");
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${song.slug}.png`;
      a.click();
    } catch {
      setError("สร้างภาพไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(null);
    }
  }

  function handleFullscreen() {
    setError(null);
    setIsFullscreen(true);
  }

  const actions = (
    <div className="poster-actions">
      <button className="btn btn-outline" onClick={handleFullscreen} disabled={busy !== null}>
        ⛶ ดูเต็มจอ
      </button>
      <button className="btn btn-green" onClick={handleDownload} disabled={busy !== null}>
        {busy === "download" ? "กำลังสร้างภาพ…" : "↓ ดาวน์โหลดภาพ"}
      </button>
    </div>
  );

  return (
    <>
      {error ? <div className="error-banner">{error}</div> : null}
      <div ref={posterRef}>
        <SongPoster song={song} actions={actions} />
      </div>

      {isFullscreen ? (
        <div className="fs-overlay" role="dialog" aria-modal="true" aria-label={`โน้ตเพลง ${song.title} แบบเต็มจอ`}>
          <div className="fs-topbar">
            <span>{song.title}</span>
            <button className="fs-close" onClick={() => setIsFullscreen(false)} aria-label="ปิด">
              ✕
            </button>
          </div>
          <div className="fs-content">
            <SongPoster song={song} />
          </div>
        </div>
      ) : null}
    </>
  );
}
