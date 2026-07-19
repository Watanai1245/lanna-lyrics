"use client";

import { toggleSongActiveAction } from "@/app/admin/actions";

export default function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  return (
    <form action={toggleSongActiveAction.bind(null, id, !active)} className="switch-row">
      <button
        type="submit"
        role="switch"
        aria-checked={active}
        className={`switch ${active ? "on" : "off"}`}
        title={active ? "กำลังแสดงผลบนหน้าเว็บ — กดเพื่อซ่อน" : "ซ่อนอยู่ ไม่แสดงบนหน้าเว็บ — กดเพื่อแสดง"}
      >
        <span className="switch-thumb" />
      </button>
      <span className="switch-label">{active ? "แสดงผล" : "ซ่อนอยู่"}</span>
    </form>
  );
}
