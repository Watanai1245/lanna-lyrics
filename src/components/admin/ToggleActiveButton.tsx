"use client";

import { toggleSongActiveAction } from "@/app/admin/actions";

export default function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  return (
    <form action={toggleSongActiveAction.bind(null, id, !active)}>
      <button
        type="submit"
        className={`status-pill ${active ? "status-on" : "status-off"}`}
        title={active ? "กำลังแสดงผลบนหน้าเว็บ — กดเพื่อซ่อน" : "ซ่อนอยู่ ไม่แสดงบนหน้าเว็บ — กดเพื่อแสดง"}
      >
        <span className="status-dot" />
        {active ? "แสดงผล" : "ซ่อนอยู่"}
      </button>
    </form>
  );
}
