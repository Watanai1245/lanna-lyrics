"use client";

import { useRef, useState } from "react";
import SongPoster from "./SongPoster";
import type { SongData } from "@/lib/types";

function isNoCapture(node: unknown): boolean {
  return node instanceof HTMLElement && node.classList.contains("poster-actions");
}

export default function PosterActions({ song }: { song: SongData }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | "fullscreen" | null>(null);
  const [fsImage, setFsImage] = useState<string | null>(null);
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

  async function handleFullscreen() {
    setError(null);
    setBusy("fullscreen");
    try {
      const dataUrl = await capture();
      if (!dataUrl) {
        setError("สร้างภาพไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }
      setFsImage(dataUrl);
    } catch {
      setError("สร้างภาพไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  const actions = (
    <div className="poster-actions">
      <button className="btn btn-outline" onClick={handleFullscreen} disabled={busy !== null}>
        {busy === "fullscreen" ? "กำลังเตรียมภาพ…" : "⛶ ดูเต็มจอ"}
      </button>
      <button className="btn btn-outline" onClick={handlePrint}>
        พิมพ์
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

      {fsImage ? (
        <div className="fs-overlay" role="dialog" aria-modal="true" aria-label={`โน้ตเพลง ${song.title} แบบเต็มจอ`}>
          <div className="fs-topbar">
            <span>{song.title}</span>
            <button className="fs-close" onClick={() => setFsImage(null)} aria-label="ปิด">
              ✕
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fsImage} alt={`โน้ตเพลง ${song.title}`} />
        </div>
      ) : null}
    </>
  );
}
